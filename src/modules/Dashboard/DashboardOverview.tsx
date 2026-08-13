import { useState, useEffect } from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { useCameraStore } from '../../store/useCameraStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Activity, Server, Zap, CheckCircle, AlertTriangle, Terminal, FileText, Plus, Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import LiveInferenceFeed from './LiveInferenceFeed';

// WebSocket connection for live terminal logs
const socket = io(`${import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'https://defence-survillance-system.onrender.com'}/system`);

export default function CommandCenter() {
    const { alerts } = useAlertStore();
    const { cameras, fetchCameras } = useCameraStore();
    const [selectedOverviewCameraId, setSelectedOverviewCameraId] = useState<string>('CAM-04');
    const [systemLogs, setSystemLogs] = useState<{ time: string, msg: string, type: string }[]>([]);

    useEffect(() => {
        fetchCameras();
    }, [fetchCameras]);

    const activeOverviewCamera = cameras.find(c => c.id === selectedOverviewCameraId) || cameras[0] || {
        id: 'CAM-04',
        name: 'CAM-04 (Perimeter Security)',
        ip_url: 'http://192.168.0.4:8080',
        zone: 'Perimeter Security',
        status: 'online',
        fps: 60,
        latencyMs: 12,
        resolution: '4K Ultra HD',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'
    };

    // 1. Real API Fetching for KPIs
    const { data: stats } = useQuery({
        queryKey: ['command_center_stats'],
        queryFn: async () => {
            // In a real app we would create this specific /api/stats/overview endpoint. 
            // Falling back to our local proxy mock data during demo
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || ''}/api/stats/overview`);
                return data;
            } catch (e) {
                // Fallback demo data
                return {
                    activeNodes: 3, totalNodes: 3,
                    totalAnomalies: 221, criticalAnomalies: 0,
                    avgLatency: 10.8, healthPercent: 99.2,
                    anomalyTrend: [{ value: 5 }, { value: 7 }, { value: 3 }, { value: 8 }, { value: 12 }],
                    latencyTrend: [{ value: 10.1 }, { value: 11.2 }, { value: 9.8 }, { value: 10.5 }, { value: 10.8 }]
                };
            }
        },
        refetchInterval: 5000, // Fetch every 5 seconds
    });

    // 2. Listen for Live Terminal Logs
    useEffect(() => {
        socket.on('system_log', (log) => {
            setSystemLogs(prev => [{ time: new Date().toLocaleTimeString(), ...log }, ...prev].slice(0, 50));
        });
        return () => { socket.off('system_log'); };
    }, []);

    const activeAlerts = alerts.filter(a => a.status !== 'Resolved').slice(0, 6);

    return (
        <div className="p-6 bg-[#0B0F19] min-h-screen text-white overflow-y-auto overflow-x-hidden">

            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold tracking-widest text-green-500 uppercase">Live System Status</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Command Center</h1>
                    <p className="text-gray-400 mt-1">Real-time edge inference and anomaly detection overview.</p>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0 relative z-10">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-semibold transition">
                        <FileText size={16} /> Generate Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition">
                        <Plus size={16} /> Add Camera Node
                    </button>
                </div>
            </div>

            {/* KPI Cards with Live Sparklines */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Active Nodes */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Server size={18} className="text-blue-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">Active Edge Nodes</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">{stats?.activeNodes || 0}/{stats?.totalNodes || 3}</h2>
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1 mt-1">↑ UP <span className="text-gray-500 font-normal">{(stats?.activeNodes / stats?.totalNodes * 100) || 0}% Operational</span></p>
                        </div>
                    </div>
                </div>

                {/* Total Anomalies */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle size={18} className="text-red-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">Total Anomalies (24h)</span>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold">{stats?.totalAnomalies || 0}</h2>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">→ STABLE <span className="text-gray-500">Critical: {stats?.criticalAnomalies || 0}</span></p>
                        </div>
                    </div>
                    {/* Sparkline Background */}
                    <div className="absolute bottom-0 right-0 w-1/2 h-16 opacity-30">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.anomalyTrend || []}>
                                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Avg Inference Time */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Zap size={18} className="text-purple-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">Avg Inference Time</span>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold">{stats?.avgLatency || '0.0'}ms</h2>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">→ STABLE <span className="text-gray-500">Using TensorRT ONNX</span></p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-16 opacity-30">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.latencyTrend || []}>
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                                <Line type="stepAfter" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle size={18} className="text-green-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">System Health</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">{stats?.healthPercent || '100'}%</h2>
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1 mt-1">↑ UP <span className="text-gray-500 font-normal">All services operational</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Video Feed & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Video & Terminal */}
                <div className="xl:col-span-2 flex flex-col gap-6">

                    {/* Live Edge Inference Widget */}
                    <div className="bg-[#151923] rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
                        <div className="p-3 border-b border-gray-800 flex flex-wrap justify-between items-center bg-[#1A1D27] gap-2">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                <h3 className="font-bold text-sm">Live Edge Inference</h3>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 uppercase tracking-wider">REC • YOLO11</span>
                            </div>

                            {/* Dynamic 108 Camera Selector Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Select Node:</span>
                                <select
                                    value={activeOverviewCamera.id}
                                    onChange={(e) => setSelectedOverviewCameraId(e.target.value)}
                                    className="bg-[#0B0F19] border border-slate-700 text-xs font-mono text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[220px] truncate"
                                >
                                    {cameras.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.id}: {c.name} ({c.zone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex-grow bg-black relative">
                            {/* Uses the dynamically selected camera */}
                            <LiveInferenceFeed camera={activeOverviewCamera} />
                        </div>
                    </div>

                    {/* NEW FEATURE: Live System Terminal */}
                    <div className="bg-[#151923] rounded-xl border border-gray-800 shadow-xl overflow-hidden h-48 flex flex-col">
                        <div className="p-2 px-4 border-b border-gray-800 bg-[#1A1D27] flex items-center gap-2">
                            <Terminal size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Event Log</span>
                        </div>
                        <div className="p-4 font-mono text-xs overflow-y-auto flex-grow bg-[#0B0F19]">
                            {systemLogs.length === 0 ? (
                                <span className="text-gray-600">Awaiting system telemetry...</span>
                            ) : (
                                systemLogs.map((log, i) => (
                                    <div key={i} className="mb-1">
                                        <span className="text-gray-500">[{log.time}]</span>{' '}
                                        <span className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-green-400'}>
                                            [{log.type.toUpperCase()}]
                                        </span>{' '}
                                        <span className="text-gray-300">{log.msg}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Priority Alerts */}
                <div className="bg-[#151923] rounded-xl border border-gray-800 shadow-xl flex flex-col h-[716px]">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1D27]">
                        <h3 className="font-bold flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" /> Priority Alerts
                        </h3>
                        <span className="text-xs text-gray-500">{activeAlerts.length} active</span>
                    </div>

                    <div className="p-4 space-y-3 overflow-y-auto flex-grow custom-scrollbar">
                        {activeAlerts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                <Shield size={48} className="mb-4" />
                                <p className="text-sm">No active priority alerts.</p>
                                <p className="text-xs mt-1">System monitoring all zones.</p>
                            </div>
                        ) : (
                            activeAlerts.map(alert => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    key={alert.id}
                                    className={`p-4 rounded-xl border ${alert.severity === 'Critical' ? 'bg-red-900/10 border-red-900/50' : 'bg-yellow-900/10 border-yellow-900/50'} flex gap-3`}
                                >
                                    <div className="mt-0.5">
                                        <AlertTriangle size={16} className={alert.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-sm font-bold uppercase tracking-wide ${alert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {alert.type.replace('_', ' ')}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <MapPin size={12} /> {alert.camera_id}
                                            </p>
                                            <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="mt-3 w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${alert.confidence * 100}%` }}></div>
                                        </div>
                                        <p className="text-right text-[10px] text-gray-500 mt-1 font-mono">CONF: {(alert.confidence * 100).toFixed(2)}%</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
