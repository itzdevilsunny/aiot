import { useState, useRef } from 'react';
import { Maximize2, ZoomIn, ZoomOut, Zap, ZapOff, Trash2, WifiOff, RefreshCw, Edit2, Check } from 'lucide-react';
import type { CameraNode } from '../../store/useCameraStore';
import { useCameraStore } from '../../store/useCameraStore';

export default function IPWebcamPlayer({ camera }: { camera: CameraNode }) {
    const [hasError, setHasError] = useState(false);
    const [isFlashlightOn, setIsFlashlightOn] = useState(false);
    const [isEditingIp, setIsEditingIp] = useState(false);
    const [customIp, setCustomIp] = useState(camera.ip_url || 'http://');
    const containerRef = useRef<HTMLDivElement>(null);
    const { removeCamera, updateStatus } = useCameraStore();

    const [activeIp, setActiveIp] = useState(camera.ip_url || 'http://');

    // IP Webcam specific video stream endpoint
    const streamUrl = activeIp?.endsWith('/video')
        ? activeIp
        : `${activeIp.replace(/\/$/, '')}/video`;

    // Send HTTP PTZ / Flashlight command directly to IP Webcam
    const sendCommand = async (endpoint: string) => {
        try {
            await fetch(`${activeIp}${endpoint}`, { mode: 'no-cors' });
        } catch (error) {
            console.warn(`PTZ/LED command warning on ${camera.name}:`, error);
        }
    };

    const toggleFlashlight = () => {
        sendCommand(`/enabletorch?enable=${isFlashlightOn ? 0 : 1}`);
        setIsFlashlightOn(!isFlashlightOn);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleSaveIp = () => {
        setActiveIp(customIp);
        setHasError(false);
        setIsEditingIp(false);
    };

    const isWorking = camera.status === 'online' && !hasError;

    return (
        <div
            ref={containerRef}
            className={`relative bg-[#0F1420] border rounded-2xl overflow-hidden shadow-lg flex flex-col group h-full min-h-[260px] transition-all duration-300 ${isWorking ? 'border-slate-800 hover:border-blue-500/40' : 'border-red-900/40 bg-red-950/10'
                }`}
        >
            {/* Top Telemetry & Control Header */}
            <div className="absolute top-0 left-0 w-full p-2.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-20 flex justify-between items-center opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isWorking ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-500'}`} />
                    <span className="text-white text-xs font-bold font-mono tracking-tight truncate drop-shadow-md">{camera.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${isWorking ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                        {isWorking ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 z-30">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingIp(!isEditingIp);
                        }}
                        className="p-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer border border-slate-700"
                        title="Edit IP Stream URL"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Disconnect and remove ${camera.name}?`)) removeCamera(camera.id);
                        }}
                        className="p-1 bg-red-950/80 hover:bg-red-900 text-red-400 hover:text-red-200 rounded-lg transition cursor-pointer border border-red-800/50"
                        title="Remove Camera"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Quick Edit IP Overlay */}
            {isEditingIp && (
                <div className="absolute inset-x-0 top-12 z-30 p-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 space-y-2">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Configure IP Webcam Stream URL</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customIp}
                            onChange={(e) => setCustomIp(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500"
                            placeholder="http://192.168.1.100:8080"
                        />
                        <button
                            onClick={handleSaveIp}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                            <Check size={12} /> Save
                        </button>
                    </div>
                </div>
            )}

            {/* Video Feed or Offline Display */}
            <div className="flex-grow bg-black relative flex items-center justify-center overflow-hidden">
                {isWorking ? (
                    <img
                        src={streamUrl}
                        alt={camera.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                        onLoad={() => {
                            setHasError(false);
                            updateStatus(camera.id, 'online');
                        }}
                        onError={() => {
                            setHasError(true);
                            updateStatus(camera.id, 'offline');
                        }}
                    />
                ) : (
                    /* Offline Camera Card */
                    <div className="absolute inset-0 bg-[#0A0E1A] flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 shadow-lg">
                            <WifiOff size={22} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">SIGNAL LOST / UNREACHABLE</h4>
                        <p className="text-[10px] font-mono text-slate-500 mt-1 max-w-[220px] truncate">{camera.ip_url}</p>
                        <button
                            onClick={() => {
                                setHasError(false);
                                updateStatus(camera.id, 'online');
                            }}
                            className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <RefreshCw size={12} className="text-blue-400" /> Retry IP Stream
                        </button>
                    </div>
                )}

                {/* Technical Resolution Badge */}
                <div className="absolute top-12 right-2 bg-black/70 backdrop-blur-sm border border-slate-800 rounded-md px-2 py-0.5 text-[9px] text-slate-300 font-mono flex items-center gap-1 z-10">
                    <span className="text-blue-400 font-bold">{camera.resolution || '1080p'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{camera.fps || 30} FPS</span>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-2 bg-[#090D16] border-t border-slate-800/80 flex justify-between items-center z-10">
                <div className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                    📍 {camera.zone}
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => sendCommand('/ptz?action=zoomin')} className="p-1 bg-slate-900 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition cursor-pointer" title="Zoom In">
                        <ZoomIn size={14} />
                    </button>
                    <button onClick={() => sendCommand('/ptz?action=zoomout')} className="p-1 bg-slate-900 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition cursor-pointer" title="Zoom Out">
                        <ZoomOut size={14} />
                    </button>
                    <button onClick={toggleFlashlight} className={`p-1 rounded-md transition cursor-pointer ${isFlashlightOn ? 'bg-amber-500 text-black' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'}`} title="LED Flashlight">
                        {isFlashlightOn ? <Zap size={14} /> : <ZapOff size={14} />}
                    </button>
                    <button onClick={toggleFullscreen} className="p-1 bg-slate-900 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition cursor-pointer" title="Fullscreen">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
