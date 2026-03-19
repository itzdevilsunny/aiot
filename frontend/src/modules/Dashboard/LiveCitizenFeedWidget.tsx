import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_BASE);

interface CitizenIncident {
    id: string;
    category: string;
    description?: string;
    location: { lat: number; lng: number };
    image_url: string;
    status: string;
    ai_priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
    is_verified_red_flag: boolean;
}

const HUBS = [
    { name: 'MCD Civic Center', lat: 28.6139, lng: 77.2090 },
    { name: 'Karol Bagh Office', lat: 28.6550, lng: 77.1888 }
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

export default function LiveCitizenFeedWidget() {
    const [reports, setReports] = useState<CitizenIncident[]>([]);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/citizen/incidents`);
                setReports(data.filter((r: any) => r.status === 'REPORTED').slice(0, 4));
            } catch (err) {
                console.error("Fetch incidents failed", err);
            }
        };
        fetchIncidents();

        const handleNew = (inc: CitizenIncident) => {
            setReports(prev => [inc, ...prev].slice(0, 4));
        };
        
        const handleUpdate = (inc: CitizenIncident) => {
            setReports(prev => prev.filter(r => r.id !== inc.id));
        };

        socket.on('citizen_incident_new', handleNew);
        socket.on('citizen_incident_updated', handleUpdate);

        return () => {
            socket.off('citizen_incident_new', handleNew);
            socket.off('citizen_incident_updated', handleUpdate);
        };
    }, []);

    const getNearestHub = (loc: {lat: number, lng: number}) => {
        const distances = HUBS.map(hub => ({
            ...hub,
            dist: parseFloat(calculateDistance(loc.lat, loc.lng, hub.lat, hub.lng))
        }));
        return distances.reduce((prev, curr) => prev.dist < curr.dist ? prev : curr);
    };

    const dispatchAndNavigate = async (incident: CitizenIncident) => {
        const { id, category, location } = incident;
        const { lat, lng } = location;

        try {
            await axios.post(`${API_BASE}/api/citizen/incidents/${id}/dispatch`);
        } catch (e) {
            console.error("Failed to patch status", e);
        }

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(googleMapsUrl, '_blank');
        console.log(`🚀 Dispatching team to ${category} at ${lat}, ${lng}`);
    };

    if (reports.length === 0) {
        return (
            <div className="flex flex-col gap-3 p-2 bg-[#0d1117] rounded-xl border border-gray-800">
                <div className="flex justify-between items-center px-2">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase">Citizen Hub Alerts</h4>
                </div>
                <div className="p-4 text-center border border-dashed border-gray-800 rounded-lg bg-[#161b22]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">No pending reports</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-2 bg-[#0d1117] rounded-xl border border-gray-800">
            <div className="flex justify-between items-center px-2 pt-1">
                <h4 className="text-[10px] font-black text-blue-500 uppercase">Citizen Hub Alerts</h4>
                <div className="flex items-center gap-2">
                    <span className="animate-ping h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-[8px] text-blue-400/50 font-black uppercase">Live Feed</span>
                </div>
            </div>
            
            {reports.map((report) => {
                const nearestHub = getNearestHub(report.location);
                return (
                    <div key={report.id} className={`p-4 rounded-lg border-l-2 group transition-all ${report.is_verified_red_flag ? 'bg-red-950/10 border-red-600' : 'bg-[#161b22] border-blue-600'}`}>
                        <div className="flex justify-between items-start text-[11px] font-bold text-white mb-2">
                            <div className="flex flex-col gap-1 min-w-0">
                                <span className="truncate uppercase tracking-wider">{report.category.replace(/_/g, ' ')}</span>
                                {report.is_verified_red_flag && (
                                    <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded flex items-center gap-1 w-fit animate-pulse font-black">
                                        VERIFIED INDIAN RED FLAG
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-blue-400 shrink-0 text-[9px] font-black uppercase tracking-tighter">{nearestHub.dist}km from {nearestHub.name.split(' ')[0]}</span>
                            </div>
                        </div>
                        {report.description && (
                            <p className="text-[10px] text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                                {report.description}
                            </p>
                        )}
                        <button 
                            onClick={() => dispatchAndNavigate(report)}
                            className={`w-full py-3 rounded-lg text-[10px] font-black transition-all active:scale-95 text-white ${report.is_verified_red_flag ? 'bg-red-600 hover:bg-red-500 shadow-[0_5px_15px_rgba(220,38,38,0.3)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_5px_15px_rgba(37,99,235,0.2)]'}`}
                        >
                            {report.is_verified_red_flag ? 'DISPATCH EMERGENCY TEAM' : 'INITIATE DISPATCH'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
