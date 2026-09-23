import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt string is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Risk Register Copilot, an enterprise AI Business Operations assistant for MNB Research.
Analyze the user's natural language project threat and return a strict JSON object matching this schema:
{
  "title": "Short descriptive risk title",
  "category": "Technical" | "Resource" | "Financial" | "Schedule" | "Operational" | "Security" | "Compliance" | "External",
  "probability": integer from 1 to 5 (1=Very Low, 5=Almost Certain),
  "impact": integer from 1 to 5 (1=Negligible, 5=Catastrophic),
  "suggestedOwnerName": "Name of assigned lead",
  "suggestedOwnerRole": "Role title of assigned lead",
  "mitigationPlan": "Actionable proactive mitigation strategy paragraph",
  "contingencyPlan": "Actionable fallback contingency plan paragraph",
  "aiConfidence": integer from 85 to 99,
  "estimatedImpactUsd": estimated financial risk in USD
}
Score Interpretation: 1-4 Low, 5-9 Medium, 10-16 High, 17-25 Critical.
Return ONLY valid JSON with no markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Analyze this project risk description:\n"${prompt}"` }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text?.trim() || '';
    
    // Clean json formatting if any
    const cleanJsonText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const data = JSON.parse(cleanJsonText);

    const prob = Math.min(5, Math.max(1, Number(data.probability) || 4));
    const imp = Math.min(5, Math.max(1, Number(data.impact) || 4));
    const score = prob * imp;

    let severity = 'Low';
    if (score >= 17) severity = 'Critical';
    else if (score >= 10) severity = 'High';
    else if (score >= 5) severity = 'Medium';

    return NextResponse.json({
      title: data.title || 'Identified Project Operational Risk',
      description: prompt,
      category: data.category || 'Technical',
      probability: prob,
      impact: imp,
      score,
      severity,
      suggestedOwnerName: data.suggestedOwnerName || 'Sunny Prasad',
      suggestedOwnerRole: data.suggestedOwnerRole || 'Business Operations Intern',
      mitigationPlan: data.mitigationPlan || 'Conduct technical spike and establish monitoring safeguards.',
      contingencyPlan: data.contingencyPlan || 'Activate fallback procedure and trigger manual review.',
      aiConfidence: data.aiConfidence || 95,
      estimatedImpactUsd: data.estimatedImpactUsd || score * 2500
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze risk' }, { status: 500 });
  }
}
