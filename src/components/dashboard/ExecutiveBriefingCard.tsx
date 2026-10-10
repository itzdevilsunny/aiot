'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { ShieldCheck, AlertTriangle, RefreshCw, Volume2, VolumeX, Play, Pause, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

export const ExecutiveBriefingCard: React.FC = () => {
  const { risks, addToast } = useRiskContext();
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [briefing, setBriefing] = useState<{
    executiveSummary: string;
    topPriorityActions: string[];
    financialVulnerabilityScore: number;
    governanceRating: string;
  } | null>(null);

  const toggleAudioPlayback = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      addToast('Speech API Note', 'Browser text-to-speech API not supported on this device.', 'warning');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      addToast('Audio Paused', 'Executive voice playback stopped.', 'info');
    } else {
      if (!briefing) return;
      window.speechSynthesis.cancel();

      const textToRead = `${briefing.executiveSummary}. Top strategic priority actions: ${briefing.topPriorityActions.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      addToast('AI Voice Briefing Playing', `Playing executive audio summary at ${speechRate}x speed.`, 'success');
    }
  };

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risks })
      });

      const data = await res.json();

      if (res.ok && data && data.executiveSummary && Array.isArray(data.topPriorityActions)) {
        setBriefing({
          executiveSummary: String(data.executiveSummary),
          topPriorityActions: data.topPriorityActions.map((a: any) => String(a)),
          financialVulnerabilityScore: Number(data.financialVulnerabilityScore) || 60,
          governanceRating: String(data.governanceRating || 'Moderate Exposure')
        });
        addToast('Executive AI Briefing Synthesized', 'Generated executive summary & top priority actions.', 'success');
      } else {
        throw new Error(data?.error || 'Invalid briefing structure');
      }
    } catch (err: any) {
      console.error('Briefing fetch error:', err);
      setBriefing(null);
      addToast('Executive Briefing Unavailable', err?.message || 'AI briefing service is temporarily unavailable. Please retry later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const topActions = briefing?.topPriorityActions || [];

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Executive Risk Briefing
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Quarterly Posture
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Authoritative risk posture synthesis and strategic priority roadmap grounded in register data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {briefing && (
            <button
              onClick={toggleAudioPlayback}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>Listen</span>
                </>
              )}
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={fetchBriefing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {loading ? 'Synthesizing...' : briefing ? 'Refresh Briefing' : 'Generate Briefing'}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {briefing ? (
        <div className="space-y-3 text-xs animate-in fade-in-50">
          {/* Executive Summary Paragraph */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Executive Posture Summary</span>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-xs">{briefing.executiveSummary}</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Vulnerability Index</span>
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono-code">{briefing.financialVulnerabilityScore} / 100</span>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Governance Status</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{briefing.governanceRating}</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Top Priority Actions */}
          {topActions.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Strategic Priority Actions</span>
              <div className="space-y-1.5">
                {topActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-3 px-3.5 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click <strong className="text-slate-700 dark:text-slate-200">Generate Briefing</strong> to synthesize live risk metrics, financial exposure tiers, and strategic priority actions.
          </p>
        </div>
      )}
    </div>
  );
};
