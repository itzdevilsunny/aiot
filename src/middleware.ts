import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and health check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname === '/api/health' ||
    pathname === '/api/proxy' ||
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/logout' ||
    pathname === '/api/auth/me'
  ) {
    return NextResponse.next();
  }

  // 2. Validate session token
  const authToken = request.cookies.get('mnb_auth_token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const rawToken = authToken || bearerToken;

  let hasValidAuth = false;
  if (rawToken) {
    try {
      // Decode base64 session token
      const decoded = JSON.parse(Buffer.from(rawToken, 'base64').toString('utf8'));
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
      if (
        decoded &&
        typeof decoded.email === 'string' &&
        decoded.email.includes('@') &&
        typeof decoded.issuedAt === 'number' &&
        Date.now() - decoded.issuedAt < maxAgeMs
      ) {
        hasValidAuth = true;
      }
    } catch {
      hasValidAuth = false;
    }
  }

  // 3. Login page handling: if on /login, allow access freely
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 4. Protected API routes: return 401 Unauthorized if not authenticated
  if (pathname.startsWith('/api/')) {
    if (!hasValidAuth) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Valid MNB Research session required to access operational data.',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 5. Protected pages: redirect to /login if not authenticated
  if (!hasValidAuth) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
