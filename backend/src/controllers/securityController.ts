import { Request, Response } from 'express';
import { UserModel, AuditLogModel, TokenModel } from '../models';
import mongoose from 'mongoose';

// ─── In-Memory Fallback Stores ──────────────────────────────
// Used when MongoDB is unavailable so the Security dashboard always renders

interface FallbackUser {
    id: string;
    email: string;
    role: 'Admin' | 'Operator' | 'Viewer';
    created_at: string;
}

interface FallbackLog {
    id: string;
    action: string;
    actor_email: string;
    ip_address: string;
    timestamp: string;
}

interface FallbackToken {
    id: string;
    name: string;
    token_prefix: string;
    scopes: string[];
    created_at: string;
    last_used: string | null;
    status: 'active' | 'revoked';
}

const fallbackUsers: FallbackUser[] = [
    { id: 'usr_001', email: 'admin@visionaiot.dev', role: 'Admin', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'usr_002', email: 'operator@visionaiot.dev', role: 'Operator', created_at: new Date(Date.now() - 86400000 * 14).toISOString() },
    { id: 'usr_003', email: 'viewer@hackops.dev', role: 'Viewer', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const fallbackLogs: FallbackLog[] = [
    { id: 'log_001', action: 'New User Invited (operator@visionaiot.dev)', actor_email: 'admin@visionaiot.dev', ip_address: '192.168.1.1', timestamp: new Date(Date.now() - 86400000 * 14).toISOString() },
    { id: 'log_002', action: 'API Token Generated: CAM-Node-04', actor_email: 'admin@visionaiot.dev', ip_address: '192.168.1.1', timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'log_003', action: 'Edge Node CAM-04 authenticated via Edge Token.', actor_email: 'edge-system', ip_address: '192.168.0.4', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'log_004', action: 'ANOMALY_DETECTED: PERSON at CAM-04 (87% confidence)', actor_email: 'SYSTEM/AI', ip_address: '192.168.0.4', timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: 'log_005', action: 'Settings Updated: Confidence Threshold → 0.75', actor_email: 'admin@visionaiot.dev', ip_address: '192.168.1.1', timestamp: new Date(Date.now() - 600000).toISOString() },
];

const fallbackTokens: FallbackToken[] = [
    { id: 'tok_001', name: 'CAM-Node-04', token_prefix: 'viot_sk_3xJ9mK2...', scopes: ['inference:push', 'heartbeat:send'], created_at: new Date(Date.now() - 86400000 * 10).toISOString(), last_used: new Date(Date.now() - 300000).toISOString(), status: 'active' },
    { id: 'tok_002', name: 'CAM-Node-08', token_prefix: 'viot_sk_7pL2nQ8...', scopes: ['inference:push', 'heartbeat:send'], created_at: new Date(Date.now() - 86400000 * 5).toISOString(), last_used: new Date(Date.now() - 120000).toISOString(), status: 'active' },
    { id: 'tok_003', name: 'CAM-Legacy-01', token_prefix: 'viot_sk_0aB4xR1...', scopes: ['inference:push'], created_at: new Date(Date.now() - 86400000 * 60).toISOString(), last_used: null, status: 'revoked' },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── Handlers ───────────────────────────────────────────────

/** GET /api/security/users */
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        if (isDbConnected()) {
            const users = await UserModel.find().sort({ created_at: -1 });
            res.json(users.map(u => ({ ...u.toObject(), id: u._id })));
            return;
        }
    } catch (e) { /* fallback below */ }
    res.json(fallbackUsers);
};

/** POST /api/security/users/invite */
export const inviteUser = async (req: Request, res: Response): Promise<void> => {
    const { email, role } = req.body;
    try {
        if (isDbConnected()) {
            const newUser = new UserModel({ email, role });
            await newUser.save();
            const log = new AuditLogModel({
                action: `New User Invited (${email})`,
                actor_email: 'admin@visionaiot.dev',
                ip_address: req.ip || '0.0.0.0',
            });
            await log.save();
            res.status(201).json({ ...newUser.toObject(), id: newUser._id });
            return;
        }
    } catch (e) { /* fallback below */ }
    
    // In-memory fallback
    const newUser: FallbackUser = {
        id: `usr_${Date.now()}`,
        email: email || 'new@user.dev',
        role: role || 'Viewer',
        created_at: new Date().toISOString(),
    };
    fallbackUsers.push(newUser);
    fallbackLogs.push({
        id: `log_${Date.now()}`,
        action: `New User Invited (${newUser.email})`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.status(201).json(newUser);
};

/** DELETE /api/security/users/:id */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    try {
        if (isDbConnected()) {
            const result = await UserModel.findByIdAndDelete(id);
            if (!result) { res.status(404).json({ error: 'User not found' }); return; }
            const log = new AuditLogModel({
                action: `User Account Revoked (${result.email})`,
                actor_email: 'admin@visionaiot.dev',
                ip_address: req.ip || '0.0.0.0',
            });
            await log.save();
            res.json({ success: true });
            return;
        }
    } catch (e) { /* fallback below */ }

    // In-memory fallback
    const idx = fallbackUsers.findIndex(u => u.id === id);
    if (idx === -1) { res.status(404).json({ error: 'User not found' }); return; }
    const removed = fallbackUsers.splice(idx, 1)[0];
    fallbackLogs.push({
        id: `log_${Date.now()}`,
        action: `User Account Revoked (${removed.email})`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.json({ success: true });
};

/** GET /api/security/logs */
export const getLogs = async (_req: Request, res: Response): Promise<void> => {
    try {
        if (isDbConnected()) {
            const logs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(50);
            res.json(logs.map(l => ({ ...l.toObject(), id: l._id })));
            return;
        }
    } catch (e) { /* fallback below */ }
    // Return fallback sorted newest-first
    res.json([...fallbackLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
};

/** GET /api/security/tokens */
export const getTokens = async (_req: Request, res: Response): Promise<void> => {
    try {
        if (isDbConnected()) {
            const tokens = await TokenModel.find().sort({ created_at: -1 });
            res.json(tokens.map(t => ({ ...t.toObject(), id: t._id })));
            return;
        }
    } catch (e) { /* fallback below */ }
    res.json(fallbackTokens);
};

/** POST /api/security/tokens — Generate new token */
export const createToken = async (req: Request, res: Response): Promise<void> => {
    const { name, scopes } = req.body as { name: string; scopes: string[] };
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'hackops-crew-secret-key-2026';
    const tokenString = jwt.sign({ edge_node: name, scopes }, JWT_SECRET, { expiresIn: '365d' });
    const tokenPrefix = `viot_sk_${tokenString.split('.')[2].substring(0, 10)}...`;

    try {
        if (isDbConnected()) {
            const newToken = new TokenModel({
                name: name || `key-${Date.now()}`,
                token_prefix: tokenPrefix,
                scopes: scopes || ['inference:push'],
            });
            await newToken.save();
            const log = new AuditLogModel({
                action: `API Token Generated: ${newToken.name}`,
                actor_email: 'admin@visionaiot.dev',
                ip_address: req.ip || '0.0.0.0',
            });
            await log.save();
            res.json({ ...newToken.toObject(), id: newToken._id, plain_token: tokenString });
            return;
        }
    } catch (e) { /* fallback below */ }

    // In-memory fallback
    const newToken: FallbackToken = {
        id: `tok_${Date.now()}`,
        name: name || `key-${Date.now()}`,
        token_prefix: tokenPrefix,
        scopes: scopes || ['inference:push'],
        created_at: new Date().toISOString(),
        last_used: null,
        status: 'active',
    };
    fallbackTokens.push(newToken);
    fallbackLogs.push({
        id: `log_${Date.now()}`,
        action: `API Token Generated: ${newToken.name}`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.json({ ...newToken, plain_token: tokenString });
};

/** DELETE /api/security/tokens/:id — Revoke token */
export const revokeToken = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    try {
        if (isDbConnected()) {
            const token = await TokenModel.findById(id);
            if (!token) { res.status(404).json({ error: 'Token not found' }); return; }
            token.status = 'revoked';
            await token.save();
            const log = new AuditLogModel({
                action: `API Token Revoked: ${token.name}`,
                actor_email: 'admin@visionaiot.dev',
                ip_address: req.ip || '0.0.0.0',
            });
            await log.save();
            res.json({ success: true });
            return;
        }
    } catch (e) { /* fallback below */ }

    // In-memory fallback
    const token = fallbackTokens.find(t => t.id === id);
    if (!token) { res.status(404).json({ error: 'Token not found' }); return; }
    token.status = 'revoked';
    fallbackLogs.push({
        id: `log_${Date.now()}`,
        action: `API Token Revoked: ${token.name}`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.json({ success: true });
};
