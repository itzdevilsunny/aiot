import { create } from 'zustand';
import axios from 'axios';

export interface CameraNode {
    id: string;
    name: string;
    ip_url: string; // e.g., http://192.168.0.4:8080
    zone: string;
    status: 'online' | 'offline' | 'connecting';
    fps: number;
}

interface CameraState {
    cameras: CameraNode[];
    gridLayout: 1 | 2 | 3; // Columns: 1x1, 2x2, 3x3
    setGridLayout: (layout: 1 | 2 | 3) => void;
    fetchCameras: () => Promise<void>;
    addCamera: (camera: Omit<CameraNode, 'id' | 'status' | 'fps'>) => Promise<void>;
    removeCamera: (id: string) => Promise<void>;
    updateStatus: (id: string, status: CameraNode['status']) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
    cameras: [],
    gridLayout: 3,

    setGridLayout: (layout) => set({ gridLayout: layout }),

    fetchCameras: async () => {
        try {
            // For demo, we proxy this through. We'll populate local store directly if backend missing 
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/cameras`);
            set({ cameras: data });
        } catch (error) {
            console.warn("Falling back to local registry init for demo / Vercel compatibility", error);
            // Hardcode the user's IP Webcam as the initial node if the backend camera registry doesn't exist yet
            set({
                cameras: [
                    { id: 'cam-04', name: 'CAM-04 (Sector 9)', ip_url: 'http://192.168.0.4:8080', zone: 'Perimeter', status: 'online', fps: 30 }
                ]
            })
        }
    },

    addCamera: async (newCam) => {
        try {
            // Mocked backend resolution
            const mockResult = { ...newCam, id: `cam-${Date.now()}`, status: 'connecting' as const, fps: 30 };
            set((state) => ({ cameras: [...state.cameras, mockResult] }));

            // Attempt backend call asynchronously
            await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/cameras`, newCam).catch(console.warn);
        } catch (error) {
            console.error("Failed to register new camera node", error);
        }
    },

    removeCamera: async (id) => {
        try {
            set((state) => ({ cameras: state.cameras.filter(c => c.id !== id) }));
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/cameras/${id}`).catch(console.warn);
        } catch (error) {
            console.error("Failed to remove camera", error);
        }
    },

    updateStatus: (id, status) => set((state) => ({
        cameras: state.cameras.map(c => c.id === id ? { ...c, status } : c)
    }))
}));
