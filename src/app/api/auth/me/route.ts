import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('mnb_auth_user')?.value;
    const members = getTeamMembers();

    let user = members[0]; // Default Sunny Prasad
    if (authCookie) {
      const found = members.find(m => m.email.toLowerCase() === authCookie.toLowerCase());
      if (found) {
        user = found;
      }
    }

    return NextResponse.json({
      success: true,
      user,
      isAuthenticated: !!authCookie
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
