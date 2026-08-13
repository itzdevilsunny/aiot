import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, MapPin, Camera, Play, RefreshCw
} from 'lucide-react';
import { useCameraStore } from '../../store/useCameraStore';

interface TrajectoryStep {
    step: number;
    cameraId: string;
    cameraName: string;
    zone: string;
    timestamp: string;
    timeDelta: string;
    confidence: number;
    thumbnailUrl: string;
    action: string;
}

interface TargetProfile {
    id: string;
    name: string;
    category: 'SUSPECT_PERSON' | 'STOLEN_VEHICLE' | 'UNATTENDED_CARGO';
    threatLevel: 'High' | 'Critical' | 'Medium';
    firstSeen: string;
    lastSeen: string;
    totalMatches: number;
    currentZone: string;
    avatarUrl: string;
    trajectory: TrajectoryStep[];
}

const MOCK_TARGETS: TargetProfile[] = [
    {
        id: 'reid_target_01',
        name: 'Suspect #8902 (Black Hoodie)',
        category: 'SUSPECT_PERSON',
        threatLevel: 'Critical',
        firstSeen: '14:10:05',
        lastSeen: '14:42:18',
        totalMatches: 4,
        currentZone: 'Industrial Cargo Yard',
        avatarUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        trajectory: [
            {
                step: 1,
                cameraId: 'CAM-004',
                cameraName: 'CAM-04 Live AI Feed',
                zone: 'Perimeter Security',
                timestamp: '14:10:05',
                timeDelta: '0m',
                confidence: 0.98,
                thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
                action: 'Breached Gate 3'
            },
            {
                step: 2,
                cameraId: 'CAM-012',
                cameraName: 'CAM-012 (Municipal Parking)',
                zone: 'Municipal Parking',
                timestamp: '14:22:40',
                timeDelta: '+12m 35s',
                confidence: 0.94,
                thumbnailUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
                action: 'Walked through B1 Level'
            },
            {
                step: 3,
                cameraId: 'CAM-022',
                cameraName: 'CAM-022 (Highway Junction)',
                zone: 'Highway Junction',
                timestamp: '14:35:10',
                timeDelta: '+12m 30s',
                confidence: 0.91,
                thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800',
                action: 'Crossed North Footbridge'
            },
            {
                step: 4,
                cameraId: 'CAM-045',
                cameraName: 'CAM-045 (Cargo Yard Node 6)',
                zone: 'Industrial Cargo Yard',
                timestamp: '14:42:18',
                timeDelta: '+7m 08s',
                confidence: 0.96,
                thumbnailUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
                action: 'Entered Container Bay 4'
            }
        ]
    },
    {
        id: 'reid_target_02',
        name: 'Stolen SUV (MH-12-AB-1234)',
        category: 'STOLEN_VEHICLE',
        threatLevel: 'High',
        firstSeen: '13:05:00',
        lastSeen: '13:45:22',
        totalMatches: 3,
        currentZone: 'Airport Terminal',
        avatarUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800',
        trajectory: [
            {
                step: 1,
                cameraId: 'CAM-001',
                cameraName: 'CAM-001 (Perimeter Main Gate)',
                zone: 'Perimeter Security',
                timestamp: '13:05:00',
                timeDelta: '0m',
                confidence: 0.97,
                thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
                action: 'Spotted at Barrier 1'
            },
            {
                step: 2,
                cameraId: 'CAM-008',
                cameraName: 'CAM-008 (Airport Terminal)',
                zone: 'Airport Terminal',
                timestamp: '13:28:15',
                timeDelta: '+23m 15s',
                confidence: 0.95,
                thumbnailUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800',
                action: 'Parked in Departure Lane'
            }
        ]
    }
];

export default function CrossCameraReID() {
    const { setSelectedCameraId } = useCameraStore();
    const [selectedTarget, setSelectedTarget] = useState<TargetProfile>(MOCK_TARGETS[0]);
    const [activeStep, setActiveStep] = useState<TrajectoryStep>(MOCK_TARGETS[0].trajectory[0]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <div className="p-4 sm:p-6 bg-[#0B0F19] min-h-screen text-white flex flex-col space-y-6 relative">
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-purple-400/40 flex items-center gap-2 animate-bounce">
                    <span>⚡ {toastMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111623] p-5 rounded-2xl border border-slate-800 shadow-xl gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Cross-Camera Re-Identification (Re-ID)</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        Multi-Camera AI Suspect Trajectory Tracker
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Track targets across municipal camera nodes with sequential movement timelines & AI feature embeddings.</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Re-ID Active
                    </span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* Left Side (1 col): Active Tracked Targets List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tracked Profiles</h3>
                    {MOCK_TARGETS.map((target) => (
                        <motion.div
                            key={target.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => { setSelectedTarget(target); setActiveStep(target.trajectory[0]); }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${selectedTarget.id === target.id
                                    ? 'bg-purple-600/15 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                    : 'bg-[#111623] border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                                    <img src={target.avatarUrl} alt={target.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-white truncate">{target.name}</h4>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${target.threatLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                            {target.threatLevel}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                        <MapPin size={10} className="text-purple-400" /> Current: {target.currentZone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
                                <span>{target.totalMatches} Camera Matches</span>
                                <span>Timeline: {target.firstSeen} → {target.lastSeen}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Side (2 cols): Re-ID Trajectory Timeline & Viewer */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Sequential Trajectory Timeline */}
                    <div className="bg-[#111623] p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Activity size={14} className="text-purple-400" /> Sequential Path Trajectory
                            </h3>
                            <span className="text-xs font-mono text-purple-400 font-bold">{selectedTarget.name}</span>
                        </div>

                        {/* Trajectory Breadcrumb Steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {selectedTarget.trajectory.map((step) => (
                                <button
                                    key={step.step}
                                    onClick={() => setActiveStep(step)}
                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${activeStep.step === step.step
                                            ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                                            Step #{step.step}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-500">{step.timeDelta}</span>
                                    </div>
                                    <p className="text-xs font-bold text-white truncate">{step.cameraId}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{step.zone}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Step Camera Inspection Frame */}
                    <div className="bg-[#111623] p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Camera size={16} className="text-blue-400" /> Step #{activeStep.step} Feed: {activeStep.cameraName}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">{activeStep.action} • {activeStep.timestamp}</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                                {Math.round(activeStep.confidence * 100)}% Re-ID Match
                            </span>
                        </div>

                        {/* Video Frame */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-800 h-64 bg-black group">
                            <img src={activeStep.thumbnailUrl} alt={activeStep.cameraName} className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 border-2 border-purple-500/40 pointer-events-none" />
                            <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                <span>RE-ID MATCH FOUND ({activeStep.cameraId})</span>
                            </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setSelectedCameraId(activeStep.cameraId);
                                    showToast(`Overview camera feed updated to stream ${activeStep.cameraId} (${activeStep.cameraName})`);
                                }}
                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                            >
                                <Play size={14} /> Stream Live Feed ({activeStep.cameraId})
                            </button>
                            <button
                                onClick={() => showToast(`Re-ID tracking reset for ${selectedTarget.name}`)}
                                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <RefreshCw size={14} /> Refresh Trajectory
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
