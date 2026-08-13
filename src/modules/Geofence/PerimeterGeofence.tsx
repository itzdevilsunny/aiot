import { useState, useRef, useEffect } from 'react';
import {
    MousePointer, Trash2, CheckCircle2,
    Volume2, VolumeX, Lock
} from 'lucide-react';
import { useCameraStore } from '../../store/useCameraStore';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

interface Point {
    x: number; // Percentage 0 - 100
    y: number; // Percentage 0 - 100
}

// Point-in-polygon ray-casting algorithm
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
    if (polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export default function PerimeterGeofence() {
    const { cameras, updateGeofence } = useCameraStore();
    const [selectedCamId, setSelectedCamId] = useState<string>('CAM-04');
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(true);
    const [isBreached, setIsBreached] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [boxes, setBoxes] = useState<any[]>([]);
    const [statusMsg, setStatusMsg] = useState('Click on canvas to draw boundary points');

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeCamera = cameras.find(c => c.id === selectedCamId) || cameras[0];

    // Load saved geofence polygon for camera
    useEffect(() => {
        if (activeCamera?.geofencePolygon && activeCamera.geofencePolygon.length > 0) {
            setPoints(activeCamera.geofencePolygon);
            setIsDrawing(false);
        } else {
            // Default preset restricted box
            setPoints([
                { x: 20, y: 20 },
                { x: 80, y: 20 },
                { x: 80, y: 80 },
                { x: 20, y: 80 }
            ]);
            setIsDrawing(false);
        }
    }, [selectedCamId, activeCamera]);

    // Socket.io bounding boxes stream
    useEffect(() => {
        const socket = io(SOCKET_URL, { reconnectionAttempts: 3 });
        const eventName = `boxes_${selectedCamId}`;

        socket.on(eventName, (incoming: any[]) => {
            setBoxes(incoming || []);
        });

        return () => {
            socket.disconnect();
        };
    }, [selectedCamId]);

    // Check breach status against YOLO11 boxes
    useEffect(() => {
        if (points.length < 3 || boxes.length === 0) {
            setIsBreached(false);
            return;
        }

        let breachFound = false;
        for (const box of boxes) {
            const centerX = box.x + (box.width / 2);
            const centerY = box.y + (box.height / 2);
            if (isPointInPolygon({ x: centerX, y: centerY }, points)) {
                breachFound = true;
                break;
            }
        }

        if (breachFound && !isBreached) {
            setIsBreached(true);
            // Trigger automatic webhook incident dispatch
            axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/alerts/webhook`, {
                camera_id: activeCamera.id,
                type: 'PERIMETER_BREACH',
                severity: 'Critical',
                confidence: 0.98,
                image_url: activeCamera.thumbnailUrl
            }).catch(console.warn);
        } else if (!breachFound) {
            setIsBreached(false);
        }
    }, [boxes, points, isBreached, activeCamera]);

    // Handle Canvas Click to add vertex
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        setPoints(prev => [...prev, { x: Math.round(clickX * 10) / 10, y: Math.round(clickY * 10) / 10 }]);
        setStatusMsg(`Point ${points.length + 1} added (${Math.round(clickX)}%, ${Math.round(clickY)}%)`);
    };

    const handleSaveGeofence = () => {
        updateGeofence(selectedCamId, points);
        setIsDrawing(false);
        setStatusMsg('Geofence boundary active and saved to Edge Node!');
    };

    const handleClearGeofence = () => {
        setPoints([]);
        setIsDrawing(true);
        setStatusMsg('Canvas cleared. Click to draw new boundary points.');
    };

    const applyPreset = (presetType: 'center' | 'left' | 'perimeter') => {
        if (presetType === 'center') {
            setPoints([{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 70, y: 70 }, { x: 30, y: 70 }]);
        } else if (presetType === 'left') {
            setPoints([{ x: 5, y: 10 }, { x: 45, y: 10 }, { x: 45, y: 90 }, { x: 5, y: 90 }]);
        } else {
            setPoints([{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 90 }, { x: 10, y: 90 }]);
        }
        setIsDrawing(false);
        setStatusMsg(`Preset '${presetType.toUpperCase()}' applied.`);
    };

    return (
        <div className="p-4 sm:p-6 bg-[#0B0F19] min-h-screen text-white flex flex-col space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111623] p-5 rounded-2xl border border-slate-800 shadow-xl gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-400 tracking-wider uppercase">Restricted Zone Enforcement</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        Perimeter AI Geofencing & Polygon Security
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Draw custom polygon restricted boundaries on any camera. Real-time point-in-polygon YOLO11 breach detection.</p>
                </div>

                {/* Node Selector Dropdown */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedCamId}
                        onChange={e => setSelectedCamId(e.target.value)}
                        className="bg-[#060D1E] border border-slate-700 text-xs font-mono text-white rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-blue-500 flex-1 md:w-64"
                    >
                        {cameras.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.id}: {c.name} ({c.zone})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${soundEnabled ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        title="Toggle Alarm Audio"
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                </div>
            </div>

            {/* Main Interactive Canvas & Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">

                {/* Left (3 cols): Live Camera Canvas with SVG Overlay */}
                <div className="lg:col-span-3 bg-black rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl min-h-[480px] flex items-center justify-center flex-col">

                    {/* Canvas Container */}
                    <div
                        ref={containerRef}
                        onClick={handleCanvasClick}
                        className={`relative w-full h-full flex items-center justify-center select-none ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
                    >
                        {/* Base Image Feed */}
                        <img
                            ref={imageRef}
                            src={activeCamera.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'}
                            alt={activeCamera.name}
                            className="w-full h-full object-cover max-h-[600px] pointer-events-none"
                        />

                        {/* Interactive SVG Polygon Overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {points.length >= 3 && (
                                <polygon
                                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                    className={`transition-all duration-300 ${isBreached
                                            ? 'fill-red-600/40 stroke-red-500 stroke-[1.5] animate-pulse'
                                            : 'fill-blue-500/25 stroke-blue-400 stroke-[1]'
                                        }`}
                                />
                            )}

                            {/* Polygon Vertices */}
                            {points.map((p, idx) => (
                                <g key={idx}>
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={1.8}
                                        className={`${isBreached ? 'fill-red-500' : 'fill-blue-500'} stroke-[0.5] stroke-white shadow-lg`}
                                    />
                                    <text x={p.x + 2} y={p.y + 1} className="fill-white text-[3px] font-bold font-mono">P{idx + 1}</text>
                                </g>
                            ))}
                        </svg>

                        {/* Live YOLO11 Bounding Boxes Overlay */}
                        {boxes.map((box) => (
                            <div
                                key={box.id}
                                className="absolute border-2 z-20 transition-all duration-300 rounded pointer-events-none shadow-lg"
                                style={{
                                    borderColor: box.color || '#3B82F6',
                                    left: `${box.x}%`,
                                    top: `${box.y}%`,
                                    width: `${box.width}%`,
                                    height: `${box.height}%`,
                                    backgroundColor: `${box.color || '#3B82F6'}20`,
                                }}
                            >
                                <div
                                    className="absolute -top-5 left-0 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap rounded"
                                    style={{ backgroundColor: box.color || '#3B82F6' }}
                                >
                                    {box.label} {Math.round((box.confidence || 0.9) * 100)}%
                                </div>
                            </div>
                        ))}

                        {/* Top HUD Alarm Banner */}
                        <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isBreached
                                    ? 'bg-red-600/90 border-red-500 text-white animate-bounce shadow-lg shadow-red-600/50'
                                    : 'bg-emerald-600/80 border-emerald-500 text-white'
                                }`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${isBreached ? 'bg-white animate-ping' : 'bg-white'}`} />
                                <span>{isBreached ? '🚨 CRITICAL RESTRICTED ZONE BREACH' : '🛡️ ZONE SECURE & MONITORED'}</span>
                            </div>
                        </div>

                        {/* Bottom Status Instruction Bar */}
                        <div className="absolute bottom-4 left-4 right-4 z-30 bg-black/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 text-xs flex items-center justify-between text-slate-300">
                            <span>{statusMsg}</span>
                            <span className="font-mono text-blue-400 font-semibold">{points.length} Polygon Vertices</span>
                        </div>
                    </div>
                </div>

                {/* Right (1 col): Controls Sidebar */}
                <div className="bg-[#111623] p-5 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Boundary Tools</h3>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            {isDrawing ? (
                                <button
                                    onClick={handleSaveGeofence}
                                    disabled={points.length < 3}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 cursor-pointer shadow-lg shadow-emerald-600/20"
                                >
                                    <CheckCircle2 size={16} /> Save & Activate Boundary
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setIsDrawing(true); setStatusMsg('Edit mode enabled. Click to add points.'); }}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                                >
                                    <MousePointer size={16} /> Redraw Boundary Points
                                </button>
                            )}

                            <button
                                onClick={handleClearGeofence}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Trash2 size={16} /> Clear Canvas
                            </button>
                        </div>

                        {/* Preset Boundaries */}
                        <div className="space-y-2 pt-4 border-t border-slate-800">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase">Quick Boundary Presets</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => applyPreset('center')}
                                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-left font-medium text-slate-200 transition-all cursor-pointer"
                                >
                                    🎯 Center Quad Vault
                                </button>
                                <button
                                    onClick={() => applyPreset('left')}
                                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-left font-medium text-slate-200 transition-all cursor-pointer"
                                >
                                    🚧 Perimeter Gate Entry
                                </button>
                                <button
                                    onClick={() => applyPreset('perimeter')}
                                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-left font-medium text-slate-200 transition-all cursor-pointer"
                                >
                                    🏢 Full Sector Perimeter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Specs */}
                    <div className="pt-4 border-t border-slate-800 space-y-1 text-[11px] text-slate-500">
                        <div className="flex justify-between">
                            <span>Camera Node:</span>
                            <span className="font-mono text-white">{activeCamera.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Algorithm:</span>
                            <span className="font-mono text-blue-400">Ray-Casting 2D</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Inference Engine:</span>
                            <span className="font-mono text-emerald-400">YOLO11 Nano</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
