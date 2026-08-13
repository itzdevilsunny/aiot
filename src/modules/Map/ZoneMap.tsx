import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useAlertStore } from '../../store/useAlertStore';
import { useCameraStore } from '../../store/useCameraStore';
import CameraBigScreenModal from '../Cameras/CameraBigScreenModal';
import type { AnomalyAlert } from '../../store/useAlertStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Radio, Clock, Route, X, Camera, AlertTriangle, Shield, Crosshair,
    Plane, Eye
} from 'lucide-react';

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '0' };
const DISPATCH_BASE = { lat: 28.6139, lng: 77.2090 };
const LIBRARIES: ('places')[] = ['places'];

const darkMapStyle: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#0c1021' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0c1021' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#4a5568' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f1923' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0f1923' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#141e2e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

const TYPE_LABELS: Record<string, string> = {
    PARKING_VIOLATION: 'Parking Violation',
    CAPACITY_EXCEEDED: 'Capacity Exceeded',
    UNAUTHORIZED_VEHICLE: 'Unauthorized Vehicle',
    SUSPICIOUS_BEHAVIOR: 'Suspicious Behavior',
    UNAUTHORIZED_ACCESS: 'Unauthorized Access',
    PERIMETER_BREACH: 'Perimeter Breach',
};

export default function ZoneMap() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
        libraries: LIBRARIES,
    });

    const camerasFromStore = useCameraStore((s) => s.cameras);
    const selectedCameraId = useCameraStore((s) => s.selectedCameraId);
    const setSelectedCameraId = useCameraStore((s) => s.setSelectedCameraId);
    const alerts = useAlertStore((s) => s.alerts);

    const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    // Drone Dispatch state
    const [isDroneDispatched, setIsDroneDispatched] = useState(false);
    const [droneEta, setDroneEta] = useState(120); // 2 minutes

    // 108 Cameras array fallback
    const allCameras = useMemo(() => {
        return camerasFromStore.map(c => ({
            ...c,
            lat: c.lat || 28.6139 + (Math.sin(Number(c.id.replace(/\D/g, '')) || 1) * 0.04),
            lng: c.lng || 77.2090 + (Math.cos(Number(c.id.replace(/\D/g, '')) || 1) * 0.04),
        }));
    }, [camerasFromStore]);

    const getCameraForAlert = useCallback(
        (cameraId: string) => allCameras.find((c) => c.id === cameraId),
        [allCameras]
    );

    const alertsByCameraId = useMemo(() => {
        const map = new Map<string, AnomalyAlert>();
        for (const alert of alerts) {
            if (!map.has(alert.camera_id) || alert.severity === 'Critical') {
                map.set(alert.camera_id, alert);
            }
        }
        return map;
    }, [alerts]);

    const pendingAlerts = useMemo(
        () => alerts.filter((a) => a.status === 'Pending').slice(0, 20),
        [alerts]
    );

    const fetchDirections = useCallback(
        (destLat: number, destLng: number) => {
            if (!window.google) return;

            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: DISPATCH_BASE,
                    destination: { lat: destLat, lng: destLng },
                    travelMode: window.google.maps.TravelMode.DRIVING,
                    provideRouteAlternatives: false,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK && result) {
                        setDirections(result);
                        const leg = result.routes[0].legs[0];
                        setRouteInfo({
                            distance: leg.distance?.text || '1.4 km',
                            duration: leg.duration?.text || '3 mins',
                        });
                    } else {
                        setDirections(null);
                        setRouteInfo({ distance: '1.8 km', duration: '4 mins' });
                    }
                }
            );
        },
        []
    );

    useEffect(() => {
        if (selectedAlert) {
            const cam = getCameraForAlert(selectedAlert.camera_id);
            if (cam?.lat && cam?.lng) {
                fetchDirections(cam.lat, cam.lng);
                if (mapInstance) {
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(DISPATCH_BASE);
                    bounds.extend({ lat: cam.lat, lng: cam.lng });
                    mapInstance.fitBounds(bounds, { top: 50, right: 400, bottom: 50, left: 50 });
                }
            }
        } else {
            setDirections(null);
            setRouteInfo(null);
            setIsDroneDispatched(false);
            if (mapInstance) {
                mapInstance.panTo(DISPATCH_BASE);
                mapInstance.setZoom(13);
            }
        }
    }, [selectedAlert, getCameraForAlert, fetchDirections, mapInstance]);

    // Deploy Autonomous Drone Unit
    const handleDeployDrone = () => {
        setIsDroneDispatched(true);
        setDroneEta(90);
        const interval = setInterval(() => {
            setDroneEta(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const selectedCameraObj = useMemo(() => {
        return allCameras.find(c => c.id === selectedCameraId) || null;
    }, [allCameras, selectedCameraId]);

    if (loadError) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617]">
                <div className="text-center space-y-3 p-8 bg-[#040D21] border border-slate-800 rounded-2xl max-w-md">
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Map Load Error</h3>
                    <p className="text-sm text-slate-400">
                        Failed to load Google Maps. Verify your <code className="text-blue-400">VITE_GOOGLE_MAPS_KEY</code> in <code className="text-blue-400">.env</code>.
                    </p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full bg-[#020617] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">Loading 108 Smart City Nodes</p>
                        <p className="text-xs text-slate-500 mt-1">Initializing Google Maps & AI Telemetry...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[#020617] overflow-hidden relative">

            {/* Big Screen Viewer Launcher Modal */}
            <CameraBigScreenModal
                camera={selectedCameraObj}
                onClose={() => setSelectedCameraId(null)}
            />

            {/* ─── Left: Alert & Camera Selector List ─── */}
            <div className="w-80 border-r border-slate-800 bg-[#040D21] flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                            Live GIS Network
                        </h2>
                        <span className="text-[10px] bg-blue-600/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                            108 Nodes
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Select incident or camera pin to inspect</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {pendingAlerts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <Shield className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-xs">No active critical incidents</p>
                        </div>
                    )}
                    {pendingAlerts.map((alert) => {
                        const cam = getCameraForAlert(alert.camera_id);
                        const isSelected = selectedAlert?.id === alert.id;
                        return (
                            <button
                                key={alert.id}
                                onClick={() => setSelectedAlert(isSelected ? null : alert)}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer
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
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto shrink-0 ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400'
                                        : alert.severity === 'Medium' ? 'bg-orange-500/20 text-orange-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {alert.severity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <Camera className="w-3 h-3" />
                                    <span>{cam?.name || alert.camera_id}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                        <span>Dispatch HQ: {DISPATCH_BASE.lat.toFixed(4)}, {DISPATCH_BASE.lng.toFixed(4)}</span>
                    </div>
                </div>
            </div>

            {/* ─── Center: Google Map ─── */}
            <div className="flex-1 relative">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={13}
                    center={DISPATCH_BASE}
                    onLoad={(map) => setMapInstance(map)}
                    options={{
                        styles: darkMapStyle,
                        disableDefaultUI: true,
                        zoomControl: true,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {/* HQ Marker */}
                    <Marker
                        position={DISPATCH_BASE}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            strokeWeight: 3,
                            strokeColor: '#1d4ed8',
                            scale: 10,
                        }}
                        title="Dispatch Headquarters"
                    />

                    {/* 108 Camera Nodes Markers */}
                    {allCameras.map((camera) => {
                        const alert = alertsByCameraId.get(camera.id);
                        const isSelected = selectedAlert?.camera_id === camera.id;

                        return (
                            <Marker
                                key={camera.id}
                                position={{ lat: camera.lat, lng: camera.lng }}
                                onClick={() => {
                                    if (alert) {
                                        setSelectedAlert(alert);
                                    } else {
                                        setSelectedCameraId(camera.id);
                                    }
                                }}
                                icon={{
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    fillColor: alert
                                        ? alert.severity === 'Critical' ? '#ef4444' : alert.severity === 'Medium' ? '#f97316' : '#eab308'
                                        : camera.status === 'online' ? '#22c55e' : '#64748b',
                                    fillOpacity: 0.9,
                                    strokeWeight: isSelected ? 4 : 2,
                                    strokeColor: isSelected ? '#3b82f6' : '#ffffff',
                                    scale: isSelected ? 14 : alert ? 10 : 7,
                                }}
                                title={`${camera.name} (${camera.id})`}
                            />
                        );
                    })}

                    {/* Directions Line */}
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{
                                polylineOptions: {
                                    strokeColor: '#3b82f6',
                                    strokeWeight: 5,
                                    strokeOpacity: 0.85,
                                },
                                suppressMarkers: true,
                            }}
                        />
                    )}
                </GoogleMap>

                {/* Map Legend */}
                <div className="absolute bottom-6 left-6 bg-[#040D21]/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-3 z-10">
                    <div className="flex items-center gap-4 text-[10px] font-medium text-slate-300">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> HQ</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Online (90+)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Critical</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span> Offline</span>
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
                            className="absolute top-6 right-6 w-80 bg-[#040D21]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl text-white z-10 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-red-500/5">
                                <div className="flex items-center gap-2.5">
                                    <ShieldAlert className="w-5 h-5 text-red-400" />
                                    <h3 className="text-sm font-bold">Drone & Ground Dispatch</h3>
                                </div>
                                <button onClick={() => setSelectedAlert(null)} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Incident Target</p>
                                    <p className="text-sm font-bold text-red-400 mt-1">
                                        {TYPE_LABELS[selectedAlert.type] || selectedAlert.type}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Camera className="w-3 h-3" />
                                        {getCameraForAlert(selectedAlert.camera_id)?.name || selectedAlert.camera_id}
                                    </p>
                                </div>

                                {/* ETA / Distance Card */}
                                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Response Time
                                        </p>
                                        <p className="text-xl font-bold text-emerald-400 mt-1">{routeInfo?.duration || '3 mins'}</p>
                                    </div>
                                    <div className="w-px h-10 bg-slate-800"></div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1 justify-end">
                                            <Route className="w-3 h-3" /> Distance
                                        </p>
                                        <p className="text-xl font-bold text-blue-400 mt-1">{routeInfo?.distance || '1.8 km'}</p>
                                    </div>
                                </div>

                                {/* Drone Unit Telemetry (if dispatched) */}
                                {isDroneDispatched && (
                                    <div className="p-3 bg-purple-600/10 border border-purple-500/30 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <Plane className="w-4 h-4 animate-bounce" /> AI Drone Unit-01 In Flight
                                            </span>
                                            <span>ETA {droneEta}s</span>
                                        </div>
                                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${((120 - droneEta) / 120) * 100}%` }} />
                                        </div>
                                        <p className="text-[10px] text-slate-400">FLIR Thermal Optics Lock • Altitude 120m • Speed 68 km/h</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-2">
                                    {!isDroneDispatched ? (
                                        <button
                                            onClick={handleDeployDrone}
                                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                                        >
                                            <Plane className="w-4 h-4" /> Deploy Autonomous AI Drone
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedCameraId(selectedAlert.camera_id)}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" /> Switch to Camera Feed (Big Screen)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
