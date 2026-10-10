import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { kris, risks } = await req.json();

    const systemInstruction = `You are a Chief Risk Officer and SRE Reliability Telemetry Specialist for MNB Research.
Perform an AI Early-Warning KRI Telemetry & SLA Breach Anomaly Scan on live metrics and risk data:

Current KRIs:
${JSON.stringify(kris, null, 2)}

Active Risks (${(risks || []).length} items):
${JSON.stringify((risks || []).slice(0, 5), null, 2)}

Provide a strict JSON response with:
1. "overallHealthScore": integer 0-100 (100 = optimal telemetry stability).
2. "anomalyRating": "Low Risk" | "Moderate Anomaly" | "Critical SLA Breach Risk".
3. "executiveSummary": string summarizing telemetry trend and breach risks for leadership (Sunny Prasad, Yash Raj, Ritika).
4. "kriAnalyses": array of objects for each KRI:
   - "kriId": string
   - "predicted30DayValue": number
   - "breachProbability": integer 0-100%
   - "rootCause": string explaining metric behavior
   - "preventiveAction": actionable step-by-step mitigation paragraph
5. "recommendedPlaybookTasks": string[] array of priority tasks to prevent SLA breaches.

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
        if (parsed && parsed.overallHealthScore !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Groq (${groqResult.model})`
          });
        }
      } catch (err) {
        console.warn('Groq KRI Telemetry parse note:', err);
      }
    }

    // If provider call did not succeed, return an honest error
    return NextResponse.json(
      {
        error: 'KRI telemetry predictive analysis service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could generate predictive KRI forecasts.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('KRI Telemetry API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
