import { NextRequest, NextResponse } from 'next/server';
import { getKRIs, createKRI } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const kris = getKRIs();
    return NextResponse.json({ success: true, count: kris.length, kris });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'KRI name is required' }, { status: 400 });
    }
    const created = createKRI(body);
    return NextResponse.json({ success: true, kri: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
