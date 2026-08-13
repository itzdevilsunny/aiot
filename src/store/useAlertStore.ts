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

const LIVE_INITIAL_ALERTS: AnomalyAlert[] = [
    {
        id: 'evt_crowd_101',
        camera_id: 'CAM-04',
        type: 'CROWD_GATHERING',
        severity: 'Critical',
        confidence: 0.96,
        image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
        status: 'Pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        operator_notes: 'Group of 7 people detected assembling near Restricted Perimeter Gate 3.',
        location: 'Perimeter Gate 3'
    },
    {
        id: 'evt_weapon_102',
        camera_id: 'CAM-012',
        type: 'WEAPON_GUN',
        severity: 'Critical',
        confidence: 0.98,
        image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        status: 'Investigating',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        operator_notes: 'Firearm detected by YOLO11 vision pipeline. Armed suspect near B1 parking ramp.',
        location: 'Municipal Parking B1'
    },
    {
        id: 'evt_sharp_103',
        camera_id: 'CAM-008',
        type: 'SHARP_OBJECT',
        severity: 'Medium',
        confidence: 0.92,
        image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
        status: 'Pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        operator_notes: 'Sharp object / knife detected near Departure Concourse.',
        location: 'Airport Terminal'
    },
    {
        id: 'evt_fire_104',
        camera_id: 'CAM-045',
        type: 'FIRE_HAZARD',
        severity: 'Critical',
        confidence: 0.95,
        image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800',
        status: 'Pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        operator_notes: 'Thermal flare and open flame emissions detected in Container Bay 4.',
        location: 'Industrial Cargo Yard'
    },
    {
        id: 'evt_leak_105',
        camera_id: 'CAM-022',
        type: 'WATER_CHEMICAL_LEAK',
        severity: 'Medium',
        confidence: 0.89,
        image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800',
        status: 'Pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        operator_notes: 'Liquid chemical spill hazard detected near North Underpass.',
        location: 'Highway Junction'
    },
    {
        id: 'evt_suspect_106',
        camera_id: 'CAM-004',
        type: 'SUSPECT_MATCH',
        severity: 'Critical',
        confidence: 0.97,
        image_url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
        status: 'Pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        operator_notes: 'Suspect #8902 (Black Hoodie) positive face match identified on CAM-04 live stream.',
        location: 'Perimeter Security'
    },
    {
        id: 'evt_vehicle_107',
        camera_id: 'CAM-001',
        type: 'UNAUTHORIZED_VEHICLE',
        severity: 'High' as unknown as 'Medium',
        confidence: 0.94,
        image_url: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800',
        status: 'Resolved',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        operator_notes: 'Blacklisted Sedan (MH-12-AB-1234) detected at Barrier 1.',
        location: 'Main Gate Barrier'
    }
];

export const useAlertStore = create<AlertState>((set, get) => ({
    alerts: LIVE_INITIAL_ALERTS,

    // Fetch Live Alerts directly from Supabase DB
    fetchLiveAlerts: async () => {
        try {
            const { data, error } = await supabase
                .from('Alert')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(200);

            if (!error && data && data.length > 0) {
                const formattedAlerts: AnomalyAlert[] = data.map((item: Record<string, unknown>) => ({
                    id: String(item.id || item.event_id),
                    camera_id: String(item.cameraId || item.camera_id || 'CAM-04'),
                    type: (item.type as AnomalyType) || 'SUSPICIOUS_BEHAVIOR',
                    severity: (item.severity as 'Low' | 'Medium' | 'Critical') || 'Medium',
                    confidence: Number(item.confidence) || 0.95,
                    image_url: String(item.imageUrl || item.image_url || LIVE_INITIAL_ALERTS[0].image_url),
                    status: (item.status as AlertStatus) || 'Pending',
                    timestamp: String(item.timestamp || item.createdAt || new Date().toISOString()),
                    operator_notes: item.operatorNotes ? String(item.operatorNotes) : item.operator_notes ? String(item.operator_notes) : undefined,
                    location: item.location ? String(item.location) : undefined,
                }));
                set({ alerts: formattedAlerts });
            }
        } catch (err) {
            console.warn('Supabase Alert Fetch fallback to live initial stream:', err);
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
                        image_url: String(newRow.imageUrl || newRow.image_url || LIVE_INITIAL_ALERTS[0].image_url),
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
