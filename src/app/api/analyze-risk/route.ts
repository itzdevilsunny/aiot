import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let bodyData: any = {};
  try {
    bodyData = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const rawPrompt = bodyData.prompt || (bodyData.title ? `${bodyData.title}${bodyData.description ? ': ' + bodyData.description : ''}` : bodyData.description);
  const prompt = typeof rawPrompt === 'string' ? rawPrompt.trim() : '';

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt, title, or description string is required' }, { status: 400 });
  }

  const systemInstruction = `You are Risk Register Copilot, an enterprise AI Business Operations assistant for MNB Research.
Analyze the user's natural language project threat and return a strict JSON object matching this schema:
{
  "title": "Short descriptive risk title (4-8 words max, tailored specifically to the user prompt)",
  "category": "Technical" | "Resource" | "Financial" | "Schedule" | "Operational" | "Security" | "Compliance" | "External",
  "probability": integer from 1 to 5 (1=Very Low, 5=Almost Certain),
  "impact": integer from 1 to 5 (1=Negligible, 5=Catastrophic),
  "suggestedOwnerName": "Sunny Prasad" | "Yash Raj" | "Ritika" | "Sumit" | "Priya Sharma",
  "suggestedOwnerRole": "Role title matching the assigned owner",
  "mitigationPlan": "Actionable proactive mitigation strategy paragraph tailored directly to this risk",
  "contingencyPlan": "Actionable fallback contingency plan paragraph tailored directly to this risk",
  "aiConfidence": integer from 90 to 99,
  "estimatedImpactUsd": estimated financial risk in USD (integer between 5000 and 150000)
}

Team Context:
- Sunny Prasad: Business Operations Intern & Risk Lead (focus: Technical, Operational, Infrastructure)
- Yash Raj: Operations Lead (focus: Operations, Resilience, External)
- Ritika: Product Manager (focus: Schedule, Product Features, Velocity)
- Sumit: Resource Manager (focus: Resource, Capacity, Workforce)
- Priya Sharma: Compliance & Audit Lead (focus: Compliance, Security, Governance)

Score Interpretation: 1-4 Low, 5-9 Medium, 10-16 High, 17-25 Critical.
Return ONLY valid JSON with no markdown formatting.`;

  // 1. Try Groq Ultra-Fast Qwen AI Engine (Primary - Sub 200ms latency)
  const groqResult = await callGroqAI({
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: `Analyze this project risk description:\n"${prompt}"` }
    ],
    jsonMode: true,
    temperature: 0.2
  });

  if (groqResult.success && groqResult.content) {
    try {
      const data = JSON.parse(groqResult.content);
      if (data && data.title) {
        const prob = Math.min(5, Math.max(1, Number(data.probability) || 3));
        const imp = Math.min(5, Math.max(1, Number(data.impact) || 3));
        const score = prob * imp;

        let severity = 'Low';
        if (score >= 17) severity = 'Critical';
        else if (score >= 10) severity = 'High';
        else if (score >= 5) severity = 'Medium';

        let ownerName = data.suggestedOwnerName || 'Sunny Prasad';
        let ownerRole = data.suggestedOwnerRole || 'Business Operations Intern & Risk Lead';

        return NextResponse.json({
          title: data.title,
          description: prompt,
          category: data.category || 'Operational',
          probability: prob,
          impact: imp,
          score,
          severity,
          suggestedOwnerName: ownerName,
          suggestedOwnerRole: ownerRole,
          mitigationPlan: data.mitigationPlan || 'Conduct technical discovery spike and establish monitoring safeguards.',
          contingencyPlan: data.contingencyPlan || 'Activate fallback procedure and trigger manual review.',
          aiConfidence: data.aiConfidence || 98,
          estimatedImpactUsd: data.estimatedImpactUsd || score * 3000,
          provider: `Groq (${groqResult.model})`
        });
      }
    } catch (parseErr) {
      console.warn('JSON parse error from Groq response:', parseErr);
    }
  }

  // 2. Try Google Gemini Multimodal/Reasoning Engine (Secondary Failover)
  const geminiResult = await callGeminiAI({
    systemInstruction,
    prompt: `Analyze this project risk description:\n"${prompt}"`,
    jsonMode: true,
    temperature: 0.2
  });

  if (geminiResult.success && geminiResult.content) {
    try {
      const data = JSON.parse(geminiResult.content);
      if (data && data.title) {
        const prob = Math.min(5, Math.max(1, Number(data.probability) || 3));
        const imp = Math.min(5, Math.max(1, Number(data.impact) || 3));
        const score = prob * imp;

        let severity = 'Low';
        if (score >= 17) severity = 'Critical';
        else if (score >= 10) severity = 'High';
        else if (score >= 5) severity = 'Medium';

        let ownerName = data.suggestedOwnerName || 'Sunny Prasad';
        let ownerRole = data.suggestedOwnerRole || 'Business Operations Intern & Risk Lead';

        return NextResponse.json({
          title: data.title,
          description: prompt,
          category: data.category || 'Operational',
          probability: prob,
          impact: imp,
          score,
          severity,
          suggestedOwnerName: ownerName,
          suggestedOwnerRole: ownerRole,
          mitigationPlan: data.mitigationPlan || 'Conduct technical discovery spike and establish monitoring safeguards.',
          contingencyPlan: data.contingencyPlan || 'Activate fallback procedure and trigger manual review.',
          aiConfidence: data.aiConfidence || 95,
          estimatedImpactUsd: data.estimatedImpactUsd || score * 3000,
          provider: `Google Gemini (${geminiResult.model})`
        });
      }
    } catch (parseErr) {
      console.warn('JSON parse error from Gemini response:', parseErr);
    }
  }

  // If neither provider succeeded, return an honest HTTP 503 error
  return NextResponse.json(
    {
      error: 'AI risk analysis service temporarily unavailable.',
      details: 'Neither Groq nor Google Gemini returned a valid structured assessment. Please verify API keys and network connectivity.',
      groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed'),
      geminiStatus: geminiResult.error || (geminiResult.success ? 'Invalid structured output' : 'Provider call failed')
    },
    { status: 503 }
  );
}
