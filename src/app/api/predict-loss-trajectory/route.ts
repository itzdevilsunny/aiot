import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { risks, velocity } = body;

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      risks = getRisks();
    }

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');

    const systemInstruction = `You are an Enterprise Risk Actuary and Quantitative Financial Modeler for MNB Research.
Perform an AI 12-Month Loss Trajectory & Threat Radar Projection based on live risk telemetry:

Mitigation Velocity: ${velocity || 3} risks resolved per month.
Active Enterprise Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  severity: r.severity,
  score: r.score,
  ownerName: r.ownerName,
  estimatedImpactUsd: r.estimatedImpactUsd || (r.score * 2500)
})), null, 2)}

Provide a strict JSON response with:
1. "baselineExposure": total current baseline financial risk ($ USD integer).
2. "projectedYearEndExposure": estimated year-end loss exposure ($ USD integer) at ${velocity || 3} risks/month resolution velocity.
3. "netRiskReductionPercent": integer 0-100%.
4. "executiveSummary": string summarizing the 12-month financial exposure curve and key threat concentrations for leadership (Sunny Prasad, Yash Raj, Ritika).
5. "trajectory": array of 12 month objects:
   - "month": string ("Month 1" through "Month 12")
   - "unmitigated": number exposure with compound drift
   - "mitigated": number exposure with proactive velocity
6. "categoryRadar": array of category concentration objects:
   - "category": string
   - "exposure": number ($K USD)

Respond ONLY with valid JSON.`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [{ role: 'user', content: systemInstruction }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqResult.success && groqResult.content) {
      try {
        const parsed = JSON.parse(groqResult.content);
        if (parsed && parsed.baselineExposure !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Groq (${groqResult.model})`
          });
        }
      } catch (e) {
        console.warn('Groq Loss Trajectory JSON parse note:', e);
      }
    }

    // 2. Secondary: Google Gemini 3.8 Flash
    const geminiResult = await callGeminiAI({
      prompt: systemInstruction,
      jsonMode: true,
      temperature: 0.2
    });

    if (geminiResult.success && geminiResult.content) {
      try {
        const parsed = JSON.parse(geminiResult.content);
        if (parsed && parsed.baselineExposure !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Google Gemini (${geminiResult.model})`
          });
        }
      } catch (e) {
        console.warn('Gemini Loss Trajectory JSON parse note:', e);
      }
    }

    // If neither provider succeeded, return an honest error
    return NextResponse.json(
      {
        error: 'AI loss trajectory prediction service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could predict financial risk trajectories for the current portfolio.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed'),
        geminiStatus: geminiResult.error || (geminiResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Loss Trajectory API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
