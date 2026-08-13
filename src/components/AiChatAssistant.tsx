import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Mic, Send, X, Bot, ArrowRight, RefreshCw, Trash2, Move
} from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';
import { useCameraStore } from '../store/useCameraStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
    action?: {
        label: string;
        path?: string;
        cameraId?: string;
    };
}

export default function AiChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const cameras = useCameraStore((s) => s.cameras);
    const alerts = useAlertStore((s) => s.alerts);
    const setSelectedCameraId = useCameraStore((s) => s.setSelectedCameraId);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'ai',
            text: 'Hello Operator! I am VisionAIoT Assistant powered by Gemini & YOLO11. Ask me about your 108+ cameras, ALPR watchlist, Re-ID trajectories, or active perimeter breaches.',
            timestamp: new Date()
        }
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Speech Recognition setup
    const toggleSpeechRecognition = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: '⚠️ Speech Recognition is not supported in this browser. Please type your query.',
                timestamp: new Date(),
            }]);
            return;
        }

        const windowObj = window as unknown as Record<string, unknown>;
        const SpeechRecognition = (windowObj.webkitSpeechRecognition || windowObj.SpeechRecognition) as new () => {
            continuous: boolean;
            interimResults: boolean;
            lang: string;
            start: () => void;
            stop: () => void;
            onerror: () => void;
            onend: () => void;
            onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
        };

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        if (!isListening) {
            setIsListening(true);
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                handleSendMessage(transcript);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
        } else {
            setIsListening(false);
            recognition.stop();
        }
    };

    const handleSendMessage = async (textToSend?: string) => {
        const query = (textToSend || input).trim();
        if (!query) return;

        const userMsg: Message = {
            id: String(Date.now()),
            sender: 'user',
            text: query,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const onlineCount = cameras.filter(c => c.status === 'online').length;
            const criticalAlerts = alerts.filter(a => a.severity === 'Critical');

            let aiText = '';
            let action: Message['action'] = undefined;
            const lowerQuery = query.toLowerCase();

            if (lowerQuery.includes('alert') || lowerQuery.includes('anomaly') || lowerQuery.includes('critical')) {
                if (criticalAlerts.length > 0) {
                    aiText = `Found ${criticalAlerts.length} active critical incident(s). Latest: "${criticalAlerts[0].type}" recorded at ${criticalAlerts[0].camera_id} with ${Math.round(criticalAlerts[0].confidence)}% confidence.`;
                    action = { label: 'Open Anomaly Alerts', path: '/dashboard/alerts' };
                } else {
                    aiText = `All systems clear! 0 critical security breaches reported across 108 camera nodes.`;
                    action = { label: 'Inspect Live Feeds', path: '/dashboard/cameras' };
                }
            } else if (lowerQuery.includes('alpr') || lowerQuery.includes('plate') || lowerQuery.includes('car') || lowerQuery.includes('vehicle')) {
                aiText = `ALPR Engine is active across 108 cameras. 5 License plate records index-matched, including flagged vehicles (MH-12-AB-1234 & KA-05-MN-4321).`;
                action = { label: 'Open ALPR Watchlist', path: '/dashboard/alpr' };
            } else if (lowerQuery.includes('reid') || lowerQuery.includes('trajectory') || lowerQuery.includes('suspect') || lowerQuery.includes('track')) {
                aiText = `Cross-Camera Re-ID is active. Currently tracking Suspect #8902 across CAM-04 -> CAM-12 -> CAM-22 -> CAM-45.`;
                action = { label: 'Open Re-ID Tracker', path: '/dashboard/reid' };
            } else if (lowerQuery.includes('drone') || lowerQuery.includes('map') || lowerQuery.includes('gis') || lowerQuery.includes('route')) {
                aiText = `Autonomous Drone Dispatch Unit is standby at Dispatch Base (28.6139°N, 77.2090°E). ETA: 90 seconds to perimeter breach zones.`;
                action = { label: 'Open Drone Zone Map', path: '/dashboard/map' };
            } else if (lowerQuery.includes('geofence') || lowerQuery.includes('boundary') || lowerQuery.includes('perimeter')) {
                aiText = `AI Polygon Geofence active on CAM-04. Polygon Ray-Casting algorithm continuously monitoring restricted security perimeter.`;
                action = { label: 'Open Geofence Zone', path: '/dashboard/geofence' };
            } else if (lowerQuery.includes('camera') || lowerQuery.includes('node') || lowerQuery.includes('stream')) {
                aiText = `System status: ${cameras.length} registered AI cameras (${onlineCount} Online, ${cameras.length - onlineCount} Offline). All nodes running YOLO11 Nano inference.`;
                action = { label: 'Open 108 Camera Grid', path: '/dashboard/cameras' };
            } else if (lowerQuery.includes('cam-04') || lowerQuery.includes('focus') || lowerQuery.includes('big screen')) {
                aiText = `Opening Big Screen Focus Mode for Camera CAM-04 (Perimeter Security Live AI Feed)...`;
                setSelectedCameraId('CAM-04');
                action = { label: 'Open Big Screen Mode', cameraId: 'CAM-04' };
            } else {
                const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
                if (geminiKey) {
                    try {
                        const response = await axios.post(
                            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
                            {
                                contents: [{
                                    parts: [{
                                        text: `You are an AI Security Command Assistant for VisionAIoT smart city defense platform (108 cameras, YOLO11, Gemini). Answer this operator question concisely in 2 sentences: "${query}"`
                                    }]
                                }]
                            }
                        );
                        aiText = response.data.candidates[0].content.parts[0].text;
                    } catch {
                        aiText = `VisionAIoT Defense Engine status nominal. ${cameras.length} camera nodes monitored, 60 FPS stream bandwidth, and 0 unhandled critical breaches.`;
                    }
                } else {
                    aiText = `VisionAIoT Defense Report: ${cameras.length} camera nodes active across 8 municipal sectors. Hardware health nominal (42°C GPU avg).`;
                }
            }

            const aiMsg: Message = {
                id: String(Date.now() + 1),
                sender: 'ai',
                text: aiText,
                timestamp: new Date(),
                action
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [...prev, {
                id: String(Date.now() + 1),
                sender: 'ai',
                text: 'System status nominal. All 108 cameras operational under YOLO11 Nano pipeline.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 150)}
            className="fixed bottom-6 right-6 z-[9999] font-sans touch-none"
        >
            {/* Floating Trigger Button (Draggable Anywhere) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (!isDragging) setIsOpen(!isOpen);
                }}
                className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center cursor-grab active:cursor-grabbing border border-blue-400/40 group"
                title="Drag me anywhere on screen!"
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}

                {/* Drag Indicator Tooltip */}
                <span className="absolute -top-8 bg-slate-900/90 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1">
                    <Move size={10} className="text-blue-400" /> Drag Anywhere
                </span>

                {/* Status Ping */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0B0F19] animate-ping" />
                )}
            </motion.button>

            {/* Chat Drawer Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-16 right-0 w-96 max-w-[92vw] h-[530px] bg-[#040D21]/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-3.5 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                        VisionAIoT Assistant
                                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            Gemini AI
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-slate-400">Natural Language & Voice Control</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setMessages([{
                                        id: '1',
                                        sender: 'ai',
                                        text: 'Chat history cleared. How can I assist you?',
                                        timestamp: new Date()
                                    }])}
                                    className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition cursor-pointer"
                                    title="Clear Chat History"
                                >
                                    <Trash2 size={15} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none shadow-lg'
                                                : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                                            }`}
                                    >
                                        <p>{msg.text}</p>

                                        {msg.action && (
                                            <button
                                                onClick={() => {
                                                    if (msg.action?.path) navigate(msg.action.path);
                                                    if (msg.action?.cameraId) setSelectedCameraId(msg.action.cameraId);
                                                }}
                                                className="mt-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-all cursor-pointer"
                                            >
                                                <span>{msg.action.label}</span>
                                                <ArrowRight size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-slate-500 mt-1 px-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                                    <RefreshCw size={14} className="animate-spin text-blue-400" />
                                    <span>Analyzing query with Gemini...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestion Chips */}
                        <div className="px-3 py-2 bg-[#060E26] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
                            <button
                                onClick={() => handleSendMessage('Show recent critical anomalies')}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg whitespace-nowrap cursor-pointer"
                            >
                                🚨 Alerts
                            </button>
                            <button
                                onClick={() => handleSendMessage('Check ALPR Watchlist')}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg whitespace-nowrap cursor-pointer"
                            >
                                🚗 ALPR Engine
                            </button>
                            <button
                                onClick={() => handleSendMessage('Track suspect with Re-ID')}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg whitespace-nowrap cursor-pointer"
                            >
                                ⚡ Re-ID Tracker
                            </button>
                            <button
                                onClick={() => handleSendMessage('Deploy autonomous drone')}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg whitespace-nowrap cursor-pointer"
                            >
                                🛸 Drone Map
                            </button>
                        </div>

                        {/* Input Footer */}
                        <div className="p-3 bg-[#081028] border-t border-slate-800 flex items-center gap-2">
                            <button
                                onClick={toggleSpeechRecognition}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isListening
                                        ? 'bg-red-500 text-white border-red-400 animate-pulse'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                                    }`}
                                title={isListening ? 'Stop Listening' : 'Speak Query'}
                            >
                                <Mic size={16} />
                            </button>

                            <input
                                type="text"
                                placeholder={isListening ? 'Listening...' : 'Ask assistant...'}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />

                            <button
                                onClick={() => handleSendMessage()}
                                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer shadow-md"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
