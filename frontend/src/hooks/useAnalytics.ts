import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// TypeScript definitions for the real data structures expected from the analytics API
export interface TrendData {
    time_bucket: string; // e.g., '2023-10-27T10:00:00Z'
    anomaly_count: number;
}

export interface ZoneData {
    zone_name: string;
    total_alerts: number;
}

export interface AnalyticsPayload {
    trends: TrendData[];
    zoneDistribution: ZoneData[];
    accuracyMetrics: {
        true_positives: number;
        false_positives: number;
        avg_confidence: number;
    };
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useAnalytics = (timeRange: '24h' | '7d' | '30d') => {
    return useQuery<AnalyticsPayload>({
        queryKey: ['analytics', timeRange],
        queryFn: async () => {
            // Use relative URL — Vite proxy forwards /api to backend
            const { data } = await axios.get(`${API_BASE}/api/analytics`, {
                params: { range: timeRange },
            });
            return data;
        },
        refetchInterval: 30000, // Silently refetch every 30s to keep charts fresh
    });
};
