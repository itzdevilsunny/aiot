import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, logAuditEvent } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const riskId = searchParams.get('riskId');
    const actionType = searchParams.get('actionType');

    let logs = getAuditLogs();
    if (riskId) {
      logs = logs.filter(l => l.riskId.toLowerCase() === riskId.toLowerCase());
    }
    if (actionType) {
      logs = logs.filter(l => l.actionType === actionType);
    }

    return NextResponse.json({ success: true, count: logs.length, auditLogs: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = logAuditEvent(body);
    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
