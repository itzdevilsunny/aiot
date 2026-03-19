import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical';
    is_read: boolean;
    created_at: string;
}

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    addLiveNotification: (notification: AppNotification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async () => {
        try {
            const { data } = await axios.get<AppNotification[]>(`${API_BASE}/api/notifications`);
            set({
                notifications: data,
                unreadCount: data.filter((n) => !n.is_read).length,
            });
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    },

    addLiveNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    markAsRead: async (id) => {
        try {
            await axios.put(`${API_BASE}/api/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    },

    markAllAsRead: async () => {
        try {
            await axios.put(`${API_BASE}/api/notifications/read-all`);
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                unreadCount: 0,
            }));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    },
}));
