'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Menu, 
  FolderKanban, 
  ChevronDown, 
  Check, 
  Sparkles,
  ShieldCheck,
  X,
  Database
} from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, onOpenCommandMenu }) => {
  const { selectedProjectId, setSelectedProjectId, projects, risks, supabaseStatus } = useRiskContext();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const criticalRisksCount = risks.filter(r => r.severity === 'Critical').length;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Active Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 text-slate-800 transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold">{activeProject ? activeProject.name : 'All Projects Workspace'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showProjectDropdown && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-popover py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Projects
              </div>

              <button
                onClick={() => {
                  setSelectedProjectId('All');
                  setShowProjectDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors ${
                  selectedProjectId === 'All' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>All Projects Workspace</span>
                </div>
                {selectedProjectId === 'All' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>

              <div className="my-1 border-t border-slate-100" />

              {projects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setShowProjectDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                    selectedProjectId === proj.id ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{proj.name}</div>
                    <div className="text-[10px] text-slate-500">{proj.totalRisks} risks • {proj.criticalRisks} critical</div>
                  </div>
                  {selectedProjectId === proj.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Supabase Connection Pill */}
        <div 
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
          title={supabaseStatus}
        >
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Supabase Live</span>
        </div>
      </div>

      {/* Middle: Global Search trigger */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <button
          onClick={onOpenCommandMenu}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/60 border border-slate-200/80 text-slate-500 text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search risks, mitigations, projects, team...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white text-slate-500 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search mobile button */}
        <button
          onClick={onOpenCommandMenu}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {criticalRisksCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-xl bg-white border border-slate-200 shadow-popover py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Copilot & Supabase Alerts
                </h4>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-left">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                    <span className="flex items-center gap-1"><Database className="w-3 h-3 text-emerald-600" /> Supabase Connection</span>
                    <span className="text-[10px] text-emerald-600 font-normal">Active</span>
                  </div>
                  <p className="text-xs text-emerald-950 mt-1 leading-tight font-medium">
                    {supabaseStatus}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-100 text-left">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-red-800">
                    <span>Critical Alert: RSK-104</span>
                    <span className="text-[10px] text-red-500 font-normal">10m ago</span>
                  </div>
                  <p className="text-xs text-red-900 mt-1 leading-tight font-medium">
                    Stripe Webhook Flakiness escalated score to 20 (Critical).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help icon */}
        <button
          onClick={() => alert(`Risk Register Copilot v2.4 Enterprise.\nSupabase Connected: https://nrymxphrspvxhacevvwr.supabase.co`)}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Help & Supabase Info"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-slate-100">
            SP
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden md:inline">Sunny P.</span>
        </div>
      </div>
    </header>
  );
};
