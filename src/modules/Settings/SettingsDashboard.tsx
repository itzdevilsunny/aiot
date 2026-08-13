import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetSettings, useUpdateSettings, settingsSchema, type SystemSettings } from '../../hooks/useSettings';
import {
    Settings, BrainCircuit, Bell, Save, CheckCircle2,
    Sliders, Cpu, Mail, Smartphone, ShieldCheck,
    Pencil, Globe, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabKey = 'ai' | 'notifications' | 'general';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'ai', label: 'AI & Detection', icon: <BrainCircuit className="w-4 h-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { key: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
];

const MODEL_OPTIONS = [
    { value: 'yolov8n-general', label: 'YOLOv8 Nano — General Objects (High FPS)', desc: 'Best for general surveillance, low-latency edge devices' },
    { value: 'yolov8m-municipal-parking', label: 'YOLOv8 Medium — Municipal Parking', desc: 'Optimized for capacity enforcement & vehicle detection' },
    { value: 'yolov8s-campus-attendance', label: 'YOLOv8 Small — Campus Tracking', desc: 'Fine-tuned for pedestrian counting & attendance' },
];

export default function SettingsDashboard() {
    const [activeTab, setActiveTab] = useState<TabKey>('ai');
    const [showSuccess, setShowSuccess] = useState(false);

    const { data: currentSettings, isLoading } = useGetSettings();
    const updateMutation = useUpdateSettings();

    const {
        register, handleSubmit, reset, watch,
        formState: { errors, isDirty },
    } = useForm<SystemSettings>({
        resolver: zodResolver(settingsSchema),
    });

    // Populate form when data arrives
    useEffect(() => {
        if (currentSettings) reset(currentSettings);
    }, [currentSettings, reset]);

    const onSubmit = (data: SystemSettings) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                reset(data);
            },
        });
    };

    const thresholdValue = watch('aiConfidenceThreshold');
    const activeModelValue = watch('activeModel');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium">Loading Configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400 tracking-wider uppercase">Configuration</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="text-slate-400 text-sm mt-1">AI thresholds, notification routing, and global preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                {/* Left Sidebar Tabs */}
                <div className="w-full md:w-56 flex md:flex-col gap-1.5 shrink-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-medium transition-all text-left w-full ${activeTab === tab.key
                                ? 'bg-slate-800 text-white border border-slate-700'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 border border-transparent'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}

                    {/* Dirty indicator */}
                    {isDirty && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-medium flex items-center gap-1.5"
                        >
                            <Pencil className="w-3 h-3" /> Unsaved changes
                        </motion.div>
                    )}
                </div>

                {/* Right Form Panel */}
                <div className="flex-1 bg-[#040D21] border border-slate-800 rounded-2xl overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {/* ─── AI Tab ───────────────────────────── */}
                                    {activeTab === 'ai' && (
                                        <div className="space-y-6">
                                            <SectionHeader icon={<Cpu className="w-4 h-4 text-blue-400" />} title="AI Inference Configuration" />

                                            {/* Model Selector */}
                                            <div>
                                                <FieldLabel>Active Neural Network Model</FieldLabel>
                                                <div className="space-y-2 mt-2">
                                                    {MODEL_OPTIONS.map((m) => (
                                                        <label
                                                            key={m.value}
                                                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                ${activeModelValue === m.value
                                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                value={m.value}
                                                                {...register('activeModel')}
                                                                className="mt-0.5 accent-blue-500"
                                                            />
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{m.label}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.activeModel && <ErrorText>{errors.activeModel.message}</ErrorText>}
                                            </div>

                                            {/* Confidence Threshold */}
                                            <div>
                                                <FieldLabel>
                                                    Global Confidence Threshold:{' '}
                                                    <span className={`font-bold ${thresholdValue > 85 ? 'text-emerald-400'
                                                        : thresholdValue > 50 ? 'text-blue-400'
                                                            : 'text-amber-400'
                                                        }`}>
                                                        {thresholdValue}%
                                                    </span>
                                                </FieldLabel>
                                                <div className="mt-3 px-1">
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="99"
                                                        {...register('aiConfidenceThreshold', { valueAsNumber: true })}
                                                        className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-500"
                                                    />
                                                    <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                                                        <span>10% — More detections, more false positives</span>
                                                        <span>99% — Only high-confidence results</span>
                                                    </div>
                                                </div>
                                                {errors.aiConfidenceThreshold && <ErrorText>{errors.aiConfidenceThreshold.message}</ErrorText>}
                                            </div>

                                            {/* Gemini Vision API Key & Camera Source Config */}
                                            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                                                    <BrainCircuit className="w-4 h-4" /> Real AI Multimodal Engine (Google Gemini)
                                                </div>

                                                <div>
                                                    <FieldLabel>Google Gemini API Key</FieldLabel>
                                                    <input
                                                        type="password"
                                                        placeholder="AIzaSy..."
                                                        defaultValue={localStorage.getItem('GEMINI_API_KEY') || ''}
                                                        onChange={(e) => localStorage.setItem('GEMINI_API_KEY', e.target.value)}
                                                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                                    />
                                                    <p className="text-[10px] text-slate-500 mt-1">
                                                        Required for Stage 2 scene-level anomaly detection (perimeter breach, safety gear missing, unauthorized vehicles).
                                                    </p>
                                                </div>

                                                <div>
                                                    <FieldLabel>Camera Stream Source</FieldLabel>
                                                    <input
                                                        type="text"
                                                        placeholder="0 (Webcam) or http://192.168.1.5:8080/video"
                                                        defaultValue={localStorage.getItem('CAMERA_SRC') || '0'}
                                                        onChange={(e) => localStorage.setItem('CAMERA_SRC', e.target.value)}
                                                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                                    />
                                                    <p className="text-[10px] text-slate-500 mt-1">
                                                        Enter device index <code className="text-blue-400">0</code> for integrated webcam, or an RTSP/HTTP video stream URL.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Auto-acknowledge */}
                                            <ToggleField
                                                label="Auto-Acknowledge Low Severity"
                                                description="Automatically resolve alerts below the confidence threshold without operator review."
                                                icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                                register={register('autoAcknowledgeLowSeverity')}
                                            />
                                        </div>
                                    )}

                                    {/* ─── Notifications Tab ────────────────── */}
                                    {activeTab === 'notifications' && (
                                        <div className="space-y-6">
                                            <SectionHeader icon={<Bell className="w-4 h-4 text-amber-400" />} title="Alert Routing & Mobile Webhook Dispatcher" />

                                            {/* Telegram Mobile Dispatcher Config */}
                                            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                                                    <Smartphone className="w-4 h-4" /> Real-time Telegram Mobile Dispatcher
                                                </div>

                                                <div>
                                                    <FieldLabel>Telegram Bot Token</FieldLabel>
                                                    <input
                                                        type="password"
                                                        placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                                                        defaultValue={localStorage.getItem('TELEGRAM_BOT_TOKEN') || ''}
                                                        onChange={(e) => localStorage.setItem('TELEGRAM_BOT_TOKEN', e.target.value)}
                                                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                                    />
                                                </div>

                                                <div>
                                                    <FieldLabel>Telegram Target Chat ID</FieldLabel>
                                                    <input
                                                        type="text"
                                                        placeholder="-100123456789 or @security_ops_channel"
                                                        defaultValue={localStorage.getItem('TELEGRAM_CHAT_ID') || ''}
                                                        onChange={(e) => localStorage.setItem('TELEGRAM_CHAT_ID', e.target.value)}
                                                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                                    />
                                                </div>

                                                <div>
                                                    <FieldLabel>Enterprise Webhook Endpoint (Slack / Discord / Custom API)</FieldLabel>
                                                    <input
                                                        type="text"
                                                        placeholder="https://hooks.slack.com/services/..."
                                                        defaultValue={localStorage.getItem('WEBHOOK_DISPATCH_URL') || ''}
                                                        onChange={(e) => localStorage.setItem('WEBHOOK_DISPATCH_URL', e.target.value)}
                                                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <ToggleField
                                                label="Critical Email Alerts"
                                                description="Dispatch emails to operators immediately upon critical anomalies."
                                                icon={<Mail className="w-4 h-4 text-blue-400" />}
                                                register={register('enableEmailAlerts')}
                                            />

                                            <ToggleField
                                                label="Browser Push Notifications"
                                                description="Show native OS notifications even when the dashboard is minimized."
                                                icon={<Smartphone className="w-4 h-4 text-purple-400" />}
                                                register={register('enablePushNotifications')}
                                            />
                                        </div>
                                    )}

                                    {/* ─── General Tab ──────────────────────── */}
                                    {activeTab === 'general' && (
                                        <div className="space-y-6">
                                            <SectionHeader icon={<Globe className="w-4 h-4 text-cyan-400" />} title="General Preferences" />

                                            <div>
                                                <FieldLabel>System Name</FieldLabel>
                                                <input
                                                    type="text"
                                                    {...register('systemName')}
                                                    className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                                    placeholder="e.g. VisionAIoT Campus Alpha"
                                                />
                                                {errors.systemName && <ErrorText>{errors.systemName.message}</ErrorText>}
                                                <p className="text-[10px] text-slate-600 mt-1">Displayed in the dashboard header and exported reports.</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer: Save Bar */}
                        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/20 flex items-center justify-between">
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Configuration saved and synced with edge nodes.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!showSuccess && <div />}

                            <button
                                type="submit"
                                disabled={!isDirty || updateMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all"
                            >
                                {updateMutation.isPending ? (
                                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-3.5 h-3.5" /> Save Configuration</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-Components ─────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            {icon}
            <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="text-xs font-medium text-slate-400 block">{children}</label>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
    return <p className="text-red-400 text-[11px] mt-1">{children}</p>;
}

function ToggleField({
    label, description, icon, register: reg,
}: {
    label: string;
    description: string;
    icon: React.ReactNode;
    register: Record<string, unknown>;
}) {
    return (
        <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
            </div>
            <input type="checkbox" {...reg} className="w-5 h-5 accent-blue-500 mt-1 shrink-0 cursor-pointer" />
        </label>
    );
}
