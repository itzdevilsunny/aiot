import { useState, useEffect, useMemo } from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import type { AnomalyAlert, AlertStatus } from '../../store/useAlertStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Shield, Clock, CheckCircle, XCircle,
    Search, Filter, Eye, ChevronDown, Siren, Camera
} from 'lucide-react';

// ─── Severity badge colors ──────────────────────────────────
const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    Critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
    Medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
    Low: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
};

const STATUS_STYLES: Record<AlertStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    Pending: { bg: 'bg-slate-600', text: 'text-slate-200', icon: <Clock className="w-3 h-3" /> },
    Investigating: { bg: 'bg-blue-600', text: 'text-blue-100', icon: <Eye className="w-3 h-3" /> },
    Resolved: { bg: 'bg-emerald-600', text: 'text-emerald-100', icon: <CheckCircle className="w-3 h-3" /> },
    'False Positive': { bg: 'bg-slate-700', text: 'text-slate-300', icon: <XCircle className="w-3 h-3" /> },
};

const TYPE_LABELS: Record<string, string> = {
    PARKING_VIOLATION: 'Parking Violation',
    CAPACITY_EXCEEDED: 'Capacity Exceeded',
    UNAUTHORIZED_VEHICLE: 'Unauthorized Vehicle',
    SUSPICIOUS_BEHAVIOR: 'Suspicious Behavior',
};

export default function AlertDashboard() {
    const { alerts, updateAlertStatus } = useAlertStore();
    const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);
    const [editNotes, setEditNotes] = useState('');
    const [editStatus, setEditStatus] = useState<AlertStatus>('Investigating');
    const [saving, setSaving] = useState(false);

    // Filters
    const [severityFilter, setSeverityFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    // When selecting an alert, pre-fill the form
    useEffect(() => {
        if (selectedAlert) {
            setEditNotes(selectedAlert.operator_notes || '');
            setEditStatus(selectedAlert.status === 'Pending' ? 'Investigating' : selectedAlert.status);
        }
    }, [selectedAlert]);

    // Keep selected alert in sync with live updates
    useEffect(() => {
        if (selectedAlert) {
            const updated = alerts.find((a) => a.id === selectedAlert.id);
            if (updated && updated.status !== selectedAlert.status) {
                setSelectedAlert(updated);
            }
        }
    }, [alerts, selectedAlert]);

    // Filter logic
    const filteredAlerts = useMemo(() => {
        return alerts.filter((a) => {
            // Sandboxed for Hackathon: Hide dummy background events from the primary alert log
            if (a.camera_id !== 'CAM-04') return false;
            
            if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
            if (statusFilter !== 'All' && a.status !== statusFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    a.type.toLowerCase().includes(q) ||
                    a.camera_id.toLowerCase().includes(q) ||
                    (a.operator_notes || '').toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [alerts, severityFilter, statusFilter, searchQuery]);

    const pendingCount = alerts.filter((a) => a.status === 'Pending').length;
    const criticalCount = alerts.filter((a) => a.severity === 'Critical' && a.status === 'Pending').length;

    const handleSave = async () => {
        if (!selectedAlert) return;
        setSaving(true);
        await updateAlertStatus(selectedAlert.id, editStatus, editNotes);
        setSaving(false);
        setSelectedAlert(null);
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-50 overflow-hidden">
            {/* ─── Left Side: Live Alert Feed ─── */}
            <div className={`${selectedAlert ? 'w-2/3' : 'w-full'} flex flex-col transition-all duration-300`}>
                {/* Header */}
                <div className="p-6 pb-0 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-red-400 tracking-wider uppercase">Live Alert Feed</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                <Siren className="w-6 h-6 text-red-400" />
                                Anomaly Alerts
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Real-time anomaly detection events from edge inference nodes.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                <span className="text-xs font-bold text-red-400">{criticalCount} Critical</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                                <span className="text-xs font-bold text-slate-300">{pendingCount} Pending</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all flex-1 min-w-[200px] max-w-sm">
                            <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 w-full"
                            />
                        </div>

                        <div className="relative group">
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 pr-8 cursor-pointer hover:border-slate-700 transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
                            >
                                <option value="All">All Severity</option>
                                <option value="Critical">Critical</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 pr-8 cursor-pointer hover:border-slate-700 transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Investigating">Investigating</option>
                                <option value="Resolved">Resolved</option>
                                <option value="False Positive">False Positive</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 text-xs ml-auto">
                            <Filter className="w-3.5 h-3.5" />
                            <span>{filteredAlerts.length} results</span>
                        </div>
                    </div>
                </div>

                {/* Alert List */}
                <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-2">
                    {filteredAlerts.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                            <Shield className="w-10 h-10 opacity-20 mb-3" />
                            <p className="text-sm font-medium">No matching anomalies.</p>
                            <p className="text-xs opacity-60 mt-1">System is monitoring all zones securely.</p>
                        </div>
                    )}
                    <AnimatePresence mode="popLayout">
                        {filteredAlerts.map((alert) => {
                            const sev = SEVERITY_STYLES[alert.severity];
                            const st = STATUS_STYLES[alert.status];
                            const isSelected = selectedAlert?.id === alert.id;

                            return (
                                <motion.div
                                    key={alert.id}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    onClick={() => setSelectedAlert(alert)}
                                    className={`p-4 rounded-xl cursor-pointer flex items-center gap-4 border transition-all duration-200 group
                    ${isSelected
                                            ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.08)]'
                                            : alert.severity === 'Critical' && alert.status === 'Pending'
                                                ? `${sev.bg} ${sev.border} hover:border-red-500/50`
                                                : 'bg-[#040D21] border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                                        }
                  `}
                                >
                                    {/* Severity Dot */}
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sev.dot} ${alert.severity === 'Critical' && alert.status === 'Pending' ? 'animate-pulse' : ''}`} />

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white truncate">{TYPE_LABELS[alert.type] || alert.type}</p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sev.bg} ${sev.text} border ${sev.border}`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Camera className="w-3 h-3" /> {alert.camera_id}
                                            </span>
                                            <span className="text-xs text-emerald-400 font-mono">
                                                {(alert.confidence).toFixed(1)}% conf
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status + Time */}
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                                            {st.icon} {alert.status}
                                        </span>
                                        <p className="text-[11px] font-mono text-slate-500">
                                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── Right Side: Editable Detail Panel ─── */}
            <AnimatePresence>
                {selectedAlert && (
                    <motion.div
                        key="detail-panel"
                        initial={{ opacity: 0, x: 40, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: '33.333%' }}
                        exit={{ opacity: 0, x: 40, width: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                        className="border-l border-slate-800 bg-[#040D21] flex flex-col overflow-hidden"
                    >
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className={`w-5 h-5 ${SEVERITY_STYLES[selectedAlert.severity].text}`} />
                                    Alert Details
                                </h3>
                                <button
                                    onClick={() => setSelectedAlert(null)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* AI Snapshot */}
                            <div className="relative rounded-xl overflow-hidden border border-slate-800 group">
                                <img
                                    src={selectedAlert.image_url}
                                    alt="Anomaly Snapshot"
                                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${SEVERITY_STYLES[selectedAlert.severity].bg} ${SEVERITY_STYLES[selectedAlert.severity].text} border ${SEVERITY_STYLES[selectedAlert.severity].border} backdrop-blur-md`}>
                                        {selectedAlert.severity}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                                    <span className="text-[10px] font-mono text-emerald-400">{selectedAlert.confidence.toFixed(1)}% confidence</span>
                                </div>
                            </div>

                            {/* Info Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Type</label>
                                    <p className="text-sm font-medium text-white mt-1">{TYPE_LABELS[selectedAlert.type]}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Camera</label>
                                    <p className="text-sm font-medium text-white mt-1 flex items-center gap-1">
                                        <Camera className="w-3.5 h-3.5 text-blue-400" /> {selectedAlert.camera_id}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Detected At</label>
                                    <p className="text-sm font-mono text-white mt-1">
                                        {new Date(selectedAlert.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Event ID</label>
                                    <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">{selectedAlert.id}</p>
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 block">Update Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['Investigating', 'Resolved', 'False Positive', 'Pending'] as AlertStatus[]).map((s) => {
                                        const st = STATUS_STYLES[s];
                                        const isActive = editStatus === s;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => setEditStatus(s)}
                                                className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border transition-all duration-200
                          ${isActive
                                                        ? `${st.bg} ${st.text} border-transparent shadow-lg`
                                                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                                    }
                        `}
                                            >
                                                {st.icon} {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Operator Notes */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 block">Operator Notes</label>
                                <textarea
                                    className="w-full bg-slate-900 text-white text-sm p-3 rounded-xl border border-slate-800 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none resize-none"
                                    rows={4}
                                    placeholder="Enter details about this incident..."
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 border-t border-slate-800 flex gap-3">
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors border border-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
