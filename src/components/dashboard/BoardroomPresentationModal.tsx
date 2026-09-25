'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Presentation, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  DollarSign, 
  AlertTriangle,
  Volume2,
  VolumeX,
  Printer
} from 'lucide-react';

interface BoardroomPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoardroomPresentationModal: React.FC<BoardroomPresentationModalProps> = ({ isOpen, onClose }) => {
  const { risks, formatCurrency } = useRiskContext();

  const [slideIndex, setSlideIndex] = useState<number>(0);

  if (!isOpen) return null;

  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => r.severity === 'Critical');
  const highRisks = risks.filter(r => r.severity === 'High');
  const totalExposureUsd = risks.reduce((acc, r) => acc + (r.estimatedImpactUsd || (r.score * 25000)), 0);

  const slides = [
    {
      title: 'Executive Boardroom Overview — Portfolio Exposure',
      subtitle: 'MNB Research Operational Risk Posture & Exposure Summary',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Threats</span>
              <div className="text-3xl font-black text-white font-mono mt-1">{totalRisks} Items</div>
              <span className="text-xs text-slate-400">Monitored across workstreams</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-red-900/60 text-center">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Vulnerabilities</span>
              <div className="text-3xl font-black text-red-400 font-mono mt-1">{criticalRisks.length} Critical</div>
              <span className="text-xs text-red-300">Requires executive attention</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/60 text-center">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Loss Exposure</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{formatCurrency(totalExposureUsd)}</div>
              <span className="text-xs text-emerald-300">Baseline exposure</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-slate-200 leading-relaxed font-medium">
            <strong className="text-indigo-300 block mb-1 uppercase tracking-wider">Executive Posture Summary:</strong>
            MNB Research maintains an active risk posture across technical infrastructure, personnel capacity, and compliance domains. Proactive mitigation plans are deployed with real-time telemetry monitoring.
          </div>
        </div>
      )
    },
    {
      title: 'Top Critical Risk Priority Roadmap',
      subtitle: 'Adversarial Threats Requiring Immediate C-Suite SLA Focus',
      content: (
        <div className="space-y-3 text-xs">
          {criticalRisks.length > 0 ? (
            criticalRisks.slice(0, 4).map((r, idx) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-900 border border-red-900/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-950 px-2.5 py-0.5 rounded">
                      #{idx + 1} {r.id}
                    </span>
                    <h4 className="font-bold text-white text-sm">{r.title}</h4>
                  </div>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">{r.mitigationPlan}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-red-400 text-sm">
                    {formatCurrency(r.estimatedImpactUsd || (r.score * 25000))}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Owner: {r.ownerName}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400">
              No critical risks active. All high-severity threats contained.
            </div>
          )}
        </div>
      )
    }
  ];

  const currentSlide = slides[slideIndex] || slides[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in-50">
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {currentSlide.title}
              </h2>
              <p className="text-xs text-slate-400">
                {currentSlide.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-bold">
              Slide {slideIndex + 1} of {slides.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          {currentSlide.content}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={slideIndex === 0}
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => setSlideIndex(s => Math.max(0, s - 1))}
          >
            Previous Slide
          </Button>

          <Button
            variant="copilot"
            size="sm"
            disabled={slideIndex === slides.length - 1}
            icon={<ChevronRight className="w-4 h-4 text-indigo-200" />}
            onClick={() => setSlideIndex(s => Math.min(slides.length - 1, s + 1))}
          >
            Next Slide →
          </Button>
        </div>
      </div>
    </div>
  );
};
