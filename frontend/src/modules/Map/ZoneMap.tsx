import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Navigation, ExternalLink, ShieldAlert, Radio, 
    X, Camera, Shield, Crosshair, Siren,
} from 'lucide-react';
import type { AnomalyAlert } from '../../store/useAlertStore';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Default Dispatch/Base Location (New Delhi campus)
const DISPATCH_BASE = { lat: 28.6139, lng: 77.2090 };

const TYPE_LABELS: Record<string, string> = {
    PARKING_VIOLATION: 'Parking Violation',
    CAPACITY_EXCEEDED: 'Capacity Exceeded',
    UNAUTHORIZED_VEHICLE: 'Unauthorized Vehicle',
    SUSPICIOUS_BEHAVIOR: 'Suspicious Behavior',
    INDIAN_RED_FLAG_VIOLENCE: '🚨 Violence Alert',
};

export default function ZoneMap() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Fetch the 50 cameras
    const { data: systemCameras = [] } = useQuery({
        queryKey: ['system_cameras_map'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/cameras`)).data,
    });

    // Fetch alerts to pass down
    const { data: alerts = [] } = useQuery({
        queryKey: ['system_alerts'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/alerts`)).data,
        refetchInterval: 3000
    });

    const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);
    // The camera being dispatched to (from URL param ?dispatch=X)
    const [dispatchRoute, setDispatchRoute] = useState<{ lat: number; lng: number } | null>(null);
    const [isDispatching, setIsDispatching] = useState(false);

    // Get camera details for a given alert
    const getCamera = (cameraId: string) => systemCameras.find((c: any) => c.name === cameraId);

    // Active incidents for sidebar
    const pendingAlerts = useMemo(
        () => alerts.filter((a: any) => a.status === 'Pending' || a.status === 'Investigating').slice(0, 20),
        [alerts]
    );

    // When cameras load, check if we have an incoming dispatch param
    useEffect(() => {
        const dispatchCamId = searchParams.get('dispatch');
        const customLat = searchParams.get('lat');
        const customLng = searchParams.get('lng');

        // Case 1: Custom Coordinates (e.g. from Citizen Hub)
        if (customLat && customLng) {
            setDispatchRoute({ lat: Number(customLat), lng: Number(customLng) });
            setIsDispatching(true);
            setSearchParams({});
            return;
        }

        // Case 2: Camera Node Dispatch
        if (!dispatchCamId || systemCameras.length === 0) return;
        const cam = systemCameras.find((c: any) => c.name === dispatchCamId);
        if (cam) {
            setDispatchRoute({ lat: cam.lat, lng: cam.lng });
            setIsDispatching(true);
            // Clear the URL param after reading
            setSearchParams({});
        }
    }, [searchParams, systemCameras]);

    // Build a map of camera_id -> active anomaly 
    const alertsByCameraId = useMemo(() => {
        const map = new Map<string, AnomalyAlert>();
        for (const alert of pendingAlerts) {
            if (!map.has(alert.camera_id) || alert.severity === 'Critical') {
                map.set(alert.camera_id, alert);
            }
        }
        return map;
    }, [pendingAlerts]);

    const openInGoogleMaps = () => {
        if (!selectedAlert) return;
        const cam = getCamera(selectedAlert.camera_id);
        if (!cam) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${DISPATCH_BASE.lat},${DISPATCH_BASE.lng}&destination=${cam.lat},${cam.lng}&travelmode=driving`,
            '_blank'
        );
    };

    return (
        <div className="flex h-full bg-[#020617] overflow-hidden">
            {/* ─── Left: Alert List Panel ─── */}
            <div className="w-80 border-r border-slate-800 bg-[#040D21] flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-red-400" />
                        Active Incidents
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">Click to target</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {pendingAlerts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <Shield className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-xs">No active incidents</p>
                        </div>
                    )}
                    {pendingAlerts.map((alert: any) => {
                        const cam = getCamera(alert.camera_id);
                        const isSelected = selectedAlert?.id === alert.id;
                        return (
                            <button
                                key={alert.id}
                                onClick={() => setSelectedAlert(isSelected ? null : alert)}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200
                  ${isSelected
                                        ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.08)]'
                                        : alert.severity === 'Critical'
                                            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                    }
                `}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${alert.severity === 'Critical' ? 'bg-red-500 animate-pulse'
                                        : alert.severity === 'Medium' ? 'bg-orange-500'
                                            : 'bg-yellow-500'
                                        }`} />
                                    <span className="text-xs font-bold text-white truncate">
                                        {TYPE_LABELS[alert.type] || alert.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <Camera className="w-3 h-3" />
                                    <span>{cam?.name || alert.camera_id}</span>
                                    <span className="ml-auto font-mono">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Dispatch Base Info */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                        <span>Dispatch HQ: {DISPATCH_BASE.lat.toFixed(4)}, {DISPATCH_BASE.lng.toFixed(4)}</span>
                    </div>
                </div>
            </div>

            {/* ─── Center: React-Leaflet Map ─── */}
            <div className="flex-1 relative z-0">
                <MapContainer center={[DISPATCH_BASE.lat, DISPATCH_BASE.lng]} zoom={13} scrollWheelZoom={true} className="h-full w-full bg-[#0c1021]">
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                    />

                    {/* Emergency Route Polyline (shown when dispatched) */}
                    {dispatchRoute && (
                        <>
                            <Polyline
                                positions={[
                                    [DISPATCH_BASE.lat, DISPATCH_BASE.lng],
                                    [dispatchRoute.lat, dispatchRoute.lng],
                                ]}
                                pathOptions={{
                                    color: '#ef4444',
                                    weight: 5,
                                    opacity: 0.9,
                                    dashArray: '12, 8',
                                }}
                            />
                            {/* Target Marker for custom dispatches */}
                            <CircleMarker
                                center={[dispatchRoute.lat, dispatchRoute.lng]}
                                radius={8}
                                pathOptions={{
                                    fillColor: '#ef4444',
                                    color: '#b91c1c',
                                    weight: 2,
                                    fillOpacity: 1,
                                }}
                            >
                                <Tooltip direction="top" opacity={1} offset={[0, -10]} permanent>
                                    <span className="font-bold text-red-500">Dispatch Target</span>
                                </Tooltip>
                            </CircleMarker>
                        </>
                    )}

                    {/* Dispatch Base Marker */}
                    <CircleMarker
                        center={[DISPATCH_BASE.lat, DISPATCH_BASE.lng]}
                        radius={10}
                        pathOptions={{
                            fillColor: '#3b82f6',
                            color: '#1d4ed8',
                            weight: 3,
                            fillOpacity: 1,
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                            <span className="font-bold">Dispatch Headquarters</span>
                        </Tooltip>
                    </CircleMarker>

                    {/* 50 Camera Nodes */}
                    {systemCameras.map((cam: any) => {
                        const alert = alertsByCameraId.get(cam.name);
                        const isSelected = selectedAlert?.camera_id === cam.name;

                        // Calculate Styling
                        const fillColor = alert 
                            ? (alert.severity === 'Critical' ? '#ef4444' : alert.severity === 'Medium' ? '#f97316' : '#eab308')
                            : (cam.status === 'UP' ? '#22c55e' : '#64748b');
                        
                        const strokeColor = isSelected ? '#3b82f6' : (alert ? '#f87171' : '#4ade80');
                        const radius = isSelected ? 12 : (alert ? 10 : 6);
                        const isPulsing = alert?.severity === 'Critical' || isSelected;

                        return (
                            <CircleMarker
                                key={cam.name}
                                center={[cam.lat, cam.lng]}
                                radius={radius}
                                eventHandlers={{
                                    click: () => {
                                        if (alert) setSelectedAlert(alert);
                                    }
                                }}
                                pathOptions={{
                                    fillColor,
                                    color: strokeColor,
                                    weight: isPulsing ? 3 : 2,
                                    fillOpacity: 0.9,
                                    className: isPulsing ? 'animate-pulse' : '',
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                    <span className="font-bold">{cam.name}</span>
                                </Tooltip>
                                
                                <Popup className="custom-popup">
                                    <div className="p-2 bg-[#0d0e12] text-white rounded">
                                        <h4 className="font-bold border-b border-gray-700 mb-2 pb-1">{cam.name} Details</h4>
                                        <div className="w-48 h-28 bg-black mb-2 rounded border border-gray-800 overflow-hidden relative">
                                            <img 
                                                src={`http://${cam.ipAddress}:8080/video`} 
                                                className="w-full h-full object-cover" 
                                                alt="stream" 
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80';
                                                    (e.target as HTMLImageElement).style.opacity = '0.3';
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 mb-3">
                                            <div><strong>Sector:</strong> {cam.sector}</div>
                                            <div><strong>Status:</strong> <span className={cam.status === 'UP' ? 'text-green-400': 'text-red-400'}>{cam.status}</span></div>
                                            <div><strong>IP:</strong> {cam.ipAddress}</div>
                                            <div><strong>Alerts:</strong> {alert ? 1 : 0}</div>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/dashboard/cameras')}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded transition"
                                        >
                                            Focus in Grid View
                                        </button>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>

                {/* ── Dispatch En-Route Banner ── */}
                {isDispatching && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-red-950/95 border border-red-500 rounded-2xl px-6 py-3 shadow-[0_0_40px_rgba(239,68,68,0.6)] backdrop-blur-md animate-pulse">
                        <Siren className="w-5 h-5 text-red-400 shrink-0" />
                        <div className="text-left">
                            <p className="text-red-400 font-black text-sm tracking-widest uppercase">Police Dispatched</p>
                            <p className="text-red-200 text-xs font-mono">Officers en route — Shortest path computed</p>
                        </div>
                        <button
                            onClick={() => setIsDispatching(false)}
                            className="ml-4 text-red-400 hover:text-white transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Map Legend Overlay */}
                <div className="absolute bottom-6 left-6 bg-[#040D21]/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-3 z-[9999]">
                    <div className="flex items-center gap-4 text-[10px] font-medium">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> <span className="text-slate-400">HQ</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> <span className="text-slate-400">Online</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> <span className="text-slate-400">Critical</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> <span className="text-slate-400">Medium</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span> <span className="text-slate-400">Low</span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block border border-slate-400"></span> <span className="text-slate-400">Offline</span></span>
                    </div>
                </div>

                {/* ─── Dispatch Control Panel Overlay ─── */}
                <AnimatePresence>
                    {selectedAlert && (
                        <motion.div
                            key="dispatch-panel"
                            initial={{ opacity: 0, x: 30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 30, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute top-6 right-6 w-80 bg-[#040D21]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl text-white z-[9999] overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-red-500/5">
                                <div className="flex items-center gap-2.5">
                                    <ShieldAlert className="w-5 h-5 text-red-400" />
                                    <h3 className="text-sm font-bold">Dispatch Control</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedAlert(null)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Target Info */}
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Target Anomaly</p>
                                    <p className="text-sm font-bold text-red-400 mt-1">
                                        {TYPE_LABELS[selectedAlert.type] || selectedAlert.type}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Camera className="w-3 h-3" />
                                        {getCamera(selectedAlert.camera_id)?.name || selectedAlert.camera_id}
                                    </p>
                                </div>

                                {/* AI Snapshot */}
                                <div className="relative rounded-xl overflow-hidden border border-slate-800">
                                    <img
                                        src={selectedAlert.image_url}
                                        alt="Threat Snapshot"
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-md ${selectedAlert.severity === 'Critical' ? 'bg-red-500/80 text-white' : 'bg-orange-500/80 text-white'
                                            }`}>
                                            {selectedAlert.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg">
                                        <span className="text-[10px] font-mono text-emerald-400">{selectedAlert.confidence.toFixed(1)}%</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-2">
                                    <button
                                        onClick={openInGoogleMaps}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.25)]"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Route Field Agent
                                        <ExternalLink className="w-3 h-3 opacity-60" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
