'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RiskItem } from '../../types/risk';
import { DollarSign, ShieldAlert } from 'lucide-react';

interface RiskDistributionProps {
  risks: RiskItem[];
}

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ risks }) => {
  const [mode, setMode] = useState<'severity' | 'usd'>('severity');

  const activeRisks = risks || [];
  const criticalCount = activeRisks.filter(r => r.severity === 'Critical').length;
  const highCount = activeRisks.filter(r => r.severity === 'High').length;
  const mediumCount = activeRisks.filter(r => r.severity === 'Medium').length;
  const lowCount = activeRisks.filter(r => r.severity === 'Low').length;

  const criticalUsd = activeRisks.filter(r => r.severity === 'Critical').reduce((acc, r) => acc + (r.estimatedImpactUsd || 50000), 0);
  const highUsd = activeRisks.filter(r => r.severity === 'High').reduce((acc, r) => acc + (r.estimatedImpactUsd || 40000), 0);
  const mediumUsd = activeRisks.filter(r => r.severity === 'Medium').reduce((acc, r) => acc + (r.estimatedImpactUsd || 15000), 0);
  const lowUsd = activeRisks.filter(r => r.severity === 'Low').reduce((acc, r) => acc + (r.estimatedImpactUsd || 5000), 0);

  const totalUsd = criticalUsd + highUsd + mediumUsd + lowUsd;
  const total = activeRisks.length;

  const severityData = [
    { name: 'Critical', value: criticalCount, usd: criticalUsd, color: '#DC2626' },
    { name: 'High', value: highCount, usd: highUsd, color: '#EA580C' },
    { name: 'Medium', value: mediumCount, usd: mediumUsd, color: '#D97706' },
    { name: 'Low', value: lowCount, usd: lowUsd, color: '#059669' },
  ].filter(d => (mode === 'severity' ? d.value > 0 : d.usd > 0));

  const chartData = severityData.map(d => ({
    name: d.name,
    value: mode === 'severity' ? d.value : d.usd,
    color: d.color
  }));

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {mode === 'severity' ? <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            <span>{mode === 'severity' ? 'Severity Breakdown' : 'USD Financial Exposure'}</span>
          </h3>
          
          {/* Mode Switch Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
            <button
              onClick={() => setMode('severity')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                mode === 'severity' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Count
            </button>
            <button
              onClick={() => setMode('usd')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                mode === 'usd' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              USD $
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === 'severity' 
            ? 'Distribution of active risk scores by severity classification.' 
            : 'Financial vulnerability impact breakdown across severity tiers.'}
        </p>
      </div>

      {/* Donut Chart Container */}
      <div className="h-48 relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="transparent"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const valStr = mode === 'usd' ? `$${Number(item.value).toLocaleString()} USD` : `${item.value} Items`;
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-md font-sans border border-slate-700">
                      <span className="font-bold">{item.name}:</span> {valStr}
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
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono-code">
            {mode === 'severity' ? total : `$${(totalUsd / 1000).toFixed(0)}k`}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {mode === 'severity' ? 'Risks' : 'Exposure'}
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Critical</span>
          </div>
          <span className="text-xs font-bold font-mono-code text-red-700 dark:text-red-400">
            {mode === 'severity' ? criticalCount : `$${(criticalUsd / 1000).toFixed(0)}k`}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">High</span>
          </div>
          <span className="text-xs font-bold font-mono-code text-orange-700 dark:text-orange-400">
            {mode === 'severity' ? highCount : `$${(highUsd / 1000).toFixed(0)}k`}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Medium</span>
          </div>
          <span className="text-xs font-bold font-mono-code text-amber-700 dark:text-amber-400">
            {mode === 'severity' ? mediumCount : `$${(mediumUsd / 1000).toFixed(0)}k`}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Low</span>
          </div>
          <span className="text-xs font-bold font-mono-code text-emerald-700 dark:text-emerald-400">
            {mode === 'severity' ? lowCount : `$${(lowUsd / 1000).toFixed(0)}k`}
          </span>
        </div>
      </div>
    </div>
  );
};
