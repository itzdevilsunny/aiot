import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import alertRoutes from './routes/alertRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import edgeRoutes from './routes/edgeRoutes';
import securityRoutes from './routes/securityRoutes';
import storageRoutes from './routes/storageRoutes';
import settingsRoutes from './routes/settingsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import statsRoutes from './routes/statsRoutes';
import reportRoutes from './routes/reportRoutes';
import { getCameras, scanNetworkCameras } from './controllers/cameraController';
import { addNotification, AppNotification as SystemNotification } from './controllers/notificationController';
import { alertStore, AnomalyAlert, createAlertOpen, cameraHeartbeats } from './controllers/alertController';
import { edgeNodes } from './controllers/edgeController';
import { dispatchToAuthorities } from './services/dispatchService';
const violenceAlertStore = new Map<string, any>();
import './models'; // Initialize MongoDB Connection

// Event bus for bridging REST → WebSocket broadcasts
export const eventBus = new EventEmitter();

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Pre-seed 24h of historical mock data so Analytics/ZoneMap are rich on first load ──
(function seedHistoricalAlerts() {
    const seedTypes: Array<AnomalyAlert['type']> = ['PARKING_VIOLATION', 'CAPACITY_EXCEEDED', 'UNAUTHORIZED_VEHICLE', 'SUSPICIOUS_BEHAVIOR'];
    const seedCams = ['CAM-01', 'CAM-02', 'CAM-03'];
    const seedSeverities: Array<AnomalyAlert['severity']> = ['Low', 'Medium', 'Critical'];
    const seedStatuses: Array<AnomalyAlert['status']> = ['Resolved', 'Resolved', 'Resolved', 'False Positive', 'Pending'];
    const seedImages = [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    ];
    const now = Date.now();
    for (let i = 0; i < 220; i++) {
        const ageMs = Math.random() * 24 * 60 * 60 * 1000; // random point in last 24h
        const id = `seed_${i}_${Math.random().toString(36).slice(2, 6)}`;
        const alert: AnomalyAlert = {
            id,
            camera_id: seedCams[Math.floor(Math.random() * seedCams.length)],
            type: seedTypes[Math.floor(Math.random() * seedTypes.length)],
            severity: seedSeverities[Math.floor(Math.random() * seedSeverities.length)],
            confidence: Math.round((Math.random() * 20 + 80) * 100) / 100,
            image_url: seedImages[Math.floor(Math.random() * seedImages.length)],
            status: seedStatuses[Math.floor(Math.random() * seedStatuses.length)],
            timestamp: new Date(now - ageMs).toISOString(),
        };
        alertStore.set(id, alert);
    }
    console.log(`[Seed] Pre-populated alertStore with ${alertStore.size} historical alerts`);
})();


app.use('/api/auth', authRoutes);
app.get('/api/cameras', getCameras);
app.post('/api/cameras/scan', scanNetworkCameras);
app.use('/api/alerts', alertRoutes);
app.post('/api/alerts/open', createAlertOpen);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/edge', edgeRoutes);

// Violence Alert & Dispatch
app.post('/api/violence-alert', express.json({ limit: '50mb' }), (req, res) => {
    const alert = {
        id: `violence_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...req.body
    };
    violenceAlertStore.set(alert.id, alert);
    io.emit('violence_alert', alert);

    // ── Cross-post into shared alertStore so Zone Map shows it ──
    const sharedAlert: AnomalyAlert = {
        id: alert.id,
        camera_id: alert.camId || 'CAM-04',
        type: 'INDIAN_RED_FLAG_VIOLENCE',
        severity: alert.severity === 'CRITICAL' ? 'Critical' : 'Medium',
        confidence: alert.confidence || 0.9,
        image_url: alert.image || '',
        status: 'Pending',
        timestamp: alert.timestamp,
        operator_notes: alert.description || '',
    };
    alertStore.set(sharedAlert.id, sharedAlert);
    io.emit('new_anomaly', sharedAlert);
    
    // Also create a system notification
    const notif: any = {
        id: `notif_v_${Date.now()}`,
        title: 'INDIAN RED FLAG: VIOLENCE ALERT',
        message: `${alert.camId}: ${alert.description}`,
        type: 'critical',
        is_read: false,
        created_at: alert.timestamp
    };
    addNotification(notif);
    io.emit('system_alert', notif);
    
    console.log('[Violence Alert] Received and broadcast:', alert.id);
    res.status(200).json({ success: true, alertId: alert.id });
});

app.post('/api/dispatch', async (req, res) => {
    const { alertId } = req.body;
    const alert = violenceAlertStore.get(alertId);
    
    if (!alert) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    const result = await dispatchToAuthorities({
        camId: alert.camId,
        memberCount: alert.count || 0,
        weaponsDetected: alert.weapons || [],
        type: alert.type || 'INDIAN_RED_FLAG',
        severity: alert.severity || 'CRITICAL',
        description: alert.description,
        image: alert.image
    });

    res.status(result.success ? 200 : 500).json(result);
});
app.use('/api/security', securityRoutes);
app.use('/api/storage', storageRoutes);

// ── CITIZEN SAFETY PORTAL API ──
export interface CitizenIncident {
    id: string;
    citizen_name: string;
    citizen_phone: string;
    category: 'Violence' | 'Crowd' | 'Municipal';
    description: string;
    location: { lat: number; lng: number };
    image_url: string;
    status: 'REPORTED' | 'UNDER REVIEW' | 'TEAM DISPATCHED' | 'RESOLVED';
    resolution_image_url?: string;
    timestamp: string;
    ai_priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
    is_verified_red_flag: boolean;
    eta?: string;
}

export const citizenIncidentStore = new Map<string, CitizenIncident>();

app.get('/api/citizen/incidents', (req, res) => {
    const incidents = Array.from(citizenIncidentStore.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    res.json(incidents);
});

app.post('/api/citizen/report', express.json({ limit: '50mb' }), (req, res) => {
    const data = req.body;
    const { lat, lng } = data.location || { lat: 28.6139, lng: 77.2090 };
    
    // ─── INCIDENT CLUSTERING (SCALABILITY) ───
    // Check for existing active incidents of same type within ~100m (0.001 deg)
    const existingIncident = Array.from(citizenIncidentStore.values()).find(inc => 
        inc.category === data.category &&
        inc.status !== 'RESOLVED' &&
        Math.abs(inc.location.lat - lat) < 0.001 &&
        Math.abs(inc.location.lng - lng) < 0.001
    );

    if (existingIncident) {
        console.log(`[CLUSTERING] Duplicate report for ${existingIncident.id}. Merging data.`);
        existingIncident.description += `\n[Update ${new Date().toLocaleTimeString()}]: ${data.description || 'Verified by additional citizen'}`;
        existingIncident.timestamp = new Date().toISOString();
        
        io.emit('citizen_incident_updated', existingIncident);
        return res.status(200).json(existingIncident);
    }

    // ─── YOLOv8 AI PRE-PROCESSING (SIMULATED) ───
    let priority: 'CRITICAL' | 'HIGH' | 'NORMAL' = 'NORMAL';
    let isVerifiedRedFlag = false;
    let aiReason = "";

    if (data.category === 'Violence') {
        priority = 'CRITICAL';
        isVerifiedRedFlag = true; 
        aiReason = "YOLOv8: Potential Weapon/Violence Detected";
    } else if (data.category === 'Crowd') {
        priority = 'HIGH';
        isVerifiedRedFlag = true; 
        aiReason = "YOLOv8: Large Crowd (4+ People) Verified";
    }

    const incident: CitizenIncident = {
        id: `CIT-${Date.now().toString().slice(-6)}`,
        citizen_name: data.citizen_name || 'Anonymous',
        citizen_phone: data.citizen_phone || 'Unverified',
        category: (data.category || 'Municipal'),
        description: aiReason ? `${aiReason} | ${data.description || ''}` : (data.description || ''),
        location: { lat, lng },
        image_url: data.image_url || '',
        status: 'REPORTED',
        timestamp: new Date().toISOString(),
        ai_priority: priority,
        is_verified_red_flag: isVerifiedRedFlag
    };
    
    citizenIncidentStore.set(incident.id, incident);
    
    if (isVerifiedRedFlag) {
        console.log(`[AI ANALYSIS] 🚨 YOLOv8 Verified: Detection triggered for ${incident.id}. flagging as INDIAN RED FLAG.`);
    }

    io.emit('citizen_incident_new', incident);
    
    const notif: any = {
        id: `notif_c_${Date.now()}`,
        title: isVerifiedRedFlag ? 'VERIFIED INDIAN RED FLAG' : `CITIZEN REPORT: ${incident.category.toUpperCase()}`,
        message: `${incident.id} - ${incident.description}`,
        type: priority === 'CRITICAL' ? 'critical' : 'warning',
        is_read: false,
        created_at: incident.timestamp
    };
    addNotification(notif);
    io.emit('system_alert', notif);

    res.status(201).json(incident);
});

app.post('/api/citizen/incidents/:id/dispatch', (req, res) => {
    const id = req.params.id;
    const incident = citizenIncidentStore.get(id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    
    incident.status = 'TEAM DISPATCHED';
    // Simulate Distance/ETA Calculation based on nearest Dispatch Unit
    incident.eta = incident.ai_priority === 'CRITICAL' ? '4 mins' : '12 mins';

    citizenIncidentStore.set(id, incident);
    
    // Broadcast state change
    io.emit('citizen_incident_updated', incident);
    res.json(incident);
});

app.post('/api/citizen/incidents/:id/resolve', express.json({ limit: '50mb' }), (req, res) => {
    const id = req.params.id;
    const incident = citizenIncidentStore.get(id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    
    incident.status = 'RESOLVED';
    // Dummy resolution proof image if none provided
    incident.resolution_image_url = req.body.image_url || 'https://images.unsplash.com/photo-1584483783936-cecb8da1c22e?w=800'; 
    citizenIncidentStore.set(id, incident);
    
    // Broadcast state change
    io.emit('citizen_incident_updated', incident);
    res.json(incident);
});
// ───────────────────────────────

app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reports', reportRoutes);

app.post('/api/system/shutdown', (req, res) => {
    const { exec } = require('child_process');
    exec('python kill_nodes.py', (err: any, stdout: any, stderr: any) => {
        io.emit('system_shutdown');
        res.sendStatus(200);
    });
});

app.post('/api/stream-upload', express.json({ limit: '50mb' }), (req, res) => {
    const { camId, image, status, metrics } = req.body;
    io.emit(`node_stream_${camId}`, { image, status, metrics });
    io.emit('primary_stream_update', { camId, frame: image });
    io.emit('edge_heartbeat', { id: camId, status: 'online', metrics });
    
    // Update Camera DB Status
    const { cameraStore } = require('./controllers/cameraController');
    const cam = cameraStore.get(camId);
    if (cam) {
        cam.status = 'UP';
        cam.lastHeartbeat = new Date().toISOString();
        cameraStore.set(camId, cam);
    }
    res.sendStatus(200);
});

app.post('/api/update-stream', express.json({ limit: '50mb' }), (req, res) => {
    const { camId, image, objects, status, metrics } = req.body;
    
    // Only emit the camera-specific stream (1 event instead of 3)
    io.emit(`node_stream_${camId}`, { image, status, objects, metrics });

    // Update Camera DB Status
    const { cameraStore } = require('./controllers/cameraController');
    const cam = cameraStore.get(camId);
    if (cam) {
        cam.status = status && status !== 'UP' ? 'ALERT' : 'UP';
        cam.lastHeartbeat = new Date().toISOString();
        cameraStore.set(camId, cam);
    }
    res.sendStatus(200);
});

// ── REAL-TIME AI ALERT BRIDGE ──────────────────────────────────────────────
app.post('/api/violence-alert', express.json({ limit: '50mb' }), (req, res) => {
    const { camId, type, severity, description, image, count, weapons } = req.body;
    
    const anomaly: AnomalyAlert = {
        id: `evt_${Date.now()}_AI`,
        camera_id: camId,
        type: type || 'SUSPICIOUS_BEHAVIOR',
        severity: severity || 'Medium',
        confidence: 0.95,
        image_url: `data:image/jpeg;base64,${image}`,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };

    // 1. History Store
    alertStore.set(anomaly.id, anomaly);
    
    // 2. Real-time Socket Broadcast
    io.emit('new_anomaly', anomaly);
    io.emit('violence_alert', { ...anomaly, description, count, weapons });
    
    // 3. System Log Feed (Terminal on Dashboard)
    const logEntry = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        source: `EDGE:${camId}`,
        msg: `🚨 ${severity} ALERT: ${description}`,
        type: severity === 'CRITICAL' ? 'error' : 'warn'
    };
    io.emit('system_log', logEntry);

    console.log(`[AI EDGE] 🚩 ${severity} alert from ${camId}: ${description}`);
    res.sendStatus(200);
});

// Basic healthcheck
app.get('/health', async (req, res) => {
    try {
        // Test DB connection
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: String(error) });
    }
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Bridge: when a Python Edge Node POSTs an anomaly via REST, broadcast it to all WS clients
    const onBroadcastAnomaly = (anomaly: AnomalyAlert) => {
        io.emit('new_anomaly', anomaly);
    };
    eventBus.on('broadcast_anomaly', onBroadcastAnomaly);

    // Relay base64 video frames from Python edge workers to React dashboard
    socket.on('primary_stream_update', (data: any) => {
        // Broadcast to ALL other connected React clients
        socket.broadcast.emit('primary_stream_update', data);
    });

    // Fallback initial cameras if DB is empty for demo
    const initialCameras = [
        { id: 'CAM-01', name: 'Main Gate', status: 'online', lat: 28.6139, lng: 77.2090 },
        { id: 'CAM-02', name: 'Perimeter Fence A', status: 'online', lat: 28.6186, lng: 77.2153 },
        { id: 'CAM-03', name: 'Parking Structure', status: 'offline', lat: 28.6100, lng: 77.2000 }
    ];
    socket.emit('init_cameras', initialCameras);

    // Simulate incoming Python AI events (Temporarily running on Node API layer until Python is built)
    const mockImages = [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
        'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800',
    ];
    const mockAnomalyInterval = setInterval(() => {
        const severities: Array<'Low' | 'Medium' | 'Critical'> = ['Low', 'Medium', 'Critical'];
        const types: Array<AnomalyAlert['type']> = ['PARKING_VIOLATION', 'CAPACITY_EXCEEDED', 'UNAUTHORIZED_VEHICLE', 'SUSPICIOUS_BEHAVIOR'];
        const randSev = Math.floor(Math.random() * 3);
        const randType = Math.floor(Math.random() * types.length);
    
        const anomaly: AnomalyAlert = {
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            camera_id: `CAM-0${Math.floor(Math.random() * 3) + 1}`,
            type: types[randType],
            severity: severities[randSev],
            confidence: Math.round((Math.random() * 20 + 80) * 100) / 100,
            image_url: mockImages[Math.floor(Math.random() * mockImages.length)],
            status: 'Pending',
            timestamp: new Date().toISOString()
        };
    
        // Store in-memory so GET /api/alerts returns history
        alertStore.set(anomaly.id, anomaly);
        // Keep store bounded to 500 entries
        if (alertStore.size > 500) {
            const oldestKey = alertStore.keys().next().value;
            if (oldestKey) alertStore.delete(oldestKey);
        }
    
        console.log('[Mock AI Publisher] Broadcast anomaly:', anomaly.type);
        io.emit('new_anomaly', anomaly);
    }, 8000); // Pulse every 8 seconds

    // ── Mock Edge Heartbeat Emitter ──
    const edgeHeartbeatInterval = setInterval(() => {
        for (const node of edgeNodes.values()) {
            if (node.status === 'offline') continue;
            // Simulate realistic metric fluctuation
            const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
            node.metrics.cpu_usage = clamp(node.metrics.cpu_usage + (Math.random() * 10 - 5), 15, 95);
            node.metrics.ram_usage = clamp(node.metrics.ram_usage + (Math.random() * 6 - 3), 30, 92);
            node.metrics.temperature = clamp(node.metrics.temperature + (Math.random() * 4 - 2), 38, 88);
            node.metrics.uptime += 10;
            node.last_heartbeat = new Date().toISOString();

            // Round for display
            node.metrics.cpu_usage = Math.round(node.metrics.cpu_usage * 10) / 10;
            node.metrics.ram_usage = Math.round(node.metrics.ram_usage * 10) / 10;
            node.metrics.temperature = Math.round(node.metrics.temperature * 10) / 10;

            io.emit('edge_heartbeat', {
                id: node.id,
                status: node.status,
                metrics: node.metrics,
                timestamp: node.last_heartbeat,
            });
        }
    }, 10000); // Every 10 seconds

    // ── Mock AI Bounding Box Inference (simulates Python AI service) ──
    const boxLabels = [
        { label: 'Vehicle', color: '#22C55E' },
        { label: 'Person', color: '#3B82F6' },
        { label: 'Missing Safety Gear', color: '#EF4444' },
        { label: 'Parking Violation', color: '#F59E0B' },
        { label: 'Unauthorized Access', color: '#EC4899' },
    ];
    // const boxInterval = setInterval(() => {
    //     const numBoxes = Math.floor(Math.random() * 3) + 1;
    //     const boxes = Array.from({ length: numBoxes }, (_, i) => {
    //         const tmpl = boxLabels[Math.floor(Math.random() * boxLabels.length)];
    //         return {
    //             id: `box_${Date.now()}_${i}`,
    //             label: tmpl.label,
    //             confidence: 0.85 + Math.random() * 0.14,
    //             color: tmpl.color,
    //             x: 10 + Math.random() * 40,
    //             y: 10 + Math.random() * 40,
    //             width: 12 + Math.random() * 20,
    //             height: 15 + Math.random() * 25,
    //         };
    //     });
    //     io.emit('boxes_CAM-04', boxes);
    // }, 3000); // Refresh every 3 seconds

    // ── Mock System Notifications ──
    const systemAlertTemplates: Array<{ title: string; message: string; type: SystemNotification['type'] }> = [
        { title: 'Parking Zone Near Capacity', message: 'Zone C-2 is at 88% capacity. 132/150 slots occupied.', type: 'warning' },
        { title: 'Edge Node Recovered', message: 'edge-jetson-02 reconnected after 2m downtime. All services restored.', type: 'info' },
        { title: 'Critical: Perimeter Breach', message: 'CAM-02 detected motion in restricted zone after hours. Security team notified.', type: 'critical' },
        { title: 'Storage Warning', message: 'S3 bucket utilization exceeded 80%. Consider adjusting retention policy.', type: 'warning' },
        { title: 'New Operator Login', message: 'operator@visionaiot.dev logged in from 192.168.1.25.', type: 'info' },
    ];
    const systemAlertInterval = setInterval(() => {
        const tmpl = systemAlertTemplates[Math.floor(Math.random() * systemAlertTemplates.length)];
        const notif: SystemNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            ...tmpl,
            is_read: false,
            created_at: new Date().toISOString(),
        };
        addNotification(notif);
        io.emit('system_alert', notif);
    }, 25000); // Every 25 seconds

    // ── Heartbeat Timeout Monitor ──
    // Marks cameras as DOWN if no heartbeat/alert received for 10 seconds
    const heartbeatTimeoutInterval = setInterval(() => {
        const now = Date.now();
        const { cameraStore } = require('./controllers/cameraController');
        const statusUpdate: any[] = [];

        for (const [camId, cam] of cameraStore.entries()) {
            const lastSeen = cameraHeartbeats.get(camId) || 0;
            const isOnline = lastSeen > 0 && (now - lastSeen) < 10000;
            cam.status = isOnline ? 'UP' : cam.status; // Don't override mock UPs
            statusUpdate.push({ id: camId, status: cam.status, lastSeen });
        }

        io.emit('system_health', statusUpdate);
    }, 5000);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // clearInterval(mockAnomalyInterval);
        clearInterval(edgeHeartbeatInterval);
        clearInterval(systemAlertInterval);
        // clearInterval(boxInterval);
        clearInterval(heartbeatTimeoutInterval);
        eventBus.off('broadcast_anomaly', onBroadcastAnomaly);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
