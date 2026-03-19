import { create } from 'zustand';
import axios from 'axios';

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

interface AlertState {
    alerts: AnomalyAlert[];
    addLiveAlert: (alert: AnomalyAlert) => void;
    setAlerts: (alerts: AnomalyAlert[]) => void;
    updateAlertStatus: (id: string, newStatus: AlertStatus, notes: string) => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useAlertStore = create<AlertState>((set) => ({
    alerts: [],

    // Triggered by Socket.io when the Python AI pushes a new detection
    addLiveAlert: (alert) =>
        set((state) => {
            // Deduplicate by ID — prevents duplicate React keys when multiple socket listeners fire
            if (state.alerts.some((a) => a.id === alert.id)) return state;
            return { alerts: [alert, ...state.alerts].slice(0, 200) };
        }),

    // Batch set from initial REST load
    setAlerts: (alerts) => set({ alerts }),

    // Triggered by the dashboard operator to update the database
    updateAlertStatus: async (id, newStatus, notes) => {
        try {
            // 1. Optimistically update the UI so the operator sees the change instantly
            set((state) => ({
                alerts: state.alerts.map((alert) =>
                    alert.id === id
                        ? { ...alert, status: newStatus, operator_notes: notes }
                        : alert
                ),
            }));

            // 2. Send the update to the backend
            await axios.put(`${API_BASE}/api/alerts/${id}`, {
                status: newStatus,
                notes,
            });
        } catch (error) {
            console.error('Failed to update alert in database', error);
            // Revert could be added here for full production robustness
        }
    },
}));
