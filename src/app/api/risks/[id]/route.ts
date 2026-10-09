import { NextRequest, NextResponse } from 'next/server';
import { getRiskById, updateRisk, deleteRisk } from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const risk = getRiskById(id);
    if (!risk) {
      return NextResponse.json({ success: false, error: 'Risk not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, risk });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { authorName, ...updates } = body;

    const updated = updateRisk(id, updates, authorName);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Risk not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, risk: updated });
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
    const success = deleteRisk(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Risk not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Risk ${id} archived` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
