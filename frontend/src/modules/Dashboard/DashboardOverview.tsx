import { useState, useEffect } from 'react';
import { useAlertStore } from '../../store/useAlertStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Server, Zap, CheckCircle, AlertTriangle, Terminal, FileText, Plus, Shield, MapPin, Search, ShieldAlert, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import LiveInferenceFeed from './LiveInferenceFeed';
import AddNodeModal from '../../components/AddNodeModal';
import AnomalyTrendChart from './AnomalyTrendChart';
import { ViolenceModal } from '../../components/ViolenceModal';
import LiveCitizenFeedWidget from './LiveCitizenFeedWidget';
import { API_BASE_URL, WS_URL } from '../../config/api';

// Single WebSocket connection — backend has no /system namespace, use root only
const MAIN_WS_URL = WS_URL;

export default function CommandCenter() {
    const { alerts, addLiveAlert } = useAlertStore();
    const { addLiveNotification } = useNotificationStore();
    const [systemLogs, setSystemLogs] = useState<{ time: string, msg: string, type: string }[]>([]);
    const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
    const [alertSearchQuery, setAlertSearchQuery] = useState('');
    const [violenceAlert, setViolenceAlert] = useState<any>(null);
    const [activeCameraOverride, setActiveCameraOverride] = useState<any>(null);
    
    // Dynamic Camera Navigation
    const [currentCamIndex, setCurrentCamIndex] = useState(0);
    // In a real app, this would be fetched from /api/nodes
    const [cameras, setCameras] = useState([
        { id: 'CAM-04', name: 'Primary Surveillance', streamUrl: 'http://10.30.56.122:8080/video', fps: 30 },
        { id: 'CAM-01', name: 'North Entrance', streamUrl: 'http://10.30.56.118:8080/video', fps: 24 },
        { id: 'CAM-02', name: 'Loading Dock', streamUrl: 'http://10.30.56.118:8080/video', fps: 24 },
    ]);

    const handleNextCamera = () => {
        setActiveCameraOverride(null);
        setCurrentCamIndex((prev) => (prev + 1) % cameras.length);
    };

    const handleBackCamera = () => {
        setActiveCameraOverride(null);
        setCurrentCamIndex((prev) => (prev - 1 + cameras.length) % cameras.length);
    };

    const activeCamera = activeCameraOverride || cameras[currentCamIndex] || { id: 'None', name: 'None', streamUrl: '', fps: 0 };
    
    // Real-Time Dashboard States
    const { data: systemCameras = [] } = useQuery({
        queryKey: ['system_cameras_overview'],
        queryFn: async () => (await axios.get(`${API_BASE_URL}/api/cameras`)).data,
        refetchInterval: 5000
    });

    const activeNodes = systemCameras.filter((c: any) => c.status === 'UP').length;
    const totalNodes = 50;
    const calculatedHealth = activeNodes > 0 ? 100 : 98;

    const [avgLatency, setAvgLatency] = useState(0);
    const [healthPercent, setHealthPercent] = useState(100);
    const [latencyTrend, setLatencyTrend] = useState<{value: number}[]>(Array(5).fill({value: 0}));

    // 1. Initial API Fetching for historical KPIs (optional baseline)
    const { data: stats } = useQuery({
        queryKey: ['command_center_stats'],
        queryFn: async () => {
             // Clean slate for live hackathon demo
             return {
                 totalAnomalies: 0, criticalAnomalies: 0,
                 anomalyTrend: [],
             };
        },
        refetchInterval: false,
    });

    // 2. Listen for Real-Time Telemetry
    useEffect(() => {
        // Prevent Vercel connection errors during SSR
        if (typeof window === 'undefined' || window.location.hostname.includes('vercel.app')) return;

        const mainSocket = io(MAIN_WS_URL, { autoConnect: false });
        mainSocket.connect();

        // System Logs (routed through main socket since backend has no /system namespace)
        mainSocket.on('system_log', (log: any) => {
            setSystemLogs(prev => [{ time: new Date().toLocaleTimeString(), ...log }, ...prev].slice(0, 50));
        });

        // Edge Heartbeats mapping to Active Nodes & Health
        const edgeStatusMap = new Map();
        mainSocket.on('edge_heartbeat', (nodeData) => {
            edgeStatusMap.set(nodeData.id, nodeData.status);
            if (nodeData.metrics) {
                const cpuHealth = Math.max(0, 100 - nodeData.metrics.cpu_usage);
                const ramHealth = Math.max(0, 100 - nodeData.metrics.ram_usage);
                setHealthPercent(Math.round((cpuHealth + ramHealth) / 2));
            }
        });

        // AI Inference Updates (Latency tracking)
        mainSocket.on('boxes_CAM-04', () => {
            if (calculatedHealth !== healthPercent) setHealthPercent(calculatedHealth);
            // In a real app we parse actual latency, here we just let UI components handle their own
        });

        // Live Alerts
        mainSocket.on('new_anomaly', (alert) => {
             addLiveAlert(alert);
             addLiveNotification({
                 id: alert.id || Date.now().toString(),
                 type: alert.severity === 'Critical' ? 'critical' : 'warning',
                 title: `New Anomaly: ${alert.type.replace('_', ' ')}`,
                 message: `Detected at ${alert.camera_id} with ${(alert.confidence * 100).toFixed(1)}% confidence.`,
                 is_read: false,
                 created_at: new Date().toISOString()
             });
             if (alert.type === 'INDIAN_RED_FLAG_VIOLENCE' && alert.severity === 'Critical') {
                 setViolenceAlert(alert);
             }
             // Audio notification disabled — re-enable with a valid audio file in /public
             // const audio = new Audio('/alert-chime.mp3');
             // audio.play().catch(() => {});
        });

        // 3. Indian Red Flag: Violence Alert Dispatch & Auto-Switch
        mainSocket.on('violence_alert', (alert: any) => {
            addLiveAlert({
                id: alert.id,
                camera_id: alert.camId,
                type: 'INDIAN_RED_FLAG_VIOLENCE',
                severity: 'Critical',
                confidence: 0.98,
                status: 'Pending',
                timestamp: alert.timestamp,
                details: alert.description,
                image: alert.image
            } as any);

            // Threat Score (TS) Logic
            const isNight = new Date().getHours() > 19 || new Date().getHours() < 6;
            const nightMult = isNight ? 1.5 : 1.0;
            const personScore = (alert.count || 0) * 10;
            const weaponScore = (alert.weapons?.length || 0) * 50;
            const threatScore = (personScore + weaponScore) * nightMult;

            setSystemLogs(prev => [{ 
                time: new Date().toLocaleTimeString(), 
                msg: `[INDIAN RED FLAG] ${alert.camId}: TS=${threatScore.toFixed(0)} | ${alert.description}`, 
                type: 'error' 
            }, ...prev].slice(0, 50));

            // Auto-switch if TS is high (>30)
            if (threatScore > 30) {
                const targetCam = cameras.find(c => c.id === alert.camId) || {
                    id: alert.camId,
                    name: 'Target Asset',
                    streamUrl: `http://10.30.56.122:8080/video`,
                    fps: 30
                };
                setActiveCameraOverride(targetCam);
            }
        });

        return () => {
            mainSocket.disconnect();
        };
    }, [addLiveAlert, addLiveNotification, cameras]);

    // Derived stats for UI
    const cam04Alerts = alerts.filter(a => a.camera_id === 'CAM-04');
    const activeAlerts = cam04Alerts.filter(a => {
        const matchesStatus = a.status !== 'Resolved';
        if (!alertSearchQuery) return matchesStatus;
        const q = alertSearchQuery.toLowerCase();
        return matchesStatus && (
            a.type.toLowerCase().includes(q) ||
            a.camera_id.toLowerCase().includes(q) ||
            a.severity.toLowerCase().includes(q)
        );
    }).slice(0, 6);
    const totalAnomaliesLive = cam04Alerts.length;
    const criticalAnomaliesLive = cam04Alerts.filter(a => a.severity === 'Critical').length;

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
         try {
             setIsGenerating(true);
             const response = await axios.get(`${API_BASE_URL}/api/reports/daily`, {
                 responseType: 'blob',
             });
             const url = window.URL.createObjectURL(new Blob([response.data]));
             const link = document.createElement('a');
             link.href = url;
             link.setAttribute('download', 'Daily_Report.pdf');
             document.body.appendChild(link);
             link.click();
             link.parentNode?.removeChild(link);
         } catch (error) {
             console.error('Failed to generate report', error);
             alert('Failed to generate report. Please try again later.');
         } finally {
             setIsGenerating(false);
         }
    };

    const handleDispatch = async (alert: any) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/dispatch`, {
                alertId: alert.id
            });
            if (res.data.success) {
                setSystemLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `🚨 DISPATCH SUCCESS: Ref ${res.data.ref}`, type: 'info' }, ...prev].slice(0, 50));
                alert('POLICE DISPATCHED: Incident logged with PCR.');
            } else {
                alert('DISPATCH FAILED: Network Timeout / Simulated PCR Offline');
            }
        } catch (error) {
            console.error('Dispatch error', error);
            alert('Police Dispatch failed. System retry enabled.');
        }
    };

    const sendLocalNotification = (alertData: any) => {
        setSystemLogs(prev => [{ 
            time: new Date().toLocaleTimeString(), 
            msg: `🔔 [LOCAL ESCALATION] Security guards notified for ${alertData.camera_id}`, 
            type: 'warn' 
        }, ...prev].slice(0, 50));
        
        // Mock API call to local security push service
        console.log("Broadcasting local notification for alert:", alertData.id);
        window.alert(`LOCAL SECURITY NOTIFIED: Responders dispatched to ${alertData.camera_id} area.`);
    };

    return (
        <div className="p-6 bg-[#0B0F19] min-h-screen text-white overflow-y-auto overflow-x-hidden">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-800 mb-8 mt-[-1.5rem] mx-[-1.5rem] bg-[#0d0e12]">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-red-500">
                      INDIAN RED FLAG: VIOLATION ALERT
                    </h1>
                </div>

                <div className="flex gap-4 mt-4 md:mt-0 relative z-10">
                    <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-600 self-center">
                        MUNICIPAL MODE: ACTIVE
                    </span>
                    <button 
                         onClick={handleGenerateReport} 
                         disabled={isGenerating}
                         className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded-lg text-sm font-semibold transition"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={16} />} 
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                    <button 
                         onClick={() => setIsAddNodeModalOpen(true)}
                         className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition"
                    >
                        <Plus size={16} /> Add Camera Node
                    </button>
                </div>
            </div>

            {/* KPI Cards with Live Sparklines */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {/* Active Nodes */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Server size={18} className="text-blue-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">Active Edge Nodes</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">{activeNodes}/{totalNodes}</h2>
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1 mt-1">↑ UP <span className="text-gray-500 font-normal">{Math.round((activeNodes / totalNodes) * 100) || 0}% Operational</span></p>
                        </div>
                    </div>
                </div>

                {/* Total Anomalies */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle size={18} className="text-red-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">Total Anomalies (24h)</span>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold">{totalAnomaliesLive}</h2>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">→ LIVE <span className="text-gray-500">Critical: {criticalAnomaliesLive}</span></p>
                        </div>
                    </div>
                    {/* Sparkline Background */}
                    <div className="absolute bottom-0 right-0 w-1/2 opacity-30" style={{ height: 48 }}>
                        <ResponsiveContainer width="100%" height={48}>
                            <LineChart data={stats?.anomalyTrend || []}>
                                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Avg Inference Time */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Zap size={18} className="text-purple-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">Avg Inference Time</span>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold">{avgLatency.toFixed(1)}ms</h2>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">→ LIVE <span className="text-gray-500">Using TensorRT ONNX</span></p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-1/2 opacity-30" style={{ height: 48 }}>
                        <ResponsiveContainer width="100%" height={48}>
                            <LineChart data={latencyTrend}>
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                                <Line type="stepAfter" dataKey="value" stroke="#A855F7" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-[#151923] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-32">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle size={18} className="text-green-400" /></div>
                        <span className="text-sm text-gray-400 font-medium">System Health</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">{calculatedHealth}%</h2>
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1 mt-1">
                                {calculatedHealth === 100 ? '↑ UP' : '↓ DOWN'} <span className="text-gray-500 font-normal">{calculatedHealth === 100 ? 'All services operational' : 'Camera Disconnected'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Video Feed & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Video & Terminal */}
                <div className="xl:col-span-2 flex flex-col gap-6">

                    {/* Live Edge Inference Widget */}
                    <div className="bg-[#000000] rounded-xl border-2 border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] overflow-hidden flex flex-col h-[500px]">
                        <div className="p-3 border-b border-red-900/50 flex justify-between items-center bg-[#1A1D27]">
                            <h3 className="font-bold flex items-center gap-2 text-white">
                                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                                Live Edge Inference: Primary Violation Monitor
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500 uppercase tracking-wider ml-2 border border-red-500">Rec</span>
                            </h3>
                            <div className="flex gap-2 items-center">
                                <div className="flex bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mr-2">
                                    <button onClick={handleBackCamera} className="px-3 py-1 text-xs hover:bg-gray-700 transition font-bold text-gray-300">BACK</button>
                                    <div className="w-px bg-gray-700"></div>
                                    <button onClick={handleNextCamera} className="px-3 py-1 text-xs hover:bg-gray-700 transition font-bold text-gray-300">NEXT</button>
                                </div>
                                <span className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-400 border border-gray-700">{activeCamera.id}</span>
                                <span className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-400 border border-gray-700">{activeCamera.fps} FPS</span>
                            </div>
                        </div>
                        <div className="flex-grow bg-black relative">
                            <LiveInferenceFeed streamUrl={activeCamera.streamUrl} cameraId={activeCamera.id} />
                        </div>
                    </div>

                    {/* NEW FEATURE: Live System Terminal */}
                    <div className="bg-[#151923] rounded-xl border border-gray-800 shadow-xl overflow-hidden h-48 flex flex-col">
                        <div className="p-2 px-4 border-b border-gray-800 bg-[#1A1D27] flex items-center gap-2">
                            <Terminal size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Event Log</span>
                        </div>
                        <div className="p-4 font-mono text-xs overflow-y-auto flex-grow bg-[#0B0F19]">
                            {systemLogs.length === 0 ? (
                                <span className="text-gray-600">Awaiting system telemetry...</span>
                            ) : (
                                systemLogs.map((log, i) => (
                                    <div key={i} className="mb-1">
                                        <span className="text-gray-500">[{log.time}]</span>{' '}
                                        <span className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-green-400'}>
                                            [{log.type.toUpperCase()}]
                                        </span>{' '}
                                        <span className="text-gray-300">{log.msg}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Anomaly Trend Chart */}
                    <AnomalyTrendChart />
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 h-[716px]">
                    {/* Priority Alerts */}
                    <div className="bg-[#151923] rounded-xl border border-gray-800 shadow-xl flex flex-col flex-grow min-h-0">
                        <div className="p-4 border-b border-gray-800 bg-[#1A1D27]">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" /> Priority Alerts
                            </h3>
                            <span className="text-xs text-gray-500">{activeAlerts.length} active</span>
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search alerts (CAM-01, Unauthorized...)"
                                value={alertSearchQuery}
                                onChange={(e) => setAlertSearchQuery(e.target.value)}
                                className="w-full bg-[#0d0e12] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    <div className="p-4 space-y-3 overflow-y-auto flex-grow custom-scrollbar">
                        {activeAlerts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                <Shield size={48} className="mb-4" />
                                <p className="text-sm">No active priority alerts.</p>
                                <p className="text-xs mt-1">System monitoring all zones.</p>
                            </div>
                        ) : (
                            activeAlerts.map(alert => {
                                const isViolence = alert.type === 'INDIAN_RED_FLAG_VIOLENCE';
                                
                                if (isViolence) {
                                  return (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      key={alert.id}
                                      className="bg-red-950/40 border-2 border-red-500 p-4 rounded-xl animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xs font-black text-red-100 uppercase flex items-center gap-2">
                                          <ShieldAlert size={14} className="text-red-500" />
                                          Indian Red Flag Detected
                                        </h3>
                                        <span className="text-[9px] bg-red-600 px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
                                      </div>
                                      
                                      <p className="text-[11px] text-red-200 mb-4 leading-relaxed font-medium">
                                        {alert.camera_id}: {(alert as any).details || 'Escalation Detected'}
                                      </p>

                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => handleDispatch(alert)}
                                          className="flex-1 bg-red-600 hover:bg-red-500 py-2 text-[10px] font-black rounded uppercase transition-all shadow-lg shadow-red-900/50 flex items-center justify-center gap-1"
                                        >
                                          🚨 DISPATCH POLICE
                                        </button>
                                        
                                        {/* NEW Rapid Notify Button */}
                                        <button 
                                          title="Notify Local Security"
                                          onClick={() => sendLocalNotification(alert)}
                                          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition-all shadow-lg flex items-center justify-center"
                                        >
                                          <BellRing size={16} />
                                        </button>

                                        <button 
                                          onClick={handleGenerateReport}
                                          className="px-3 bg-white/10 hover:bg-white/20 py-2 text-[10px] rounded font-bold uppercase transition-all"
                                        >
                                          📄 LOG
                                        </button>
                                      </div>
                                    </motion.div>
                                  );
                                }

                                return (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    key={alert.id}
                                    className={`p-4 rounded-xl border ${alert.severity === 'Critical' ? 'bg-red-900/10 border-red-900/50' : 'bg-yellow-900/10 border-yellow-900/50'} flex gap-3`}
                                >
                                    <div className="mt-0.5">
                                        <AlertTriangle size={16} className={alert.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-sm font-bold uppercase tracking-wide ${alert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {isViolence ? 'VIOLENCE DETECTED' : alert.type.replace('_', ' ')}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <MapPin size={12} /> {alert.camera_id}
                                            </p>
                                            <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        {/* Inject special data tags for Violence incident details */}
                                        {isViolence && (
                                            <div className="mt-2 text-[11px] font-bold text-red-300 bg-red-950/50 border border-red-900/50 rounded px-2 py-1 truncate">
                                                {(alert as any).details || '4+ Members'}
                                            </div>
                                        )}
                                        <div className="mt-3 w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${alert.confidence * 100}%` }}></div>
                                        </div>
                                        <p className="text-right text-[10px] text-gray-500 mt-1 font-mono">CONF: {(alert.confidence * 100).toFixed(2)}%</p>
                                    </div>
                                </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* NEW FEATURE: Citizen PWA Sync Bridge Widget */}
                <div className="shrink-0">
                    <LiveCitizenFeedWidget />
                </div>
            </div>
        </div>

            <AddNodeModal 
                isOpen={isAddNodeModalOpen} 
                onClose={() => setIsAddNodeModalOpen(false)} 
                onAdd={(data: any) => {
                    console.log('Deploying node:', data);
                    // Mock immediate feedback
                    setSystemLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `Provisioning new edge node: ${data.name}...`, type: 'info' }, ...prev].slice(0, 50));
                    setTimeout(() => {
                         // Mute manual updates as nodes pull from DB
                         
                         // Add new camera to navigation
                         const newCamId = `CAM-0${cameras.length + 1}`;
                         setCameras(prev => [...prev, { id: newCamId, name: data.name, streamUrl: data.ip.includes('http') ? data.ip : `http://${data.ip}`, fps: 30 }]);
                         
                         setSystemLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `Node ${data.name} connected successfully.`, type: 'info' }, ...prev].slice(0, 50));
                    }, 1500);
                    setIsAddNodeModalOpen(false);
                }} 
            />
            <ViolenceModal alert={violenceAlert} onClose={() => setViolenceAlert(null)} />
        </div>
    );
}
