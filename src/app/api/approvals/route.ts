import { NextRequest, NextResponse } from 'next/server';
import { getApprovals, createApproval } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const approvals = getApprovals();
    return NextResponse.json({ success: true, count: approvals.length, approvals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.riskId) {
      return NextResponse.json({ success: false, error: 'Risk ID is required' }, { status: 400 });
    }
    const created = createApproval(body);
    return NextResponse.json({ success: true, approval: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
