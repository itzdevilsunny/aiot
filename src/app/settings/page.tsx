'use client';

import React, { useState } from 'react';
import { Settings, User, Building, Bell, Sliders, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useRiskContext } from '../../context/RiskContext';

export default function SettingsPage() {
  const { addToast } = useRiskContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'scoring' | 'notifications'>('profile');

  const handleSave = () => {
    addToast('Settings Saved', 'Your system preferences have been updated.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage workspace settings, risk scoring matrix standards, profile, and notification rules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
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
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">User Profile Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" defaultValue="Sunny P." className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                <input type="text" defaultValue="Lead Risk Officer & PM" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" defaultValue="sunny@acme-cloud.io" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input type="text" defaultValue="Enterprise Core Ops" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Enterprise Workspace</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workspace Name</label>
              <input type="text" defaultValue="Enterprise Core Ops Workspace" className="w-full p-2.5 rounded-lg border border-slate-300 font-medium" />
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

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save System Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
