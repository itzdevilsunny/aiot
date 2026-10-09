import { NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks, logAuditEvent } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const allRisks = getRisks();
    const unmitigatedCritical = allRisks.filter(
      r => r.severity === 'Critical' && r.status !== 'Mitigated' && r.status !== 'Closed'
    );

    const prompt = `You are the Chief Risk Officer AI Cron Guard at MNB Research.
Perform an automated risk health audit on the following unmitigated critical risks:
${unmitigatedCritical.map(r => `- [${r.id}] ${r.title} (P:${r.probability} x I:${r.impact} = Score ${r.score}) Owner: ${r.ownerName || 'Unassigned'}`).join('\n')}

Generate a JSON response:
1. "auditStatus": "PASSED" or "ACTION_REQUIRED"
2. "healthSummary": A 2-sentence health summary.
3. "escalationsTriggered": Count of critical items needing escalation.
4. "recommendedMitigationPriority": String naming top priority item.

Return valid JSON without markdown code fences.`;

    let auditResult: any = null;
    let providerName = 'Groq (qwen/qwen3.8-27b)';

    // 1. Try Groq Qwen (Primary)
    const groqRes = await callGroqAI({
      messages: [{ role: 'user', content: prompt }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqRes.success && groqRes.content) {
      try {
        auditResult = JSON.parse(groqRes.content);
      } catch (e) {
        console.warn('Groq parse note:', e);
      }
    }

    // 2. Try Gemini (Secondary)
    if (!auditResult) {
      const geminiRes = await callGeminiAI({
        prompt,
        jsonMode: true,
        temperature: 0.2
      });
      if (geminiRes.success && geminiRes.content) {
        try {
          auditResult = JSON.parse(geminiRes.content);
          providerName = `Google Gemini (${geminiRes.model})`;
        } catch (geminiErr) {
          console.warn('Gemini parse note:', geminiErr);
        }
      }
    }

    if (!auditResult) {
      auditResult = {
        auditStatus: unmitigatedCritical.length > 0 ? 'ACTION_REQUIRED' : 'PASSED',
        healthSummary: `Automated audit identified ${unmitigatedCritical.length} unmitigated critical risks requiring SLA escalation.`,
        escalationsTriggered: unmitigatedCritical.length,
        recommendedMitigationPriority: unmitigatedCritical[0]?.title || 'None'
      };
      providerName = 'Deterministic Scoring Engine';
    }

    // Log to Immutable Audit Ledger
    logAuditEvent({
      riskId: unmitigatedCritical[0]?.id || 'SYSTEM-CRON',
      actionType: 'UPDATE',
      actorName: 'AI Risk Health Guard',
      actorRole: 'Automated Cron Engine',
      changesSummary: `Health Audit: ${auditResult.healthSummary} (${providerName})`,
      newData: auditResult
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cronStatus: 'SUCCESS',
      provider: providerName,
      auditResult
    });

  } catch (err: any) {
    console.error('Cron health error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
