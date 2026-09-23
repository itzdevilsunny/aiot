import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const risks = body.risks || [];

    const now = new Date();
    
    // Risks that require re-assessment (Critical/High risks or items due soon)
    const overdueRisks = risks.filter((r: any) => {
      if (r.status === 'Mitigated' || r.status === 'Closed') return false;
      if (r.severity === 'Critical' || r.severity === 'High') return true;
      if (r.dueDate) {
        const due = new Date(r.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 7; // Due within 7 days
      }
      return false;
    });

    return NextResponse.json({
      success: true,
      totalAudited: risks.length,
      overdueCount: overdueRisks.length,
      overdueItems: overdueRisks.map((r: any) => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
        ownerName: r.ownerName,
        dueDate: r.dueDate || '30-Day SLA Review'
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
