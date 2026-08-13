import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Camera as CameraIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const fetchCameras = async () => {
    // Graceful fallback for demo if real API is down
    try {
        const { data } = await axios.get(`${API_BASE}/api/cameras`);
        return data;
    } catch {
        console.warn("Real API offline, falling back to module mock array.");
        return [
            { id: '1', name: 'Main Gate', status: 'online', lat: 28.6139, lng: 77.2090 },
            { id: '2', name: 'Parking Lot B', status: 'online', lat: 28.6150, lng: 77.2100 },
            { id: '3', name: 'Warehouse A', status: 'offline', lat: 28.6120, lng: 77.2080 }
        ];
    }
};

export default function CameraGrid() {
    const { data: cameras, isLoading } = useQuery({ queryKey: ['cameras'], queryFn: fetchCameras });

    if (isLoading) return <div className="text-white p-6 animate-pulse">Establishing secure streams...</div>;

    return (
        <div className="p-6 bg-[#020617] min-h-screen">
            <div className="flex justify-between items-center mb-6 text-white border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2"><CameraIcon /> Live Edge Streams</h2>
                <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">Add Camera</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cameras?.map((cam: { id: string; name: string; status: string }) => (
                    <div key={cam.id} className="relative bg-black rounded-lg overflow-hidden group border border-slate-800 aspect-video flex items-center justify-center">
                        {/* Standalone WebRTC/RTSP fallback placeholder */}
                        <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-80 group-hover:opacity-40 transition-opacity">
                            <CameraIcon className="w-8 h-8 text-slate-500 mb-2" />
                            <span className="text-xs font-mono text-slate-500">AWAITING RTSP SIGNAL</span>
                        </div>

                        {/* Simulated specific stream for demo */}
                        {cam.id === '1' && (
                            <img src="http://192.0.0.4:8080/video" alt="IP Webcam" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        )}


                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-sm border border-white/10">
                            {cam.name}
                        </div>
                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cam.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                            {cam.status}
                        </div>
                        <div className="absolute bottom-2 right-2">
                            <span className="text-[10px] text-white/50 bg-black/50 px-1 rounded">{cam.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
