import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Shield, Key, Users, Activity, Trash2, Plus,
    Lock, Eye, UserCheck, Clock, ExternalLink, Copy,
    AlertTriangle, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InviteUserModal from '../../components/InviteUserModal';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

type Role = 'Admin' | 'Operator' | 'Viewer';
type TabKey = 'users' | 'audit' | 'tokens';

interface SystemUser {
    id: string;
    email: string;
    role: Role;
    created_at: string;
}

interface AuditLog {
    id: string;
    action: string;
    actor_email: string;
    ip_address: string;
    timestamp: string;
}

interface EdgeToken {
    id: string;
    name: string;
    token_prefix: string;
    scopes: string[];
    created_at: string;
    last_used: string | null;
    status: 'active' | 'revoked';
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { key: 'audit', label: 'Audit Trail', icon: <Activity className="w-4 h-4" /> },
    { key: 'tokens', label: 'API & Edge Tokens', icon: <Key className="w-4 h-4" /> },
];

const ROLE_STYLES: Record<Role, { bg: string; text: string; icon: React.ReactNode }> = {
    Admin: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: <Shield className="w-3 h-3" /> },
    Operator: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: <UserCheck className="w-3 h-3" /> },
    Viewer: { bg: 'bg-slate-500/15', text: 'text-slate-400', icon: <Eye className="w-3 h-3" /> },
};

export default function SecurityDashboard() {
    const [activeTab, setActiveTab] = useState<TabKey>('users');
    const queryClient = useQueryClient();

    // ─── Users ──────────────────────────────────────────────────
    const { data: users, isLoading: usersLoading } = useQuery<SystemUser[]>({
        queryKey: ['security_users'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/security/users`)).data,
        enabled: activeTab === 'users',
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => axios.delete(`${API_BASE}/api/security/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security_users'] });
            queryClient.invalidateQueries({ queryKey: ['security_logs'] });
        },
    });

    // ─── Audit Logs ─────────────────────────────────────────────
    const { data: logs, isLoading: logsLoading } = useQuery<AuditLog[]>({
        queryKey: ['security_logs'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/security/logs`)).data,
        enabled: activeTab === 'audit',
        refetchInterval: 5000, // Fetch every 5s for "live" system events
    });

    // ─── Tokens ─────────────────────────────────────────────────
    const { data: tokens, isLoading: tokensLoading } = useQuery<EdgeToken[]>({
        queryKey: ['security_tokens'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/security/tokens`)).data,
        enabled: activeTab === 'tokens',
    });

    const [newlyGeneratedToken, setNewlyGeneratedToken] = useState<string | null>(null);

    const createTokenMutation = useMutation({
        mutationFn: () => axios.post(`${API_BASE}/api/security/tokens`, { name: `CAM-Node-${Math.floor(Math.random() * 100)}`, scopes: ['inference:push', 'heartbeat:send'] }),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['security_tokens'] });
            queryClient.invalidateQueries({ queryKey: ['security_logs'] });
            if (response.data.plain_token) {
                setNewlyGeneratedToken(response.data.plain_token);
            }
        },
    });

    const revokeTokenMutation = useMutation({
        mutationFn: (id: string) => axios.delete(`${API_BASE}/api/security/tokens/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security_tokens'] });
            queryClient.invalidateQueries({ queryKey: ['security_logs'] });
        },
    });

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400 tracking-wider uppercase">Security Center</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Security & Access Control</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage users, review audit logs, and configure edge device authentication.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#040D21] border border-slate-800 rounded-xl p-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.key
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#040D21] border border-slate-800 rounded-2xl overflow-hidden"
                >
                    {activeTab === 'users' && <UsersPanel users={users} loading={usersLoading} onDelete={(id) => deleteUserMutation.mutate(id)} />}
                    {activeTab === 'audit' && <AuditPanel logs={logs} loading={logsLoading} />}
                    {activeTab === 'tokens' && (
                        <TokensPanel
                            tokens={tokens}
                            loading={tokensLoading}
                            onGenerate={() => createTokenMutation.mutate()}
                            onRevoke={(id) => revokeTokenMutation.mutate(id)}
                            isGenerating={createTokenMutation.isPending}
                            generatedToken={newlyGeneratedToken}
                            clearGeneratedToken={() => setNewlyGeneratedToken(null)}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─── Users Panel ────────────────────────────────────────────

function UsersPanel({ users, loading, onDelete }: { users?: SystemUser[]; loading: boolean; onDelete: (id: string) => void }) {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-sm font-bold text-white">Registered Personnel</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">{users?.length ?? 0} accounts in system</p>
                </div>
                <button 
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Invite User
                </button>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading user database..." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="pb-3 pl-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email</th>
                                <th className="pb-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Role</th>
                                <th className="pb-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Joined</th>
                                <th className="pb-3 text-right pr-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((u) => {
                                const role = ROLE_STYLES[u.role];
                                return (
                                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group">
                                        <td className="py-3.5 pl-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700">
                                                    {u.email[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-white">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${role.bg} ${role.text}`}>
                                                {role.icon} {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="py-3.5 text-right pr-3">
                                            <button
                                                onClick={() => onDelete(u.id)}
                                                disabled={u.role === 'Admin'}
                                                className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                                title={u.role === 'Admin' ? 'Cannot revoke admin' : 'Revoke Access'}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <InviteUserModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}

// ─── Audit Log Panel ────────────────────────────────────────

const ACTION_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
    Success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-400' },
    Failed: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' },
    Revoked: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-400' },
    Restart: { icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-400' },
    Updated: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-blue-400' },
    Generated: { icon: <Key className="w-4 h-4" />, color: 'text-purple-400' },
    Registered: { icon: <UserCheck className="w-4 h-4" />, color: 'text-emerald-400' },
    Pushed: { icon: <ExternalLink className="w-4 h-4" />, color: 'text-cyan-400' },
    Offline: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' },
};

function getActionStyle(action: string) {
    for (const [key, style] of Object.entries(ACTION_ICONS)) {
        if (action.includes(key)) return style;
    }
    return { icon: <Activity className="w-4 h-4" />, color: 'text-slate-400' };
}

function AuditPanel({ logs, loading }: { logs?: AuditLog[]; loading: boolean }) {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-sm font-bold text-white">Recent Security Events</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">System-wide activity log — immutable audit trail</p>
            </div>

            {loading ? (
                <LoadingSpinner text="Fetching audit trail..." />
            ) : (
                <div className="space-y-2">
                    {logs?.map((log, i) => {
                        const style = getActionStyle(log.action);
                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ${style.color}`}>
                                    {style.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{log.action}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        <span className="text-slate-400">{log.actor_email}</span>
                                        <span className="mx-1.5">•</span>
                                        <span className="font-mono">{log.ip_address}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(log.timestamp)}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Tokens Panel ───────────────────────────────────────────

function TokensPanel({
    tokens, loading, onGenerate, onRevoke, isGenerating, generatedToken, clearGeneratedToken
}: {
    tokens?: EdgeToken[];
    loading: boolean;
    onGenerate: () => void;
    onRevoke: (id: string) => void;
    isGenerating: boolean;
    generatedToken?: string | null;
    clearGeneratedToken?: () => void;
}) {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-sm font-bold text-white">Edge Device Authentication</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">API keys used by Jetson Nanos to push inference data</p>
                </div>
                {!generatedToken && (
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Generate Token
                    </button>
                )}
            </div>

            {generatedToken && (
                <div className="mb-6 bg-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow-lg shadow-emerald-500/5">
                    <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-2 block">
                        Your Edge Token (Copy this to your Python script)
                    </label>
                    <div className="bg-black p-3 rounded-lg border border-slate-700 font-mono text-xs text-emerald-500 break-all mb-3 relative group">
                        {generatedToken}
                        <button 
                            className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                            onClick={() => navigator.clipboard.writeText(generatedToken)}
                        >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                    <button 
                        onClick={clearGeneratedToken} 
                        className="text-slate-500 text-xs hover:text-white transition-colors underline"
                    >
                        Clear view
                    </button>
                </div>
            )}

            {loading ? (
                <LoadingSpinner text="Loading edge tokens..." />
            ) : (
                <div className="space-y-3">
                    {tokens?.map((token) => (
                        <div
                            key={token.id}
                            className={`flex items-center gap-4 border rounded-xl px-5 py-4 transition-colors ${token.status === 'revoked'
                                    ? 'bg-red-500/5 border-red-500/20 opacity-50'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${token.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                                }`}>
                                <Key className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white">{token.name}</p>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg uppercase ${token.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                                        }`}>
                                        {token.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-mono text-slate-500">{token.token_prefix}</span>
                                    <span className="text-[10px] text-slate-600">
                                        Scopes: {token.scopes.join(', ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-0.5">
                                    <span>Created: {new Date(token.created_at).toLocaleDateString()}</span>
                                    <span>Last used: {token.last_used ? timeAgo(token.last_used) : 'Never'}</span>
                                </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                                    title="Copy Token ID"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                                {token.status === 'active' && (
                                    <button
                                        onClick={() => onRevoke(token.id)}
                                        className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Revoke Token"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Shared Helpers ─────────────────────────────────────────

function LoadingSpinner({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin"></div>
            <span className="text-sm text-slate-500">{text}</span>
        </div>
    );
}

function timeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
