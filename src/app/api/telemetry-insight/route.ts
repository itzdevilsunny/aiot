import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { GoogleGenAI } from '@google/genai';

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
        provider: 'Groq (qwen/qwen3.8-27b)'
      });
    }

    // 2. Try Gemini fallback if configured with valid key
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.startsWith('AIzaSy')) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        if (response.text) {
          return NextResponse.json({
            insight: response.text.trim(),
            provider: 'Google Gemini (gemini-2.5-flash)'
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini attempt note:', geminiErr);
      }
    }

    return NextResponse.json({
      insight: `Copilot Telemetry: ${criticalCount} critical and ${highCount} high risks active. Prioritize mitigation on ${topRiskTitle}.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
