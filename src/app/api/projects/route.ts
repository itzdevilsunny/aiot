import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const projects = getProjects();
    return NextResponse.json({ success: true, count: projects.length, projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Project name is required' }, { status: 400 });
    }
    const created = createProject(body);
    return NextResponse.json({ success: true, project: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
