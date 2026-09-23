'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { week: 'W1 Sep', identified: 4, resolved: 2 },
  { week: 'W2 Sep', identified: 8, resolved: 5 },
  { week: 'W3 Sep', identified: 14, resolved: 9 },
  { week: 'W4 Sep', identified: 19, resolved: 14 },
  { week: 'W1 Oct', identified: 22, resolved: 17 },
  { week: 'W2 Oct', identified: 24, resolved: 19 },
];

export const TrendChart: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Risk Telemetry Velocity Trend</h3>
          <p className="text-xs text-slate-500">Cumulative identified risk items vs mitigation resolutions over 6 weeks.</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIdentified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="identified" name="Identified Threats" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorIdentified)" />
            <Area type="monotone" dataKey="resolved" name="Mitigated Items" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
