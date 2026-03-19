import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Video, Radar, AlertTriangle } from 'lucide-react';
import CameraGridView from '../../components/CameraGridView';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function LiveCameras() {
    const [activeSector, setActiveSector] = useState<number | 'ALL'>('ALL');
    const qc = useQueryClient();

    // Network Scanner mutation
    const scanMutation = useMutation({
        mutationFn: () => axios.post(`${API_BASE}/api/cameras/scan`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['system_cameras'] }),
    });

    // Fetch the 50 cameras
    const { data: allCameras = [], isLoading } = useQuery({
        queryKey: ['system_cameras'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/cameras`)).data,
    });

    // Fetch alerts to pass down
    const { data: alerts = [] } = useQuery({
        queryKey: ['system_alerts'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/alerts`)).data,
        refetchInterval: 3000
    });

    const activeAlerts = alerts.filter((a: any) => a.status === 'Investigating' || a.status === 'Pending');

    const filteredCameras = activeSector === 'ALL' 
        ? allCameras 
        : allCameras.filter((c: any) => c.sector === activeSector);

    return (
        <div className="bg-[#0B0F19] min-h-screen text-white flex">
            {/* Sidebar specific for large grids */}
            <div className="w-64 bg-[#1A1D27] border-r border-gray-800 p-4 flex flex-col hidden md:flex">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Video size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Node Grid</h1>
                        <p className="text-[10px] text-green-400">● {allCameras.filter((c: any) => c.status === 'UP').length} Online</p>
                    </div>
                </div>

                <div className="flex flex-col space-y-2 mt-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Sectors</span>
                    <button 
                         onClick={() => setActiveSector('ALL')}
                         className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSector === 'ALL' ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
                    >
                         All Sectors (50)
                    </button>
                    {[1, 2, 3, 4, 5].map(s => (
                        <button 
                            key={s}
                            onClick={() => setActiveSector(s)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSector === s ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
                        >
                            Sector {s} (CAM-{(s-1)*10 + 1} to {s*10})
                        </button>
                    ))}
                </div>

                {/* Scan Network Button */}
                <button
                    onClick={() => scanMutation.mutate()}
                    disabled={scanMutation.isPending}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-600/30 transition-all disabled:opacity-50"
                >
                    {scanMutation.isPending ? (
                        <><div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> Scanning 192.168.1.x...</>
                    ) : (
                        <><Radar size={16} /> Scan Network &amp; Auto-Add</>
                    )}
                </button>
                {scanMutation.isSuccess && (
                    <p className="text-[10px] text-emerald-400 mt-2 text-center">✅ {(scanMutation.data as any)?.data?.message}</p>
                )}
            </div>

            {/* Main Grid Content */}
            <div className="flex-1 p-6 flex flex-col h-screen overflow-y-auto">
                {/* Emergency Focus Banner */}
                {activeAlerts.some((a: any) => a.confidence > 90) && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl flex items-center gap-3 animate-pulse">
                        <AlertTriangle className="text-red-400 shrink-0" size={22} />
                        <div>
                            <p className="text-red-300 text-sm font-bold">🚨 EMERGENCY FOCUS — High-Confidence Anomaly Detected</p>
                            <p className="text-red-400/70 text-xs">Camera {activeAlerts.find((a: any) => a.confidence > 90)?.camera_id || 'UNKNOWN'} triggered a {'>'}90% confidence alert. Auto-switching view.</p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Live Monitor {activeSector !== 'ALL' && `- Sector ${activeSector}`}</h2>
                    <p className="text-gray-400 text-sm">Real-time edge streams prioritized by active AI anomalies.</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <CameraGridView allCameras={filteredCameras} activeAlerts={activeAlerts} />
                )}
            </div>
        </div>
    );
}
