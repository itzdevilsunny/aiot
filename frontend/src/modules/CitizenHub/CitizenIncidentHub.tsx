import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { 
    Shield, Users, Trash2, CheckCircle2, 
    AlertTriangle, MapPin, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_BASE);

interface CitizenIncident {
    id: string;
    citizen_name: string;
    citizen_phone: string;
    category: 'Violence' | 'Crowd' | 'Municipal';
    description: string;
    location: { lat: number; lng: number };
    image_url: string;
    status: 'REPORTED' | 'UNDER REVIEW' | 'TEAM DISPATCHED' | 'RESOLVED';
    resolution_image_url?: string;
    timestamp: string;
    ai_priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
    is_verified_red_flag: boolean;
    eta?: string;
}

// Marker icons
const createIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const icons = {
    REPORTED: createIcon('red'),
    'UNDER REVIEW': createIcon('orange'),
    'TEAM DISPATCHED': createIcon('blue'),
    RESOLVED: createIcon('grey')
};
const catIcons = { Violence: Shield, Crowd: Users, Municipal: Trash2 };

export default function CitizenIncidentHub() {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState<CitizenIncident[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            const { data } = await axios.get(`${API_BASE}/api/citizen/incidents`);
            setIncidents(data);
        };
        fetchIncidents();

        socket.on('citizen_incident_new', (inc: CitizenIncident) => setIncidents(prev => [inc, ...prev]));
        socket.on('citizen_incident_updated', (inc: CitizenIncident) => setIncidents(prev => prev.map(p => p.id === inc.id ? inc : p)));

        return () => {
            socket.off('citizen_incident_new');
            socket.off('citizen_incident_updated');
        };
    }, []);

    const handleAction = async (id: string, action: 'dispatch' | 'resolve') => {
        setLoadingId(id);
        const payload = action === 'resolve' ? { image_url: 'https://images.unsplash.com/photo-1584483783936-cecb8da1c22e?w=800' } : {};
        await axios.post(`${API_BASE}/api/citizen/incidents/${id}/${action}`, payload);
        
        // If it's a dispatch, launch internal live navigation to the coordinates
        if (action === 'dispatch') {
            const inc = incidents.find(i => i.id === id);
            if (inc && inc.location) {
                navigate(`/dashboard/map?lat=${inc.location.lat}&lng=${inc.location.lng}`);
            }
        }
        
        setLoadingId(null);
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
            <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-medium text-blue-400 tracking-wider uppercase">Public Intake</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Citizen Incident Hub</h1>
            <p className="text-slate-400 text-sm mt-1">Live triage and dispatch for citizen-reported civic issues.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* Live Map Panel */}
                <div className="bg-[#040D21] border border-slate-800 rounded-2xl overflow-hidden h-[500px] flex flex-col relative z-0">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400" /> Live Geotags
                        </h2>
                    </div>
                    <div className="flex-1 relative">
                        <MapContainer center={[28.6139, 77.2090]} zoom={13} className="w-full h-full z-0">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                            />
                            {incidents.map(inc => (
                                <Marker key={inc.id} position={[inc.location.lat, inc.location.lng]} icon={icons[inc.status]}>
                                    <Popup className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl">
                                        <div className="p-1">
                                            <p className="font-bold text-sm mb-1">{inc.category}</p>
                                            <p className="text-xs text-slate-400 mb-2">{inc.status}</p>
                                            {inc.image_url && <img src={inc.image_url} className="w-full h-24 object-cover rounded-md" alt="Incident" />}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Queue Panel */}
                <div className="bg-[#040D21] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" /> Incident Queue
                        </h2>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-bold">{incidents.length} Records</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <AnimatePresence>
                            {incidents.slice().sort((a,b) => (a.is_verified_red_flag ? -1 : b.is_verified_red_flag ? 1 : 0)).map(inc => {
                                const Icon = catIcons[inc.category] || Shield;
                                return (
                                    <motion.div 
                                        key={inc.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`bg-slate-900/50 border rounded-xl p-4 transition-colors ${inc.is_verified_red_flag && inc.status === 'REPORTED' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse' : 'border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 rounded-lg bg-slate-950 overflow-hidden shrink-0 relative">
                                                    {inc.image_url && <img src={inc.image_url} alt="Issue" className="w-full h-full object-cover" />}
                                                    {inc.is_verified_red_flag && (
                                                        <span className="absolute top-0 left-0 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-br-lg text-white">
                                                            INDIAN RED FLAG
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`w-4 h-4 ${inc.is_verified_red_flag ? 'text-red-400' : 'text-blue-400'}`} />
                                                        <span className="text-sm font-bold text-white uppercase">{inc.category}</span>
                                                        <span className={`text-[9px] px-2 rounded-full font-bold uppercase tracking-wider ${
                                                            inc.status === 'REPORTED' ? 'bg-red-500/20 text-red-400' :
                                                            inc.status === 'TEAM DISPATCHED' ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-emerald-500/20 text-emerald-400'
                                                        }`}>{inc.status}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{inc.description}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1 flex gap-2 items-center font-mono">
                                                        <span>{inc.citizen_name}</span> • 
                                                        <span>{new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        {inc.eta && <span className="text-blue-400 ml-1">• ETA: {inc.eta}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Panel */}
                                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/50">
                                            {inc.status === 'REPORTED' || inc.status === 'UNDER REVIEW' ? (
                                                <button 
                                                    onClick={() => handleAction(inc.id, 'dispatch')}
                                                    disabled={loadingId === inc.id}
                                                    className="w-full sm:w-auto px-4 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                                                >
                                                    <Navigation size={14} /> 
                                                    NAVIGATE TO INCIDENT
                                                </button>
                                            ) : inc.status === 'TEAM DISPATCHED' ? (
                                                <button 
                                                    onClick={() => handleAction(inc.id, 'resolve')}
                                                    disabled={loadingId === inc.id}
                                                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> MARK RESOLVED
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Case Closed
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {incidents.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 py-12">
                                <Shield className="w-12 h-12 mb-4" />
                                <p className="text-sm">No citizen incidents reported.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
