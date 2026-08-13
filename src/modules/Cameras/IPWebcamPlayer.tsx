import { useState, useRef } from 'react';
import { Maximize2, ZoomIn, ZoomOut, Zap, ZapOff, Trash2 } from 'lucide-react';
import type { CameraNode } from '../../store/useCameraStore';
import { useCameraStore } from '../../store/useCameraStore';

export default function IPWebcamPlayer({ camera }: { camera: CameraNode }) {
    const [hasError, setHasError] = useState(false);
    const [isFlashlightOn, setIsFlashlightOn] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { removeCamera } = useCameraStore();

    // IP Webcam specific endpoints
    const streamUrl = `${camera.ip_url}/video`;

    // Send HTTP command directly to the IP Webcam
    const sendCommand = async (endpoint: string) => {
        try {
            // Adding a local proxy bypass or basic fetch with no-cors so we don't trip CORS over raw IP
            await fetch(`${camera.ip_url}${endpoint}`, { mode: 'no-cors' });
        } catch (error) {
            console.error(`Command failed on ${camera.name}`, error);
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

    return (
        <div
            ref={containerRef}
            className="relative bg-[#151923] border border-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col group h-full min-h-[250px]"
        >
            {/* Top Telemetry Bar */}
            <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                    <span className="text-white text-xs font-bold drop-shadow-md">{camera.name}</span>
                    <span className="bg-blue-600/80 px-1.5 py-0.5 rounded text-[10px] text-white uppercase">{camera.zone}</span>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm(`Disconnect and remove ${camera.name}?`)) removeCamera(camera.id);
                    }}
                    className="text-red-400 hover:text-red-300 p-1 bg-black/50 rounded transition cursor-pointer z-50 pointer-events-auto"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Video Feed Area */}
            <div className="flex-grow bg-black relative flex items-center justify-center pointer-events-none">
                <img
                    src={hasError ? (camera.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800') : streamUrl}
                    alt={camera.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                    onError={() => {
                        setHasError(true);
                    }}
                />

                {/* Overlaid Camera Specs */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-slate-700/60 rounded-md px-2 py-0.5 text-[10px] text-white font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{camera.resolution || '1080p'}</span>
                </div>

                {/* Enlarge Click Hint */}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <Maximize2 size={14} /> Open Big Screen
                    </div>
                </div>
            </div>

            {/* Bottom PTZ Control Bar */}
            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/90 to-transparent z-10 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <button onClick={() => sendCommand('/ptz?action=zoomin')} className="p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded text-white backdrop-blur-sm transition tooltip-trigger cursor-pointer" title="Zoom In">
                    <ZoomIn size={16} />
                </button>
                <button onClick={() => sendCommand('/ptz?action=zoomout')} className="p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded text-white backdrop-blur-sm transition tooltip-trigger cursor-pointer" title="Zoom Out">
                    <ZoomOut size={16} />
                </button>
                <button onClick={toggleFlashlight} className={`p-1.5 rounded backdrop-blur-sm transition cursor-pointer ${isFlashlightOn ? 'bg-yellow-500/80 text-black' : 'bg-gray-800/80 hover:bg-gray-700 text-white'}`} title="Toggle Node LED">
                    {isFlashlightOn ? <Zap size={16} /> : <ZapOff size={16} />}
                </button>
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                <button onClick={toggleFullscreen} className="p-1.5 bg-gray-800/80 hover:bg-gray-700 rounded text-white backdrop-blur-sm transition tooltip-trigger cursor-pointer" title="Fullscreen Node">
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
    );
}
