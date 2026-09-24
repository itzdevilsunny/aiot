'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RiskItem } from '../../types/risk';
import { MOCK_RISKS } from '../../data/mockData';

interface RiskDistributionProps {
  risks: RiskItem[];
}

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ risks }) => {
  const activeRisks = risks && risks.length > 0 ? risks : MOCK_RISKS;
  const criticalCount = activeRisks.filter(r => r.severity === 'Critical').length;
  const highCount = activeRisks.filter(r => r.severity === 'High').length;
  const mediumCount = activeRisks.filter(r => r.severity === 'Medium').length;
  const lowCount = activeRisks.filter(r => r.severity === 'Low').length;

  const data = [
    { name: 'Critical', value: criticalCount, color: '#DC2626' },
    { name: 'High', value: highCount, color: '#EA580C' },
    { name: 'Medium', value: mediumCount, color: '#D97706' },
    { name: 'Low', value: lowCount, color: '#059669' },
  ].filter(d => d.value > 0);

  const total = activeRisks.length;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">Severity Breakdown</h3>
          <span className="text-xs font-semibold text-slate-500">{total} Total Items</span>
        </div>
        <p className="text-xs text-slate-500">Distribution of active risk scores by severity classification.</p>
      </div>

      {/* Donut Chart Container */}
      <div className="h-48 relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const percent = total > 0 ? Math.round(((item.value as number) / total) * 100) : 0;
                  return (
                    <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md">
                      <span className="font-bold">{item.name}:</span> {item.value} ({percent}%)
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900">{total}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Risks</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 border border-red-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-xs font-medium text-slate-700">Critical</span>
          </div>
          <span className="text-xs font-bold text-red-700">{criticalCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-medium text-slate-700">High</span>
          </div>
          <span className="text-xs font-bold text-orange-700">{highCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-700">Medium</span>
          </div>
          <span className="text-xs font-bold text-amber-700">{mediumCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">Low</span>
          </div>
          <span className="text-xs font-bold text-emerald-700">{lowCount}</span>
        </div>
      </div>
    </div>
  );
};
