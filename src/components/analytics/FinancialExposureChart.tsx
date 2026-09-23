'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRiskContext } from '../../context/RiskContext';
import { DollarSign } from 'lucide-react';

export const FinancialExposureChart: React.FC = () => {
  const { risks } = useRiskContext();

  const categories = ['Technical', 'Resource', 'Financial', 'Compliance', 'Security', 'Operational'];
  const data = categories.map(cat => {
    const catRisks = risks.filter(r => r.category === cat);
    const totalUsd = catRisks.reduce((acc, r) => acc + (r.estimatedImpactUsd || (r.score * 2500)), 0);
    return {
      category: cat,
      exposureUsd: totalUsd,
      formattedUsd: `$${(totalUsd / 1000).toFixed(1)}k`
    };
  });

  const totalCompanyExposure = data.reduce((acc, d) => acc + d.exposureUsd, 0);
  const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Estimated Financial Exposure by Domain</span>
          </h3>
          <p className="text-xs text-slate-500">USD financial vulnerability variance mapped across core business units.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Portfolio Exposure</span>
          <span className="text-sm font-black text-indigo-600">${(totalCompanyExposure / 1000).toFixed(1)}k USD</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              tickFormatter={(val) => `$${val / 1000}k`}
            />
            <Tooltip
              formatter={(value: any) => [`$${Number(value).toLocaleString()} USD`, 'Estimated Financial Exposure']}
              contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="exposureUsd" radius={[6, 6, 0, 0]}>
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
