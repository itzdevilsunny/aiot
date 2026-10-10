import { NextRequest, NextResponse } from 'next/server';
import { getRisks, createRisk, syncFromSupabase, syncRiskToSupabase } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const owner = searchParams.get('owner');
    const search = searchParams.get('search');
    const projectId = searchParams.get('projectId');

    // Ensure authoritative synchronization from Supabase PostgreSQL
    await syncFromSupabase();

    let risks = getRisks();

    if (category && category !== 'All') {
      risks = risks.filter(r => r.category === category);
    }
    if (severity && severity !== 'All') {
      risks = risks.filter(r => r.severity === severity);
    }
    if (status && status !== 'All') {
      risks = risks.filter(r => r.status === status);
    }
    if (owner && owner !== 'All') {
      risks = risks.filter(r => r.ownerName === owner);
    }
    if (projectId && projectId !== 'All') {
      risks = risks.filter(r => r.projectId === projectId);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      risks = risks.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: risks.length,
      risks
    });
  } catch (error: any) {
    console.error('GET /api/risks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ success: false, error: 'Risk title is required' }, { status: 400 });
    }

    const created = createRisk(body);
    // Explicitly persist to authoritative Supabase PostgreSQL
    await syncRiskToSupabase(created);

    return NextResponse.json({
      success: true,
      risk: created
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/risks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
