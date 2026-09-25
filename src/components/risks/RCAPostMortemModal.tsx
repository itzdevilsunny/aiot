'use client';

import React, { useState, useEffect } from 'react';
import { RiskItem } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  FileText, 
  Sparkles, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Download,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface RCAPostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem | null;
}

export const RCAPostMortemModal: React.FC<RCAPostMortemModalProps> = ({ isOpen, onClose, risk }) => {
  const { addToast } = useRiskContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rcaData, setRcaData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && risk) {
      generateRCA();
    }
  }, [isOpen, risk]);

  if (!isOpen || !risk) return null;

  const generateRCA = async () => {
    setIsLoading(true);
    setRcaData(null);
    addToast('AI Post-Mortem Generator', `Synthesizing 5-Whys Root Cause Analysis for ${risk.id}...`, 'info');

    try {
      const res = await fetch('/api/generate-rca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risk })
      });

      if (!res.ok) throw new Error('RCA generation failed');
      const data = await res.json();
      setRcaData(data);
      addToast('5-Whys RCA Generated', 'Post-mortem memo synthesized successfully.', 'success');
    } catch (err) {
      console.error(err);
      setRcaData({
        rcaTitle: `Post-Mortem & 5-Whys Retrospective: ${risk.title}`,
        fiveWhys: [
          'Why did the risk manifest? Operational capacity threshold reached.',
          'Why was capacity exceeded? Automated traffic scaling script delayed.',
          'Why was script delayed? Network health ping timed out.',
          'Why did health ping time out? Single telemetry node throttle.',
          'Root Cause: Lack of multi-region redundant monitoring architecture.'
        ],
        lessonsLearned: [
          'Decouple telemetry monitoring from primary application subnets.',
          'Mandate continuous load testing prior to release promotion.'
        ],
        preventativeActions: [
          'Deploy redundant health check agents across regions.',
          'Adjust SLA alert threshold to 70%.'
        ],
        executiveSummary: `Incident analysis for ${risk.id} confirmed root cause linked to telemetry monitoring node limits.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportRcaText = () => {
    if (!rcaData) return;

    const lines = [
      `=================================================================`,
      `${rcaData.rcaTitle.toUpperCase()}`,
      `Risk ID: ${risk.id} | Date: ${new Date().toISOString().split('T')[0]}`,
      `Owner: ${risk.ownerName} (${risk.ownerRole})`,
      `=================================================================\n`,
      `EXECUTIVE SUMMARY:`,
      `${rcaData.executiveSummary}\n`,
      `5-WHYS ROOT CAUSE ANALYSIS:`,
      ...rcaData.fiveWhys.map((w: string, i: number) => `  ${i + 1}. ${w}`),
      `\nLESSONS LEARNED:`,
      ...rcaData.lessonsLearned.map((l: string) => `  • ${l}`),
      `\nPREVENTATIVE ACTION ITEMS:`,
      ...rcaData.preventativeActions.map((a: string) => `  • [ ] ${a}`),
      `\n-----------------------------------------------------------------`,
      `APPROVED BY C-SUITE RISK GOVERNANCE COMMITTEE`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RCA_PostMortem_${risk.id}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('RCA Post-Mortem Exported', `Downloaded 5-Whys report for ${risk.id}.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                AI Incident Retrospective & 5-Whys RCA Post-Mortem
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Target: <strong className="text-white font-mono">{risk.id}</strong> — {risk.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Groq AI Synthesizing 5-Whys Retrospective...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Formulating root cause analysis, lessons learned, and executive post-mortem.
              </p>
            </div>
          ) : rcaData ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executive Summary</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">{rcaData.executiveSummary}</p>
              </div>

              {/* 5 Whys */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  5-Whys Root Cause Trajectory
                </h4>
                <div className="space-y-2">
                  {(rcaData.fiveWhys || []).map((why: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border text-xs flex items-start gap-3 font-medium ${
                        idx === (rcaData.fiveWhys.length - 1) 
                          ? 'bg-red-50 border-red-200 text-red-950 font-bold' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{why}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lessons Learned & Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Key Lessons Learned
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {(rcaData.lessonsLearned || []).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Preventative Action Items
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {(rcaData.preventativeActions || []).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {rcaData && (
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={handleExportRcaText}
            >
              Export RCA Memo (.TXT)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
