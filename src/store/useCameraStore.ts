import { create } from 'zustand';
import axios from 'axios';

export interface CameraNode {
    id: string;
    name: string;
    ip_url: string;
    zone: string;
    status: 'online' | 'offline' | 'connecting';
    fps: number;
    resolution?: string;
    latencyMs?: number;
    model?: string;
    thumbnailUrl?: string;
    lat?: number;
    lng?: number;
    geofencePolygon?: { x: number; y: number }[];
}

interface CameraState {
    cameras: CameraNode[];
    selectedCameraId: string | null;
    gridLayout: 1 | 2 | 3 | 4;
    setGridLayout: (layout: 1 | 2 | 3 | 4) => void;
    setSelectedCameraId: (id: string | null) => void;
    fetchCameras: () => Promise<void>;
    addCamera: (camera: Omit<CameraNode, 'id' | 'status' | 'fps'>) => Promise<void>;
    removeCamera: (id: string) => Promise<void>;
    updateStatus: (id: string, status: CameraNode['status']) => void;
    updateGeofence: (id: string, polygon: { x: number; y: number }[]) => void;
}

const ZONES = [
    'Perimeter Security',
    'Municipal Parking',
    'Airport Terminal',
    'Highway Junction',
    'Campus Plaza',
    'Server Vault & Data Center',
    'Industrial Cargo Yard',
    'Subway Concourse'
];

const THUMBNAILS = [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800',
];

// Helper to generate 108 Realistic Smart City & Industrial AI Cameras
export const generate108Cameras = (): CameraNode[] => {
    const list: CameraNode[] = [];

    // CAM-04 as primary active live feed
    list.push({
        id: 'CAM-04',
        name: 'CAM-04 Live AI Feed (YOLO11)',
        ip_url: 'http://192.168.0.4:8080',
        zone: 'Perimeter Security',
        status: 'online',
        fps: 60,
        resolution: '4K Ultra HD',
        latencyMs: 12,
        model: 'YOLO11 Nano + Gemini Multimodal',
        thumbnailUrl: THUMBNAILS[0],
        lat: 28.6200,
        lng: 77.2100
    });

    for (let i = 1; i <= 107; i++) {
        const padId = String(i).padStart(3, '0');
        const id = `CAM-${padId}`;
        const zone = ZONES[i % ZONES.length];
        const status: CameraNode['status'] = i % 15 === 0 ? 'offline' : (i % 8 === 0 ? 'connecting' : 'online');
        const fps = status === 'online' ? Math.floor(Math.random() * 30 + 30) : 0;
        const latencyMs = status === 'online' ? Math.floor(Math.random() * 20 + 8) : 0;

        list.push({
            id,
            name: `${id} (${zone} Node ${Math.floor(i / 8) + 1})`,
            ip_url: `http://192.168.${(i % 10) + 1}.${i}:8080`,
            zone,
            status,
            fps,
            resolution: i % 2 === 0 ? '1080p Full HD' : '4K Ultra HD',
            latencyMs,
            model: 'YOLO11 Nano Edge Inference',
            thumbnailUrl: THUMBNAILS[i % THUMBNAILS.length],
            lat: 28.6100 + (i * 0.0012),
            lng: 77.2000 + (i * 0.0015)
        });
    }

    return list;
};

export const useCameraStore = create<CameraState>((set) => ({
    cameras: generate108Cameras(),
    selectedCameraId: null,
    gridLayout: 3,

    setGridLayout: (layout) => set({ gridLayout: layout }),
    setSelectedCameraId: (id) => set({ selectedCameraId: id }),

    fetchCameras: async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'https://defence-survillance-system.onrender.com'}/api/cameras`);
            if (Array.isArray(data) && data.length >= 100) {
                set({ cameras: data });
            } else {
                set({ cameras: generate108Cameras() });
            }
        } catch {
            set({ cameras: generate108Cameras() });
        }
    },

    addCamera: async (newCam) => {
        try {
            const mockResult: CameraNode = {
                ...newCam,
                id: `CAM-${Date.now().toString().slice(-4)}`,
                status: 'connecting',
                fps: 30,
                resolution: '1080p Full HD',
                latencyMs: 15,
                model: 'YOLO11 Nano'
            };
            set((state) => ({ cameras: [mockResult, ...state.cameras] }));
            await axios.post(`${import.meta.env.VITE_API_URL || 'https://defence-survillance-system.onrender.com'}/api/cameras`, newCam).catch(console.warn);
        } catch (error) {
            console.error("Failed to register new camera node", error);
        }
    },

    removeCamera: async (id) => {
        try {
            set((state) => ({ cameras: state.cameras.filter(c => c.id !== id) }));
            await axios.delete(`${import.meta.env.VITE_API_URL || 'https://defence-survillance-system.onrender.com'}/api/cameras/${id}`).catch(console.warn);
        } catch (error) {
            console.error("Failed to remove camera", error);
        }
    },

    updateStatus: (id, status) => set((state) => ({
        cameras: state.cameras.map(c => c.id === id ? { ...c, status } : c)
    })),
    updateGeofence: (id, polygon) => set((state) => ({
        cameras: state.cameras.map(c => c.id === id ? { ...c, geofencePolygon: polygon } : c)
    }))
}));
