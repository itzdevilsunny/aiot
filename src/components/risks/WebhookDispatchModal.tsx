'use client';

import React, { useState } from 'react';
import { RiskItem } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  BellRing, 
  Send, 
  X, 
  CheckCircle2, 
  Copy, 
  MessageSquare, 
  Globe, 
  ShieldAlert
} from 'lucide-react';

interface WebhookDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem | null;
}

export const WebhookDispatchModal: React.FC<WebhookDispatchModalProps> = ({ isOpen, onClose, risk }) => {
  const { addToast } = useRiskContext();

  const [platform, setPlatform] = useState<'slack' | 'teams' | 'pagerduty' | 'custom'>('slack');
  const [webhookUrl, setWebhookUrl] = useState<string>('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXX────────');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  if (!isOpen || !risk) return null;

  const slackPayload = {
    text: `🚨 *[CRITICAL RISK ALERT]* ${risk.id}: ${risk.title}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🚨 ${risk.id}: ${risk.title}`, emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Category:*\n${risk.category}` },
          { type: 'mrkdwn', text: `*Severity:*\n${risk.severity} (${risk.score}/25)` },
          { type: 'mrkdwn', text: `*Owner:*\n${risk.ownerName}` },
          { type: 'mrkdwn', text: `*Project:*\n${risk.projectName}` }
        ]
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Proactive Mitigation Plan:*\n${risk.mitigationPlan}` }
      }
    ]
  };

  const teamsPayload = {
    type: 'MessageCard',
    context: 'http://schema.org/extensions',
    summary: `Risk Alert: ${risk.id}`,
    themeColor: risk.severity === 'Critical' ? 'FF0000' : 'FF9900',
    title: `🚨 ${risk.id}: ${risk.title}`,
    sections: [
      {
        facts: [
          { name: 'Category', value: risk.category },
          { name: 'Risk Score', value: `${risk.score} / 25 (${risk.severity})` },
          { name: 'Primary Owner', value: risk.ownerName }
        ],
        text: risk.description
      }
    ]
  };

  const currentPayload = platform === 'slack' ? slackPayload : platform === 'teams' ? teamsPayload : slackPayload;
  const jsonPayloadString = JSON.stringify(currentPayload, null, 2);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(jsonPayloadString);
    addToast('Payload Copied', 'JSON Webhook block copied to clipboard.', 'success');
  };

  const handleTestDispatch = () => {
    setIsDispatching(true);
    addToast('Dispatching Webhook Alert', `Sending HTTP POST payload to ${platform.toUpperCase()}...`, 'info');

    setTimeout(() => {
      setIsDispatching(false);
      addToast('Webhook Dispatched Successfully!', `Notification delivered for ${risk.id}.`, 'success');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Live Slack & Teams Webhook Incident Dispatcher
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Risk: <strong className="text-white font-mono">{risk.id}</strong> — {risk.title}
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Platform Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'slack', label: 'Slack Webhook', icon: MessageSquare },
              { id: 'teams', label: 'MS Teams', icon: MessageSquare },
              { id: 'pagerduty', label: 'PagerDuty', icon: ShieldAlert },
              { id: 'custom', label: 'Custom HTTP Endpoint', icon: Globe }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  platform === p.id 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Webhook Endpoint Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Incoming Webhook Target URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* JSON Payload Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Formatted Alert Payload (JSON)</label>
              <button
                onClick={handleCopyPayload}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy JSON
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono rounded-xl bg-slate-900 text-emerald-400 overflow-x-auto max-h-48 border border-slate-800">
              {jsonPayloadString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="copilot"
            size="sm"
            disabled={isDispatching}
            icon={<Send className="w-3.5 h-3.5 text-indigo-200" />}
            onClick={handleTestDispatch}
          >
            {isDispatching ? 'Dispatching Payload...' : `Dispatch Alert to ${platform.toUpperCase()} →`}
          </Button>
        </div>
      </div>
    </div>
  );
};
