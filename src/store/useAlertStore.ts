import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabase';

export type AlertStatus = 'Pending' | 'Investigating' | 'Resolved' | 'False Positive';

export type AnomalyType =
    | 'CROWD_GATHERING'         // 5 or more people
    | 'SHARP_OBJECT'            // Knife / Blade / Scissors
    | 'WEAPON_GUN'              // Firearm / Gun
    | 'FIRE_HAZARD'             // Fire / Flame / Smoke
    | 'WATER_CHEMICAL_LEAK'     // Chemical spill / Liquid leak / Flood
    | 'UNAUTHORIZED_VEHICLE'    // Blacklisted or unauthorized vehicle
    | 'SUSPECT_MATCH'           // Criminal or suspect face match
    | 'PERIMETER_BREACH'        // Geofence violation
    | 'PARKING_VIOLATION'
    | 'CAPACITY_EXCEEDED'
    | 'SUSPICIOUS_BEHAVIOR';

export interface AnomalyAlert {
    id: string;
    camera_id: string;
    type: AnomalyType;
    severity: 'Low' | 'Medium' | 'Critical';
    confidence: number;
    image_url: string;
    status: AlertStatus;
    timestamp: string;
    operator_notes?: string;
    location?: string;
}

interface AlertState {
    alerts: AnomalyAlert[];
    fetchLiveAlerts: () => Promise<void>;
    subscribeToLiveAlerts: () => () => void;
    addLiveAlert: (alert: AnomalyAlert) => void;
    createAlert: (newAlert: Omit<AnomalyAlert, 'id' | 'timestamp' | 'status'>) => Promise<void>;
    updateAlertStatus: (id: string, newStatus: AlertStatus, notes: string) => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://defence-survillance-system.onrender.com';

export const useAlertStore = create<AlertState>((set, get) => ({
    alerts: [],

    // Fetch Live Alerts directly from Supabase DB
    fetchLiveAlerts: async () => {
        try {
            const { data, error } = await supabase
                .from('Alert')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(200);

            if (!error && data) {
                const formattedAlerts: AnomalyAlert[] = data.map((item: Record<string, unknown>) => ({
                    id: String(item.id || item.event_id),
                    camera_id: String(item.cameraId || item.camera_id || 'CAM-04'),
                    type: (item.type as AnomalyType) || 'SUSPICIOUS_BEHAVIOR',
                    severity: (item.severity as 'Low' | 'Medium' | 'Critical') || 'Medium',
                    confidence: Number(item.confidence) || 0.95,
                    image_url: String(item.imageUrl || item.image_url || ''),
                    status: (item.status as AlertStatus) || 'Pending',
                    timestamp: String(item.timestamp || item.createdAt || new Date().toISOString()),
                    operator_notes: item.operatorNotes ? String(item.operatorNotes) : item.operator_notes ? String(item.operator_notes) : undefined,
                    location: item.location ? String(item.location) : undefined,
                }));
                set({ alerts: formattedAlerts });
            }
        } catch (err) {
            console.warn('Supabase Alert Fetch error:', err);
        }
    },

    // Subscribe to Live Supabase DB Changes (Realtime Stream)
    subscribeToLiveAlerts: () => {
        const channel = supabase
            .channel('realtime_alerts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Alert' },
                (payload) => {
                    const newRow = payload.new as Record<string, unknown>;
                    const newAlert: AnomalyAlert = {
                        id: String(newRow.id || Date.now()),
                        camera_id: String(newRow.cameraId || newRow.camera_id || 'CAM-04'),
                        type: (newRow.type as AnomalyType) || 'SUSPICIOUS_BEHAVIOR',
                        severity: (newRow.severity as 'Low' | 'Medium' | 'Critical') || 'Critical',
                        confidence: Number(newRow.confidence) || 0.95,
                        image_url: String(newRow.imageUrl || newRow.image_url || ''),
                        status: 'Pending',
                        timestamp: new Date().toISOString(),
                        operator_notes: newRow.operatorNotes ? String(newRow.operatorNotes) : undefined,
                    };
                    get().addLiveAlert(newAlert);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    // Triggered by Socket.io or Supabase Realtime when detection is pushed
    addLiveAlert: (alert) =>
        set((state) => ({
            alerts: [alert, ...state.alerts.filter(a => a.id !== alert.id)].slice(0, 500),
        })),

    // Create a new anomaly alert in Supabase & Backend
    createAlert: async (newAlert) => {
        const created: AnomalyAlert = {
            ...newAlert,
            id: `evt_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'Pending',
        };

        set((state) => ({ alerts: [created, ...state.alerts] }));

        // Post to Supabase DB directly
        await supabase.from('Alert').insert([
            {
                id: created.id,
                cameraId: created.camera_id,
                type: created.type,
                severity: created.severity,
                confidence: created.confidence,
                imageUrl: created.image_url,
                status: 'Pending',
                operatorNotes: created.operator_notes || null,
            }
        ]).then(({ error }) => {
            if (error) console.warn('Supabase direct insert error:', error.message);
        });

        // Also post to Render Express Webhook
        await axios.post(`${API_BASE}/api/alerts/webhook`, created).catch(console.warn);
    },

    // Triggered by dashboard operator to update alert status
    updateAlertStatus: async (id, newStatus, notes) => {
        set((state) => ({
            alerts: state.alerts.map((alert) =>
                alert.id === id
                    ? { ...alert, status: newStatus, operator_notes: notes }
                    : alert
            ),
        }));

        // Update in Supabase DB
        await supabase
            .from('Alert')
            .update({ status: newStatus, operatorNotes: notes })
            .eq('id', id)
            .then(({ error }) => {
                if (error) console.warn('Supabase status update warning:', error.message);
            });

        // Update via Render API
        await axios.put(`${API_BASE}/api/alerts/${id}`, { status: newStatus, notes }).catch(console.warn);
    },
}));
