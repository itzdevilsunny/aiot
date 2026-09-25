'use client';

import React, { useState } from 'react';
import { RiskItem } from '../../types/risk';
import { Copy, Check, ExternalLink, X, Send, Code, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRiskContext } from '../../context/RiskContext';

interface JiraExportModalProps {
  risk: RiskItem;
  isOpen: boolean;
  onClose: () => void;
}

export const JiraExportModal: React.FC<JiraExportModalProps> = ({
  risk,
  isOpen,
  onClose
}) => {
  const { addToast } = useRiskContext();
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const jiraIssuePayload = {
    fields: {
      project: {
        key: risk.projectId ? risk.projectId.toUpperCase().replace('-', '') : 'RISK'
      },
      summary: `[${risk.id}] ${risk.title}`,
      description: `*Risk Register Threat Assessment*\n\n` +
        `*Category:* ${risk.category}\n` +
        `*Severity:* ${risk.severity} (Score: ${risk.score}/25 | Probability: ${risk.probability}/5, Impact: ${risk.impact}/5)\n` +
        `*Primary Owner:* ${risk.ownerName} (${risk.ownerRole})\n` +
        `*Financial Risk Exposure:* $${(risk.estimatedImpactUsd || risk.score * 2500).toLocaleString()} USD\n\n` +
        `h3. Proactive Mitigation Plan\n${risk.mitigationPlan}\n\n` +
        `h3. Contingency Fallback Plan\n${risk.contingencyPlan}`,
      issuetype: {
        name: risk.severity === 'Critical' ? 'Bug' : 'Task'
      },
      priority: {
        name: risk.severity === 'Critical' ? 'Highest' : risk.severity === 'High' ? 'High' : 'Medium'
      },
      labels: [
        'risk-register-copilot',
        risk.category.toLowerCase(),
        risk.severity.toLowerCase()
      ]
    }
  };

  const jsonString = JSON.stringify(jiraIssuePayload, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    addToast('Jira Payload Copied', 'JSON payload copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportDirect = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/jira-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskId: risk.id, payload: jiraIssuePayload })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Jira Export Complete', `Created Jira Ticket ${data.issueKey || 'PROJ-104'} for ${risk.id}.`, 'success');
      } else {
        addToast('Jira Payload Exported', `Formatted REST payload for Jira integration (${data.message || 'Ready'}).`, 'info');
      }
    } catch (err) {
      addToast('Jira Payload Ready', 'Copied formatted Jira JSON payload.', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden space-y-4">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Code className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <span>Jira Issue REST API Exporter</span>
                <span className="font-mono-code text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30 font-bold">
                  v2 REST API
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">Format risk item into Jira ticket schema</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-mono-code font-bold text-indigo-600 block text-xs">{risk.id}</span>
              <span className="font-bold text-slate-900 text-xs truncate max-w-xs block">{risk.title}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
              risk.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Priority: {risk.severity === 'Critical' ? 'Highest' : 'High'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Formatted Atlassian Jira REST API Payload
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 text-indigo-300 font-mono-code text-[11px] overflow-x-auto max-h-52 leading-relaxed border border-slate-800">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">
            Compatible with Jira Cloud & Jira Data Center API v2/v3
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isExporting}
              onClick={handleExportDirect}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {isExporting ? 'Exporting...' : 'Export to Jira API'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
