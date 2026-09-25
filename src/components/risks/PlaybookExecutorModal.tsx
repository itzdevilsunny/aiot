'use client';

import React, { useState } from 'react';
import { RiskItem } from '../../types/risk';
import { ShieldAlert, CheckCircle2, AlertTriangle, Send, X, Play, Zap, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRiskContext } from '../../context/RiskContext';

interface PlaybookExecutorModalProps {
  risk: RiskItem;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaybookExecutorModal: React.FC<PlaybookExecutorModalProps> = ({
  risk,
  isOpen,
  onClose
}) => {
  const { addToast } = useRiskContext();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  if (!isOpen) return null;

  const runbookSteps = [
    `Declare incident level for [${risk.id}] "${risk.title}" & page owner (${risk.ownerName}).`,
    `Isolate impacted sub-system boundaries and apply fallback feature flags.`,
    `Execute contingency plan: "${risk.contingencyPlan || 'Activate secondary replica pool.'}"`,
    `Verify error metric stabilization and notify Slack #operations-alerts channel.`
  ];

  const handleToggleStep = (stepIdx: number) => {
    if (completedSteps.includes(stepIdx)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepIdx));
    } else {
      setCompletedSteps([...completedSteps, stepIdx]);
    }
  };

  const handleTriggerAutomatedRunbook = async () => {
    setIsExecuting(true);
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog([`[${timestamp}] Initiating automated contingency execution runbook for ${risk.id}...`]);

    setTimeout(() => {
      setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Paging primary owner ${risk.ownerName} (${risk.ownerRole})...`]);
    }, 600);

    setTimeout(() => {
      setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Applying fallback feature flags to isolate failing code path...`]);
    }, 1200);

    setTimeout(() => {
      setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triggering Slack webhook escalation alert to #operations-alerts...`]);
      setCompletedSteps([0, 1, 2, 3]);
      setIsExecuting(false);
      addToast('Contingency Runbook Complete', `Executed emergency protocol for ${risk.id}.`, 'success');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden space-y-4">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <span>Incident Response Runbook</span>
                <span className="font-mono-code text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 font-bold">
                  {risk.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 truncate max-w-md">{risk.title}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Contingency Plan Highlight Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Target Contingency Plan</span>
            <p className="text-amber-950 font-medium leading-relaxed">{risk.contingencyPlan}</p>
          </div>

          {/* Step-by-Step Runbook Checklist */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Step-by-Step Operational Runbook Execution
            </span>

            <div className="space-y-2">
              {runbookSteps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleStep(idx)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium'
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automated Execution Log Terminal */}
          {executionLog.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono-code text-[11px] space-y-1 max-h-32 overflow-y-auto">
              {executionLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 font-mono-code">
            Progress: {completedSteps.length} / {runbookSteps.length} Steps Completed
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="copilot"
              size="sm"
              disabled={isExecuting}
              onClick={handleTriggerAutomatedRunbook}
              icon={<Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />}
            >
              {isExecuting ? 'Executing Runbook...' : 'Automate Runbook'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
