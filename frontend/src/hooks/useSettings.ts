import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Strict Zod validation schema
export const settingsSchema = z.object({
    systemName: z.string().optional(),
    aiConfidenceThreshold: z.number().optional(),
    activeModel: z.string().optional(),
    enableEmailAlerts: z.boolean().optional(),
    enablePushNotifications: z.boolean().optional(),
    autoAcknowledgeLowSeverity: z.boolean().optional(),
    anomalyThreshold: z.number().optional(),
    storageRetentionDays: z.number().optional(),
    activeSectors: z.array(z.number()).optional(),
    aiModelPrecision: z.enum(['FP16', 'INT8']).optional(),
    notificationEmail: z.string().optional(),
});

export type SystemSettings = z.infer<typeof settingsSchema>;

/** Fetch current live settings */
export const useGetSettings = () =>
    useQuery<SystemSettings>({
        queryKey: ['system_settings'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/settings`)).data,
        refetchOnWindowFocus: false,
    });

/** Persist updated settings */
export const useUpdateSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (newSettings: SystemSettings) =>
            axios.put(`${API_BASE}/api/settings`, newSettings),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['system_settings'] }),
    });
};
