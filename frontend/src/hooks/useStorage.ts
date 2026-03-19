import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface StorageDistribution {
    category: string;
    size_GB: number;
    color: string;
    fileCount: number;
}

export interface StorageStats {
    totalCapacity_GB: number;
    usedSpace_GB: number;
    freeSpace_GB: number;
    distribution: StorageDistribution[];
    retentionDays: number;
    totalFiles: number;
}

export interface StorageFile {
    id: string;
    key: string;
    filename: string;
    type: 'video' | 'image' | 'log';
    size_MB: number;
    url: string;
    created_at: string;
}

/** Fetch bucket stats + distribution */
export const useStorageStats = () =>
    useQuery<StorageStats>({
        queryKey: ['storage_stats'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/storage/stats`)).data,
        refetchInterval: 300000,
    });

/** Fetch paginated files with optional type filter */
export const useStorageFiles = (page = 1, limit = 50, type = 'all') =>
    useQuery<{ files: StorageFile[]; total: number }>({
        queryKey: ['storage_files', page, type],
        queryFn: async () =>
            (await axios.get(`${API_BASE}/api/storage/files`, { params: { page, limit, type } })).data,
    });

/** Delete a file by S3 key */
export const useDeleteFile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (key: string) => axios.delete(`${API_BASE}/api/storage/files`, { data: { key } }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['storage_files'] });
            qc.invalidateQueries({ queryKey: ['storage_stats'] });
        },
    });
};

/** Update retention policy */
export const useUpdatePolicy = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (days: number) => axios.put(`${API_BASE}/api/storage/policy`, { days }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['storage_stats'] }),
    });
};
