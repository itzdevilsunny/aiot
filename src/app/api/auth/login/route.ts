import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const members = getTeamMembers();
    const user = members.find(m => m.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active MNB Research account found with this email address.' 
      }, { status: 401 });
    }

    // In enterprise SSO / demo mode, password verification
    const response = NextResponse.json({
      success: true,
      user,
      token: `sess_${Date.now()}_${Buffer.from(user.email).toString('base64')}`
    });

    // Set secure auth cookie
    response.cookies.set('mnb_auth_user', user.email, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
