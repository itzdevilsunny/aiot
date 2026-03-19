import { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import DetectionTrendChart from './DetectionTrendChart';
import ZoneDistributionChart from './ZoneDistributionChart';
import {
    Download, Activity, Target, TrendingUp, ShieldCheck, ShieldAlert,
    BarChart3, Clock, ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

type TimeRange = '24h' | '7d' | '30d';

const RANGE_LABELS: Record<TimeRange, string> = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
};

export default function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const { data, isLoading, isError } = useAnalytics(timeRange);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">Aggregating Analytics Data</p>
                        <p className="text-xs text-slate-500 mt-1">Querying time-series database...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617]">
                <div className="text-center space-y-3 p-8 bg-[#040D21] border border-slate-800 rounded-2xl max-w-md">
                    <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Analytics Unavailable</h3>
                    <p className="text-sm text-slate-400">
                        Failed to fetch analytics data from the backend API. Ensure the server is running and connected to the database.
                    </p>
                </div>
            </div>
        );
    }

    const totalAnomalies = data.trends.reduce((acc, curr) => acc + curr.anomaly_count, 0);
    const avgConfidence = data.accuracyMetrics.avg_confidence;
    const peakBucket = data.trends.reduce((max, curr) =>
        curr.anomaly_count > max.anomaly_count ? curr : max,
        data.trends[0] || { time_bucket: '', anomaly_count: 0 }
    );

    const exportToCSV = () => {
        window.open(`/api/analytics/export?range=${timeRange}`, '_blank');
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400 tracking-wider uppercase">Intelligence</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Historical data aggregated from edge inference nodes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 pr-9 cursor-pointer hover:border-slate-700 transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={`Total Anomalies (${RANGE_LABELS[timeRange]})`}
                    value={totalAnomalies.toLocaleString()}
                    icon={<Activity className="w-5 h-5 text-red-400" />}
                    delay={0}
                />
                <KPICard
                    title="AI Avg Confidence"
                    value={`${(avgConfidence * 100).toFixed(1)}%`}
                    icon={<Target className="w-5 h-5 text-emerald-400" />}
                    delay={0.05}
                />
                <KPICard
                    title="True Positives"
                    value={data.accuracyMetrics.true_positives.toString()}
                    icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
                    delay={0.1}
                />
                <KPICard
                    title="Peak Detections"
                    value={peakBucket.anomaly_count.toString()}
                    subtitle={peakBucket.time_bucket ? new Date(peakBucket.time_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                    delay={0.15}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detection Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-[#040D21] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Detection Frequency
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Anomaly incidents over time ({RANGE_LABELS[timeRange]})</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] text-slate-400 font-medium">Auto-refresh 30s</span>
                        </div>
                    </div>
                    <DetectionTrendChart rawData={data.trends} />
                </motion.div>

                {/* Zone Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-[#040D21] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                Anomalies by Zone
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Distribution across monitored zones</p>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                            {data.zoneDistribution.length} zones
                        </span>
                    </div>
                    <ZoneDistributionChart rawData={data.zoneDistribution} />
                </motion.div>
            </div>

            {/* Accuracy Overview */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-[#040D21] border border-slate-800 rounded-2xl p-6"
            >
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Model Accuracy Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <AccuracyMeter
                        label="True Positives"
                        value={data.accuracyMetrics.true_positives}
                        total={totalAnomalies || 1}
                        color="bg-emerald-500"
                    />
                    <AccuracyMeter
                        label="False Positives"
                        value={data.accuracyMetrics.false_positives}
                        total={totalAnomalies || 1}
                        color="bg-red-500"
                    />
                    <AccuracyMeter
                        label="Pending Review"
                        value={Math.max(0, totalAnomalies - data.accuracyMetrics.true_positives - data.accuracyMetrics.false_positives)}
                        total={totalAnomalies || 1}
                        color="bg-slate-500"
                    />
                </div>
            </motion.div>
        </div>
    );
}

// ─── Sub-Components ─────────────────────────────────────────

function KPICard({
    title, value, subtitle, icon, delay = 0,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-[#040D21] border border-slate-800 p-5 rounded-2xl group hover:border-slate-700 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.05)]"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-slate-400 font-medium text-xs truncate">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-white mt-1.5">{value}</h3>
                    {subtitle && <p className="text-[11px] text-slate-500 mt-1 font-mono">{subtitle}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:bg-slate-800 transition-colors shrink-0`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

function AccuracyMeter({
    label, value, total, color,
}: {
    label: string;
    value: number;
    total: number;
    color: string;
}) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <span className="text-sm font-bold text-white">{value} <span className="text-slate-500 font-normal text-xs">({pct}%)</span></span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
}
