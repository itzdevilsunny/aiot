import { NextRequest, NextResponse } from 'next/server';
import { updateAction, deleteAction } from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateAction(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Action not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, action: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = deleteAction(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Action not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Action ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
