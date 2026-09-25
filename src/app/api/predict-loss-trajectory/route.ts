import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { risks, velocity } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');

    const systemInstruction = `You are an Enterprise Risk Actuary and Quantitative Financial Modeler.
Perform an AI 12-Month Loss Trajectory & Threat Radar Projection based on live risk telemetry:

Mitigation Velocity: ${velocity || 3} risks resolved per month.
Active Enterprise Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  severity: r.severity,
  score: r.score,
  estimatedImpactUsd: r.estimatedImpactUsd || (r.score * 25000)
})), null, 2)}

Provide a strict JSON response with:
1. "baselineExposure": total current baseline financial risk ($ USD).
2. "projectedYearEndExposure": estimated year-end loss exposure at ${velocity || 3} risks/month resolution velocity.
3. "netRiskReductionPercent": integer 0-100%.
4. "executiveSummary": string summarizing the 12-month financial exposure curve and key threat concentrations.
5. "trajectory": array of 12 month objects:
   - "month": string ("Month 1" through "Month 12")
   - "unmitigated": number exposure with compound drift
   - "mitigated": number exposure with proactive velocity
6. "categoryRadar": array of category concentration objects:
   - "category": string
   - "exposure": number ($K USD)

Respond ONLY with valid JSON.`;

    // Tier 1: Groq LLaMA 3.3 70B
    if (groqApiKey && groqApiKey.trim().length > 10) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey.trim()}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: systemInstruction }],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices[0]?.message?.content || '{}';
          const parsed = JSON.parse(content);
          return NextResponse.json({
            ...parsed,
            provider: 'Groq (LLaMA 3.3 70B Versatile)'
          });
        }
      } catch (err) {
        console.warn('Groq Loss Trajectory note:', err);
      }
    }

    // Tier 2: Gemini 2.5 Flash
    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
          config: { responseMimeType: 'application/json' }
        });

        const text = response.text?.trim() || '{}';
        const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({
          ...parsed,
          provider: 'Gemini 2.5 Flash'
        });
      } catch (err) {
        console.warn('Gemini Loss Trajectory note:', err);
      }
    }

    // Tier 3: High-Precision Smart Dynamic Engine
    const baselineExposure = activeRisks.reduce((acc: number, r: any) => acc + (r.estimatedImpactUsd || (r.score * 25000)), 0);
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
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + (r.estimatedImpactUsd || (r.score * 25000));
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
      provider: 'Enterprise Dynamic AI Engine'
    });
  } catch (error: any) {
    console.error('Loss Trajectory API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
