import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, syncFromSupabase } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    await syncFromSupabase();
    const stats = getDashboardStats();
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
