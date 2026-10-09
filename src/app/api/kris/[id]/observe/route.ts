import { NextRequest, NextResponse } from 'next/server';
import { recordKRIObservation } from '@/lib/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const value = Number(body.value);
    if (isNaN(value)) {
      return NextResponse.json({ success: false, error: 'Valid numerical value is required' }, { status: 400 });
    }

    const updated = recordKRIObservation(id, value, body.note);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'KRI not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, kri: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
