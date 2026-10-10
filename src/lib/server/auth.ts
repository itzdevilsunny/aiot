import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers } from './db';
import { TeamMember } from '../../types/risk';

const SESSION_SECRET = process.env.AUTH_SECRET || 'mnb_erm_enterprise_secure_token_salt_2026';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  issuedAt: number;
}

export function createSessionToken(user: TeamMember): string {
  const payload: SessionData = {
    userId: user.id,
    email: user.email.toLowerCase(),
    role: user.role,
    issuedAt: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const parsed = JSON.parse(raw) as SessionData;
    if (!parsed.email || !parsed.issuedAt) return null;
    
    // Sessions valid for 7 days
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.issuedAt > maxAgeMs) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAuthenticatedUser(req: NextRequest): TeamMember | null {
  // Check auth header first (Bearer token)
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Fallback to cookie
  if (!token) {
    token = req.cookies.get('mnb_auth_token')?.value || null;
  }

  const cookieUser = req.cookies.get('mnb_auth_user')?.value;

  if (token) {
    const session = verifySessionToken(token);
    if (session) {
      const members = getTeamMembers();
      return members.find(m => m.email.toLowerCase() === session.email.toLowerCase()) || null;
    }
  }

  if (cookieUser) {
    const members = getTeamMembers();
    return members.find(m => m.email.toLowerCase() === cookieUser.toLowerCase()) || null;
  }

  return null;
}

export function requireAuth(req: NextRequest): { user: TeamMember } | { errorResponse: NextResponse } {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json({
        success: false,
        error: 'Unauthorized: Active MNB Research authentication required.',
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    };
  }
  return { user };
}

export function requireRole(req: NextRequest, allowedRoles: string[]): { user: TeamMember } | { errorResponse: NextResponse } {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult;
  }

  const { user } = authResult;
  const hasRole = allowedRoles.some(r => 
    user.role.toLowerCase().includes(r.toLowerCase()) || 
    (user.userRole && user.userRole.toLowerCase().includes(r.toLowerCase()))
  );

  if (!hasRole) {
    return {
      errorResponse: NextResponse.json({
        success: false,
        error: `Forbidden: Access requires one of roles: [${allowedRoles.join(', ')}].`,
        code: 'FORBIDDEN'
      }, { status: 403 })
    };
  }

  return { user };
}
