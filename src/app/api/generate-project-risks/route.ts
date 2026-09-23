import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { topic, projectName } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Project topic string is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Risk Register Copilot for MNB Research.
Generate an array of 3 to 4 realistic operational project risks based on the user's project context.
Return a strict JSON object matching this schema:
{
  "risks": [
    {
      "title": "Short descriptive risk title",
      "category": "Technical" | "Resource" | "Financial" | "Schedule" | "Operational" | "Security" | "Compliance" | "External",
      "probability": integer from 1 to 5,
      "impact": integer from 1 to 5,
      "suggestedOwnerName": "Name of assigned lead",
      "suggestedOwnerRole": "Role title",
      "mitigationPlan": "Actionable proactive mitigation strategy paragraph",
      "contingencyPlan": "Actionable fallback contingency plan paragraph",
      "aiConfidence": integer from 88 to 98,
      "estimatedImpactUsd": estimated financial risk in USD
    }
  ]
}
Return ONLY valid JSON with no markdown syntax.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Generate 3 to 4 project risks for project "${projectName || 'Enterprise Project'}" with context:\n"${topic}"` }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text?.trim() || '';
    const cleanJsonText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const data = JSON.parse(cleanJsonText);

    const generatedRisks = (data.risks || []).map((item: any, idx: number) => {
      const prob = Math.min(5, Math.max(1, Number(item.probability) || 4));
      const imp = Math.min(5, Math.max(1, Number(item.impact) || 4));
      const score = prob * imp;

      let severity = 'Low';
      if (score >= 17) severity = 'Critical';
      else if (score >= 10) severity = 'High';
      else if (score >= 5) severity = 'Medium';

      return {
        title: item.title || `Operational Risk ${idx + 1}`,
        description: `Identified risk threat for ${projectName || 'Project'}: ${item.title}`,
        category: item.category || 'Technical',
        probability: prob,
        impact: imp,
        score,
        severity,
        suggestedOwnerName: item.suggestedOwnerName || 'Sunny Prasad',
        suggestedOwnerRole: item.suggestedOwnerRole || 'Business Operations Intern',
        mitigationPlan: item.mitigationPlan || 'Implement technical discovery spike and automated validation checks.',
        contingencyPlan: item.contingencyPlan || 'Activate fallback contingency window and execute manual review.',
        aiConfidence: item.aiConfidence || 94,
        estimatedImpactUsd: item.estimatedImpactUsd || score * 2500
      };
    });

    return NextResponse.json({ risks: generatedRisks });
  } catch (err: any) {
    console.error('Gemini Bulk API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate project risks' }, { status: 500 });
  }
}
