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
    const fileName = body.fileName || body.title;
    if (!fileName) {
      return NextResponse.json({ success: false, error: 'File name is required' }, { status: 400 });
    }
    const created = createEvidence({
      ...body,
      fileName,
      fileType: body.fileType || body.type || 'application/pdf',
      fileSize: body.fileSize || 1024 * 128,
      fileUrl: body.fileUrl || `/evidence/${encodeURIComponent(fileName)}`,
      uploadedBy: body.uploadedBy || 'Sunny Prasad',
      description: body.description || fileName,
      verificationStatus: body.verificationStatus || 'Verified',
      linkedRiskId: body.linkedRiskId || (Array.isArray(body.linkedRiskIds) ? body.linkedRiskIds[0] : undefined),
      linkedControlId: body.linkedControlId || body.controlCode,
      validityExpiryDate: body.validityExpiryDate || '2027-12-31'
    });
    return NextResponse.json({ success: true, evidence: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
