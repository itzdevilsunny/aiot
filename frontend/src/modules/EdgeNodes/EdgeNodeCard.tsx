import { motion } from 'framer-motion';
import { Cpu, HardDrive, Thermometer, RefreshCw, UploadCloud, AlertCircle, Clock } from 'lucide-react';
import type { EdgeNode } from '../../store/useEdgeStore';
import { useEdgeStore } from '../../store/useEdgeStore';

/** Color ramp for metric bars */
const getMetricColor = (val: number, isTemp = false): string => {
    const threshold = isTemp ? 80 : 85;
    if (val >= threshold) return 'bg-red-500';
    if (val >= threshold - 15) return 'bg-amber-500';
    return 'bg-blue-500';
};

const getMetricGlow = (val: number, isTemp = false): string => {
    const threshold = isTemp ? 80 : 85;
    if (val >= threshold) return 'shadow-[0_0_8px_rgba(239,68,68,0.3)]';
    return '';
};

/** Format seconds to human-readable uptime */
function formatUptime(seconds: number): string {
    if (seconds <= 0) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export default function EdgeNodeCard({ node }: { node: EdgeNode }) {
    const sendDeviceCommand = useEdgeStore((s) => s.sendDeviceCommand);
    const { metrics } = node;

    const isOffline = node.status === 'offline';
    const isBusy = node.status === 'restarting' || node.status === 'updating';

    const statusConfig: Record<EdgeNode['status'], { bg: string; text: string; label: string }> = {
        online: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Online' },
        offline: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Offline' },
        restarting: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Restarting' },
        updating: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Updating' },
    };

    const status = statusConfig[node.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#040D21] rounded-2xl border overflow-hidden transition-all duration-300 group
        ${isOffline ? 'border-red-900/30 opacity-60'
                    : isBusy ? 'border-amber-500/30'
                        : 'border-slate-800 hover:border-slate-700 hover:shadow-[0_0_25px_rgba(37,99,235,0.05)]'
                }`}
        >
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                            {node.name}
                            {isOffline && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">{node.mac_address}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ${status.bg} ${status.text} ${isBusy ? 'animate-pulse' : ''}`}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Telemetry Bars */}
            <div className="px-5 space-y-3 mb-5">
                <MetricBar
                    icon={<Cpu className="w-3.5 h-3.5" />}
                    label="CPU Load"
                    value={metrics.cpu_usage}
                    unit="%"
                    color={getMetricColor(metrics.cpu_usage)}
                    glow={getMetricGlow(metrics.cpu_usage)}
                />
                <MetricBar
                    icon={<HardDrive className="w-3.5 h-3.5" />}
                    label="Memory"
                    value={metrics.ram_usage}
                    unit="%"
                    color={getMetricColor(metrics.ram_usage)}
                    glow={getMetricGlow(metrics.ram_usage)}
                />
                <MetricBar
                    icon={<Thermometer className="w-3.5 h-3.5" />}
                    label="Core Temp"
                    value={metrics.temperature}
                    unit="°C"
                    max={100}
                    color={getMetricColor(metrics.temperature, true)}
                    glow={getMetricGlow(metrics.temperature, true)}
                    isTemp
                />
            </div>

            {/* Footer: Model + Uptime + Actions */}
            <div className="px-5 py-4 border-t border-slate-800/50 bg-slate-900/20 flex items-center justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                        <span className="text-blue-400 font-semibold">YOLOv8</span>
                        <span>v{node.model_version}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                        <Clock className="w-3 h-3" />
                        <span>Uptime: {formatUptime(metrics.uptime)}</span>
                    </div>
                </div>

                <div className="flex gap-1.5">
                    <button
                        disabled={isBusy || isOffline}
                        onClick={() => sendDeviceCommand(node.id, 'update_model')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-700/50"
                        title="Push Latest Model"
                    >
                        <UploadCloud className="w-3.5 h-3.5" />
                    </button>
                    <button
                        disabled={isBusy}
                        onClick={() => sendDeviceCommand(node.id, 'restart')}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-red-500/20"
                        title="Hard Restart Node"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── MetricBar Sub-Component ────────────────────────────────

function MetricBar({
    icon, label, value, unit, color, glow, max = 100, isTemp = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
    color: string;
    glow: string;
    max?: number;
    isTemp?: boolean;
}) {
    const pct = Math.min((value / max) * 100, 100);
    const isHot = isTemp && value > 80;

    return (
        <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-400">{icon} {label}</span>
                <span className={`font-mono font-bold ${isHot ? 'text-red-400' : 'text-slate-300'}`}>
                    {value.toFixed(1)}{unit}
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color} ${glow}`}
                />
            </div>
        </div>
    );
}
