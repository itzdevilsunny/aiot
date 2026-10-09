import { NextRequest, NextResponse } from 'next/server';
import { updateControl, deleteControl } from '@/lib/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateControl(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Control not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, control: updated });
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
    const ok = deleteControl(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Control not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Control ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
