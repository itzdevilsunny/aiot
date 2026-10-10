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

    // Automated escalation notification for approval requests
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/notify-escalation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskId: body.riskId,
          title: body.riskTitle || body.riskId,
          eventType: 'APPROVAL_REQUESTED',
          ownerName: body.requestedBy || 'Risk Assessor',
          reason: body.reason || 'Residual risk governance approval requested.'
        })
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true, approval: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
