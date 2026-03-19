import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEdgeStore } from '../../store/useEdgeStore';
import EdgeNodeCard from './EdgeNodeCard';
import {
    Server, Activity, Wifi, WifiOff, RefreshCw, Cpu,
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function EdgeDashboard() {
    const { nodes, setInitialNodes } = useEdgeStore();

    // Fetch initial node list from REST API
    const { isLoading } = useQuery({
        queryKey: ['edge_nodes'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/api/edge`);
            setInitialNodes(data);
            return data;
        },
        refetchOnWindowFocus: false,
    });

    const onlineCount = nodes.filter((n) => n.status === 'online').length;
    const offlineCount = nodes.filter((n) => n.status === 'offline').length;
    const busyCount = nodes.filter((n) => n.status === 'restarting' || n.status === 'updating').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">Connecting to Edge Fleet</p>
                        <p className="text-xs text-slate-500 mt-1">Querying device registry...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Server className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400 tracking-wider uppercase">Infrastructure</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Edge Compute Fleet</h1>
                    <p className="text-slate-400 text-sm mt-1">Live hardware telemetry and model deployment.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status Badges */}
                    <div className="flex items-center gap-4 bg-[#040D21] border border-slate-800 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-bold text-white">{onlineCount}</span>
                            <span className="text-[10px] text-slate-500">Online</span>
                        </div>
                        <div className="w-px h-4 bg-slate-800"></div>
                        <div className="flex items-center gap-1.5">
                            <WifiOff className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs font-bold text-white">{offlineCount}</span>
                            <span className="text-[10px] text-slate-500">Offline</span>
                        </div>
                        {busyCount > 0 && (
                            <>
                                <div className="w-px h-4 bg-slate-800"></div>
                                <div className="flex items-center gap-1.5">
                                    <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                    <span className="text-xs font-bold text-white">{busyCount}</span>
                                    <span className="text-[10px] text-slate-500">Busy</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Live Indicator */}
                    <div className="flex items-center gap-1.5 bg-[#040D21] border border-slate-800 rounded-xl px-3 py-2.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-medium">Telemetry Live</span>
                    </div>
                </div>
            </div>

            {/* Fleet Summary Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#040D21] border border-slate-800 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                <SummaryKPI
                    label="Total Nodes"
                    value={nodes.length.toString()}
                    icon={<Server className="w-4 h-4 text-blue-400" />}
                />
                <SummaryKPI
                    label="Fleet Uptime"
                    value={`${nodes.length > 0 ? Math.round((onlineCount / nodes.length) * 100) : 0}%`}
                    icon={<Activity className="w-4 h-4 text-emerald-400" />}
                />
                <SummaryKPI
                    label="Avg CPU Load"
                    value={`${nodes.length > 0 ? (nodes.filter(n => n.status !== 'offline').reduce((s, n) => s + n.metrics.cpu_usage, 0) / Math.max(onlineCount + busyCount, 1)).toFixed(1) : '0'}%`}
                    icon={<Cpu className="w-4 h-4 text-amber-400" />}
                />
                <SummaryKPI
                    label="Active Models"
                    value={`v${nodes.find(n => n.status === 'online')?.model_version || '—'}`}
                    icon={<Server className="w-4 h-4 text-purple-400" />}
                />
            </motion.div>

            {/* Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {nodes.map((node) => (
                    <EdgeNodeCard key={node.id} node={node} />
                ))}
                {nodes.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                        <Server className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm font-medium">No edge nodes registered</p>
                        <p className="text-xs text-slate-600 mt-1">Ensure the backend API is running</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Summary KPI ────────────────────────────────────────────

function SummaryKPI({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                <p className="text-lg font-bold text-white truncate">{value}</p>
            </div>
        </div>
    );
}
