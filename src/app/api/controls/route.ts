import { NextRequest, NextResponse } from 'next/server';
import { getControls, createControl } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const controls = getControls();
    return NextResponse.json({ success: true, count: controls.length, controls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Control name is required' }, { status: 400 });
    }
    const created = createControl(body);
    return NextResponse.json({ success: true, control: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
