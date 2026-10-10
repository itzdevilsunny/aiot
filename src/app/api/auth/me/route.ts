import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({
        success: false,
        isAuthenticated: false,
        user: null
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
