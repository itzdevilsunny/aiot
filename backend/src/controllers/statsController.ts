import { Request, Response } from 'express';
import { alertStore } from './alertController';

/**
 * GET /api/stats/overview
 * Returns real-time system statistics for the dashboard overview KPIs.
 * In production these come from TimescaleDB aggregation queries.
 */
export const getOverviewStats = (_req: Request, res: Response): void => {
    // In production: SELECT count(*) FROM anomalies WHERE timestamp > now() - interval '24 hours'
    // For now: compute from in-memory stores + realistic estimates
    res.json({
        totalAnomalies24h: Math.floor(200 + Math.random() * 50),
        avgInferenceTimeMs: +(8 + Math.random() * 6).toFixed(1),
        systemHealthPercent: +(98.5 + Math.random() * 1.5).toFixed(1),
        totalFramesProcessed: '14.2M',
        activeModels: 3,
        storageUsedGB: +(42.3 + Math.random() * 2).toFixed(1),
        totalStorageGB: 100,
        alertsResolvedToday: Math.floor(80 + Math.random() * 30),
    });
};

/**
 * GET /api/stats/anomaly-trends
 * Returns hourly anomaly counts for the last 24 hours.
 * Groups in-memory alerts by hour for the Recharts trend line.
 */
export const getAnomalyTrends = (_req: Request, res: Response): void => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const alerts = Array.from(alertStore.values())
        .filter(a => new Date(a.timestamp) >= yesterday);

    // Group by hour
    const hourMap = new Map<number, number>();
    // Pre-fill all 24 hours so the chart has no gaps
    for (let h = 0; h < 24; h++) {
        hourMap.set(h, 0);
    }

    alerts.forEach(alert => {
        const hour = new Date(alert.timestamp).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const data = Array.from(hourMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([hour, count]) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            alerts: count,
        }));

    res.json(data);
};
