'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  MoreVertical
} from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const pathname = usePathname();
  const { risks } = useRiskContext();

  const openRisksCount = risks.filter(r => r.status === 'Open').length;
  const criticalCount = risks.filter(r => r.severity === 'Critical').length;

  const mainNav = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Risk Register', href: '/register', icon: ShieldAlert, badge: openRisksCount },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const workspaceNav = [
    { label: 'My Risks', href: '/my-risks', icon: UserCheck, badge: criticalCount ? `${criticalCount} crit` : undefined },
    { label: 'Team', href: '/team', icon: Users },
  ];

  const systemNav = [
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const renderNavLink = (item: { label: string; href: string; icon: any; badge?: string | number }) => {
    const isActive = pathname === item.href;
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
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">Risk Register</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700 tracking-wide">Copilot</span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium">Enterprise Operations AI</p>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
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
                  AI Risk Analyzer
                </div>
                <div className="text-[10px] text-indigo-600 font-medium">Natural language threats</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main</h3>
            <nav className="space-y-1">
              {mainNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace</h3>
            <nav className="space-y-1">
              {workspaceNav.map(renderNavLink)}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</h3>
            <nav className="space-y-1">
              {systemNav.map(renderNavLink)}
            </nav>
          </div>
        </div>

        {/* User Footer Tile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                  alt="Sunny P."
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate text-left">
                <h4 className="text-xs font-semibold text-slate-900 truncate">Sunny P.</h4>
                <p className="text-[10px] text-slate-600 truncate">Lead Risk Officer</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
