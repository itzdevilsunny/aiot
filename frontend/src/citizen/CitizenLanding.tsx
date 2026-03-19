import { Shield, Lock, Activity, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CitizenLanding() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                {/* Logo & Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] mb-8 shadow-[0_0_40px_rgba(75,43,238,0.3)]">
                        <div className="w-full h-full bg-[#040D21] rounded-2xl flex items-center justify-center">
                            <Shield className="w-10 h-10 text-white drop-shadow-md" />
                        </div>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                            CIVIC SHIELD
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium tracking-wide mb-12">
                        Report. Track. Resolve.
                    </p>
                </motion.div>

                {/* Login Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-sm"
                >
                    <button 
                        onClick={() => navigate('/citizen/dashboard')}
                        className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(75,43,238,0.4)] transition-all hover:shadow-[0_0_30px_rgba(75,43,238,0.6)] active:scale-[0.98]"
                    >
                        <Lock className="w-5 h-5 text-blue-200" />
                        <span className="text-lg tracking-wide shadow-sm">SECURE CITIZEN LOGIN</span>
                        <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors"></div>
                    </button>
                    <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> End-to-end encrypted civic portal
                    </p>
                </motion.div>
            </div>

            {/* Stats Bottom Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full bg-[#040D21]/80 backdrop-blur-lg border-t border-slate-800/80 p-6 z-10"
            >
                <div className="max-w-md mx-auto grid grid-cols-3 gap-4 divide-x divide-slate-800 text-center">
                    <div className="flex flex-col items-center">
                        <Activity className="w-4 h-4 text-blue-400 mb-1.5" />
                        <span className="text-lg font-bold text-white">4,231</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Reports</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mb-1.5" />
                        <span className="text-lg font-bold text-white">98%</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Resolved</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 text-purple-400 mb-1.5" />
                        <span className="text-lg font-bold text-white">12m</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Response</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
