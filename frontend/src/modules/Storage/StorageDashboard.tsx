import { useState } from 'react';
import { useStorageStats, useStorageFiles, useDeleteFile, useUpdatePolicy } from '../../hooks/useStorage';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
    Database, Download, Trash2, HardDrive, Video, FileText,
    Image as ImageIcon, Shield, Clock, Filter, CheckCircle2,
    AlertTriangle, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FileFilter = 'all' | 'video' | 'image' | 'log';

const FILTER_LABELS: { key: FileFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Filter className="w-3.5 h-3.5" /> },
    { key: 'video', label: 'Video', icon: <Video className="w-3.5 h-3.5" /> },
    { key: 'image', label: 'Images', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { key: 'log', label: 'Logs', icon: <FileText className="w-3.5 h-3.5" /> },
];

const FILE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
    video: { icon: <Video className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/15' },
    image: { icon: <ImageIcon className="w-4 h-4" />, color: 'text-orange-400 bg-orange-500/15' },
    log: { icon: <FileText className="w-4 h-4" />, color: 'text-purple-400 bg-purple-500/15' },
};

export default function StorageDashboard() {
    const { data: stats, isLoading: statsLoading } = useStorageStats();
    const [fileFilter, setFileFilter] = useState<FileFilter>('all');
    const [page] = useState(1);
    const { data: fileData, isLoading: filesLoading } = useStorageFiles(page, 50, fileFilter);
    const deleteFile = useDeleteFile();
    const updatePolicy = useUpdatePolicy();
    const [retentionInput, setRetentionInput] = useState('');
    const [policySuccess, setPolicySuccess] = useState(false);

    const usagePct = stats ? ((stats.usedSpace_GB / stats.totalCapacity_GB) * 100).toFixed(1) : '0';

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">Analyzing Storage</p>
                        <p className="text-xs text-slate-500 mt-1">Reading bucket metadata...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-purple-400 tracking-wider uppercase">Data Management</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Media & Storage</h1>
                <p className="text-slate-400 text-sm mt-1">Object storage utilization, retention policies, and evidence archive.</p>
            </div>

            {/* Top Row: Pie Chart + Retention Policy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Storage Usage + Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-[#040D21] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-8"
                >
                    {/* Pie Chart */}
                    <div className="relative w-44 h-44 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.distribution}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={72}
                                    paddingAngle={4}
                                    dataKey="size_GB"
                                    strokeWidth={0}
                                >
                                    {stats?.distribution.map((entry, i) => (
                                        <Cell key={`cell-${i}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">{usagePct}%</span>
                            <span className="text-[10px] text-slate-500 font-medium">Used</span>
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="flex-1 w-full">
                        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-slate-400" /> Storage Breakdown
                        </h2>
                        <div className="space-y-3">
                            {stats?.distribution.map((item) => (
                                <div key={item.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-slate-300">{item.category}</span>
                                        <span className="text-[10px] text-slate-600">{item.fileCount} files</span>
                                    </div>
                                    <span className="font-mono text-sm text-slate-400">{item.size_GB} GB</span>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-sm font-bold text-white">Capacity</span>
                                <span className="font-mono text-sm text-white">{stats?.usedSpace_GB} / {stats?.totalCapacity_GB} GB</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transition-all duration-700"
                                    style={{ width: `${usagePct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Retention Policy */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-[#040D21] border border-slate-800 rounded-2xl p-6 flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-bold text-white">Auto-Cleanup Policy</h2>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                        Active rule: Delete media older than <strong className="text-emerald-400">{stats?.retentionDays} days</strong>.
                    </p>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5 block">New Period (Days)</label>
                            <input
                                type="number"
                                value={retentionInput}
                                onChange={(e) => { setRetentionInput(e.target.value); setPolicySuccess(false); }}
                                placeholder="e.g. 30"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => {
                                const days = parseInt(retentionInput);
                                if (days > 0) {
                                    updatePolicy.mutate(days, { onSuccess: () => { setPolicySuccess(true); setRetentionInput(''); } });
                                }
                            }}
                            disabled={!retentionInput || updatePolicy.isPending}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                            {updatePolicy.isPending ? (
                                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...</>
                            ) : policySuccess ? (
                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Policy Applied!</>
                            ) : (
                                'Apply New Policy'
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* File Archive Browser */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#040D21] border border-slate-800 rounded-2xl overflow-hidden"
            >
                {/* File table header */}
                <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-bold text-white">Secure Media Archive</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">{fileData?.total ?? 0} objects in bucket</p>
                    </div>
                    <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-lg p-0.5">
                        {FILTER_LABELS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFileFilter(f.key)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${fileFilter === f.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {f.icon} {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* File table */}
                {filesLoading ? (
                    <div className="p-10 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin"></div>
                        <span className="text-xs text-slate-500">Loading objects...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold w-10">Type</th>
                                    <th className="px-6 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Filename / Object Key</th>
                                    <th className="px-6 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Size</th>
                                    <th className="px-6 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Uploaded</th>
                                    <th className="px-6 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {fileData?.files.map((file, i) => {
                                        const style = FILE_ICONS[file.type];
                                        return (
                                            <motion.tr
                                                key={file.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group"
                                            >
                                                <td className="px-6 py-3">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${style.color}`}>
                                                        {style.icon}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-sm font-medium text-white truncate max-w-xs">{file.filename}</p>
                                                    <p className="text-[10px] font-mono text-slate-600 truncate max-w-xs mt-0.5">{file.key}</p>
                                                </td>
                                                <td className="px-6 py-3 text-xs text-slate-400 font-mono">{file.size_MB} MB</td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(file.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                            title="Secure Download"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFile.mutate(file.key)}
                                                            className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {fileData?.files.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                                <AlertTriangle className="w-8 h-8 opacity-20 mb-2" />
                                <p className="text-xs">No files matching this filter</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
