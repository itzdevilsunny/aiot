import { create } from 'zustand';

export interface Alert {
    id: string;
    camera_id: string;
    type: string;
    severity: 'Low' | 'Medium' | 'Critical';
    confidence: number;
    image_url: string;
    timestamp: string;
}

// Assuming Detection has a similar structure to Alert, or is at least an object.
// The user's instruction implies adding 'detections' but doesn't define the Detection interface.
// For now, we'll define a basic Detection interface.
export interface Detection {
    id: string;
    camera_id: string;
    type: string;
    confidence: number;
    image_url: string;
    timestamp: string;
}

export interface Camera {
    id: string;
    name: string;
    status: 'online' | 'offline';
    lat: number;
    lng: number;
}

interface VisionState {
    alerts: Alert[];
    cameras: Camera[];
    detections: Detection[]; // Added detections array
    addAlert: (alert: Alert) => void;
    addDetection: (detection: Detection) => void; // Added addDetection method
    setCameras: (cameras: Camera[]) => void;
    updateCameraStatus: (id: string, status: 'online' | 'offline') => void;
}

export const useVisionStore = create<VisionState>((set) => ({
    alerts: [],
    cameras: [],
    detections: [], // Initialize detections as an empty array
    addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })), // Keep last 50, changed from 100
    addDetection: (detection) => set((state) => ({ detections: [detection, ...state.detections].slice(0, 50) })), // Added addDetection logic
    setCameras: (cameras) => set({ cameras }),
    updateCameraStatus: (id, status) => set((state) => ({
        cameras: state.cameras.map(c => c.id === id ? { ...c, status } : c)
    }))
}));
