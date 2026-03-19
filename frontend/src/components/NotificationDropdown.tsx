import { useState, useEffect, useRef } from 'react';
import { useNotificationStore, type AppNotification } from '../store/useNotificationStore';
import { Bell, AlertTriangle, Info, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const ICON_MAP: Record<AppNotification['type'], { icon: React.ReactNode; color: string; bg: string }> = {
    critical: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/15' },
    warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    info: { icon: <Info className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/15' },
};

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold text-white bg-red-500 rounded-full ring-2 ring-[#040D21] leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-96 bg-[#0a1628] border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[999] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsRead()}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
                                    >
                                        <CheckCheck className="w-3 h-3" /> Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto overscroll-contain">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs text-slate-600">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 15).map((notif, i) => {
                                    const style = ICON_MAP[notif.type];
                                    return (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                                            className={`px-4 py-3 border-b border-slate-800/50 flex gap-3 cursor-pointer transition-colors ${notif.is_read ? 'opacity-50 hover:opacity-70' : 'hover:bg-slate-800/30'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                                {style.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-xs font-medium truncate ${notif.is_read ? 'text-slate-400' : 'text-white'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5" />}
                                                </div>
                                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{notif.message}</p>
                                                <p className="text-[9px] text-slate-600 mt-1">{timeAgo(notif.created_at)}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
