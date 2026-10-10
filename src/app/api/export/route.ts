import { NextRequest, NextResponse } from 'next/server';
import { getRisks } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';

    const risks = getRisks();

    if (format === 'json') {
      return new NextResponse(JSON.stringify(risks, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="MNB_Risk_Register_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    // Generate CSV
    const headers = [
      'Risk ID',
      'Title',
      'Category',
      'Severity',
      'Score',
      'Probability',
      'Impact',
      'Status',
      'Owner',
      'Owner Role',
      'Estimated Exposure USD',
      'Mitigation Progress %',
      'Mitigation Strategy',
      'Due Date'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = risks.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.title),
      escapeCsv(r.category),
      escapeCsv(r.severity),
      r.score,
      r.probability,
      r.impact,
      escapeCsv(r.status),
      escapeCsv(r.ownerName),
      escapeCsv(r.ownerRole),
      r.estimatedImpactUsd || (r.score * 3000),
      r.mitigationProgress || 0,
      escapeCsv(r.mitigationPlan),
      escapeCsv(r.dueDate || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="MNB_Risk_Register_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
