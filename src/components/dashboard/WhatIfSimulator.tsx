'use client';

import React, { useState, useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Sliders, ShieldCheck, DollarSign, TrendingDown, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const WhatIfSimulator: React.FC = () => {
  const { risks } = useRiskContext();

  // Simulated mitigation state per risk ID: riskId -> simulatedProgress (0 to 100)
  const [simulatedProgress, setSimulatedProgress] = useState<Record<string, number>>({});

  const formatUSD = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${Math.round(val).toLocaleString()}`;
  };

  // Calculate baseline vs simulated portfolio financial exposure
  const stats = useMemo(() => {
    let baselineTotal = 0;
    let simulatedTotal = 0;

    risks.forEach(r => {
      const baseImpact = r.estimatedImpactUsd || (r.score * 2500);
      baselineTotal += baseImpact;

      const currentProg = simulatedProgress[r.id] !== undefined 
        ? simulatedProgress[r.id] 
        : r.mitigationProgress || 0;

      // Exposure remaining scales inversely with mitigation progress (100% progress = 15% residual risk)
      const residualFactor = 1 - (currentProg / 100) * 0.85;
      simulatedTotal += baseImpact * residualFactor;
    });

    const costSaved = Math.max(0, baselineTotal - simulatedTotal);
    const reductionPercent = baselineTotal > 0 ? Math.round((costSaved / baselineTotal) * 100) : 0;

    const chartData = [
      { name: 'Baseline Exposure', amount: Math.round(baselineTotal), fill: '#ef4444' },
      { name: 'Simulated Exposure', amount: Math.round(simulatedTotal), fill: '#10b981' }
    ];

    return {
      baselineTotal,
      simulatedTotal,
      costSaved,
      reductionPercent,
      chartData
    };
  }, [risks, simulatedProgress]);

  const handleSliderChange = (riskId: string, value: number) => {
    setSimulatedProgress(prev => ({
      ...prev,
      [riskId]: value
    }));
  };

  const handleResetSim = () => {
    setSimulatedProgress({});
  };

  const handleMaximizeAll = () => {
    const maxed: Record<string, number> = {};
    risks.forEach(r => {
      maxed[r.id] = 100;
    });
    setSimulatedProgress(maxed);
  };

  return (
    <div className="p-6 rounded-2xl glass-card space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Interactive What-If Mitigation Impact Simulator
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live ROI Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Adjust mitigation progress sliders to simulate real-time financial risk exposure reduction ($ USD).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMaximizeAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Simulate 100% Mitigation
          </button>

          <button
            onClick={handleResetSim}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards & Comparison Bar Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Stats */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Baseline Exposure</span>
            <div className="text-2xl font-extrabold font-mono-code text-red-400">{formatUSD(stats.baselineTotal)}</div>
            <p className="text-[11px] text-slate-400">Current unmitigated risk portfolio</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950 text-white shadow-md border border-emerald-800/40 space-y-1">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Simulated Post-Mitigation Exposure</span>
            <div className="text-2xl font-extrabold font-mono-code text-emerald-400">{formatUSD(stats.simulatedTotal)}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 pt-1">
              <TrendingDown className="w-4 h-4" />
              <span>{stats.reductionPercent}% Risk Compressed</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Estimated Financial Capital Saved</span>
            <div className="text-2xl font-extrabold font-mono-code text-indigo-900">{formatUSD(stats.costSaved)}</div>
            <p className="text-[11px] text-indigo-700 font-medium">Direct ROI from proactive mitigation controls</p>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Exposure Compression Breakdown ($ USD)</span>
          </h4>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickFormatter={(val) => formatUSD(val)} />
                <Tooltip 
                  formatter={(val: any) => [formatUSD(Number(val)), 'Exposure']} 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Risk Sliders Table */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Active Risk Items & Mitigation Readiness Sliders
        </h4>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
          {risks.map(r => {
            const currentVal = simulatedProgress[r.id] !== undefined ? simulatedProgress[r.id] : (r.mitigationProgress || 0);
            return (
              <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {r.id}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 truncate">{r.title}</h5>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Owner: {r.ownerName}</span>
                    <span>•</span>
                    <span className="font-mono-code text-slate-700 font-bold">Score: {r.score}/25</span>
                    <span>•</span>
                    <span className="font-mono-code text-slate-700">Base: {formatUSD(r.estimatedImpactUsd || r.score * 2500)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-64 shrink-0">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={currentVal}
                    onChange={(e) => handleSliderChange(r.id, Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="font-mono-code text-xs font-extrabold text-indigo-700 w-12 text-right">
                    {currentVal}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
