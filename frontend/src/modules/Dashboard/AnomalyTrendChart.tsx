import { useEffect, useState } from 'react';
import axios from 'axios';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface TrendPoint {
    hour: string;
    alerts: number;
}

export default function AnomalyTrendChart() {
    const [data, setData] = useState<TrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrends = async () => {
        try {
            const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/stats/anomaly-trends`);
            setData(resp.data);
        } catch (err) {
            console.error('Failed to fetch anomaly trends', err);
            // Fallback demo data
            const now = new Date().getHours();
            setData(Array.from({ length: 24 }, (_, i) => ({
                hour: `${i.toString().padStart(2, '0')}:00`,
                alerts: i <= now ? Math.floor(Math.random() * 12) + 1 : 0,
            })));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchTrends, 60000);
        return () => clearInterval(interval);
    }, []);

    const totalAlerts = data.reduce((sum, d) => sum + d.alerts, 0);
    const peakHour = data.reduce((max, d) => d.alerts > max.alerts ? d : max, { hour: '--', alerts: 0 });

    return (
        <div className="bg-[#151923] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1A1D27]">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-red-400" />
                    <h3 className="font-bold text-white text-sm">Anomaly Frequency (24h)</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">Total: <span className="text-white font-bold">{totalAlerts}</span></span>
                        <span className="text-gray-500">Peak: <span className="text-red-400 font-bold">{peakHour.hour}</span></span>
                    </div>
                    <button 
                        onClick={fetchTrends} 
                        className="p-1.5 rounded-lg hover:bg-gray-800 transition text-gray-500 hover:text-white"
                        title="Refresh trends"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="p-4 h-56">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                        Loading trend data...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2533" />
                            <XAxis 
                                dataKey="hour" 
                                stroke="#4b5563" 
                                fontSize={10} 
                                tickLine={false}
                                interval={2}
                            />
                            <YAxis 
                                stroke="#4b5563" 
                                fontSize={10} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#0d0e12', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                itemStyle={{ color: '#ef4444' }}
                                labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="alerts"
                                stroke="#EF4444"
                                strokeWidth={2}
                                fill="url(#alertGradient)"
                                dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#EF4444', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
