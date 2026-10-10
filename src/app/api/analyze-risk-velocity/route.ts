import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { risk } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk object required' }, { status: 400 });
    }

    const prompt = `You are an Enterprise Risk Velocity Analyst for MNB Research. Analyze how quickly this threat will manifest and cascade:
Title: "${risk.title}"
Category: "${risk.category}"
Description: "${risk.description || risk.title}"
Probability: ${risk.probability}/5
Impact: ${risk.impact}/5
Owner: "${risk.ownerName || 'Sunny Prasad'}"

Evaluate the risk velocity category (Explosive <1h, Rapid <24h, Moderate 1-7d, Gradual >30d), estimate time to impact in hours, estimate required time to execute full mitigation in hours, and outline the cascading failure pathway for MNB Research leadership (Sunny Prasad, Yash Raj, Ritika).

Respond ONLY with a valid JSON object matching this structure:
{
  "velocityCategory": "Explosive" | "Rapid" | "Moderate" | "Gradual",
  "timeToImpactHours": integer,
  "estimatedMitigationHours": integer,
  "slaBufferHours": integer (timeToImpactHours - estimatedMitigationHours),
  "slaStatus": "CRITICAL SLA DEFICIT" | "WARNING" | "HEALTHY",
  "cascadePathways": ["Step 1", "Step 2", "Step 3"],
  "recommendedUrgency": "Immediate On-Call Escalation" | "24h Priority Review" | "Standard Review Window"
}`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [{ role: 'user', content: prompt }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqResult.success && groqResult.content) {
      try {
        const parsed = JSON.parse(groqResult.content);
        return NextResponse.json({
          ...parsed,
          source: `Groq (${groqResult.model})`
        });
      } catch (e) {
        console.warn('Groq Risk Velocity parse note:', e);
      }
    }

    // If provider call did not succeed, return an honest error
    return NextResponse.json(
      {
        error: 'Risk velocity analysis service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could compute cascade velocity metrics.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Risk Velocity API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
