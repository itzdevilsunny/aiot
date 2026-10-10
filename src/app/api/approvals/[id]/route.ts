import { NextRequest, NextResponse } from 'next/server';
import { updateApproval } from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, approverName } = body;
    const comments = body.decisionComments || body.comments || '';

    if (status !== 'Approved' && status !== 'Rejected') {
      return NextResponse.json({ success: false, error: 'Status must be Approved or Rejected' }, { status: 400 });
    }

    const updated = updateApproval(id, status, comments, approverName);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Approval request not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, approval: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return PATCH(req, ctx);
}
