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
    const name = body.name || body.title;
    if (!name) {
      return NextResponse.json({ success: false, error: 'Control name is required' }, { status: 400 });
    }
    const created = createControl({
      ...body,
      name,
      description: body.description || name,
      category: body.category || 'Technical',
      type: body.type || 'Preventive',
      objective: body.objective || name,
      ownerName: body.ownerName || 'Sunny Prasad',
      ownerRole: body.ownerRole || 'Risk Owner',
      implementationStatus: body.implementationStatus || 'Implemented',
      effectiveness: body.effectiveness || (body.effectivenessRating > 70 ? 'Effective' : 'Partially Effective'),
      testStatus: body.testStatus || 'Passed',
      linkedRiskIds: body.linkedRiskIds || []
    });
    return NextResponse.json({ success: true, control: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
