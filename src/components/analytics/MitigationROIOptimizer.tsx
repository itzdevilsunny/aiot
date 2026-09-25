'use client';

import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  Download,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { RiskROIDetailModal, ROIRiskItem } from '../roi/RiskROIDetailModal';
import { AIBudgetOptimizerModal } from '../roi/AIBudgetOptimizerModal';

export const MitigationROIOptimizer: React.FC = () => {
  const { risks, formatCurrency, addToast } = useRiskContext();

  const [activeRoiDetail, setActiveRoiDetail] = useState<ROIRiskItem | null>(null);
  const [isAIOptimizerModalOpen, setIsAIOptimizerModalOpen] = useState<boolean>(false);
  const [targetBudgetFilter, setTargetBudgetFilter] = useState<number>(25000);

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

    // Cumulative budget filtering
    let cumBudget = 0;
    const fundedItems = items.map(item => {
      cumBudget += item.estimatedMitigationCost;
      return {
        ...item,
        isWithinBudget: cumBudget <= targetBudgetFilter
      };
    });

    const totalPotentialLoss = items.reduce((acc, i) => acc + i.estimatedLoss, 0);
    const totalMitigationBudget = items.reduce((acc, i) => acc + i.estimatedMitigationCost, 0);
    const totalExpectedSavings = items.reduce((acc, i) => acc + i.netSavings, 0);
    const portfolioRoi = Math.round((totalExpectedSavings / (totalMitigationBudget || 1)) * 100);

    return {
      items: fundedItems,
      totalPotentialLoss,
      totalMitigationBudget,
      totalExpectedSavings,
      portfolioRoi,
      fundedCount: fundedItems.filter(i => i.isWithinBudget).length
    };
  }, [risks, targetBudgetFilter]);

  const handleExportCFOMemoText = () => {
    const lines = [
      `=================================================================`,
      `ENTERPRISE MITIGATION ROI & CAPITAL BUDGET ALLOCATION MEMO`,
      `Generated: ${new Date().toISOString().split('T')[0]} | MNB Research Operations`,
      `=================================================================\n`,
      `PORTFOLIO FINANCIAL SUMMARY:`,
      `Total Unmitigated Loss Exposure: ${formatCurrency(roiAnalysis.totalPotentialLoss)}`,
      `Required Mitigation Budget: ${formatCurrency(roiAnalysis.totalMitigationBudget)}`,
      `Net Financial Savings: ${formatCurrency(roiAnalysis.totalExpectedSavings)}`,
      `Portfolio Mitigation ROI: +${roiAnalysis.portfolioRoi}%\n`,
      `HIGHEST FINANCIAL ROI MITIGATION PRIORITY RANKING:`,
      `-----------------------------------------------------------------`
    ];

    roiAnalysis.items.forEach((i, idx) => {
      lines.push(`#${idx + 1} [${i.id}] ${i.title}`);
      lines.push(`  Category: ${i.category} | Potential Loss: ${formatCurrency(i.estimatedLoss)} | Mitigation Spend: ${formatCurrency(i.estimatedMitigationCost)}`);
      lines.push(`  Net Savings: ${formatCurrency(i.netSavings)} | ROI: +${i.roiPercent}% | Funded in Budget: ${i.isWithinBudget ? 'YES' : 'NO'}`);
      lines.push(`-----------------------------------------------------------------`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CFO_Mitigation_ROI_Budget_Memo_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CFO ROI Memo Exported', 'Downloaded financial budget allocation memo.', 'success');
  };

  return (
    <>
      <RiskROIDetailModal
        item={activeRoiDetail}
        isOpen={!!activeRoiDetail}
        onClose={() => setActiveRoiDetail(null)}
      />

      <AIBudgetOptimizerModal
        isOpen={isAIOptimizerModalOpen}
        onClose={() => setIsAIOptimizerModalOpen(false)}
        targetBudget={targetBudgetFilter}
      />

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

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="copilot"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-emerald-200" />}
              onClick={() => setIsAIOptimizerModalOpen(true)}
            >
              Run AI Budget Optimizer
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleExportCFOMemoText}
            >
              Export CFO Memo (.TXT)
            </Button>
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

        {/* Capital Budget Allocation Slider Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Capital Budget Allocation Simulator
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Allocated Budget: {formatCurrency(targetBudgetFilter)} ({roiAnalysis.fundedCount} / {roiAnalysis.items.length} Risks Funded)
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <span className="text-[10px] font-mono font-bold text-slate-400">$5,000</span>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={targetBudgetFilter}
              onChange={(e) => setTargetBudgetFilter(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] font-mono font-bold text-slate-400">$100,000</span>
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
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roiAnalysis.items.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setActiveRoiDetail(item)}
                    className={`transition-colors cursor-pointer group ${
                      item.isWithinBudget ? 'hover:bg-emerald-50/40 bg-white' : 'bg-slate-50/60 opacity-65 hover:opacity-100'
                    }`}
                  >
                    <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{item.title}</div>
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
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
