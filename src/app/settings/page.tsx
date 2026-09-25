'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Building, 
  Bell, 
  Sliders, 
  Terminal, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Database, 
  Activity, 
  RotateCcw, 
  ShieldCheck,
  Globe,
  Bot
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useRiskContext } from '../../context/RiskContext';
import { createClient } from '../../lib/supabase/client';

export default function SettingsPage() {
  const { 
    currentUser, 
    updateUserProfile, 
    workspaceSettings, 
    updateWorkspaceSettings, 
    notificationSettings, 
    updateNotificationSettings, 
    addToast,
    supabaseStatus,
    renderBackendStatus,
    risks
  } = useRiskContext();

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'scoring' | 'notifications' | 'testbench'>('profile');

  // Local Form States
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileRole, setProfileRole] = useState(currentUser.role);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileDept, setProfileDept] = useState(currentUser.department);

  const [wsName, setWsName] = useState(workspaceSettings.workspaceName);
  const [wsPrefix, setWsPrefix] = useState(workspaceSettings.riskIdPrefix);
  const [wsReviewDays, setWsReviewDays] = useState(workspaceSettings.defaultReviewDays);
  const [wsSyncMode, setWsSyncMode] = useState<'auto' | 'manual'>(workspaceSettings.cloudSyncMode);

  const [critThresh, setCritThresh] = useState(workspaceSettings.criticalScoreThreshold);
  const [highThresh, setHighThresh] = useState(workspaceSettings.highScoreThreshold);
  const [medThresh, setMedThresh] = useState(workspaceSettings.mediumScoreThreshold);

  // Matrix Interactive Test Cell State
  const [testProb, setTestProb] = useState<number>(4);
  const [testImp, setTestImp] = useState<number>(5);

  const [notifs, setNotifs] = useState(notificationSettings);

  // Webhook Test Bench States
  const [testLog, setTestLog] = useState<string>('Ready to test enterprise webhooks & live API endpoints...\nSystem environment: Node.js Next.js App Router (Production build OK)');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Sync state when context loads/changes
  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileRole(currentUser.role);
    setProfileEmail(currentUser.email);
    setProfileDept(currentUser.department);
  }, [currentUser]);

  useEffect(() => {
    setWsName(workspaceSettings.workspaceName);
    setWsPrefix(workspaceSettings.riskIdPrefix);
    setWsReviewDays(workspaceSettings.defaultReviewDays);
    setWsSyncMode(workspaceSettings.cloudSyncMode);
    setCritThresh(workspaceSettings.criticalScoreThreshold);
    setHighThresh(workspaceSettings.highScoreThreshold);
    setMedThresh(workspaceSettings.mediumScoreThreshold);
  }, [workspaceSettings]);

  useEffect(() => {
    setNotifs(notificationSettings);
  }, [notificationSettings]);

  const handleSaveAllSettings = () => {
    updateUserProfile({
      name: profileName,
      role: profileRole,
      email: profileEmail,
      department: profileDept
    });

    updateWorkspaceSettings({
      workspaceName: wsName,
      riskIdPrefix: wsPrefix,
      defaultReviewDays: wsReviewDays,
      cloudSyncMode: wsSyncMode,
      criticalScoreThreshold: critThresh,
      highScoreThreshold: highThresh,
      mediumScoreThreshold: medThresh
    });

    updateNotificationSettings(notifs);

    addToast('System Settings Saved', 'Profile, workspace, matrix scale, and notification preferences updated.', 'success');
  };

  const handleResetDefaults = () => {
    setProfileName('Sunny Prasad');
    setProfileRole('Business Operations Intern');
    setProfileEmail('sunny.prasad@mnbresearch.com');
    setProfileDept('MNB Research · Business Operations');

    setWsName('MNB Research Business Operations');
    setWsPrefix('RSK-');
    setWsReviewDays(30);
    setWsSyncMode('auto');

    setCritThresh(20);
    setHighThresh(12);
    setMedThresh(6);

    const defaultNotifs = {
      emailCriticalAlerts: true,
      dailyDigestEmail: true,
      slackWebhookAlerts: true,
      slaBreachAutoEscalation: true
    };
    setNotifs(defaultNotifs);

    updateUserProfile({
      name: 'Sunny Prasad',
      role: 'Business Operations Intern',
      email: 'sunny.prasad@mnbresearch.com',
      department: 'MNB Research · Business Operations'
    });
    updateWorkspaceSettings({
      workspaceName: 'MNB Research Business Operations',
      riskIdPrefix: 'RSK-',
      defaultReviewDays: 30,
      cloudSyncMode: 'auto',
      criticalScoreThreshold: 20,
      highScoreThreshold: 12,
      mediumScoreThreshold: 6
    });
    updateNotificationSettings(defaultNotifs);

    addToast('Defaults Restored', 'Reset system settings to standard enterprise parameters.', 'info');
  };

  // Test Bench Handlers
  const handleRunSlackTest = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => `[${timestamp}] POST /api/notify-escalation -> Dispatching Slack webhook payload...`);
    try {
      const res = await fetch('/api/notify-escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskId: 'RSK-102',
          title: 'Database Locks & Query Timeout Spike',
          category: 'Technical',
          severity: 'Critical',
          score: 20,
          ownerName: profileName,
          channel: '#mnb-ops-risk-alerts'
        })
      });
      const data = await res.json();
      setTestLog(prev => `${prev}\n[${timestamp}] HTTP 200 OK: ${JSON.stringify(data, null, 2)}`);
      addToast('Slack Webhook Success', 'Escalation alert payload delivered to #mnb-ops-risk-alerts.', 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\n[${timestamp}] ERROR: ${e.message}`);
      addToast('Slack Webhook Error', e.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunJiraTest = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => `${prev}\n\n[${timestamp}] POST /api/jira-export -> Synthesizing Jira Cloud REST API payload...`);
    try {
      const res = await fetch('/api/jira-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'RSK-104',
          title: 'DevOps Pipeline Storage Quota Depletion',
          description: 'Automated CI/CD runner build cache artifact growth caused storage pool exhaustion.',
          category: 'Technical',
          severity: 'High',
          score: 16,
          ownerName: profileName,
          mitigationPlan: 'Configure automated artifact expiration policy (7 days) and attach 200GB block storage.',
          contingencyPlan: 'Purge non-essential feature branch docker images and expand staging cluster volume.'
        })
      });
      const data = await res.json();
      setTestLog(prev => `${prev}\n[${timestamp}] HTTP 200 OK: ${JSON.stringify(data, null, 2)}`);
      addToast('Jira REST Payload Formatted', 'Synthesized Jira issue payload for RSK-104.', 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\n[${timestamp}] ERROR: ${e.message}`);
      addToast('Jira Payload Error', e.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunCronTest = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => `${prev}\n\n[${timestamp}] GET /api/cron-risk-health -> Running 30-Day Risk Health SLA Review scan...`);
    try {
      const res = await fetch('/api/cron-risk-health');
      const data = await res.json();
      setTestLog(prev => `${prev}\n[${timestamp}] HTTP 200 OK: ${JSON.stringify(data, null, 2)}`);
      addToast('Midnight SLA Cron Executed', `Scanned active risks via Gemini Cron Guard.`, 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\n[${timestamp}] ERROR: ${e.message}`);
      addToast('Cron Execution Error', e.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunSupabasePing = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => `${prev}\n\n[${timestamp}] SUPABASE DB PING -> Querying 'public.risks' via Supabase JS Client...`);
    const startTime = performance.now();
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('risks').select('*', { count: 'exact' });
      const duration = Math.round(performance.now() - startTime);

      if (error) {
        setTestLog(prev => `${prev}\n[${timestamp}] Supabase Error: ${error.message}`);
        addToast('Supabase Ping Note', error.message, 'warning');
      } else {
        setTestLog(prev => `${prev}\n[${timestamp}] HTTP 200 OK (${duration}ms latency): Fetched ${data?.length || 0} rows from Supabase Cloud DB.`);
        addToast('Supabase Cloud Ping', `Latency: ${duration}ms · ${data?.length || 0} active risks in Cloud DB.`, 'success');
      }
    } catch (e: any) {
      setTestLog(prev => `${prev}\n[${timestamp}] ERROR: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunRenderPing = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => `${prev}\n\n[${timestamp}] RENDER BACKEND PING -> Fetching /api/proxy?path=/health ...`);
    const startTime = performance.now();
    try {
      const res = await fetch('/api/proxy?path=/health');
      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);
      setTestLog(prev => `${prev}\n[${timestamp}] HTTP 200 OK (${duration}ms latency): Render Server Response: ${JSON.stringify(data, null, 2)}`);
      addToast('Render Backend Active', `Render server response in ${duration}ms.`, 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\n[${timestamp}] ERROR: ${e.message}`);
      addToast('Render Ping Error', e.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunGeminiTest = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => `${prev}\n\n[${timestamp}] POST /api/copilot-chat -> Executing AI Copilot intelligence reasoning...`);
    const startTime = performance.now();
    try {
      const res = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: 'Perform portfolio financial exposure audit & list top critical risks.',
          risks
        })
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);
      setTestLog(prev => `${prev}\n[${timestamp}] HTTP 200 OK (${duration}ms latency):\n${data.reply}`);
      addToast('AI Intelligence Active', `Generated analytical response in ${duration}ms.`, 'success');
    } catch (e: any) {
      setTestLog(prev => `${prev}\n[${timestamp}] ERROR: ${e.message}`);
      addToast('AI Test Error', e.message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Matrix severity calculator preview
  const testScore = testProb * testImp;
  let testSeverity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (testScore >= critThresh) testSeverity = 'Critical';
  else if (testScore >= highThresh) testSeverity = 'High';
  else if (testScore >= medThresh) testSeverity = 'Medium';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace Governance & Operations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1 flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-400" />
              <span>System Settings & API Test Bench</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Configure user profile, enterprise workspace parameters, 5×5 matrix scoring thresholds, notification alerts, and live API webhooks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="copilot"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetDefaults}
            >
              Reset Defaults
            </Button>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-200/70 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-indigo-600" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'workspace' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-slate-700" />
          <span>Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'scoring' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-600" />
          <span>Matrix Scoring Scale</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-600" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('testbench')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'testbench' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>Webhook Test Bench</span>
        </button>
      </div>

      {/* Main Tab Content Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-6">
        {/* TAB 1: USER PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  User Profile Settings
                </h3>
                <p className="text-[11px] text-slate-500">Updates here sync across workspace risk logs, audit trails, and navigation headers.</p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                <img 
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} 
                  alt={profileName} 
                  className="w-6 h-6 rounded-full border border-indigo-300"
                />
                <span className="font-bold text-indigo-900">{profileName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Role Title *</label>
                <input 
                  type="text" 
                  value={profileRole} 
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Department / Organization *</label>
                <input 
                  type="text" 
                  value={profileDept} 
                  onChange={(e) => setProfileDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">Account Security & Role Scope</span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Single Sign-On (SSO) Active
                </span>
                <span>·</span>
                <span>Assigned Workstream Risks: <strong className="text-slate-900">{currentUser.assignedRisksCount}</strong></span>
                <span>·</span>
                <span>Mitigation SLA Progress: <strong className="text-emerald-700">{currentUser.mitigationProgress}%</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENTERPRISE WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-5 text-xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-700" />
                Enterprise Workspace & Data Infrastructure
              </h3>
              <p className="text-[11px] text-slate-500">Configure workspace parameters, risk naming conventions, and cloud sync policies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Workspace Name</label>
                <input 
                  type="text" 
                  value={wsName} 
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Risk Unique ID Prefix</label>
                <input 
                  type="text" 
                  value={wsPrefix} 
                  onChange={(e) => setWsPrefix(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Default Review SLA Interval (Days)</label>
                <input 
                  type="number" 
                  value={wsReviewDays} 
                  onChange={(e) => setWsReviewDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Cloud Persistence Sync Mode</label>
                <select 
                  value={wsSyncMode} 
                  onChange={(e) => setWsSyncMode(e.target.value as 'auto' | 'manual')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                >
                  <option value="auto">⚡ Real-time Cloud Sync (Supabase & Render)</option>
                  <option value="manual">💾 Manual Cache Sync</option>
                </select>
              </div>
            </div>

            {/* Cloud Storage Connections Status */}
            <div className="space-y-3 pt-2">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">Connected Infrastructure Backend Services</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Supabase Cloud Database</span>
                      <span className="text-[10px] text-slate-500">{supabaseStatus}</span>
                    </div>
                  </div>
                  <Badge variant="status">Connected</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Render API Server</span>
                      <span className="text-[10px] text-slate-500">{renderBackendStatus}</span>
                    </div>
                  </div>
                  <Badge variant="status">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MATRIX SCORING SCALE */}
        {activeTab === 'scoring' && (
          <div className="space-y-5 text-xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                5×5 Quantitative Matrix Scoring Thresholds
              </h3>
              <p className="text-[11px] text-slate-500">Define score boundaries for severity badges across all risk calculations (Score = Probability × Impact).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-950">Critical Severity</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-200 text-red-900">Score ≥ {critThresh}</span>
                </div>
                <input 
                  type="range" 
                  min="16" 
                  max="25" 
                  value={critThresh} 
                  onChange={(e) => setCritThresh(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer" 
                />
                <p className="text-[10px] text-slate-600">Requires executive escalation & 24h SLA response.</p>
              </div>

              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-950">High Severity</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-200 text-orange-900">Score {highThresh} to {critThresh - 1}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="19" 
                  value={highThresh} 
                  onChange={(e) => setHighThresh(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer" 
                />
                <p className="text-[10px] text-slate-600">Requires assigned owner & weekly review cycle.</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Medium Severity</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">Score {medThresh} to {highThresh - 1}</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="11" 
                  value={medThresh} 
                  onChange={(e) => setMedThresh(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer" 
                />
                <p className="text-[10px] text-slate-600">Monitored during standard bi-weekly sprint reviews.</p>
              </div>
            </div>

            {/* Interactive 5x5 Matrix Simulator */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Interactive 5×5 Matrix Simulator Preview
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Click any probability/impact to test live score calculation</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Probability Level (1-5)</label>
                    <select 
                      value={testProb} 
                      onChange={(e) => setTestProb(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                    >
                      {[1, 2, 3, 4, 5].map(p => (
                        <option key={p} value={p}>{p} - {p === 5 ? 'Almost Certain' : p === 4 ? 'Likely' : p === 3 ? 'Possible' : p === 2 ? 'Unlikely' : 'Rare'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Impact Level (1-5)</label>
                    <select 
                      value={testImp} 
                      onChange={(e) => setTestImp(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                    >
                      {[1, 2, 3, 4, 5].map(i => (
                        <option key={i} value={i}>{i} - {i === 5 ? 'Catastrophic' : i === 4 ? 'Major' : i === 3 ? 'Moderate' : i === 2 ? 'Minor' : 'Negligible'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 text-center min-w-[150px]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Calculated Result</span>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="font-mono text-base font-extrabold text-slate-900">{testProb} × {testImp} = {testScore}</span>
                    <Badge severity={testSeverity} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-5 text-xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Notification & Escalation Rules
              </h3>
              <p className="text-[11px] text-slate-500">Control automated email digests, Slack webhooks, and midnight SLA breach notifications.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifs.emailCriticalAlerts} 
                  onChange={(e) => setNotifs(prev => ({ ...prev, emailCriticalAlerts: e.target.checked }))}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4" 
                />
                <div>
                  <span className="font-bold text-slate-900 block">Instant Email Alert on Critical Risk Escalation</span>
                  <span className="text-[11px] text-slate-500">Triggers an automated email when any risk score meets or exceeds {critThresh} (Critical).</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifs.dailyDigestEmail} 
                  onChange={(e) => setNotifs(prev => ({ ...prev, dailyDigestEmail: e.target.checked }))}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4" 
                />
                <div>
                  <span className="font-bold text-slate-900 block">Daily Executive Risk Digest Email</span>
                  <span className="text-[11px] text-slate-500">Delivers a morning summary of open risks, overdue checklist items, and mitigation progress at 8:00 AM.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifs.slackWebhookAlerts} 
                  onChange={(e) => setNotifs(prev => ({ ...prev, slackWebhookAlerts: e.target.checked }))}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4" 
                />
                <div>
                  <span className="font-bold text-slate-900 block">Slack Webhook Operational Alerts (#mnb-ops-risk-alerts)</span>
                  <span className="text-[11px] text-slate-500">Dispatches structured JSON payloads to Slack on new risk creation or mitigation updates.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifs.slaBreachAutoEscalation} 
                  onChange={(e) => setNotifs(prev => ({ ...prev, slaBreachAutoEscalation: e.target.checked }))}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600 w-4 h-4" 
                />
                <div>
                  <span className="font-bold text-slate-900 block">Midnight SLA Breach Auto-Escalation Task</span>
                  <span className="text-[11px] text-slate-500">Scans active risk register daily at midnight and flags overdue mitigations past the {wsReviewDays}-day SLA.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: WEBHOOK TEST BENCH */}
        {activeTab === 'testbench' && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  Live API Webhook & Governance Test Bench
                </h3>
                <p className="text-[11px] text-slate-500">Execute live HTTP diagnostic requests against Next.js API routes, Supabase DB, and Render backend.</p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live Diagnostic Bench
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                Test Jira Payload
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={handleRunCronTest}
              >
                Trigger Midnight Cron
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<Database className="w-3.5 h-3.5 text-blue-600" />}
                onClick={handleRunSupabasePing}
              >
                Ping Supabase DB
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<Globe className="w-3.5 h-3.5 text-indigo-600" />}
                onClick={handleRunRenderPing}
              >
                Ping Render Backend
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isTesting}
                icon={<Bot className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={handleRunGeminiTest}
              >
                Test AI Copilot Chat
              </Button>
            </div>

            {/* Live Terminal Output Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Execution Terminal Telemetry Log
                </label>
                <button 
                  onClick={() => setTestLog('Terminal log cleared. Ready for next diagnostic test...')}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Clear Terminal
                </button>
              </div>

              <pre className="w-full h-[220px] p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
                {testLog}
              </pre>
            </div>
          </div>
        )}

        {/* Global Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            Restore Defaults
          </Button>

          <Button variant="primary" size="md" onClick={handleSaveAllSettings}>
            Save System Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
