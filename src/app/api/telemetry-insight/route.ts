import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { criticalCount, highCount, topRiskTitle } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        insight: `Copilot Telemetry: ${criticalCount || 2} critical risks active. Elevating top priority mitigation recommended.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Give a 1-sentence concise enterprise Business Operations executive insight for MNB Research based on these active risk stats:
Critical risks count: ${criticalCount || 2}
High risks count: ${highCount || 3}
Top priority threat: "${topRiskTitle || 'Multi-Region PostgreSQL Database Locks'}"
Format: Keep it under 25 words, professional, data-driven.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 60,
      }
    });

    const text = response.text?.trim() || `Copilot Telemetry: ${criticalCount || 2} critical risks active. Elevating top priority mitigation recommended.`;

    return NextResponse.json({ insight: text });
  } catch (err: any) {
    return NextResponse.json({
      insight: `Copilot Telemetry: Active monitoring on top operational risks.`
    });
  }
}
