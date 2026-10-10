import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { risk } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk details missing' }, { status: 400 });
    }

    const prompt = `You are an Adversarial Enterprise Security Auditor and Red-Teamer for MNB Research. Stress-test this risk item:
Title: "${risk.title}"
Category: "${risk.category}"
Description: "${risk.description || risk.title}"
Current Likelihood (1-5): ${risk.probability || 3}
Current Impact (1-5): ${risk.impact || 3}
Owner: "${risk.ownerName || 'Sunny Prasad'}"

Provide an aggressive red-team audit evaluation. Identify blind spots, challenge current rating if underestimated, and formulate a 3-tier defense strategy (Preventative, Detective, Corrective).

Respond ONLY with a valid JSON object matching this structure:
{
  "blindSpots": ["string vulnerability 1", "string vulnerability 2", "string vulnerability 3"],
  "challengedLikelihood": 1-5 integer,
  "challengedImpact": 1-5 integer,
  "challengedScore": integer (challengedLikelihood * challengedImpact),
  "strategies": {
    "preventative": ["action 1", "action 2", "action 3"],
    "detective": ["action 1", "action 2", "action 3"],
    "corrective": ["action 1", "action 2", "action 3"]
  }
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
        console.warn('Groq Red-Team parse note:', e);
      }
    }

    // If provider call did not succeed, return an honest error
    return NextResponse.json(
      {
        error: 'AI red-team threat challenge service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could challenge risk mitigation assumptions.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Red-Team API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
