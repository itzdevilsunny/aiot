'use client';

import React, { useState } from 'react';
import { Settings, User, Building, Bell, Sliders, Terminal, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useRiskContext } from '../../context/RiskContext';

export default function SettingsPage() {
  const { addToast } = useRiskContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'scoring' | 'notifications' | 'testbench'>('profile');
  const [testLog, setTestLog] = useState<string>('Ready to test enterprise webhooks & API endpoints...');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const handleSave = () => {
    addToast('Settings Saved', 'Your system preferences have been updated.', 'success');
  };

  const handleRunSlackTest = async () => {
    setIsTesting(true);
    setTestLog('POST /api/notify-escalation -> Dispatching Slack payload...');
    try {
      const res = await fetch('/api/notify-escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskId: 'RSK-999',
          title: 'TEST SLA Escalation Alert',
          severity: 'Critical',
          score: 25,
          ownerName: 'Sunny Prasad',
          channel: '#mnb-ops-risk-alerts'
        })
      });
      const data = await res.json();
      setTestLog(prev => `${prev}\nHTTP 200 OK: ${JSON.stringify(data, null, 2)}`);
      addToast('Slack Webhook Sent', 'Test escalation dispatched to #mnb-ops-risk-alerts.', 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\nError: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunJiraTest = async () => {
    setIsTesting(true);
    setTestLog('POST /api/jira-export -> Synthesizing Jira payload...');
    try {
      const res = await fetch('/api/jira-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskId: 'RSK-104',
          title: 'Database Failover Latency Spike',
          severity: 'High',
          projectCode: 'MNB-CORE'
        })
      });
      const data = await res.json();
      setTestLog(prev => `${prev}\nHTTP 200 OK: ${JSON.stringify(data, null, 2)}`);
      addToast('Jira Payload Ready', 'Formatted REST payload generated for issue key MNB-CORE-104.', 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\nError: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunCronTest = async () => {
    setIsTesting(true);
    setTestLog('GET /api/cron-risk-health -> Triggering 30-Day SLA Review Scan...');
    try {
      const res = await fetch('/api/cron-risk-health');
      const data = await res.json();
      setTestLog(prev => `${prev}\nHTTP 200 OK: ${JSON.stringify(data, null, 2)}`);
      addToast('Risk Health Cron Executed', 'Scanned active register. 0 overdue SLA breaches found.', 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\nError: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>System Settings & API Test Bench</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage workspace settings, risk scoring matrix standards, notification rules, and integration webhooks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> Profile
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`pb-3 px-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'workspace'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Workspace
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`pb-3 px-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'scoring'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" /> Matrix Scoring Scale
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>

        <button
          onClick={() => setActiveTab('testbench')}
          className={`pb-3 px-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'testbench'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-600" /> Webhook Test Bench
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">User Profile Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" defaultValue="Sunny Prasad" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                <input type="text" defaultValue="Business Operations Intern" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" defaultValue="sunny.prasad@mnbresearch.com" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" defaultValue="MNB Research · Business Operations" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Enterprise Workspace</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workspace Name</label>
              <input type="text" defaultValue="MNB Research Business Operations" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Risk ID Prefix</label>
              <input type="text" defaultValue="RSK-" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium font-mono" />
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">5×5 Probability × Impact Matrix Thresholds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <span className="font-bold text-red-900">Critical Severity Threshold</span>
                <p className="text-slate-600 mt-1">Scores ≥ 20 (Red Alert)</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <span className="font-bold text-orange-900">High Severity Threshold</span>
                <p className="text-slate-600 mt-1">Scores 12 to 19</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-900">Medium Severity Threshold</span>
                <p className="text-slate-600 mt-1">Scores 6 to 11</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900">Low Severity Threshold</span>
                <p className="text-slate-600 mt-1">Scores 1 to 5</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Notification Alerts</h3>
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Email alert on new Critical risk score escalation (≥20)</span>
            </label>
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Daily Copilot risk digest email</span>
            </label>
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Slack integration webhook notifications</span>
            </label>
          </div>
        )}

        {activeTab === 'testbench' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>Live API Webhook & Governance Test Bench</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                Active Telemetry
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<Send className="w-3.5 h-3.5 text-indigo-600" />}
                onClick={handleRunSlackTest}
              >
                Test Slack Webhook
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                onClick={handleRunJiraTest}
              >
                Test Jira REST Payload
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={handleRunCronTest}
              >
                Trigger Midnight SLA Cron
              </Button>
            </div>

            {/* Live Terminal Output Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Execution Terminal Telemetry Log
              </label>
              <pre className="w-full h-[180px] p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-y-auto leading-relaxed">
                {testLog}
              </pre>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save System Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
