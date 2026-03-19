import { Request, Response } from 'express';
import { alertStore, AnomalyAlert } from './alertController';

/** Helper: filter alerts by time range */
function filterByRange(range: string): AnomalyAlert[] {
    const now = Date.now();
    let cutoff: number;

    switch (range) {
        case '7d':
            cutoff = now - 7 * 24 * 60 * 60 * 1000;
            break;
        case '30d':
            cutoff = now - 30 * 24 * 60 * 60 * 1000;
            break;
        case '24h':
        default:
            cutoff = now - 24 * 60 * 60 * 1000;
            break;
    }

    return Array.from(alertStore.values()).filter(
        (a) => new Date(a.timestamp).getTime() >= cutoff
    );
}

/** Helper: bucket alerts into time intervals */
function bucketTrends(alerts: AnomalyAlert[], range: string) {
    // Determine bucket size based on range
    let bucketMs: number;
    let bucketCount: number;

    switch (range) {
        case '7d':
            bucketMs = 24 * 60 * 60 * 1000; // 1 day buckets
            bucketCount = 7;
            break;
        case '30d':
            bucketMs = 24 * 60 * 60 * 1000; // 1 day buckets
            bucketCount = 30;
            break;
        case '24h':
        default:
            bucketMs = 60 * 60 * 1000; // 1 hour buckets
            bucketCount = 24;
            break;
    }

    const now = Date.now();
    const buckets: { time_bucket: string; anomaly_count: number }[] = [];

    for (let i = bucketCount - 1; i >= 0; i--) {
        const bucketStart = now - (i + 1) * bucketMs;
        const bucketEnd = now - i * bucketMs;

        const count = alerts.filter((a) => {
            const t = new Date(a.timestamp).getTime();
            return t >= bucketStart && t < bucketEnd;
        }).length;

        buckets.push({
            time_bucket: new Date(bucketEnd).toISOString(),
            anomaly_count: count,
        });
    }

    return buckets;
}

/** Helper: compute zone distribution from camera IDs */
function computeZoneDistribution(alerts: AnomalyAlert[]) {
    // Map camera IDs to human-readable zone names
    const zoneNames: Record<string, string> = {
        'CAM-01': 'Main Gate',
        'CAM-02': 'Parking Structure',
        'CAM-03': 'Perimeter Fence A',
    };

    const zoneCounts = new Map<string, number>();

    for (const alert of alerts) {
        const zone = zoneNames[alert.camera_id] || alert.camera_id;
        zoneCounts.set(zone, (zoneCounts.get(zone) || 0) + 1);
    }

    return Array.from(zoneCounts.entries()).map(([zone_name, total_alerts]) => ({
        zone_name,
        total_alerts,
    }));
}

/** Helper: compute accuracy metrics */
function computeAccuracyMetrics(alerts: AnomalyAlert[]) {
    const resolved = alerts.filter((a) => a.status === 'Resolved');
    const falsePositives = alerts.filter((a) => a.status === 'False Positive');
    const totalConfidence = alerts.reduce((sum, a) => sum + a.confidence, 0);

    return {
        true_positives: resolved.length,
        false_positives: falsePositives.length,
        avg_confidence: alerts.length > 0 ? (totalConfidence / alerts.length) / 100 : 0,
    };
}

/** GET /api/analytics?range=24h|7d|30d */
export const getAnalytics = (req: Request, res: Response): void => {
    const range = (req.query.range as string) || '24h';
    const alerts = filterByRange(range);

    res.json({
        trends: bucketTrends(alerts, range),
        zoneDistribution: computeZoneDistribution(alerts),
        accuracyMetrics: computeAccuracyMetrics(alerts),
    });
};

/** GET /api/analytics/export?range=24h|7d|30d — CSV export */
export const exportAnalytics = (req: Request, res: Response): void => {
    const range = (req.query.range as string) || '24h';
    const alerts = filterByRange(range);

    // Build CSV
    const header = 'id,camera_id,type,severity,confidence,status,timestamp,operator_notes\n';
    const rows = alerts
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((a) =>
            `${a.id},${a.camera_id},${a.type},${a.severity},${a.confidence},${a.status},${a.timestamp},"${(a.operator_notes || '').replace(/"/g, '""')}"`
        )
        .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics_${range}_${Date.now()}.csv`);
    res.send(header + rows);
};
