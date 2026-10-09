import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createEvidence } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const description = (formData.get('description') as string) || '';
    const linkedRiskId = (formData.get('linkedRiskId') as string) || undefined;
    const linkedControlId = (formData.get('linkedControlId') as string) || undefined;
    const uploadedBy = (formData.get('uploadedBy') as string) || 'Sunny Prasad';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'evidence');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 12);
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const diskFileName = `${Date.now()}-${hash}-${sanitizedOriginal}`;
    const filePath = path.join(uploadDir, diskFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/evidence/${diskFileName}`;

    const newEvidence = createEvidence({
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      fileUrl: publicUrl,
      linkedRiskId,
      linkedControlId,
      uploadedBy,
      description: description || `Evidence upload: ${file.name}`,
      verificationStatus: 'Pending'
    });

    return NextResponse.json({
      success: true,
      evidence: newEvidence
    }, { status: 201 });

  } catch (error: any) {
    console.error('Upload evidence error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
