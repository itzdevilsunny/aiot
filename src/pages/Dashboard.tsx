import React, { useState } from 'react';
import {
    Camera, AlertTriangle, Activity, Shield, Database,
    LayoutDashboard, Video, Settings, Search, Menu,
    MapPin, Server as ServerIcon, ChevronLeft, ChevronRight, CheckCircle2, Lock, Car
} from 'lucide-react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAlertStore } from '../store/useAlertStore';
import NotificationDropdown from '../components/NotificationDropdown';
import AiChatAssistant from '../components/AiChatAssistant';

const MODULE_ORDER = [
    { path: '/dashboard', title: 'Overview' },
    { path: '/dashboard/cameras', title: 'Live Cameras' },
    { path: '/dashboard/geofence', title: 'AI Geofence Zone' },
    { path: '/dashboard/alpr', title: 'ALPR Engine' },
    { path: '/dashboard/reid', title: 'Cross-Camera Re-ID' },
    { path: '/dashboard/alerts', title: 'Anomaly Alerts' },
    { path: '/dashboard/analytics', title: 'Analytics' },
    { path: '/dashboard/map', title: 'Zone Map' },
    { path: '/dashboard/edge', title: 'Edge Nodes' },
    { path: '/dashboard/security', title: 'Security' },
    { path: '/dashboard/storage', title: 'Storage' },
    { path: '/dashboard/settings', title: 'Settings' },
];

export default function DashboardLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const pendingAlertCount = useAlertStore((s) => s.alerts.filter(a => a.status === 'Pending').length);

    const currentIndex = MODULE_ORDER.findIndex((m) => m.path === location.pathname);
    const currentModule = MODULE_ORDER[Math.max(0, currentIndex)];

    const handleBack = () => {
        if (currentIndex > 0) navigate(MODULE_ORDER[currentIndex - 1].path);
    };
    const handleNext = () => {
        if (currentIndex < MODULE_ORDER.length - 1) navigate(MODULE_ORDER[currentIndex + 1].path);
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-50 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#040D21] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Vision<span className="text-blue-500">AIoT</span></span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
                    <SidebarItem icon={<LayoutDashboard />} label="Overview" active={location.pathname === '/dashboard'} path="/dashboard" />
                    <SidebarItem icon={<Video />} label="Live Cameras" active={location.pathname === '/dashboard/cameras'} badge="4" path="/dashboard/cameras" />
                    <SidebarItem icon={<Lock />} label="AI Geofence" active={location.pathname === '/dashboard/geofence'} path="/dashboard/geofence" />
                    <SidebarItem icon={<Car />} label="ALPR Engine" active={location.pathname === '/dashboard/alpr'} path="/dashboard/alpr" />
                    <SidebarItem icon={<Activity />} label="Re-ID Trajectory" active={location.pathname === '/dashboard/reid'} path="/dashboard/reid" />
                    <SidebarItem icon={<AlertTriangle />} label="Anomaly Alerts" active={location.pathname === '/dashboard/alerts'} badge={pendingAlertCount > 0 ? String(pendingAlertCount) : undefined} badgeColor="bg-red-500" path="/dashboard/alerts" />
                    <SidebarItem icon={<Activity />} label="Analytics" active={location.pathname === '/dashboard/analytics'} path="/dashboard/analytics" />
                    <SidebarItem icon={<MapPin />} label="Zone Map" active={location.pathname === '/dashboard/map'} path="/dashboard/map" />

                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4">System</p>
                    <SidebarItem icon={<ServerIcon />} label="Edge Nodes" active={location.pathname === '/dashboard/edge'} badge="3 Active" badgeColor="bg-emerald-500" path="/dashboard/edge" />
                    <SidebarItem icon={<Shield />} label="Security" active={location.pathname === '/dashboard/security'} path="/dashboard/security" />
                    <SidebarItem icon={<Database />} label="Storage" active={location.pathname === '/dashboard/storage'} path="/dashboard/storage" />
                    <SidebarItem icon={<Settings />} label="Settings" active={location.pathname === '/dashboard/settings'} path="/dashboard/settings" />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 w-full bg-slate-900/50 border border-slate-800 rounded-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div className="flex-1 text-left">
                            <p className="text-xs font-bold text-slate-200">System Online</p>
                            <p className="text-[10px] text-slate-400">Public Demo Mode</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative z-0 overflow-y-auto overflow-x-hidden">
                {/* Top Header */}
                <header className="relative z-[100] h-16 border-b border-slate-800 bg-[#040D21]/80 backdrop-blur-md shrink-0 flex items-center justify-between px-4 sm:px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input type="text" placeholder="Search cameras, zones, alerts..." className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 w-64" />
                        </div>
                    </div>

                    {/* Center: Back / Next Module Navigation */}
                    <div className="hidden md:flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-0.5">
                        <button
                            onClick={handleBack}
                            disabled={currentIndex <= 0}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="w-32 text-center text-[11px] font-semibold text-slate-300 truncate px-1.5">
                            {currentModule?.title || 'Dashboard'}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex >= MODULE_ORDER.length - 1}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationDropdown />
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                                AD
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
                                    admin@visionaiot.dev
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Outlet for Nested Routes (DashboardOverview, CameraGrid, etc) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    <Outlet />
                </div>

                {/* Floating AI Chat Assistant */}
                <AiChatAssistant />
            </main>
        </div>
    );
}

// Helper Components
function SidebarItem({ icon, label, active, badge, badgeColor = "bg-blue-500", path = "/dashboard" }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, badgeColor?: string, path?: string }) {
    return (
        <Link to={path} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${active
            ? 'bg-blue-600/10 text-blue-400 border border-slate-700 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
            }`}>
            <div className="flex items-center gap-3">
                <div className={`transition-colors ${active ? 'text-blue-400' : 'text-slate-500'}`}>
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-white' : ''}`}>{label}</span>
            </div>
            {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${badgeColor}`}>{badge}</span>
            )}
        </Link>
    );
}
