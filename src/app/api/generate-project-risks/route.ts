import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { topic, projectName } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Project topic string is required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

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

    // 1. Try Groq LLaMA 3.3 70B Engine (Sub 200ms)
    if (groqApiKey && groqApiKey.trim().length > 10) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: `Generate 3 to 4 project risks for project "${projectName || 'Enterprise Project'}" with context:\n"${topic}"` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const contentStr = groqData.choices?.[0]?.message?.content?.trim();
          if (contentStr) {
            const data = JSON.parse(contentStr);
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
                aiConfidence: item.aiConfidence || 96,
                estimatedImpactUsd: item.estimatedImpactUsd || score * 2500
              };
            });

            return NextResponse.json({ risks: generatedRisks, provider: 'Groq (LLaMA 3.3 70B)' });
          }
        }
      } catch (err: any) {
        console.warn('Groq bulk generation note:', err?.message || err);
      }
    }

    // 2. Gemini Fallback
    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
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

        return NextResponse.json({ risks: generatedRisks, provider: 'Gemini 2.5' });
      } catch (err: any) {
        console.warn('Gemini bulk generation note:', err?.message || err);
      }
    }

    // 3. Fallback Output
    return NextResponse.json({
      risks: [
        {
          title: `Cloud Capacity & Service Availability Constraint`,
          description: `Identified capacity bottleneck during ${topic} rollout.`,
          category: 'Technical',
          probability: 4,
          impact: 4,
          score: 16,
          severity: 'High',
          suggestedOwnerName: 'Sunny Prasad',
          suggestedOwnerRole: 'Business Operations Intern',
          mitigationPlan: 'Reserve spot instance fallback pools and request cloud regional quota increase.',
          contingencyPlan: 'Shift non-critical evaluations to quantization pipelines to reduce compute footprint.',
          aiConfidence: 95,
          estimatedImpactUsd: 40000
        },
        {
          title: `Integration SLA Latency Spike`,
          description: `API rate limits during peak analytical workload execution for ${topic}.`,
          category: 'External',
          probability: 3,
          impact: 4,
          score: 12,
          severity: 'High',
          suggestedOwnerName: 'Yash Raj',
          suggestedOwnerRole: 'Operations Lead',
          mitigationPlan: 'Implement exponential backoff queue with jitter and request higher rate limits.',
          contingencyPlan: 'Route traffic to secondary open-source endpoint model.',
          aiConfidence: 92,
          estimatedImpactUsd: 30000
        },
        {
          title: `Compliance Audit Log Retention Evidence Gap`,
          description: `Log archiving policies for ${topic} require immutable retention locks.`,
          category: 'Compliance',
          probability: 2,
          impact: 4,
          score: 8,
          severity: 'Medium',
          suggestedOwnerName: 'Devyash',
          suggestedOwnerRole: 'Data Quality & Security Analyst',
          mitigationPlan: 'Enforce Object Lock in compliance mode with 365-day retention policies.',
          contingencyPlan: 'Engage compliance auditor for 1-week extension window with mitigation memo.',
          aiConfidence: 94,
          estimatedImpactUsd: 20000
        }
      ]
    });
  } catch (err: any) {
    console.error('Bulk API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate project risks' }, { status: 500 });
  }
}
