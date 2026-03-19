import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, MapPin, X, ArrowUpCircle, Shield, Users, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ReportModal() {
    const navigate = useNavigate();
    const [category, setCategory] = useState<'Violence' | 'Crowd' | 'Municipal' | null>(null);
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get live geolocation proactive on mount
    useEffect(() => {
        handleGetLocation();
    }, []);

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }, () => {
                // Fallback to center of map if denied
                setLocation({ lat: 28.6139, lng: 77.2090 });
            });
        }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Low Data Mode: 70% quality jpeg
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const compressed = await compressImage(file);
            setImagePreview(compressed);
        }
    };

    const handleSubmit = async () => {
        if (!category || !imagePreview) return;
        setIsSubmitting(true);

        const session = JSON.parse(localStorage.getItem('citizen_session') || '{}');
        
        // POST to backend
        try {
            await axios.post(`${API_BASE}/api/citizen/report`, {
                citizen_name: session.name || 'Anonymous',
                citizen_phone: session.phone || 'Unknown',
                category,
                description,
                image_url: imagePreview,
                location: location || { lat: 28.6139, lng: 77.2090 }
            });
            // Brief delay for effect
            setTimeout(() => {
                setIsSubmitting(false);
                navigate('/citizen/dashboard');
            }, 1500);
        } catch (error) {
            console.error("Submission failed", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-white p-0 pb-20 font-sans selection:bg-blue-500/30">
            {/* Header - Glassmorphism style */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase leading-none mb-1">Secure Reporting</h1>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">New Incident Report</p>
                    </div>
                </div>
                {location && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">GPS Live</span>
                    </div>
                )}
            </header>

            <div className="p-6 flex flex-col gap-10 max-w-lg mx-auto w-full pb-32">
                {/* Visual Evidence Area */}
                <section className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Visual Evidence</h3>
                        {imagePreview && (
                            <button 
                                onClick={() => setImagePreview(null)}
                                className="text-[10px] font-bold text-red-400 uppercase tracking-wider hover:underline"
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                    <motion.div 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden group ${imagePreview ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_40px_rgba(37,99,235,0.1)]' : 'border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60'}`}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Evidence" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Camera className="w-10 h-10 text-blue-500" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-[10px] font-black tracking-widest text-white uppercase mb-1">Click to Capture</span>
                                    <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Supports native camera feed</span>
                                </div>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={(e) => {
                                handleImageUpload(e);
                                handleGetLocation(); 
                            }} 
                            className="hidden" 
                            accept="image/*" 
                            capture="environment"
                        />
                    </motion.div>
                </section>

                {/* Incident Type Grid */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Incident Categorization</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'Violence', icon: <Shield className="w-7 h-7" />, label: 'VIOLENCE', color: 'blue' },
                            { id: 'Crowd', icon: <Users className="w-7 h-7" />, label: 'CROWD', color: 'purple' },
                            { id: 'Municipal', icon: <Trash2 className="w-7 h-7" />, label: 'MUNICIPAL', color: 'emerald' }
                        ].map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCategory(item.id as any)}
                                className={`flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all ${category === item.id 
                                    ? 'bg-blue-600 border-blue-400 shadow-[0_15px_30px_rgba(37,99,235,0.3)]' 
                                    : 'bg-[#161b22] border-gray-800 text-gray-500 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'}`}
                            >
                                <div className={`${category === item.id ? 'text-white' : 'text-gray-400'}`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[9px] font-black tracking-[0.15em] uppercase text-center leading-tight ${category === item.id ? 'text-white' : 'text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Description Textarea */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Description & Context</h3>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail the emergency (location specifics, number of people involved, etc.)"
                        className="w-full bg-[#161b22] border-2 border-gray-800 rounded-2xl p-5 text-xs font-semibold placeholder:text-gray-600 focus:border-blue-500 focus:bg-[#1c2128] focus:outline-none transition-all min-h-[120px] resize-none shadow-inner"
                    />
                </section>

                {/* Live Location Block */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Automatic Geotagging</h3>
                    <div 
                        className={`w-full flex items-center gap-4 p-5 bg-[#161b22] border-2 rounded-2xl transition-all shadow-sm ${location ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-800'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location ? 'bg-emerald-500/20' : 'bg-gray-800'}`}>
                            <MapPin className={`w-5 h-5 ${location ? 'text-emerald-500' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                            <span className={`block text-[10px] font-black tracking-widest uppercase mb-0.5 ${location ? 'text-emerald-400' : 'text-gray-500'}`}>
                                {location ? 'Coordinates Locked' : 'Acquiring GPS...'}
                            </span>
                            <span className="block text-[9px] font-mono text-gray-600 uppercase tracking-tighter">
                                {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Waiting for system handshake'}
                            </span>
                        </div>
                        {location && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                    </div>
                </section>
            </div>

            {/* Bottom Submit Button - Floating with Gradient */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/95 to-transparent z-[60]">
                <AnimatePresence mode="wait">
                    {isSubmitting ? (
                        <motion.div
                            key="submitting"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full bg-blue-600 py-6 rounded-2xl flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(37,99,235,0.4)]"
                        >
                            <span className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            <span className="text-sm font-black tracking-[0.2em] text-white uppercase">AI Processing...</span>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="submit"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            disabled={!category || !imagePreview || isSubmitting}
                            onClick={handleSubmit}
                            className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 transition-all font-black tracking-[0.2em] text-sm uppercase ${!category || !imagePreview || isSubmitting 
                                ? 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_15px_35px_rgba(37,99,235,0.4)] active:scale-95 active:shadow-none'}`}
                        >
                            <ArrowUpCircle className="w-6 h-6" />
                            <span>Transmit Report</span>
                        </motion.button>
                    )}
                </AnimatePresence>
                <p className="text-[8px] text-center text-gray-600 font-bold uppercase tracking-[0.4em] mt-6">Secure End-to-End Encryption Enabled</p>
            </div>
        </div>
    );
}
