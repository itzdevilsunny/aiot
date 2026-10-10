import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { risks } = await req.json();

    const prompt = `You are Priya Sharma, Lead ISO 27001 Auditor and Chief Information Security Officer for MNB Research. Synthesize an official ISO 27001 Statement of Applicability (SoA) document based on this risk register summary:
Active Risks: ${risks?.length || 0} items.

Generate a structured SoA report containing ISO 27001:2022 control mappings (A.5.15, A.8.8, A.8.12, A.8.16, A.8.20), applicability justifications, implementation status, and auditor sign-off memo for MNB Research leadership (Sunny Prasad, Yash Raj, Ritika).

Respond ONLY with a valid JSON object matching this exact structure:
{
  "soaTitle": "ISO 27001:2022 Statement of Applicability (SoA) & Control Assurance",
  "overview": "Overview paragraph",
  "controls": [
    {
      "controlId": "A.X.Y",
      "name": "Control Title",
      "applicable": true,
      "justification": "Why control is applicable to business risk posture",
      "implementationStatus": "Implemented" | "In Progress" | "Monitored"
    }
  ],
  "auditorMemo": "Official sign-off memo text signed by Priya Sharma (Compliance & Audit Lead)"
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
        console.warn('Groq SoA parse note:', e);
      }
    }

    // If provider call did not succeed, return an honest error
    return NextResponse.json(
      {
        error: 'Statement of Applicability (SoA) generation service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could generate a structured ISO 27001 SoA assessment.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('SoA API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
