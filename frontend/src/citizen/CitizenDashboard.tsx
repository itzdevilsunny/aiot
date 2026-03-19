import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
    Clock, Camera,
    CheckCircle2, AlertTriangle, Navigation, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_BASE);

interface CitizenIncident {
    id: string;
    category: 'Violence' | 'Crowd' | 'Municipal';
    description: string;
    image_url: string;
    status: 'REPORTED' | 'UNDER REVIEW' | 'TEAM DISPATCHED' | 'RESOLVED';
    resolution_image_url?: string;
    timestamp: string;
    eta?: string;
}

const STATUS_STEPS = ['REPORTED', 'UNDER REVIEW', 'TEAM DISPATCHED', 'RESOLVED'];

export default function CitizenDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{name: string, phone: string} | null>(null);
    const [incidents, setIncidents] = useState<CitizenIncident[]>([]);

    useEffect(() => {
        const session = localStorage.getItem('citizen_session');
        if (!session) {
            navigate('/citizen/login');
            return;
        }
        setUser(JSON.parse(session));

        // Fetch citizen's history (filtering backend by phone in a real app, here we just show all for demo)
        const fetchIncidents = async () => {
            const { data } = await axios.get(`${API_BASE}/api/citizen/incidents`);
            // In demo, filter to only show ones they created (using their name/phone as strict match if we wanted, 
            // but for a better demo experience let's show the last 5)
            setIncidents(data.slice(0, 5));
        };
        fetchIncidents();

        // Listen for live updates when admin dispatches or resolves
        socket.on('citizen_incident_updated', (updatedIncident: CitizenIncident) => {
            setIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
        });
        socket.on('citizen_incident_new', (newIncident: CitizenIncident) => {
            setIncidents(prev => [newIncident, ...prev].slice(0, 5));
        });

        return () => {
            socket.off('citizen_incident_updated');
            socket.off('citizen_incident_new');
        };
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col p-4 font-sans text-white pb-24 relative">
            {/* Simple Header */}
            <header className="flex justify-between items-center mb-6 pt-2">
                <h1 className="text-xl font-black text-blue-500 tracking-wider">URBAN PULSE</h1>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-500/20">
                    {user.name.substring(0, 2).toUpperCase()}
                </div>
            </header>

            <main className="flex-1 space-y-6">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 shadow-md">
                        <p className="text-[10px] text-gray-500 flex flex-col uppercase font-bold tracking-wider mb-1">Active Reports</p>
                        <p className="text-3xl font-black text-blue-400">
                            {incidents.filter(i => i.status !== 'RESOLVED').length.toString().padStart(2, '0')}
                        </p>
                    </div>
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 shadow-md">
                        <p className="text-[10px] text-gray-500 flex flex-col uppercase font-bold tracking-wider mb-1">Resolved</p>
                        <p className="text-3xl font-black text-green-400">
                            {incidents.filter(i => i.status === 'RESOLVED').length.toString().padStart(2, '0')}
                        </p>
                    </div>
                </div>

                {/* Active Reports Timeline */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" /> My Active Reports
                    </h3>
                    
                    <div className="space-y-4">
                        <AnimatePresence>
                            {incidents.length === 0 ? (
                                <div className="bg-[#040D21] border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500">
                                    <Clock className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                    <p className="text-xs">No active reports filed.</p>
                                </div>
                            ) : (
                                incidents.map(issue => (
                                    <motion.div 
                                        key={issue.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-sm"
                                    >
                                        <div className="p-4 border-b border-gray-800 flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-[#0d1117] border border-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {issue.image_url ? (
                                                        <img src={issue.image_url} alt="Incident" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-slate-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-blue-400 font-mono tracking-wider">{issue.id}</span>
                                                    <h4 className="text-sm font-bold text-white mt-0.5">{issue.category} Issue</h4>
                                                    <p className="text-[10px] text-slate-500 mt-1 flex gap-1 items-center">
                                                        <Clock className="w-3 h-3" /> {new Date(issue.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Timeline */}
                                        <div className="p-5">
                                            {/* ETA Action Banner */}
                                            {issue.status === 'TEAM DISPATCHED' && (
                                                <div className="mb-6 p-3 bg-orange-500/10 border border-orange-500/50 rounded-lg flex items-center gap-3 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                                        <Navigation className="w-4 h-4 text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-orange-400 tracking-wide uppercase">Unit Dispatched - ETA {issue.eta || '8 Mins'}</p>
                                                        <p className="text-[10px] text-orange-200/70">Response team is actively navigating to your coordinates.</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="relative">
                                                <div className="absolute top-2.5 left-3 right-3 h-0.5 bg-slate-800 rounded-full" />
                                                <div 
                                                    className="absolute top-2.5 left-3 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(STATUS_STEPS.indexOf(issue.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                                                />
                                                
                                                <div className="flex justify-between relative z-10">
                                                    {STATUS_STEPS.map((step, idx) => {
                                                        const isCompleted = STATUS_STEPS.indexOf(issue.status) > idx;
                                                        const isCurrent = issue.status === step;
                                                        
                                                        let colorClass = 'bg-slate-900 border-slate-700 text-slate-600';
                                                        if (isCompleted) colorClass = 'bg-blue-600 border-blue-500 text-white';
                                                        if (isCurrent) colorClass = step === 'TEAM DISPATCHED' ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse' : 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]';

                                                        return (
                                                            <div key={step} className="flex flex-col items-center gap-2">
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${colorClass}`}>
                                                                    {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                                                                </div>
                                                                <span className={`text-[8px] font-bold text-center max-w-[50px] leading-tight ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                                                                    {step}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Proof of Resolution (Before/After) */}
                                        {issue.status === 'RESOLVED' && issue.resolution_image_url && (
                                            <div className="p-4 border-t border-slate-800 bg-emerald-950/20">
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Proof of Resolution
                                                </span>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="relative rounded-lg overflow-hidden border border-slate-800">
                                                        <img src={issue.image_url} alt="Before" className="w-full h-24 object-cover" />
                                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1 text-[10px] text-center font-medium">BEFORE</div>
                                                    </div>
                                                    <div className="relative rounded-lg overflow-hidden border border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                        <img src={issue.resolution_image_url} alt="After" className="w-full h-24 object-cover" />
                                                        <div className="absolute bottom-0 inset-x-0 bg-emerald-900/80 backdrop-blur-sm p-1 text-[10px] text-center font-medium text-emerald-100">AFTER (FIXED)</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Reporting Button - Android Style FAB */}
            <button 
                onClick={() => navigate('/citizen/report')}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center border-[3px] border-[#0d1117] hover:bg-blue-500 active:scale-95 transition-all outline-none z-50"
            >
                <Camera size={26} color="white" className="drop-shadow-md" />
            </button>
        </div>
    );
}
