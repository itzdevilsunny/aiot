import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers, updateTeamMember } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const teamMembers = getTeamMembers();
    return NextResponse.json({ success: true, count: teamMembers.length, teamMembers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    const updated = updateTeamMember(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, teamMember: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
