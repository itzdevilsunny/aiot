import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Camera as CameraIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '';

const fetchCameras = async () => {
    // Graceful fallback for demo if real API is down
    try {
        const { data } = await axios.get(`${API_BASE}/api/cameras`);
        return data;
    } catch (err) {
        console.warn("Real API offline, falling back to module mock array.");
        return [
            { id: '1', name: 'Main Gate', status: 'online', lat: 28.6139, lng: 77.2090 },
            { id: '2', name: 'Parking Lot B', status: 'online', lat: 28.6150, lng: 77.2100 },
            { id: '3', name: 'Warehouse A', status: 'offline', lat: 28.6120, lng: 77.2080 }
        ];
    }
};

const CameraCard = ({ cam }: { cam: any }) => {
    const [streamFrame, setStreamFrame] = useState<string | null>(null);
    const [alertActive, setAlertActive] = useState(false);

    useEffect(() => {
        // Prevent Vercel connection errors during SSR
        if (typeof window === 'undefined' || window.location.hostname.includes('vercel.app')) return;
        
        const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:4000');
        socket.on(`node_stream_${cam.id}`, (data: any) => {
            setStreamFrame(`data:image/jpeg;base64,${data.image}`);
            if (data.status === 'ALERT ACTIVE') setAlertActive(true);
            else setAlertActive(false);
        });

        return () => { socket.disconnect(); };
    }, [cam.id]);

    const isActuallyLive = streamFrame !== null || cam.status === 'online';

    return (
        <div className={`relative bg-black rounded-lg border-2 transition-all overflow-hidden aspect-video flex flex-col ${
            alertActive ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'border-slate-800'
        }`}>
            {/* Header Info */}
            <div className="flex justify-between p-1.5 bg-black/80 text-[10px] absolute top-0 left-0 right-0 z-10 backdrop-blur-sm">
                <span className="text-white/80 font-mono tracking-wider">{cam.name} ({cam.id})</span>
                {isActuallyLive ? (
                    <span className="text-emerald-500 font-bold animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> LIVE
                    </span>
                ) : (
                    <span className="text-slate-500">OFFLINE</span>
                )}
            </div>

            {/* Live Feed Image */}
            <div className="flex-1 w-full bg-slate-900 overflow-hidden relative">
                {streamFrame ? (
                    <img src={streamFrame} className="w-full h-full object-cover" alt={`Feed for ${cam.id}`} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                        <CameraIcon className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-xs font-mono">Connecting...</span>
                    </div>
                )}
            </div>

            {/* Alert Overlay */}
            {alertActive && (
                <div className="absolute bottom-2 left-2 bg-red-600 text-[10px] text-white px-2 py-0.5 font-bold rounded animate-bounce shadow-lg">
                    ALERT ACTIVE
                </div>
            )}
        </div>
    );
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cameras?.map((cam: any) => (
                    <CameraCard key={cam.id} cam={cam} />
                ))}
            </div>
        </div>
    );
}
