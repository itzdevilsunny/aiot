import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { risks, totalBudget } = body;

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      risks = getRisks();
    }

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');

    const systemInstruction = `You are a Chief Financial Officer (CFO) and Enterprise Risk Quantitative Analyst for MNB Research.
Perform an AI Budget Allocation & Return on Investment (ROI) Optimization on live risk data:

Available Capital Budget: $${totalBudget || 25000} USD
Active Enterprise Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  severity: r.severity,
  score: r.score,
  ownerName: r.ownerName,
  estimatedImpactUsd: r.estimatedImpactUsd || (r.score * 25000),
  mitigationProgress: r.mitigationProgress
})), null, 2)}

Provide a strict JSON response with:
1. "optimizedRoi": integer percentage (e.g. 520).
2. "capitalAllocated": number total budget allocated ($ USD).
3. "totalLossAvoided": number total expected financial savings ($ USD).
4. "executiveSummary": string detailing the optimal capital allocation strategy for leadership (Sunny Prasad, Yash Raj, Ritika).
5. "allocations": array of objects:
   - "riskId": string
   - "title": string
   - "recommendedBudget": number
   - "expectedLossAvoided": number
   - "roiPercent": number
   - "priorityRank": number
   - "justification": string paragraph
6. "cfoMemo": official sign-off memo for capital expenditure authorization.

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
        if (parsed && parsed.optimizedRoi !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Groq (${groqResult.model})`
          });
        }
      } catch (err) {
        console.warn('Groq ROI Optimization parse note:', err);
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
        if (parsed && parsed.optimizedRoi !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Google Gemini (${geminiResult.model})`
          });
        }
      } catch (err) {
        console.warn('Gemini ROI Optimization parse note:', err);
      }
    }

    // If neither provider succeeded, return an honest error
    return NextResponse.json(
      {
        error: 'AI budget optimization service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could generate a capital budget optimization plan.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed'),
        geminiStatus: geminiResult.error || (geminiResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('ROI Optimization API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
