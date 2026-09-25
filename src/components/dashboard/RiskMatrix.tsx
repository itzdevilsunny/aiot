'use client';

import React, { useState } from 'react';
import { RiskItem, ProbabilityLevel, ImpactLevel } from '../../types/risk';
import { Badge } from '../ui/Badge';
import { useRouter } from 'next/navigation';
import { MOCK_RISKS } from '../../data/mockData';

interface RiskMatrixProps {
  risks: RiskItem[];
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks }) => {
  const router = useRouter();
  const [selectedCell, setSelectedCell] = useState<{ prob: ProbabilityLevel; imp: ImpactLevel } | null>(null);

  const activeRisks = risks && risks.length > 0 ? risks : MOCK_RISKS;

  // Group risks by (Probability, Impact)
  const getCellRisks = (prob: ProbabilityLevel, imp: ImpactLevel) => {
    return activeRisks.filter(r => r.probability === prob && r.impact === imp);
  };

  const getCellBg = (prob: number, imp: number) => {
    const score = prob * imp;
    if (score >= 20) return 'bg-red-100/90 text-red-900 border-red-200/90 hover:bg-red-200/80 shadow-2xs';
    if (score >= 12) return 'bg-amber-100/90 text-amber-900 border-amber-200/90 hover:bg-amber-200/80 shadow-2xs';
    if (score >= 6) return 'bg-yellow-100/80 text-yellow-900 border-yellow-200/90 hover:bg-yellow-200/70 shadow-2xs';
    return 'bg-emerald-100/80 text-emerald-900 border-emerald-200/90 hover:bg-emerald-200/70 shadow-2xs';
  };

  const selectedCellRisks = selectedCell ? getCellRisks(selectedCell.prob, selectedCell.imp) : [];

  return (
    <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>5×5 Risk Severity Matrix</span>
              <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Formula: P × I
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Probability (Y) vs Impact (X). Click any cell to view risk items.</p>
          </div>
        </div>

        {/* 5x5 Grid */}
        <div className="relative">
          {/* Y Axis Label */}
          <div className="absolute -left-6 top-1/2 -rotate-90 -translate-y-1/2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Probability
          </div>

          <div className="space-y-1.5 pl-2">
            {[5, 4, 3, 2, 1].map((probLevel) => (
              <div key={probLevel} className="flex items-center gap-1.5">
                <span className="w-4 text-xs font-mono-code font-bold text-slate-400 text-right">{probLevel}</span>
                <div className="grid grid-cols-5 gap-1.5 flex-1">
                  {[1, 2, 3, 4, 5].map((impLevel) => {
                    const prob = probLevel as ProbabilityLevel;
                    const imp = impLevel as ImpactLevel;
                    const cellRisks = getCellRisks(prob, imp);
                    const isSelected = selectedCell?.prob === prob && selectedCell?.imp === imp;

                    return (
                      <button
                        key={`${prob}-${imp}`}
                        onClick={() => setSelectedCell(isSelected ? null : { prob, imp })}
                        className={`h-11 rounded-lg border text-xs font-bold flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${getCellBg(prob, imp)} ${
                          isSelected ? 'ring-2 ring-slate-900 ring-offset-1 scale-[1.04] shadow-md z-10' : ''
                        }`}
                        title={`P:${prob} × I:${imp} = Score ${prob * imp} (${cellRisks.length} risks)`}
                      >
                        <span className="text-[10px] opacity-75 font-mono-code">{prob * imp}</span>
                        {cellRisks.length > 0 && (
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-mono-code font-bold flex items-center justify-center shadow-xs mt-0.5">
                            {cellRisks.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* X Axis Numbers & Label */}
            <div className="flex items-center gap-1.5 pt-1 pl-2">
              <span className="w-4"></span>
              <div className="grid grid-cols-5 gap-1.5 flex-1 text-center text-xs font-mono-code font-bold text-slate-400">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
            <div className="text-center text-[10px] font-bold tracking-wider uppercase text-slate-400 pt-1">
              Impact Scale (1 = Negligible → 5 = Catastrophic)
            </div>
          </div>
        </div>
      </div>

      {/* Selected Matrix Cell Filter Preview Drawer */}
      {selectedCell && (
        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl p-3 animate-in fade-in-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Selected Cell: P:{selectedCell.prob} × I:{selectedCell.imp} (Score {selectedCell.prob * selectedCell.imp})
            </span>
            <button 
              onClick={() => setSelectedCell(null)}
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Clear Filter
            </button>
          </div>

          {selectedCellRisks.length > 0 ? (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {selectedCellRisks.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => router.push(`/risk/${r.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-300 text-left cursor-pointer transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-mono-code font-bold text-slate-500 mr-2">{r.id}</span>
                    <span className="text-xs font-semibold text-slate-900 truncate">{r.title}</span>
                  </div>
                  <Badge severity={r.severity} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-1">No active risks positioned in this cell matrix coordinate.</p>
          )}
        </div>
      )}
    </div>
  );
};
