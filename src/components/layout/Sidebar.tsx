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
  Sparkles,
  ChevronRight,
  MoreVertical,
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  Check,
  KeyRound,
  Printer,
  Gauge
} from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { risks, currentUser, teamMembers, login, logout } = useRiskContext();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const openRisksCount = risks.filter(r => r.status === 'Open').length;
  const criticalCount = risks.filter(r => r.severity === 'Critical').length;

  const overviewNav = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  ];

  const riskManagementNav = [
    { label: 'Risk Register', href: '/register', icon: ShieldAlert, badge: openRisksCount },
    { label: 'My Risks', href: '/my-risks', icon: UserCheck, badge: criticalCount ? `${criticalCount} crit` : undefined },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Compliance Matrix', href: '/compliance', icon: ShieldCheck },
    { label: 'KRI Telemetry', href: '/kri', icon: Gauge },
    { label: 'Monte Carlo Stress Test', href: '/simulation', icon: SlidersHorizontal },
  ];

  const workspaceNav = [
    { label: 'Team', href: '/team', icon: Users },
  ];

  const systemNav = [
    { label: 'Executive Report', href: '/report', icon: Printer },
    { label: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
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
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
          isActive
            ? 'bg-slate-900 text-white font-semibold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
          <span>{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            isActive 
              ? 'bg-white/20 text-white' 
              : item.label === 'My Risks' && criticalCount > 0 
                ? 'bg-red-100 text-red-700' 
                : 'bg-slate-200 text-slate-700'
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[240px] bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Top Brand Header */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Risk Register</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700 tracking-wide">Copilot</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold truncate">
                MNB Research · Business Operations
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* AI Banner Shortcut */}
          <Link
            href="/add"
            onClick={onCloseMobile}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100/60 border border-indigo-200/60 hover:border-indigo-300 transition-all group shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-indigo-950 flex items-center gap-1">
                  AI Risk Analysis
                </div>
                <div className="text-[10px] text-indigo-600 font-medium">Natural language threats</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Overview</h3>
            <nav className="space-y-1">
              {overviewNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Risk Management</h3>
            <nav className="space-y-1">
              {riskManagementNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Workspace</h3>
            <nav className="space-y-1">
              {workspaceNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">System</h3>
            <nav className="space-y-1">
              {systemNav.map(renderNavLink)}
            </nav>
          </div>
        </div>

        {/* User Footer Tile & Interactive Dropdown Menu */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 relative">
          {showUserDropdown && (
            <div className="absolute bottom-16 left-3 right-3 rounded-2xl bg-white border border-slate-200 shadow-popover p-2 z-50 animate-in fade-in-50 zoom-in-95 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-1.5">
                <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-indigo-600 font-semibold truncate">{currentUser.role}</div>
              </div>

              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">Switch Account</div>
                {teamMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      login(m.email);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentUser.email.toLowerCase() === m.email.toLowerCase()
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                    {currentUser.email.toLowerCase() === m.email.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="my-1.5 border-t border-slate-100" />

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  router.push('/login');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auth & Login Screen</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowUserDropdown(false);
                  router.push('/login');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-2 ring-slate-100">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate text-left">
                <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium truncate">{currentUser.role}</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowUserDropdown(!showUserDropdown);
              }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
