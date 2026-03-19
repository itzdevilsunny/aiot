import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ZoneData } from '../../hooks/useAnalytics';

// Gradient palette for bars — highest-risk zones get warmer colors
const BAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#6366f1', '#8b5cf6', '#a855f7'];

export default function ZoneDistributionChart({ rawData }: { rawData: ZoneData[] }) {
    const sortedData = [...rawData].sort((a, b) => b.total_alerts - a.total_alerts);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="zone_name"
                        stroke="#334155"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        angle={-30}
                        textAnchor="end"
                    />
                    <YAxis
                        stroke="#334155"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            borderRadius: '12px',
                            color: '#fff',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        }}
                    />
                    <Bar dataKey="total_alerts" radius={[6, 6, 0, 0]} maxBarSize={60}>
                        {sortedData.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                                fillOpacity={0.85}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
