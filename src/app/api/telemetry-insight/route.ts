import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { criticalCount = 2, highCount = 3, topRiskTitle = 'Payment Gateway Key Exhaustion' } = await req.json();

    const prompt = `Give a 1-sentence concise enterprise Business Operations executive insight for MNB Research based on these active risk stats:
Critical risks count: ${criticalCount}
High risks count: ${highCount}
Top priority threat: "${topRiskTitle}"
Format: Keep it under 25 words, professional, data-driven.`;

    // 1. Try Groq Qwen (Primary AI Engine)
    const groqRes = await callGroqAI({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    if (groqRes.success && groqRes.content) {
      return NextResponse.json({
        insight: groqRes.content.trim(),
        provider: `Groq (${groqRes.model})`
      });
    }

    // 2. Try Gemini fallback (Secondary AI Engine)
    const geminiRes = await callGeminiAI({
      prompt,
      temperature: 0.3
    });

    if (geminiRes.success && geminiRes.content) {
      return NextResponse.json({
        insight: geminiRes.content.trim(),
        provider: `Google Gemini (${geminiRes.model})`
      });
    }

    return NextResponse.json({
      insight: `Copilot Telemetry: ${criticalCount} critical and ${highCount} high risks active. Prioritize mitigation on ${topRiskTitle}.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const prompt = `Give a 1-sentence concise enterprise Business Operations executive insight for MNB Research risk portfolio. Keep it under 25 words, professional, data-driven.`;
    const groqRes = await callGroqAI({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });
    if (groqRes.success && groqRes.content) {
      return NextResponse.json({
        insight: groqRes.content.trim(),
        provider: `Groq (${groqRes.model})`
      });
    }
    const geminiRes = await callGeminiAI({ prompt, temperature: 0.3 });
    if (geminiRes.success && geminiRes.content) {
      return NextResponse.json({
        insight: geminiRes.content.trim(),
        provider: `Google Gemini (${geminiRes.model})`
      });
    }
    return NextResponse.json({
      insight: 'Copilot Telemetry: Risk portfolio within active governance thresholds. Monitor cryptographic key rotation.',
      provider: 'System Telemetry'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
