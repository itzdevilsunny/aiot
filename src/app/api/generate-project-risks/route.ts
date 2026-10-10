import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { topic, projectName } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Project topic string is required' }, { status: 400 });
    }

    const systemInstruction = `You are Risk Register Copilot for MNB Research.
Generate an array of 3 to 4 realistic operational project risks based on the user's project context.

Team Context for Suggested Owners:
- Sunny Prasad (Business Operations Intern & Risk Lead - Technical, Operational, Infrastructure)
- Yash Raj (Operations Lead - Financial, External, Governance)
- Ritika (Product Manager - Schedule, Product Features, Velocity)
- Sumit (Resource Manager - Resource, Workforce, Capacity)
- Priya Sharma (Compliance & Audit Lead - Compliance, Security, Audit)

Return a strict JSON object matching this schema:
{
  "risks": [
    {
      "title": "Short descriptive risk title",
      "category": "Technical" | "Resource" | "Financial" | "Schedule" | "Operational" | "Security" | "Compliance" | "External",
      "probability": integer from 1 to 5,
      "impact": integer from 1 to 5,
      "suggestedOwnerName": "Sunny Prasad" | "Yash Raj" | "Ritika" | "Sumit" | "Priya Sharma",
      "suggestedOwnerRole": "Role title",
      "mitigationPlan": "Actionable proactive mitigation strategy paragraph",
      "contingencyPlan": "Actionable fallback contingency plan paragraph",
      "aiConfidence": integer from 88 to 98,
      "estimatedImpactUsd": estimated financial risk in USD
    }
  ]
}
Return ONLY valid JSON with no markdown syntax.`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Generate 3 to 4 project risks for project "${projectName || 'Enterprise Project'}" with context:\n"${topic}"` }
      ],
      jsonMode: true,
      temperature: 0.3
    });

    if (groqResult.success && groqResult.content) {
      try {
        const data = JSON.parse(groqResult.content);
        if (data && Array.isArray(data.risks) && data.risks.length > 0) {
          const generatedRisks = data.risks.map((item: any, idx: number) => {
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
              suggestedOwnerRole: item.suggestedOwnerRole || 'Business Operations Intern & Risk Lead',
              mitigationPlan: item.mitigationPlan || 'Implement technical discovery spike and automated validation checks.',
              contingencyPlan: item.contingencyPlan || 'Activate fallback contingency window and execute manual review.',
              aiConfidence: item.aiConfidence || 96,
              estimatedImpactUsd: item.estimatedImpactUsd || score * 2500
            };
          });

          return NextResponse.json({ risks: generatedRisks, provider: `Groq (${groqResult.model})` });
        }
      } catch (err: any) {
        console.warn('Groq bulk generation parse note:', err?.message || err);
      }
    }

    // 2. Secondary: Google Gemini 3.8 Flash
    const geminiResult = await callGeminiAI({
      prompt: `${systemInstruction}\n\nGenerate 3 to 4 project risks for project "${projectName || 'Enterprise Project'}" with context:\n"${topic}"`,
      jsonMode: true,
      temperature: 0.3
    });

    if (geminiResult.success && geminiResult.content) {
      try {
        const data = JSON.parse(geminiResult.content);
        if (data && Array.isArray(data.risks) && data.risks.length > 0) {
          const generatedRisks = data.risks.map((item: any, idx: number) => {
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
              suggestedOwnerRole: item.suggestedOwnerRole || 'Business Operations Intern & Risk Lead',
              mitigationPlan: item.mitigationPlan || 'Implement technical discovery spike and automated validation checks.',
              contingencyPlan: item.contingencyPlan || 'Activate fallback contingency window and execute manual review.',
              aiConfidence: item.aiConfidence || 96,
              estimatedImpactUsd: item.estimatedImpactUsd || score * 2500
            };
          });

          return NextResponse.json({ risks: generatedRisks, provider: `Google Gemini (${geminiResult.model})` });
        }
      } catch (err: any) {
        console.warn('Gemini bulk generation parse note:', err?.message || err);
      }
    }
    // If neither provider succeeded, return an honest error
    return NextResponse.json(
      {
        error: 'AI bulk risk generation service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini returned structured risk items for this topic.',
        groqStatus: groqResult.error || (groqResult.success ? 'No risks parsed' : 'Provider call failed'),
        geminiStatus: geminiResult.error || (geminiResult.success ? 'No risks parsed' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (err: any) {
    console.error('Bulk API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate project risks' }, { status: 500 });
  }
}
