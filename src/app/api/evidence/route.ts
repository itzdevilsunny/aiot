import { NextRequest, NextResponse } from 'next/server';
import { getEvidence, createEvidence } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const evidence = getEvidence();
    return NextResponse.json({ success: true, count: evidence.length, evidence });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.fileName) {
      return NextResponse.json({ success: false, error: 'File name is required' }, { status: 400 });
    }
    const created = createEvidence(body);
    return NextResponse.json({ success: true, evidence: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
