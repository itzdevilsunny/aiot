'use client';

import React, { useState } from 'react';
import { RiskItem } from '../../types/risk';
import { ExternalLink, Copy, Check, X, ShieldAlert, Code2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface JiraTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem;
}

export const JiraTicketModal: React.FC<JiraTicketModalProps> = ({ isOpen, onClose, risk }) => {
  const [copied, setCopied] = useState(false);
  const [ticketData, setTicketData] = useState<{
    jiraPayload?: any;
    githubMarkdown?: string;
    githubNewIssueUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/jira-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(risk)
      })
        .then(res => res.json())
        .then(data => setTicketData(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, risk]);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (ticketData?.githubMarkdown) {
      navigator.clipboard.writeText(ticketData.githubMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jira & GitHub Ticket Generator</h3>
              <p className="text-xs text-slate-500">Convert [{risk.id}] into developer issue tickets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Generating Jira & GitHub payloads...</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Jira JSON Preview */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">Jira REST API JSON Payload</label>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-36">
                {JSON.stringify(ticketData?.jiraPayload, null, 2)}
              </pre>
            </div>

            {/* GitHub Issue Markdown Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">GitHub Issue Markdown Template</label>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Markdown!' : 'Copy Markdown'}
                </button>
              </div>
              <textarea
                readOnly
                rows={5}
                value={ticketData?.githubMarkdown || ''}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800"
              />
            </div>

            {/* Direct Links */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Create directly in GitHub repository:</span>
              {ticketData?.githubNewIssueUrl && (
                <a
                  href={ticketData.githubNewIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Open GitHub Issue Form <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
