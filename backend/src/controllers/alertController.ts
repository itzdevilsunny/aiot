import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import z from 'zod';
import { dispatchEmergencyNotification } from '../utils/alertNotifier';

const prisma = new PrismaClient();

export type AlertStatus = 'Pending' | 'Investigating' | 'Resolved' | 'False Positive';

export interface AnomalyAlert {
    id: string;
    camera_id: string;
    type: 'PARKING_VIOLATION' | 'CAPACITY_EXCEEDED' | 'UNAUTHORIZED_VEHICLE' | 'SUSPICIOUS_BEHAVIOR' | string;
    severity: 'Low' | 'Medium' | 'Critical';
    confidence: number;
    image_url: string;
    status: AlertStatus;
    timestamp: string;
    operator_notes?: string;
}

// In-memory alert store (stands in for PostgreSQL when DB is unavailable or for demo history)
export const alertStore = new Map<string, AnomalyAlert>();

// Zod Schema for strict payload validation from the Python AI Engine
const createAlertSchema = z.object({
    camera_id: z.string().uuid(),
    type: z.string().min(1).max(100),
    severity: z.enum(['Low', 'Medium', 'Critical']),
    confidence: z.number().min(0).max(1),
    image_url: z.string().url().optional()
});

/** POST /api/alerts/webhook — Dedicated intake for Python AI engine */
export const handleAiDetection = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Strict Payload Validation
        const parsedData = createAlertSchema.parse(req.body);

        // 2. Map Payload to Prisma Db format
        const severityMap = {
            'Low': 'LOW',
            'Medium': 'MEDIUM',
            'Critical': 'CRITICAL'
        } as const;

        try {
            // Attempt to persist to PostgreSQL Database
            const savedAlert = await prisma.alert.create({
                data: {
                    cameraId: parsedData.camera_id,
                    type: parsedData.type,
                    severity: severityMap[parsedData.severity],
                    confidence: parsedData.confidence,
                    imageUrl: parsedData.image_url || null,
                    status: 'Pending'
                },
                include: { camera: true }
            });

            // 3. Broadcast Alert to React via WebSockets
            const io = req.app.get('io') as Server;
            if (io) {
                io.emit('new_anomaly', savedAlert);
            }

            res.status(201).json(savedAlert);
        } catch (dbError) {
            console.error("PostgreSQL not available or failed to insert. Falling back to in-memory store for Demo.", dbError);

            // Mock DB Save for local Vercel demo
            const fallbackAlert: AnomalyAlert = {
                id: `evt_${Date.now()}`,
                camera_id: parsedData.camera_id,
                type: parsedData.type,
                severity: parsedData.severity,
                confidence: parsedData.confidence,
                image_url: parsedData.image_url || '',
                status: 'Pending',
                timestamp: new Date().toISOString()
            };

            alertStore.set(fallbackAlert.id, fallbackAlert);

            // 3. Broadcast Alert to React via WebSockets & Emergency Mobile Notifier
            const io = req.app.get('io') as Server;
            if (io) io.emit('new_anomaly', fallbackAlert);

            // Dispatch Telegram & Enterprise Webhooks asynchronously
            dispatchEmergencyNotification(fallbackAlert).catch(console.warn);

            res.status(201).json(fallbackAlert);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Payload Validation Failed', details: error.issues });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

/** GET /api/alerts — return all alerts, newest first */
export const getAlerts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const dbAlerts = await prisma.alert.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: { camera: true }
        });
        res.json(dbAlerts);
    } catch {
        // Fallback to memory
        const alerts = Array.from(alertStore.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        res.json(alerts);
    }
};

/** PUT /api/alerts/:id — update status & operator_notes */
export const updateAlert = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { status, notes } = req.body as { status?: AlertStatus; notes?: string };

    try {
        const updated = await prisma.alert.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { operatorNotes: notes })
            }
        });
        console.log(`[Alert Updated DB] ${id} → ${status}`);
        res.json(updated);
    } catch {
        // Fallback
        const alert = alertStore.get(id);
        if (!alert) {
            res.status(404).json({ error: 'Alert not found' });
            return;
        }

        if (status) alert.status = status;
        if (notes !== undefined) alert.operator_notes = notes;

        alertStore.set(id, alert);
        console.log(`[Alert Updated Mem] ${id} → ${status}`);
        res.json(alert);
    }
};
