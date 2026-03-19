import { Request, Response } from 'express';

// ─── Types ──────────────────────────────────────────────────

export interface StorageFile {
    id: string;
    key: string;
    filename: string;
    type: 'video' | 'image' | 'log';
    size_MB: number;
    url: string;
    created_at: string;
}

// ─── In-Memory Stores ───────────────────────────────────────

let retentionDays = 30;

const mockFiles: StorageFile[] = [
    { id: 'f_001', key: 'captures/2026-02-27/CAM-01_maingate_14-32-10.mp4', filename: 'CAM-01_maingate_14-32-10.mp4', type: 'video', size_MB: 124.5, url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'f_002', key: 'captures/2026-02-27/CAM-02_perimeter_15-01-45.mp4', filename: 'CAM-02_perimeter_15-01-45.mp4', type: 'video', size_MB: 98.2, url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'f_003', key: 'alerts/2026-02-27/evt_parking_violation_01.jpg', filename: 'evt_parking_violation_01.jpg', type: 'image', size_MB: 2.4, url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'f_004', key: 'alerts/2026-02-27/evt_capacity_breach_02.jpg', filename: 'evt_capacity_breach_02.jpg', type: 'image', size_MB: 1.8, url: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800', created_at: new Date(Date.now() - 5400000).toISOString() },
    { id: 'f_005', key: 'alerts/2026-02-26/evt_unauthorized_vehicle_03.jpg', filename: 'evt_unauthorized_vehicle_03.jpg', type: 'image', size_MB: 3.1, url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'f_006', key: 'logs/2026-02-27/edge-jetson-01_system.log', filename: 'edge-jetson-01_system.log', type: 'log', size_MB: 0.8, url: '#', created_at: new Date(Date.now() - 10800000).toISOString() },
    { id: 'f_007', key: 'logs/2026-02-27/edge-jetson-02_system.log', filename: 'edge-jetson-02_system.log', type: 'log', size_MB: 1.2, url: '#', created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 'f_008', key: 'captures/2026-02-26/CAM-03_parking_09-15-33.mp4', filename: 'CAM-03_parking_09-15-33.mp4', type: 'video', size_MB: 210.7, url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 'f_009', key: 'alerts/2026-02-25/evt_suspicious_behavior_04.jpg', filename: 'evt_suspicious_behavior_04.jpg', type: 'image', size_MB: 2.6, url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800', created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: 'f_010', key: 'captures/2026-02-25/CAM-01_maingate_22-45-12.mp4', filename: 'CAM-01_maingate_22-45-12.mp4', type: 'video', size_MB: 156.3, url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', created_at: new Date(Date.now() - 345600000).toISOString() },
];

const fileStore = new Map<string, StorageFile>(mockFiles.map((f) => [f.id, f]));

function computeStats() {
    const files = Array.from(fileStore.values());
    const videoGB = +(files.filter((f) => f.type === 'video').reduce((s, f) => s + f.size_MB, 0) / 1024).toFixed(2);
    const imageGB = +(files.filter((f) => f.type === 'image').reduce((s, f) => s + f.size_MB, 0) / 1024).toFixed(3);
    const logGB = +(files.filter((f) => f.type === 'log').reduce((s, f) => s + f.size_MB, 0) / 1024).toFixed(3);
    const usedGB = +(videoGB + imageGB + logGB).toFixed(2);

    return {
        totalCapacity_GB: 50,
        usedSpace_GB: usedGB,
        freeSpace_GB: +(50 - usedGB).toFixed(2),
        distribution: [
            { category: 'Video Clips', size_GB: videoGB, color: '#3b82f6', fileCount: files.filter((f) => f.type === 'video').length },
            { category: 'Alert Images', size_GB: imageGB, color: '#f97316', fileCount: files.filter((f) => f.type === 'image').length },
            { category: 'System Logs', size_GB: logGB, color: '#8b5cf6', fileCount: files.filter((f) => f.type === 'log').length },
        ],
        retentionDays,
        totalFiles: files.length,
    };
}

// ─── Handlers ───────────────────────────────────────────────

/** GET /api/storage/stats */
export const getStorageStats = (_req: Request, res: Response): void => {
    res.json(computeStats());
};

/** GET /api/storage/files */
export const getStorageFiles = (req: Request, res: Response): void => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const typeFilter = req.query.type as string | undefined;

    let files = Array.from(fileStore.values());
    if (typeFilter && typeFilter !== 'all') {
        files = files.filter((f) => f.type === typeFilter);
    }
    // Sort by newest first
    files.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = files.length;
    const start = (page - 1) * limit;
    const paginatedFiles = files.slice(start, start + limit);

    res.json({ files: paginatedFiles, total, page, limit });
};

/** DELETE /api/storage/files */
export const deleteStorageFile = (req: Request, res: Response): void => {
    const { key } = req.body as { key: string };
    const file = Array.from(fileStore.values()).find((f) => f.key === key);
    if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
    }
    fileStore.delete(file.id);
    res.json({ success: true, deleted: file.filename });
};

/** PUT /api/storage/policy */
export const updateRetentionPolicy = (req: Request, res: Response): void => {
    const { days } = req.body as { days: number };
    if (!days || days < 1) {
        res.status(400).json({ error: 'Invalid retention period' });
        return;
    }
    retentionDays = days;
    res.json({ success: true, retentionDays });
};
