'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  FolderKanban, 
  BarChart3, 
  UserCheck, 
  Users, 
  Settings, 
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  Check,
  Printer,
  Gauge,
  Network,
  FileCheck,
  CheckSquare,
  FileText,
  Clock,
  ClipboardList,
  Plus
} from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { risks, controls, actions, evidence, approvals, currentUser, teamMembers, login, logout } = useRiskContext();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const openRisksCount = risks.filter(r => r.status === 'Open').length;
  const criticalCount = risks.filter(r => r.severity === 'Critical').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const overdueActionsCount = actions.filter(a => a.status !== 'Completed' && new Date(a.dueDate) < new Date()).length;

  const overviewNav = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  ];

  const riskManagementNav = [
    { label: 'Risk Register', href: '/register', icon: ShieldAlert, badge: openRisksCount },
    { label: 'My Risks', href: '/my-risks', icon: UserCheck, badge: criticalCount ? `${criticalCount}` : undefined },
    { label: 'Mitigation Actions', href: '/actions', icon: CheckSquare, badge: overdueActionsCount ? `${overdueActionsCount}` : undefined },
  ];

  const governanceNav = [
    { label: 'Controls', href: '/controls', icon: ShieldCheck, badge: controls.length },
    { label: 'Reviews & Approvals', href: '/approvals', icon: Clock, badge: pendingApprovalsCount ? `${pendingApprovalsCount}` : undefined },
    { label: 'Evidence Library', href: '/evidence', icon: FileText, badge: evidence.length },
    { label: 'Audit Trail', href: '/audit-logs', icon: ClipboardList },
  ];

  const monitoringNav = [
    { label: 'KRI Telemetry', href: '/kri', icon: Gauge },
    { label: 'Analytics & Heatmap', href: '/analytics', icon: BarChart3 },
    { label: 'Threat Surface', href: '/threat-surface', icon: ShieldAlert },
    { label: 'Scenario Simulation', href: '/simulation', icon: SlidersHorizontal },
  ];

  const administrationNav = [
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Compliance Matrix', href: '/compliance', icon: FileCheck },
    { label: 'Executive Report', href: '/report', icon: Printer },
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const renderNavLink = (item: { label: string; href: string; icon: any; badge?: string | number }) => {
    const isActive = pathname === item.href || (item.href === '/register' && pathname === '/risks');
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          isActive
            ? 'bg-slate-900 text-white font-semibold dark:bg-indigo-600 dark:text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            isActive 
              ? 'bg-white/20 text-white' 
              : item.label === 'Mitigation Actions' && overdueActionsCount > 0
                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                : item.label === 'Reviews & Approvals' && pendingApprovalsCount > 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : item.label === 'My Risks' && criticalCount > 0 
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Top Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Risk Register</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tracking-wide border border-slate-200 dark:border-slate-700">Copilot</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                MNB Research · Enterprise ERM
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Overview</h3>
            <nav className="space-y-0.5">
              {overviewNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Risk Management</h3>
            <nav className="space-y-0.5">
              {riskManagementNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Governance</h3>
            <nav className="space-y-0.5">
              {governanceNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Monitoring</h3>
            <nav className="space-y-0.5">
              {monitoringNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Administration</h3>
            <nav className="space-y-0.5">
              {administrationNav.map(renderNavLink)}
            </nav>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          {/* Active Cloud Engine Telemetry */}
          <div className="px-2.5 py-1.5 bg-white dark:bg-slate-950/70 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Render API
            </span>
            <span className="text-[9px] text-slate-500 truncate max-w-[95px]" title="risk-register-copilot-1.onrender.com">
              copilot-1.onrender
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors text-left"
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.role}</div>
              </div>
            </button>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Sign Out Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Role Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute bottom-16 left-3 right-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Role / Profile
              </div>
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => {
                    login(member.id);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    currentUser.id === member.id ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-semibold">{member.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{member.role}</div>
                  </div>
                  {currentUser.id === member.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
