import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type Role = 'Admin' | 'Operator' | 'Viewer';

interface User {
    id: string;
    email: string;
    role: Role;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

// Persist stores the JWT in localStorage so the user stays logged in
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        { name: 'vision-auth-storage' }
    )
);

// ─── Axios Interceptor Setup ────────────────────────────────
// Called once in main.tsx / App.tsx to inject JWT into every request
export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use((config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    axios.interceptors.response.use(
        (response) => {
            // Vercel SPA routing returns index.html for unknown /api/ routes.
            if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
                console.warn('Backend unavailable (Vercel). Returning mock data for demo.', response.config.url);
                const url = response.config.url || '';
                let mockData: any = [];

                if (url.includes('/api/stats')) mockData = { totalAnomalies24h: 221, avgInferenceTimeMs: 10.8, systemHealthPercent: 99.2, storageUsedGB: 43.9, totalStorageGB: 100, activeModels: 3, alertsResolvedToday: 91, totalFramesProcessed: '14.2M' };
                if (url.includes('/api/analytics')) mockData = { trends: Array.from({ length: 10 }, (_, i) => ({ time_bucket: new Date(Date.now() - i * 3600000).toISOString(), anomaly_count: Math.floor(Math.random() * 20) })).reverse(), zoneMetrics: [], accuracyMetrics: { avg_confidence: 0.88, false_positive_rate: 0.02 } };
                if (url.includes('/api/settings')) mockData = { systemName: 'VisionAIoT', aiConfidenceThreshold: 85, alertRetentionDays: 30, enablePushNotifications: false, theme: 'dark' };
                if (url.includes('/api/storage/stats')) mockData = { totalBytes: 100 * 1024 ** 3, usedBytes: 43.9 * 1024 ** 3, fileCount: 1420 };
                if (url.includes('/api/notifications')) mockData = [
                    { id: '1', title: 'System Online', message: 'VisionAIoT deployed successfully.', type: 'info', is_read: false, created_at: new Date().toISOString() }
                ];

                return { ...response, data: mockData };
            }
            return response;
        },
        (error) => {
            // Auto-logout if JWT is expired or invalid
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
            }
            return Promise.reject(error);
        }
    );
};
