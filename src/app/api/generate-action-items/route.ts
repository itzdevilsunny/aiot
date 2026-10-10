import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { 
      riskId = 'RSK-101', 
      title = 'Operational Risk Threat', 
      category = 'Operational', 
      description = '', 
      mitigationPlan = '',
      ownerName = 'Risk Lead',
      existingChecklist = []
    } = await req.json();

    const existingTitles = existingChecklist.map((c: any) => c.title || c).join(', ');

    const systemPrompt = `You are an expert Chief Risk Officer and Operations Lead for MNB Research.
Your goal is to generate 3 to 4 HIGHLY SPECIFIC, PRACTICAL, NON-REPEATING mitigation execution tasks for this specific risk.

RISK PROFILE:
- ID: [${riskId}]
- Title: "${title}"
- Category: ${category}
- Description: "${description || 'None provided'}"
- Mitigation Strategy: "${mitigationPlan || 'None provided'}"
- Assigned Owner: ${ownerName}

CURRENT EXISTING TASKS (DO NOT DUPLICATE THESE):
${existingTitles || 'None'}

RULES:
1. Return strictly 3-4 distinct, actionable operational tasks directly relevant to this specific risk.
2. DO NOT output generic boilerplate tasks (e.g. DO NOT say "Conduct security vulnerability audit" unless this is a cybersecurity risk).
3. DO NOT repeat any of the existing tasks listed above.
4. Keep each task title concise (6 to 14 words), direct, and execution-oriented.
5. Return JSON format with a single key "tasks" containing an array of strings.

Example format:
{
  "tasks": [
    "Configure automated OCR data pipeline to parse client tax verification docs",
    "Establish 24-hour SLA agreement with third-party verification vendor",
    "Train tier-2 onboarding coordinators on manual exception escalation runbook"
  ]
}`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b) with jsonMode
    const groqRes = await callGroqAI({
      messages: [{ role: 'user', content: systemPrompt }],
      jsonMode: true,
      temperature: 0.3
    });

    if (groqRes.success && groqRes.content) {
      try {
        const parsed = JSON.parse(groqRes.content);
        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          return NextResponse.json({
            success: true,
            provider: `Groq (${groqRes.model})`,
            tasks: parsed.tasks
          });
        }
      } catch (err) {
        console.warn('JSON parse error from Groq action items:', err);
      }
    }

    // 2. Secondary: Gemini Fallback
    const geminiRes = await callGeminiAI({
      prompt: systemPrompt,
      temperature: 0.3,
      jsonMode: true
    });

    if (geminiRes.success && geminiRes.content) {
      try {
        const parsed = JSON.parse(geminiRes.content);
        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          return NextResponse.json({
            success: true,
            provider: `Google Gemini (${geminiRes.model})`,
            tasks: parsed.tasks
          });
        }
      } catch (err) {}
    }

    // Dynamic smart fallback tailored to category (never repeating the same 3 strings)
    const categoryDefaults: Record<string, string[]> = {
      Schedule: [
        `Deploy automated document extraction validation pipeline for ${title}`,
        `Establish 48-hour SLA escalation thresholds with onboarding vendors`,
        `Designate dedicated onboarding coordinator for enterprise tier accounts`
      ],
      Technical: [
        `Implement circuit breaker and retry policies across upstream API endpoints`,
        `Establish automated real-time latency alarms in cloud monitoring dashboard`,
        `Execute disaster recovery failover drill and validate cold-standby node sync`
      ],
      Financial: [
        `Execute weekly variance reconciliations against approved departmental budget limits`,
        `Formalize multi-currency treasury hedging guidelines with finance leadership`,
        `Configure real-time transaction fee anomalies and automated audit alarms`
      ]
    };

    const fallbackTasks = categoryDefaults[category] || [
      `Formulate step-by-step mitigation runbook tailored for ${title}`,
      `Conduct stakeholder alignment review with ${ownerName} and action assignees`,
      `Establish weekly progress milestones to track residual risk reduction`
    ];

    return NextResponse.json({
      success: true,
      provider: 'Rule-Based Smart Generator',
      tasks: fallbackTasks
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error?.message || 'Failed to generate action items',
      tasks: []
    }, { status: 500 });
  }
}
