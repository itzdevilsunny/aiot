import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Props {
    streamUrl: string;
    cameraId: string;
}

import { WS_URL } from '../../config/api';

export default function LiveInferenceFeed({ streamUrl, cameraId }: Props) {
    const [isLive, setIsLive] = useState(false);
    
    // Core refs for high-performance bypass
    const socketRef = useRef<Socket | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const lastFrameTimeRef = useRef(Date.now());
    const lastSeqRef = useRef(0); // For chronological ordering
    
    // Telemetry refs
    const latencyHudRef = useRef<HTMLSpanElement>(null);
    const objectsHudRef = useRef<HTMLSpanElement>(null);
    const statusTextRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || window.location.hostname.includes('vercel.app')) return;

        const SOCKET_URL = WS_URL;
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        setIsLive(false);
        lastFrameTimeRef.current = Date.now();
        lastSeqRef.current = 0;

        // Single Stream Listener
        socket.on(`node_stream_${cameraId}`, (data: { image: string; status?: string; objects?: number; metrics?: any; seq?: number }) => {
            // MONOTONIC FILTERING: Discard frames that arrive out of order (fixes forward/backward jitter)
            if (data.seq && data.seq <= lastSeqRef.current) {
                return; // Stale frame, skip
            }
            if (data.seq) lastSeqRef.current = data.seq;
            
            lastFrameTimeRef.current = Date.now();

            if (data.image) {
                if (!isLive) setIsLive(true);
                if (imgRef.current) {
                    imgRef.current.src = `data:image/jpeg;base64,${data.image}`;
                }
            }

            // Sync HUD elements (Direct DOM)
            if (latencyHudRef.current) latencyHudRef.current.innerText = `${Math.round(data.metrics?.inferenceTime || 0)}ms`;
            if (objectsHudRef.current) objectsHudRef.current.innerText = String(data.objects || 0);
            if (statusTextRef.current) {
                const isAlert = data.status && data.status !== 'UP';
                statusTextRef.current.innerText = isAlert ? 'ALERT: VIOLATION' : 'LIVE MONITORING';
                statusTextRef.current.className = `text-[10px] font-black tracking-widest ${isAlert ? 'text-red-500' : 'text-emerald-500'}`;
            }
        });

        // Watchdog: If no frame for 10s, show Awaiting UI
        const watchdog = setInterval(() => {
            if (Date.now() - lastFrameTimeRef.current > 10000) {
                setIsLive(false);
            }
        }, 3000);

        return () => {
            socket.disconnect();
            clearInterval(watchdog);
            socketRef.current = null;
        };
    }, [cameraId]);

    return (
        <div className="relative w-full h-full min-h-[420px] bg-black overflow-hidden flex items-center justify-center border-2 border-white/5 rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* The Main AI Stream */}
            <img
                ref={imgRef}
                alt="AI Feed"
                className={`object-contain w-full h-full absolute inset-0 z-10 transition-opacity duration-300 ${isLive ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Syncing Overlay (Always present when not live) */}
            {!isLive && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0e12]/90 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]" />
                    <div className="text-center space-y-2">
                        <p className="text-[12px] text-white font-black uppercase tracking-[0.3em]">Awaiting AI Uplink</p>
                        <p className="text-[10px] text-white/30 font-mono tracking-tighter">NODE: {cameraId} :: {streamUrl}</p>
                    </div>
                </div>
            )}

            {/* HUD OVERLAYS (Integrated) */}
            {isLive && (
                <>
                    <div className="absolute top-6 right-6 z-30 font-mono text-[10px] bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl min-w-[160px] space-y-2">
                        <div className="flex justify-between items-center"><span className="text-white/40">ENGINE</span><span className="text-emerald-400 font-bold">YOLOv8s</span></div>
                        <div className="flex justify-between items-center"><span className="text-white/40">LATENCY</span><span ref={latencyHudRef} className="text-white">0ms</span></div>
                        <div className="flex justify-between items-center"><span className="text-white/40">OBJECTS</span><span ref={objectsHudRef} className="text-white">0</span></div>
                        <div className="pt-2 border-t border-white/5">
                            <span ref={statusTextRef} className="text-[10px] text-emerald-500 font-black tracking-widest">LIVE MONITORING</span>
                        </div>
                    </div>

                    <div className="absolute top-6 left-6 z-30">
                        <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-black border border-red-600/50 flex items-center gap-2 backdrop-blur-md">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            AI PROCESSED
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-1">
                        <span className="text-[14px] font-black text-white/90 tracking-tighter drop-shadow-lg uppercase">
                            Primary Anomaly Node
                        </span>
                        <span className="text-[10px] font-mono text-white/40 tracking-widest">
                            {cameraId} :: {new Date().toLocaleTimeString()}
                        </span>
                    </div>

                    <div className="absolute bottom-6 right-6 z-30 font-mono text-[9px] text-white/20 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        2.5 FPS OPTIMIZED :: RES 640P
                    </div>
                </>
            )}
        </div>
    );
}




