import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '../../../lib/supabase/client';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY missing' }, { status: 500 });
    }

    const supabase = createClient();
    const { data: risks, error } = await supabase.from('risks').select('*');

    if (error || !risks) {
      return NextResponse.json({ error: 'Failed to fetch risks from Supabase' }, { status: 500 });
    }

    const unmitigatedCritical = risks.filter(r => r.severity === 'Critical' && r.status !== 'Mitigated' && r.status !== 'Closed');

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the Chief Risk Officer AI Cron Guard at MNB Research.
Perform a midnight automated risk health audit on the following unmitigated critical risks:
${unmitigatedCritical.map(r => `- [${r.id}] ${r.title} (P:${r.probability} x I:${r.impact} = Score ${r.score}) Owner: ${r.owner_name}`).join('\n')}

Generate a JSON response:
1. "auditStatus": "PASSED" or "ACTION_REQUIRED"
2. "healthSummary": A 2-sentence midnight health summary.
3. "escalationsTriggered": Count of critical items needing escalation.
4. "recommendedMitigationPriority": String naming top priority item.

Return valid JSON without markdown code fences.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const cleanText = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
    let auditResult;
    try {
      auditResult = JSON.parse(cleanText);
    } catch {
      auditResult = {
        auditStatus: unmitigatedCritical.length > 0 ? 'ACTION_REQUIRED' : 'PASSED',
        healthSummary: `Midnight automated audit identified ${unmitigatedCritical.length} unmitigated critical risks requiring SLA escalation.`,
        escalationsTriggered: unmitigatedCritical.length,
        recommendedMitigationPriority: unmitigatedCritical[0]?.title || 'None'
      };
    }

    // Log to Supabase Audit Logs
    await supabase.from('risk_audit_logs').insert([{
      risk_id: 'SYSTEM-CRON',
      action_type: 'ESCALATION',
      actor_name: 'Midnight AI Health Guard',
      actor_role: 'Automated Cron Engine',
      changes_summary: `Midnight Audit: ${auditResult.healthSummary}`,
      new_data: auditResult
    }]);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cronStatus: 'SUCCESS',
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
