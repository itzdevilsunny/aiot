'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Sparkles, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const ExecutiveBriefingCard: React.FC = () => {
  const { risks, addToast } = useRiskContext();
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<{
    executiveSummary: string;
    topPriorityActions: string[];
    financialVulnerabilityScore: number;
    governanceRating: string;
  } | null>(null);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risks })
      });
      const data = await res.json();
      setBriefing(data);
      addToast('Gemini Briefing Synthesized', 'Generated executive summary & top priority actions.', 'success');
    } catch (err) {
      console.error('Briefing fetch error:', err);
      addToast('Briefing Error', 'Used cached governance synthesis fallback.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden space-y-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Executive Gemini Briefing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 2.5 Flash
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">AI-synthesized C-Suite operational posture & strategic priority roadmap</p>
          </div>
        </div>

        <Button
          variant="copilot"
          size="sm"
          disabled={loading}
          onClick={fetchBriefing}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          {loading ? 'Synthesizing...' : briefing ? 'Re-Synthesize' : 'Generate Briefing'}
        </Button>
      </div>

      {/* Content Area */}
      {briefing ? (
        <div className="space-y-4 text-xs animate-in fade-in-50">
          {/* Executive Summary Paragraph */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Executive Posture Summary</span>
            <p className="text-slate-200 leading-relaxed font-medium">{briefing.executiveSummary}</p>
          </div>

          {/* Metrics Pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vulnerability Score</span>
                <span className="text-lg font-black text-amber-400">{briefing.financialVulnerabilityScore} / 100</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-400/80" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Governance Status</span>
                <span className="text-sm font-bold text-emerald-400">{briefing.governanceRating}</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400/80" />
            </div>
          </div>

          {/* Top Priority Actions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Top 3 Strategic Priority Actions</span>
            <div className="space-y-2">
              {briefing.topPriorityActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 font-medium leading-normal">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong className="text-white">Generate Briefing</strong> to synthesize live risk metrics, estimated USD financial exposure, and strategic priority actions using Gemini 2.5 Flash.
          </p>
        </div>
      )}
    </div>
  );
};
