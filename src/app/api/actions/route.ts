import { NextRequest, NextResponse } from 'next/server';
import { getActions, createAction } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const actions = getActions();
    return NextResponse.json({ success: true, count: actions.length, actions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Action title is required' }, { status: 400 });
    }
    const created = createAction(body);
    return NextResponse.json({ success: true, action: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
