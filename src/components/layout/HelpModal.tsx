'use client';

import React from 'react';
import { 
  X, 
  HelpCircle, 
  Command, 
  ShieldCheck, 
  SlidersHorizontal, 
  FileText, 
  Sparkles, 
  Network, 
  CheckCircle2 
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Risk Register Copilot User Guide</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MNB Research
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Documentation & Enterprise Operations Manual</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Quick Shortcuts */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-indigo-600" /> Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span>Global Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">⌘ K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span>AI Copilot Chat</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">⌘ /</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span>Close Modals</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">ESC</kbd>
              </div>
            </div>
          </div>

          {/* Module Capabilities */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Key Enterprise Modules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Monte Carlo Simulation
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Run 1,000+ stochastic iterations on <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/simulation</code> to forecast P50 Expected Loss & P90 VaR exposure.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Network className="w-3.5 h-3.5 text-indigo-600" /> Cascading Threat Graph
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Toggle on <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/register</code> to trace downstream chain reactions from root causes to financial loss.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Executive PDF & CSV
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Export C-Suite PDF briefings from the Executive Briefing card or download RFC4180 CSV risk registers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Multimodal Vision & Voice
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upload database error screenshots or speak via microphone to get real-time AI risk analysis.
                </p>
              </div>
            </div>
          </div>

          {/* 5x5 Matrix Reference */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-indigo-950">5×5 Risk Score Formula</h4>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Risk Score = Probability (1–5) × Impact (1–5). Severity categories: <strong>Low (1–4)</strong>, <strong>Medium (5–9)</strong>, <strong>High (10–16)</strong>, <strong>Critical (17–25)</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">MNB Research · Identify. Assess. Mitigate.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
