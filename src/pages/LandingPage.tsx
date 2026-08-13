import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Activity, Map, Cpu, ArrowRight, Video } from 'lucide-react';

export default function LandingPage() {
    const features = [
        { icon: Activity, title: 'Urban Pulse Analytics', desc: 'Predictive anomaly detection for smart city infrastructure with sub-500ms latency.' },
        { icon: Map, title: 'Live Geospatial Mapping', desc: 'Real-time zone mapping and dispatch routing powered by Google Maps integration.' },
        { icon: Cpu, title: 'Edge Node Telemetry', desc: 'Remote hardware monitoring, thermal tracking, and OTA AI model deployments.' },
        { icon: Shield, title: 'Governance & Security', desc: 'Strict Role-Based Access Control (RBAC) and immutable system audit logs.' },
    ];

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
            {/* Navigation Bar */}
            <nav className="fixed w-full z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Video size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">VisionAIoT</span>
                    </div>
                    <Link
                        to="/dashboard"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] text-sm"
                    >
                        Access Dashboard
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400 text-sm font-medium mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    System v2.0 is Live
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
                >
                    Complex Imaging Intelligence <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        For Smart Infrastructure.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-3xl mb-10"
                >
                    Deploy production-ready AIoT anomaly detection. From municipal parking capacity enforcement to real-time security tracking, scale your edge compute securely.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Link
                        to="/dashboard"
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-200 transition-all"
                    >
                        Launch Command Center
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </main>

            {/* Features Grid */}
            <section className="py-20 bg-[#111623] border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Engineered for Scale</h2>
                        <p className="text-gray-400">Seamlessly integrating React frontend, NestJS backend, and Python YOLOv8 microservices.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                                className="bg-[#1A1D27] p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-colors"
                            >
                                <feat.icon size={32} className="text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center border-t border-gray-800 bg-[#0B0F19]">
                <p className="text-gray-500 text-sm">
                    Engineered with precision by <span className="text-white font-semibold">HackOps Crew</span>.
                </p>
            </footer>
        </div>
    );
}
