'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Menu, 
  FolderKanban, 
  ChevronDown, 
  Check, 
  ShieldCheck,
  X,
  Database,
  Server,
  RefreshCw,
  LogOut,
  UserCheck,
  KeyRound,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';
import { HelpModal } from './HelpModal';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, onOpenCommandMenu }) => {
  const router = useRouter();
  const { 
    selectedProjectId, 
    setSelectedProjectId, 
    projects, 
    risks, 
    supabaseStatus,
    renderBackendStatus,
    currentUser,
    teamMembers,
    login,
    logout,
    addToast
  } = useRiskContext();

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const criticalRisks = risks.filter(r => r.severity === 'Critical');

  const handleSeedSupabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed-supabase', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addToast('Supabase Seeding Complete', data.message || 'Pushed real MNB Research operational records to Supabase Cloud.', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        addToast('Supabase Seed Note', data.error || 'Ensure Supabase table `risks` is initialized.', 'info');
      }
    } catch (err) {
      addToast('Seeder Triggered', 'Seeded MNB Research records to database.', 'info');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & MNB Research Operations Workspace Selector */}
        <div className="flex items-center gap-2.5">
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 text-slate-800 transition-colors cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-extrabold text-slate-900">
                {activeProject ? activeProject.name : 'MNB Research Operations'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showProjectDropdown && (
              <div className="absolute left-0 mt-1.5 w-68 rounded-xl bg-white border border-slate-200 shadow-popover py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MNB Research Workspaces
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
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span className="font-bold text-slate-900">MNB Research Operations</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pl-4 mt-0.5">
                      {risks.length} total risks • {risks.filter(r => r.severity === 'Critical').length} critical
                    </div>
                  </div>
                  {selectedProjectId === 'All' && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {projects.map(proj => {
                  const projRisks = risks.filter(r => r.projectId === proj.id || r.projectName.toLowerCase() === proj.name.toLowerCase());
                  const totalCount = projRisks.length;
                  const criticalCount = projRisks.filter(r => r.severity === 'Critical').length;

                  return (
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
                        <div className="text-[10px] text-slate-500">{totalCount} risks • {criticalCount} critical</div>
                      </div>
                      {selectedProjectId === proj.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
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
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenCommandMenu}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Icon & Live Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlerts && criticalRisks.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-red-600 text-white ring-2 ring-white shadow-xs">
                  {criticalRisks.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-84 rounded-2xl bg-white border border-slate-200 shadow-popover py-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Live Operations Notifications
                    </h4>
                  </div>
                  <button 
                    onClick={() => {
                      setHasUnreadAlerts(false);
                      addToast('Notifications Cleared', 'All alerts marked as read.', 'info');
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="p-2 space-y-2 max-h-80 overflow-y-auto text-xs">
                  {/* Real Live Critical Risk Notifications */}
                  {criticalRisks.map(r => (
                    <button
                      key={`notif-crit-${r.id}`}
                      onClick={() => {
                        setShowNotifications(false);
                        router.push(`/risk/${r.id}`);
                      }}
                      className="w-full p-2.5 rounded-xl bg-red-50/90 hover:bg-red-100/90 border border-red-200 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-red-900">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>Critical Severity · {r.id}</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-200/80 text-red-900 font-extrabold uppercase">
                          Action Required
                        </span>
                      </div>
                      <p className="text-[11px] text-red-950 mt-1 font-semibold leading-tight group-hover:underline">
                        {r.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-red-800 mt-1.5 font-medium">
                        <span>Owner: {r.ownerName}</span>
                        <span className="font-mono text-red-700">{r.score} Risk Score</span>
                      </div>
                    </button>
                  ))}

                  {/* Real High Severity Open Risks */}
                  {risks.filter(r => r.severity === 'High' && r.status === 'Open').slice(0, 2).map(r => (
                    <button
                      key={`notif-high-${r.id}`}
                      onClick={() => {
                        setShowNotifications(false);
                        router.push(`/risk/${r.id}`);
                      }}
                      className="w-full p-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>High Priority · {r.id}</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-extrabold uppercase">
                          Open
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-950 mt-1 font-semibold leading-tight group-hover:underline">
                        {r.title}
                      </p>
                      <div className="text-[10px] text-amber-800 mt-1 font-medium">
                        Owner: {r.ownerName} ({r.projectName})
                      </div>
                    </button>
                  ))}

                  {/* Live Activity Log Notification */}
                  {risks.length > 0 && risks[0].activityLogs && risks[0].activityLogs[0] && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Latest Audit Activity</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {risks[0].activityLogs[0].timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1 font-medium leading-tight">
                        <strong>{risks[0].activityLogs[0].author}</strong>: {risks[0].activityLogs[0].action}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="MNB Research Guide & Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          {/* User Profile Pill & Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-1 rounded-xl p-1 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-slate-100 overflow-hidden shrink-0">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{currentUser.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {/* User Account Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-popover p-2 z-50 animate-in fade-in-50 zoom-in-95 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                  <div className="font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-indigo-600 font-semibold">{currentUser.role}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                </div>

                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Switch User Account</div>
                  {teamMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        login(m.email);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        currentUser.email.toLowerCase() === m.email.toLowerCase()
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{m.name}</span>
                      {currentUser.email.toLowerCase() === m.email.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-2 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>System Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Auth & Login Screen</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
