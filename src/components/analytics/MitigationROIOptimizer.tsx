'use client';

import React, { useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const MitigationROIOptimizer: React.FC = () => {
  const { risks, formatCurrency } = useRiskContext();

  const roiAnalysis = useMemo(() => {
    const activeRisks = risks.filter(r => r.status !== 'Closed');

    const items = activeRisks.map(r => {
      const estimatedLoss = r.estimatedImpactUsd || (r.score * 25000);
      const estimatedMitigationCost = Math.round(estimatedLoss * 0.12); // ~12% cost of total exposure
      const expectedLossReduction = Math.round(estimatedLoss * (r.mitigationProgress > 0 ? (r.mitigationProgress / 100) * 0.8 : 0.7));
      const netSavings = Math.max(0, expectedLossReduction - estimatedMitigationCost);
      const roiPercent = Math.round((netSavings / (estimatedMitigationCost || 1)) * 100);

      return {
        ...r,
        estimatedLoss,
        estimatedMitigationCost,
        expectedLossReduction,
        netSavings,
        roiPercent
      };
    }).sort((a, b) => b.roiPercent - a.roiPercent);

    const totalPotentialLoss = items.reduce((acc, i) => acc + i.estimatedLoss, 0);
    const totalMitigationBudget = items.reduce((acc, i) => acc + i.estimatedMitigationCost, 0);
    const totalExpectedSavings = items.reduce((acc, i) => acc + i.netSavings, 0);
    const portfolioRoi = Math.round((totalExpectedSavings / (totalMitigationBudget || 1)) * 100);

    return {
      items,
      totalPotentialLoss,
      totalMitigationBudget,
      totalExpectedSavings,
      portfolioRoi
    };
  }, [risks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Mitigation ROI & Budget Allocation Optimizer
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quantifies net financial savings and return on investment (ROI %) for proactive mitigation execution.
          </p>
        </div>
      </div>

      {/* Top ROI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Risk Exposure Loss</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(roiAnalysis.totalPotentialLoss)}
          </div>
          <span className="text-[11px] text-slate-500">Unmitigated baseline</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Required Mitigation Budget</span>
          <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">
            {formatCurrency(roiAnalysis.totalMitigationBudget)}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">~12% capital investment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Net Financial Savings</span>
          <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
            {formatCurrency(roiAnalysis.totalExpectedSavings)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> Capital loss avoided
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Portfolio Mitigation ROI</span>
          <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
            +{roiAnalysis.portfolioRoi}%
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">Return on mitigation spend</span>
        </div>
      </div>

      {/* ROI Prioritization Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Highest Financial ROI Mitigation Priority Ranking ({roiAnalysis.items.length} Items)
          </h3>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Budget Optimization
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Risk Item</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Potential Loss</th>
                <th className="p-3 text-right">Mitigation Cost</th>
                <th className="p-3 text-right">Net Savings</th>
                <th className="p-3 text-center">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roiAnalysis.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                    <div className="font-bold text-slate-900 truncate">{item.title}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(item.estimatedLoss)}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-indigo-700">
                    {formatCurrency(item.estimatedMitigationCost)}
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                    {formatCurrency(item.netSavings)}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] font-mono">
                      +{item.roiPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
