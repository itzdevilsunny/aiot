import { Request, Response } from 'express';

// ─── Types ──────────────────────────────────────────────────

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical';
    is_read: boolean;
    created_at: string;
}

// ─── In-Memory Store ────────────────────────────────────────

export const notificationStore = new Map<string, AppNotification>();

// Pre-seed with realistic system events
const seed: AppNotification[] = [
    { id: 'notif_001', title: 'Parking Capacity Exceeded', message: 'Zone B-3 has exceeded 95% capacity. 142/150 slots occupied. Consider diverting vehicles.', type: 'critical', is_read: false, created_at: new Date(Date.now() - 120000).toISOString() },
    { id: 'notif_002', title: 'Edge Node Overheating', message: 'edge-jetson-03 temperature reached 82°C. Thermal throttling may begin at 85°C.', type: 'warning', is_read: false, created_at: new Date(Date.now() - 300000).toISOString() },
    { id: 'notif_003', title: 'Model Update Deployed', message: 'YOLOv8m-municipal-parking v8.1.3 successfully deployed to all 3 edge nodes.', type: 'info', is_read: false, created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 'notif_004', title: 'Unauthorized Vehicle Detected', message: 'CAM-02 flagged an unregistered vehicle in restricted zone A-1. Confidence: 94.2%.', type: 'critical', is_read: false, created_at: new Date(Date.now() - 900000).toISOString() },
    { id: 'notif_005', title: 'Daily Backup Complete', message: 'All video clips and alert images backed up to S3. 2.4 GB transferred.', type: 'info', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'notif_006', title: 'Suspicious Behavior Alert', message: 'CAM-01 detected loitering near main gate for > 10 minutes. Review recommended.', type: 'warning', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'notif_007', title: 'System Health Check Passed', message: 'All services online. Database latency: 12ms. API response time: 45ms avg.', type: 'info', is_read: true, created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 'notif_008', title: 'Retention Policy Executed', message: 'Cleaned up 847 files older than 30 days. Freed 18.3 GB of storage.', type: 'info', is_read: true, created_at: new Date(Date.now() - 28800000).toISOString() },
];

seed.forEach((n) => notificationStore.set(n.id, n));

// ─── Handlers ───────────────────────────────────────────────

/** GET /api/notifications */
export const getNotifications = (_req: Request, res: Response): void => {
    const all = Array.from(notificationStore.values())
        .sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
        });
    res.json(all);
};

/** PUT /api/notifications/:id/read */
export const markAsRead = (req: Request, res: Response): void => {
    const notif = notificationStore.get(req.params.id as string);
    if (!notif) {
        res.status(404).json({ error: 'Notification not found' });
        return;
    }
    notif.is_read = true;
    res.json({ success: true });
};

/** PUT /api/notifications/read-all */
export const markAllAsRead = (_req: Request, res: Response): void => {
    for (const notif of notificationStore.values()) {
        notif.is_read = true;
    }
    res.json({ success: true });
};

/** Helper: push a notification into the store (called from Socket.IO emitter) */
export function addNotification(notif: AppNotification): void {
    notificationStore.set(notif.id, notif);
    // Keep store bounded at 100
    if (notificationStore.size > 100) {
        const oldest = notificationStore.keys().next().value;
        if (oldest) notificationStore.delete(oldest);
    }
}
