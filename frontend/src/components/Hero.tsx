import { motion } from 'framer-motion';
import { ChevronRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/20 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-neon-purple/20 rounded-full blur-[100px] -z-10"></div>

            <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-neon-blue/30 text-neon-blue text-sm font-medium mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
                    </span>
                    Live Edge Inference v2.0 is Active
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8"
                >
                    Real-Time Anomaly <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple text-glow">
                        Detection at the Edge
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12"
                >
                    Transforming complex imaging data from CCTV, medical scans, and drones into instant, intelligent alerts using scalable AIoT architecture. Built to process millions of frames per second with near-zero latency.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neon-blue text-slate-950 font-bold text-lg hover:bg-neon-blue/90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 group">
                        <ShieldAlert className="w-5 h-5" />
                        Start Monitoring
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl glass border-slate-600 text-white font-medium text-lg text-center hover:bg-slate-800/50 transition-all block">
                        View Live Demo
                    </Link>
                </motion.div>
            </div>

            {/* Decorative lines */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
        </section>
    );
}
