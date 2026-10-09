import { NextRequest, NextResponse } from 'next/server';
import { deleteEvidence } from '@/lib/server/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = deleteEvidence(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Evidence not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Evidence ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
