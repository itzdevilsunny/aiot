import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('mnb_auth_token');
  response.cookies.delete('mnb_auth_user');
  return response;
}
