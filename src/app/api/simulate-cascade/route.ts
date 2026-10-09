import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { triggerRiskId, risks } = body;

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      risks = getRisks();
    }

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');
    const triggerRisk = activeRisks.find((r: any) => r.id === triggerRiskId) || activeRisks[0] || {
      id: 'RSK-201',
      title: 'Payment Gateway Key Exhaustion',
      score: 20,
      category: 'Technical'
    };

    const systemInstruction = `You are a Principal Reliability Architect and System Dependency Modeler for MNB Research.
Perform an AI Cascading Threat Propagation & Topological Blast-Radius Analysis for the following trigger risk:

Trigger Risk:
ID: ${triggerRisk.id}
Title: ${triggerRisk.title}
Category: ${triggerRisk.category}
Owner: ${triggerRisk.ownerName || 'Sunny Prasad'}

All Active Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({ id: r.id, title: r.title, category: r.category, severity: r.severity })), null, 2)}

Model how this upstream failure event propagates across microservice subsystems into downstream business revenue impacts.

Return a strict JSON response with:
1. "triggerNode": object:
   - "id": string (e.g. "${triggerRisk.id}")
   - "label": string ("${triggerRisk.title}")
   - "severity": "Critical" | "High" | "Medium"
   - "exposureUsd": number
2. "subsystems": array of 2 affected service objects:
   - "id": string (e.g. "SVC-API", "SVC-AUTH")
   - "label": string (e.g. "API Gateway Timeout & 504 Errors")
   - "latency": string (e.g. "< 30s")
   - "impactUsd": number
   - "status": "Active Threat" | "Contained"
3. "businessImpact": object:
   - "id": string (e.g. "BIZ-REVENUE")
   - "label": string (e.g. "Checkout Cart Abandonment & SLA Fine")
   - "slaBreach": boolean
   - "finalExposureUsd": number
4. "totalCascadeLoss": number total financial blast-radius.
5. "containmentPlaybook": string[] array of circuit-breaker tasks to isolate propagation.

Respond ONLY with valid JSON.`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [{ role: 'user', content: systemInstruction }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqResult.success && groqResult.content) {
      try {
        const parsed = JSON.parse(groqResult.content);
        if (parsed && parsed.triggerNode) {
          return NextResponse.json({
            ...parsed,
            provider: `Groq (${groqResult.model})`
          });
        }
      } catch (err) {
        console.warn('Groq Cascade Simulation parse note:', err);
      }
    }

    // 2. Secondary: Google Gemini 3.8 Flash
    const geminiResult = await callGeminiAI({
      prompt: systemInstruction,
      jsonMode: true,
      temperature: 0.2
    });

    if (geminiResult.success && geminiResult.content) {
      try {
        const parsed = JSON.parse(geminiResult.content);
        if (parsed && parsed.triggerNode) {
          return NextResponse.json({
            ...parsed,
            provider: `Google Gemini (${geminiResult.model})`
          });
        }
      } catch (err) {
        console.warn('Gemini Cascade Simulation parse note:', err);
      }
    }

    // 2. Dynamic Fallback
    const baseLoss = triggerRisk.estimatedImpactUsd || ((triggerRisk.score || 16) * 15000);
    const sub1Loss = Math.round(baseLoss * 0.55);
    const sub2Loss = Math.round(baseLoss * 0.30);
    const bizLoss = Math.round(baseLoss * 1.85);
    const totalCascadeLoss = baseLoss + sub1Loss + sub2Loss + bizLoss;

    return NextResponse.json({
      triggerNode: {
        id: triggerRisk.id,
        label: triggerRisk.title,
        severity: triggerRisk.severity || 'Critical',
        exposureUsd: baseLoss
      },
      subsystems: [
        {
          id: 'SVC-API',
          label: `${triggerRisk.category} API Gateway & Microservice Timeout`,
          latency: '< 30s',
          impactUsd: sub1Loss,
          status: 'Active Threat'
        },
        {
          id: 'SVC-AUTH',
          label: 'User Authentication Session Drop',
          latency: '< 2m',
          impactUsd: sub2Loss,
          status: 'Contained'
        }
      ],
      businessImpact: {
        id: 'BIZ-REVENUE',
        label: 'Checkout Cart Abandonment & SLA Fine Escalation',
        slaBreach: true,
        finalExposureUsd: bizLoss
      },
      totalCascadeLoss,
      containmentPlaybook: [
        `Deploy circuit breaker pattern on ${triggerRisk.id} microservice endpoint.`,
        'Enable fallback response caching to prevent API gateway 504 timeouts.',
        'Isolate database read replicas and autoscale connection pool.'
      ],
      provider: 'Dynamic Context Engine'
    });
  } catch (error: any) {
    console.error('Cascade Simulation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
