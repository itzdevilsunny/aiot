'use client';

import React, { useState, useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  SlidersHorizontal, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export const PredictiveRiskRadar: React.FC = () => {
  const { risks, formatCurrency } = useRiskContext();

  const [mitigationVelocity, setMitigationVelocity] = useState<number>(3); // 1 to 10 risks resolved per month

  const trajectoryData = useMemo(() => {
    const activeRisks = risks.filter(r => r.status !== 'Closed');
    const totalBaselineExposure = activeRisks.reduce((acc, r) => acc + (r.estimatedImpactUsd || (r.score * 25000)), 0);

    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'];

    const monthlyTrajectory = months.map((month, idx) => {
      // Unmitigated exposure continues to grow slightly (+2% compound risk drift per month)
      const unmitigated = Math.round(totalBaselineExposure * Math.pow(1.02, idx));
      // Mitigated exposure decreases proportionally with mitigation velocity
      const reductionFactor = Math.max(0, 1 - (idx + 1) * (mitigationVelocity * 0.08));
      const mitigated = Math.round(totalBaselineExposure * reductionFactor);

      return {
        month,
        unmitigated,
        mitigated
      };
    });

    // Category Radar distribution
    const categoryTotals: Record<string, number> = {};
    activeRisks.forEach(r => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + (r.estimatedImpactUsd || (r.score * 25000));
    });

    const radarData = Object.entries(categoryTotals).map(([cat, total]) => ({
      category: cat,
      exposure: Math.round(total / 1000) // In Thousands
    }));

    return {
      monthlyTrajectory,
      radarData,
      totalBaselineExposure,
      projectedYearEndLoss: monthlyTrajectory[11]?.mitigated || 0
    };
  }, [risks, mitigationVelocity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              12-Month Predictive Loss Trajectory & Threat Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate portfolio financial exposure curves over 12 months based on mitigation resolution velocity.
          </p>
        </div>

        {/* Velocity Slider */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Mitigation Velocity:</span>
          <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {mitigationVelocity} risks / mo
          </span>
          <input
            type="range"
            min="1"
            max="10"
            value={mitigationVelocity}
            onChange={(e) => setMitigationVelocity(Number(e.target.value))}
            className="w-28 accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Portfolio Baseline</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(trajectoryData.totalBaselineExposure)}
          </div>
          <span className="text-[11px] text-slate-500">Unmitigated baseline risk exposure</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Projected Year-End Exposure</span>
          <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
            {formatCurrency(trajectoryData.projectedYearEndLoss)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">At {mitigationVelocity} risks/mo resolution rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">12-Month Net Risk Reduction</span>
          <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">
            {Math.round(((trajectoryData.totalBaselineExposure - trajectoryData.projectedYearEndLoss) / (trajectoryData.totalBaselineExposure || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold">Overall risk reduction efficiency</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart (12-Month Trajectory) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <LineChartIcon className="w-4 h-4 text-indigo-600" />
              Unmitigated vs Mitigated Loss Exposure Trajectory
            </h3>
            <span className="text-[10px] text-indigo-600 font-bold">12-Month Projection</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData.monthlyTrajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Loss Exposure']}
                />
                <Area type="monotone" dataKey="unmitigated" stroke="#ef4444" fill="#fee2e2" name="Unmitigated Risk Drift" />
                <Area type="monotone" dataKey="mitigated" stroke="#10b981" fill="#d1fae5" name="Mitigated Trajectory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart (Category Threat Concentration) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Category Threat Concentration Radar
            </h3>
            <p className="text-[11px] text-slate-500">Distribution of loss exposure across category domains ($K USD)</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={trajectoryData.radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 9 }} />
                <Radar name="Exposure ($K)" dataKey="exposure" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
