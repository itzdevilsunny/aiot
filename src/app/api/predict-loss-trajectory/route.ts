import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { risks, velocity } = await req.json();

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

    // 2. High-Precision Dynamic Fallback Engine
    const baselineExposure = activeRisks.reduce((acc: number, r: any) => acc + (r.estimatedImpactUsd || (r.score * 2500)), 0);
    const v = Number(velocity) || 3;

    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'];
    const trajectory = months.map((month, idx) => {
      const unmitigated = Math.round(baselineExposure * Math.pow(1.02, idx));
      const factor = Math.max(0, 1 - (idx + 1) * (v * 0.08));
      const mitigated = Math.round(baselineExposure * factor);
      return { month, unmitigated, mitigated };
    });

    const categoryTotals: Record<string, number> = {};
    activeRisks.forEach((r: any) => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + (r.estimatedImpactUsd || (r.score * 2500));
    });

    const categoryRadar = Object.entries(categoryTotals).map(([cat, total]) => ({
      category: cat,
      exposure: Math.round(total / 1000)
    }));

    const projectedYearEndExposure = trajectory[11]?.mitigated || 0;
    const netRiskReductionPercent = Math.round(((baselineExposure - projectedYearEndExposure) / (baselineExposure || 1)) * 100);

    return NextResponse.json({
      baselineExposure,
      projectedYearEndExposure,
      netRiskReductionPercent,
      executiveSummary: `12-month trajectory model projects baseline financial risk of $${baselineExposure.toLocaleString()} reducing to $${projectedYearEndExposure.toLocaleString()} at a mitigation velocity of ${v} risks/month. Yields a net risk reduction efficiency of ${netRiskReductionPercent}%.`,
      trajectory,
      categoryRadar,
      provider: 'Dynamic Context Engine'
    });
  } catch (error: any) {
    console.error('Loss Trajectory API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
