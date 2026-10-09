import { NextResponse } from 'next/server';
import { pingSupabase } from '@/lib/supabase/server';
import { getRisks, getControls, getActions, getEvidence, getAuditLogs } from '@/lib/server/db';
import { callGroqAI } from '@/lib/groq';

export async function GET() {
  const startTime = Date.now();

  // 1. Supabase Check
  const supabasePing = await pingSupabase();

  // 2. Groq AI Health
  let groqStatus = 'UNKNOWN';
  try {
    const groqRes = await callGroqAI({
      messages: [{ role: 'user', content: 'ping' }],
      maxTokens: 5
    });
    groqStatus = groqRes.success ? 'CONNECTED' : 'ERROR';
  } catch (e: any) {
    groqStatus = `ERROR: ${e.message}`;
  }

  // 3. Gemini Status
  const geminiKey = process.env.GEMINI_API_KEY;
  let geminiStatus = 'NOT_CONFIGURED';
  if (geminiKey) {
    if (geminiKey.startsWith('AIzaSy')) {
      geminiStatus = 'CONFIGURED_STANDARD_KEY';
    } else {
      geminiStatus = 'CONFIGURED_UNSUPPORTED_TOKEN_FORMAT (Requires AIzaSy... Google AI Studio key)';
    }
  }

  // 4. Persistent DB Engine
  const risks = getRisks();
  const controls = getControls();
  const actions = getActions();
  const evidence = getEvidence();
  const auditLogs = getAuditLogs();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    database: {
      authoritativeSource: supabasePing.ok ? 'SUPABASE_POSTGRESQL' : 'SERVER_PERSISTENT_ENGINE',
      supabase: supabasePing,
      persistentStore: {
        healthy: true,
        totalRisks: risks.length,
        totalControls: controls.length,
        totalActions: actions.length,
        totalEvidence: evidence.length,
        totalAuditLogs: auditLogs.length
      }
    },
    ai: {
      primary: {
        provider: 'Groq (qwen/qwen3.8-27b)',
        status: groqStatus
      },
      secondary: {
        provider: 'Google Gemini (gemini-2.5-flash)',
        status: geminiStatus
      }
    },
    deployment: {
      frontend: 'Vercel (Production)',
      backend: 'Render (Active Engine)',
      environment: process.env.NODE_ENV || 'production'
    }
  });
}
