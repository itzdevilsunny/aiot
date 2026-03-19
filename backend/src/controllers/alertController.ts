import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuditLogModel } from '../models';
import { cameraStore } from './cameraController';
import { dispatchViolenceAlert } from '../services/notificationService';

// Track last heartbeat time per camera for timeout detection
export const cameraHeartbeats = new Map<string, number>();

export type AlertStatus = 'Pending' | 'Investigating' | 'Resolved' | 'False Positive';

export interface AnomalyAlert {
    id: string;
    camera_id: string;
    type: 'PARKING_VIOLATION' | 'CAPACITY_EXCEEDED' | 'UNAUTHORIZED_VEHICLE' | 'SUSPICIOUS_BEHAVIOR' | 'INDIAN_RED_FLAG_VIOLENCE';
    severity: 'Low' | 'Medium' | 'Critical';
    confidence: number;
    image_url: string;
    status: AlertStatus;
    timestamp: string;
    operator_notes?: string;
}

// In-memory alert store (stands in for PostgreSQL when DB is unavailable)
export const alertStore = new Map<string, AnomalyAlert>();

/** GET /api/alerts — return all alerts, newest first */
export const getAlerts = (_req: Request, res: Response): void => {
    const alerts = Array.from(alertStore.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    res.json(alerts);
};

/** PUT /api/alerts/:id — update status & operator_notes */
export const updateAlert = (req: Request, res: Response): void => {
    const id = req.params.id as string;
    const { status, notes } = req.body as { status?: AlertStatus; notes?: string };

    const alert = alertStore.get(id);

    if (!alert) {
        res.status(404).json({ error: 'Alert not found' });
        return;
    }

    if (status) alert.status = status;
    if (notes !== undefined) alert.operator_notes = notes;

    alertStore.set(id, alert);

    console.log(`[Alert Updated] ${id} → ${status}`);
    res.json(alert);
};

/** POST /api/alerts — receive a new anomaly from Edge Node */
export const createAlert = async (req: Request, res: Response): Promise<void> => {
    // ─── JWT Authentication ───
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }

    let edgeNodeId = 'Unknown Node';
    try {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'hackops-crew-secret-key-2026';
        const decoded = jwt.verify(token, secret) as any;
        edgeNodeId = decoded.edge_node || req.body.location || 'CAM-04';

        // Log Token Usage to Audit Trail
        const log = new AuditLogModel({
            action: `${edgeNodeId} authenticated via Edge Token.`,
            actor_email: 'edge-system',
            ip_address: req.ip || '0.0.0.0'
        });
        await log.save();
    } catch (e) {
        console.log(`[Auth Failed] Invalid Edge Token from ${req.ip}`);
        res.status(401).json({ error: "Unauthorized Edge Node: Invalid Token" });
        return;
    }
    // ──────────────────────────

    const { type, location, confidence, timestamp } = req.body;
    
    // Convert logic from python payload
    const confDec = confidence ? confidence / 100 : 0.85;

    const anomaly: AnomalyAlert = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        camera_id: location || edgeNodeId,
        type: (type || 'UNKNOWN').replace('-', '_').toUpperCase() as any,
        severity: confDec > 0.85 ? 'Critical' : confDec > 0.6 ? 'Medium' : 'Low',
        confidence: confDec,
        image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        status: 'Pending',
        timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString()
    };
    
    alertStore.set(anomaly.id, anomaly);
    if (alertStore.size > 500) {
        const oldestKey = alertStore.keys().next().value;
        if (oldestKey) alertStore.delete(oldestKey);
    }
    
    console.log(`[Edge Anomaly REST] ${anomaly.type} at ${anomaly.camera_id}`);
    
    // Trigger socket broadcast globally
    try {
        const { eventBus } = require('../index');
        eventBus.emit('broadcast_anomaly', anomaly);
    } catch (e) {}

    res.status(201).json(anomaly);
};

/** POST /api/alerts/open — unauthenticated anomaly endpoint for edge workers */
export const createAlertOpen = async (req: Request, res: Response): Promise<void> => {
    const { type, location, confidence, timestamp } = req.body;
    const confDec = confidence ? confidence / 100 : 0.85;

    const anomaly: AnomalyAlert = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        camera_id: location || 'UNKNOWN',
        type: (type || 'UNKNOWN').replace('-', '_').toUpperCase() as any,
        severity: confDec > 0.85 ? 'Critical' : confDec > 0.6 ? 'Medium' : 'Low',
        confidence: confDec,
        image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        status: 'Pending',
        timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString()
    };

    alertStore.set(anomaly.id, anomaly);
    if (alertStore.size > 500) {
        const oldestKey = alertStore.keys().next().value;
        if (oldestKey) alertStore.delete(oldestKey);
    }

    // Update camera heartbe    // Mark camera as UP
    const cam = cameraStore.get(anomaly.camera_id);
    if (cam) {
        cam.status = 'UP';
        cam.lastHeartbeat = new Date().toISOString();
        cameraStore.set(anomaly.camera_id, cam);
    }

    // Log to Audit Trail
    try {
        const log = new AuditLogModel({
            action: `ANOMALY_DETECTED: ${anomaly.type} at ${anomaly.camera_id} (${Math.round(confDec * 100)}% confidence)`,
            actor_email: 'SYSTEM/AI',
            ip_address: req.ip || '0.0.0.0'
        });
        await log.save();
    } catch(e) {}

    console.log(`[Edge Anomaly] ${anomaly.type} at ${anomaly.camera_id}`);

    // Trigger socket broadcast
    try {
        const { eventBus } = require('../index');
        eventBus.emit('broadcast_anomaly', anomaly);
        
        // --- THREAT SCORING & SPATIAL CONGESTION LOGIC ---
        let threatScore = 0;
        const currentHour = new Date().getHours();
        
        // Night Time bonus (2 AM - 4 AM)
        if (currentHour >= 2 && currentHour <= 4) threatScore += 25;

        // If this is a critical violence alert
        if (anomaly.type === 'INDIAN_RED_FLAG_VIOLENCE' && anomaly.severity === 'Critical') {
            const detailsUpper = (req.body.details || '').toUpperCase();
            
            if (detailsUpper.includes('WEAPON') || detailsUpper.includes('KNIFE') || detailsUpper.includes('BAT')) {
                threatScore += 100;
            }
            if (detailsUpper.includes('CROWD') || detailsUpper.includes('GROUP') || parseInt(detailsUpper.match(/\d+/)?.[0] || '0') >= 4) {
                threatScore += 50;
            }

            console.log(`[THREAT SCORING] ${anomaly.camera_id} computed score: ${threatScore}`);

            // Force the primary surveillance window to lock on high-threat targets
            if (threatScore >= 50) {
                console.log(`[SPATIAL CONGESTION] Auto-switching primary dashboard to ${anomaly.camera_id} due to high Threat Score (${threatScore})`);
                eventBus.emit('force_stream_switch', anomaly.camera_id);
            }
            
            // Dispatch SMS/WhatsApp
            dispatchViolenceAlert({
                camId: anomaly.camera_id,
                details: req.body.details || 'Violent incident detected'
            });
        }
    } catch (e) {
        console.error("Error in alert post-processing:", e);
    }

    res.status(201).json(anomaly);
};
