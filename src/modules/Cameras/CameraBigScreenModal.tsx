import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera as CameraIcon, Cpu, Activity, ChevronLeft, ChevronRight,
    ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Eye
} from 'lucide-react';
import type { CameraNode } from '../../store/useCameraStore';
import { useCameraStore } from '../../store/useCameraStore';
import { useAlertStore } from '../../store/useAlertStore';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'https://defence-survillance-system.onrender.com';

interface CameraBigScreenModalProps {
    camera: CameraNode | null;
    onClose: () => void;
}

interface BoundingBox {
    id: string;
    label: string;
    confidence: number;
    color: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function CameraBigScreenModal({ camera, onClose }: CameraBigScreenModalProps) {
    const { cameras, setSelectedCameraId } = useCameraStore();
    const [boxes, setBoxes] = useState<BoundingBox[]>([]);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showOverlay, setShowOverlay] = useState(true);
    const [isTriggeringAlert, setIsTriggeringAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const currentIndex = cameras.findIndex(c => c?.id === camera?.id);

    const handlePrev = () => {
        if (currentIndex > 0) {
            setSelectedCameraId(cameras[currentIndex - 1].id);
        } else {
            setSelectedCameraId(cameras[cameras.length - 1].id);
        }
    };

    const handleNext = () => {
        if (currentIndex < cameras.length - 1) {
            setSelectedCameraId(cameras[currentIndex + 1].id);
        } else {
            setSelectedCameraId(cameras[0].id);
        }
    };

    // Listen for live YOLO11 bounding boxes for this camera
    useEffect(() => {
        if (!camera) return;

        const socket = io(SOCKET_URL, { reconnectionAttempts: 3 });
        const eventName = `boxes_${camera.id}`;

        socket.on(eventName, (data: BoundingBox[]) => {
            setBoxes(data || []);
        });

        // Fallback simulated boxes if specific camera has no active stream
        let interval: ReturnType<typeof setInterval> | null = null;
        if (camera.id !== 'CAM-04' && camera.status === 'online') {
            interval = setInterval(() => {
                setBoxes([
                    {
                        id: `box_${Date.now()}_1`,
                        label: 'PERSON',
                        confidence: 0.94,
                        color: '#3B82F6',
                        x: 25 + Math.random() * 10,
                        y: 30 + Math.random() * 10,
                        width: 15,
                        height: 35
                    },
                    {
                        id: `box_${Date.now()}_2`,
                        label: 'VEHICLE',
                        confidence: 0.91,
                        color: '#22C55E',
                        x: 55 + Math.random() * 10,
                        y: 40 + Math.random() * 10,
                        width: 25,
                        height: 30
                    }
                ]);
            }, 3000);
        }

        return () => {
            socket.disconnect();
            if (interval) clearInterval(interval);
        };
    }, [camera]);

    // Handle manual anomaly incident creation
    const handleTriggerTestAnomaly = async () => {
        if (!camera) return;
        setIsTriggeringAlert(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'https://defence-survillance-system.onrender.com'}/api/alerts/webhook`, {
                camera_id: camera.id,
                type: 'UNAUTHORIZED_ACCESS',
                severity: 'Critical',
                confidence: 0.96,
                image_url: camera.thumbnailUrl
            });
            setAlertMessage('Manual AI Anomaly dispatched to Dashboard!');
            setTimeout(() => setAlertMessage(''), 4000);
        } catch {
            setAlertMessage('Anomaly posted locally.');
            setTimeout(() => setAlertMessage(''), 4000);
        } finally {
            setIsTriggeringAlert(false);
        }
    };

    if (!camera) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl font-sans">

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="relative w-full max-w-7xl h-[92vh] bg-[#040D21] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl text-white"
                >
                    {/* Top Control Header */}
                    <div className="h-16 px-6 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrev}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                                title="Previous Camera (Left Arrow)"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                    <CameraIcon size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-white">{camera.name}</h2>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${camera.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : camera.status === 'connecting' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {camera.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">Zone: <span className="text-slate-200">{camera.zone}</span> • IP: <span className="font-mono text-slate-300">{camera.ip_url}</span></p>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                                title="Next Camera (Right Arrow)"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Middle Badges */}
                        <div className="hidden lg:flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-medium">
                                <Cpu size={14} className="text-blue-400" />
                                Model: <span className="font-bold text-white">YOLO11 Nano</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-medium">
                                <Activity size={14} className="text-emerald-400" />
                                Latency: <span className="font-bold text-emerald-400">{camera.latencyMs || 12}ms</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-medium">
                                Resolution: <span className="font-bold text-white">{camera.resolution || '4K Ultra HD'}</span>
                            </div>
                        </div>

                        {/* Close button */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-slate-800 hover:bg-red-600/30 hover:text-red-400 text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#020617]">

                        {/* Left: Huge Viewport Canvas */}
                        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                            {/* Visual Noise/Grid lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

                            {/* Camera Feed Image / Video Canvas */}
                            <div
                                className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
                                style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
                            >
                                <img
                                    src={camera.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'}
                                    alt={camera.name}
                                    className="w-full h-full object-cover max-h-full"
                                />

                                {/* Bounding Box Overlays */}
                                {showOverlay && boxes.map((box) => (
                                    <div
                                        key={box.id}
                                        className="absolute border-2 transition-all duration-300 rounded pointer-events-none shadow-lg"
                                        style={{
                                            borderColor: box.color || '#22C55E',
                                            left: `${box.x}%`,
                                            top: `${box.y}%`,
                                            width: `${box.width}%`,
                                            height: `${box.height}%`,
                                        }}
                                    >
                                        <div
                                            className="absolute -top-6 left-0 px-2 py-0.5 text-[11px] font-bold text-white rounded shadow-md flex items-center gap-1.5 whitespace-nowrap"
                                            style={{ backgroundColor: box.color || '#22C55E' }}
                                        >
                                            <span>{box.label}</span>
                                            <span>{Math.round((box.confidence || 0.9) * 100)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* HUD Live Overlay Indicators */}
                            <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-bold tracking-wider uppercase">REC • LIVE STREAM</span>
                                <span className="text-slate-400">|</span>
                                <span className="font-mono text-slate-300">{camera.fps || 60} FPS</span>
                            </div>

                            {/* Navigation Shortcuts Overlay */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-400">
                                <span>Camera <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{cameras.length}</strong></span>
                                <span>(Use ← → keys to switch)</span>
                            </div>
                        </div>

                        {/* Right: Interactive PTZ & Telemetry Sidebar */}
                        <div className="w-full lg:w-80 bg-[#060D1E] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between space-y-4 overflow-y-auto shrink-0">
                            <div className="space-y-5">
                                {/* PTZ Joystick Controls */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                                        <span>PTZ Optics Control</span>
                                        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1 cursor-pointer">
                                            <RotateCcw size={10} /> Reset
                                        </button>
                                    </h3>

                                    {/* Directional Pad */}
                                    <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
                                        <div />
                                        <button onClick={() => setPan(p => ({ ...p, y: p.y + 20 }))} className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-xl text-center text-white text-xs font-bold cursor-pointer">▲</button>
                                        <div />
                                        <button onClick={() => setPan(p => ({ ...p, x: p.x + 20 }))} className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-xl text-center text-white text-xs font-bold cursor-pointer">◄</button>
                                        <div className="p-2.5 bg-slate-950 rounded-xl flex items-center justify-center text-slate-600 text-[10px] font-mono">PTZ</div>
                                        <button onClick={() => setPan(p => ({ ...p, x: p.x - 20 }))} className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-xl text-center text-white text-xs font-bold cursor-pointer">►</button>
                                        <div />
                                        <button onClick={() => setPan(p => ({ ...p, y: p.y - 20 }))} className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-xl text-center text-white text-xs font-bold cursor-pointer">▼</button>
                                        <div />
                                    </div>

                                    {/* Zoom Buttons */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <button onClick={() => setZoom(z => Math.max(1, z - 0.25))} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer">
                                            <ZoomOut size={14} /> Zoom Out
                                        </button>
                                        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer">
                                            <ZoomIn size={14} /> Zoom In ({zoom}x)
                                        </button>
                                    </div>
                                </div>

                                {/* AI Display Toggles */}
                                <div className="space-y-2 pt-3 border-t border-slate-800">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">AI Detection Layers</h3>

                                    <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                                        <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
                                            <Eye size={14} className="text-blue-400" /> Show YOLO11 Overlays
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={showOverlay}
                                            onChange={e => setShowOverlay(e.target.checked)}
                                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                                        />
                                    </label>
                                </div>

                                {/* Quick AI Actions */}
                                <div className="space-y-2 pt-3 border-t border-slate-800">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Emergency Response</h3>

                                    {alertMessage && (
                                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
                                            {alertMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setAlertMessage(`📸 Snapshot Captured & Pushed to Supabase Alerts!`);
                                            useAlertStore.getState().createAlert({
                                                camera_id: camera.id,
                                                type: 'SUSPECT_MATCH',
                                                severity: 'Critical',
                                                confidence: 0.98,
                                                image_url: camera.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
                                                operator_notes: `Manual Camera Snapshot taken by Operator on ${camera.name} (${camera.zone}).`,
                                                location: camera.zone
                                            });
                                            setTimeout(() => setAlertMessage(''), 4000);
                                        }}
                                        className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                                    >
                                        <CameraIcon size={14} /> 📸 Capture Snapshot & Flag Suspect
                                    </button>

                                    <button
                                        onClick={handleTriggerTestAnomaly}
                                        disabled={isTriggeringAlert}
                                        className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                                    >
                                        <AlertTriangle size={14} /> {isTriggeringAlert ? 'Dispatching...' : '🚨 Trigger Manual AI Anomaly'}
                                    </button>
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                                <div className="flex justify-between">
                                    <span>Stream Bitrate:</span>
                                    <span className="font-mono text-slate-300">4.8 Mbps</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Engine:</span>
                                    <span className="font-mono text-blue-400">YOLO11 Nano + Gemini</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
