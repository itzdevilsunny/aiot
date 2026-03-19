import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Server, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Generates smooth random data for the chart
const generateData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
        time: i,
        inference: Math.floor(Math.random() * 20) + 80,
        latency: Math.floor(Math.random() * 5) + 2,
    }));
};

export default function MonitoringNodeDemo() {
    const [data, setData] = useState(generateData());

    useEffect(() => {
        const interval = setInterval(() => {
            setData((prev) => {
                const newData = [...prev.slice(1)];
                newData.push({
                    time: prev[prev.length - 1].time + 1,
                    inference: Math.floor(Math.random() * 20) + 80,
                    latency: Math.floor(Math.random() * 5) + 2,
                });
                return newData;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="demo" className="py-24 relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Live Node <span className="text-neon-purple text-glow">Telemetry</span>
                    </h2>
                    <p className="text-slate-400">Real-time inference metrics from active edge deployment.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glass-card overflow-hidden border-slate-700 max-w-5xl mx-auto"
                >
                    {/* Dashboard Header */}
                    <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            <h3 className="font-semibold text-lg">vision-aiot-monitoring-node-alpha</h3>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                                <Server className="w-4 h-4 text-emerald-400" />
                                <span className="text-slate-300">Nodes: 14/14 Active</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                                <Zap className="w-4 h-4 text-neon-blue" />
                                <span className="text-slate-300">Avg Latency: 4ms</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                        {/* Chart Area */}
                        <div className="col-span-2 space-y-6">
                            <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <ActivityIcon /> Inference Throughput (FPS)
                            </h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorInference" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" hide />
                                        <YAxis stroke="#475569" fontSize={12} domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                            itemStyle={{ color: '#00f0ff' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="inference"
                                            stroke="#00f0ff"
                                            fillOpacity={1}
                                            fill="url(#colorInference)"
                                            strokeWidth={2}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Events */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-slate-400 mb-4">Latest Detections</h4>

                            <div className="space-y-3">
                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex gap-4 items-start">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">Unrecognized Object</p>
                                        <p className="text-xs text-slate-500">Node-7 • 2s ago</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex gap-4 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">Zone Cleared</p>
                                        <p className="text-xs text-slate-500">Node-3 • 14s ago</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/30 border border-emerald-500/20 rounded-xl p-4 flex gap-4 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">System Nominal</p>
                                        <p className="text-xs text-slate-500">All Nodes • 45s ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function ActivityIcon() {
    return (
        <svg className="w-4 h-4 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    );
}
