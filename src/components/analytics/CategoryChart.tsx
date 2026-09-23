'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRiskContext } from '../../context/RiskContext';

export const CategoryChart: React.FC = () => {
  const { risks } = useRiskContext();

  const categories = ['Technical', 'Resource', 'Financial', 'Compliance', 'Security', 'External'];
  const data = categories.map(cat => ({
    category: cat,
    count: risks.filter(r => r.category === cat).length
  }));

  const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Risks by Category</h3>
          <p className="text-xs text-slate-500">Distribution of operational threats across risk domains.</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
