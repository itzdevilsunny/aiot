import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://risk-register-copilot.onrender.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetPath = searchParams.get('path') || '/health';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_URL}${targetPath}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ status: 'offline', message: `Render status ${res.status}` }, { status: 200 });
    }

    const data = await res.json().catch(() => ({ status: 'ok' }));
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ status: 'fallback', message: 'Render backend unreachable' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetPath = searchParams.get('path') || '/api/risks';

  try {
    const body = await req.json().catch(() => ({}));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${BACKEND_URL}${targetPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({ success: res.ok }));
    return NextResponse.json(data, { status: res.status || 200 });
  } catch (err: any) {
    return NextResponse.json({ status: 'fallback', success: false }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetPath = searchParams.get('path') || '/api/risks';

  try {
    const body = await req.json().catch(() => ({}));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${BACKEND_URL}${targetPath}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({ success: res.ok }));
    return NextResponse.json(data, { status: res.status || 200 });
  } catch (err: any) {
    return NextResponse.json({ status: 'fallback', success: false }, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetPath = searchParams.get('path') || '/api/risks';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${BACKEND_URL}${targetPath}`, {
      method: 'DELETE',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return NextResponse.json({ success: res.ok }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ status: 'fallback', success: false }, { status: 200 });
  }
}
