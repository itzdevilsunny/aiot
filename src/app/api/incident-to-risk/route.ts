import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      incidentText = '', 
      incidentTitle = '',
      affectedService = 'Production Infrastructure',
      incidentSeverity = 'Major' 
    } = body;

    if (!incidentText.trim() && !incidentTitle.trim()) {
      return NextResponse.json({ 
        error: 'Please provide incident details, post-mortem notes, or outage summary.' 
      }, { status: 400 });
    }

    const teamDirectory = `
MNB RESEARCH ASSIGNEE DIRECTORY:
- Sunny Prasad: Business Operations Intern & Risk Lead (Specialty: DB, Infrastructure, Register Ops)
- Yash Raj: Operations Lead & Governance Officer (Specialty: Operational Resilience, Incident Response)
- Ritika: Product Manager & Strategic Execution Lead (Specialty: Product Gateways, Roadmaps)
- Sumit: Resource Manager & Capacity Lead (Specialty: Vendor Limits, Team Capacity)
- Priya Sharma: Compliance & Audit Lead (Specialty: SOC 2, ISO 31000, Regulatory Audits)
`;

    const systemPrompt = `You are the Lead Risk Architect & Incident Management Specialist for MNB Research.
Analyze this raw operational incident/outage post-mortem and convert it into a formal, structured Enterprise Risk record under ISO 31000 guidelines.

${teamDirectory}

RAW INCIDENT POST-MORTEM DATA:
Title/Topic: "${incidentTitle || 'Operational Outage / Incident'}"
Severity: ${incidentSeverity}
Affected Service: ${affectedService}
Incident Logs & Description:
"""
${incidentText}
"""

INSTRUCTIONS:
1. Synthesize a professional enterprise risk title prefixed with appropriate context (e.g. "Post-Incident: Gateway Key Rotation Failure").
2. Accurately assign category from: Technical, Operational, Security, Financial, Schedule, Compliance.
3. Formulate an executive description of the ongoing operational threat if recurrence is not mitigated.
4. Extract the primary technical/process root cause.
5. Score Probability (1 to 5) and Impact (1 to 5) based on real incident severity.
6. Assign the best owner from the MNB team directory above.
7. Write a concrete Proactive Mitigation Strategy and Contingency Fallback Plan.
8. Generate 3 to 4 unique, actionable remediation tasks for the execution checklist (no generic filler).
9. Recommend 1 linked internal control (Type: Preventative, Detective, or Corrective).
10. Estimate USD financial exposure impact (e.g. 15000, 45000).

Return strictly JSON matching this schema:
{
  "title": "string",
  "category": "Technical" | "Operational" | "Security" | "Financial" | "Schedule" | "Compliance",
  "description": "string",
  "rootCause": "string",
  "probability": number (1-5),
  "impact": number (1-5),
  "suggestedOwner": "string (Sunny Prasad | Yash Raj | Ritika | Sumit | Priya Sharma)",
  "suggestedOwnerRole": "string",
  "mitigationPlan": "string",
  "contingencyPlan": "string",
  "checklist": ["string", "string", "string"],
  "recommendedControl": {
    "title": "string",
    "type": "Preventative" | "Detective" | "Corrective",
    "description": "string"
  },
  "estimatedImpactUsd": number
}`;

    // 1. Primary: Ultra-Fast Groq Qwen 27B
    const groqRes = await callGroqAI({
      messages: [{ role: 'user', content: systemPrompt }],
      jsonMode: true,
      temperature: 0.25
    });

    if (groqRes.success && groqRes.content) {
      try {
        const parsed = JSON.parse(groqRes.content);
        const prob = Math.min(5, Math.max(1, parseInt(parsed.probability, 10) || 3));
        const imp = Math.min(5, Math.max(1, parseInt(parsed.impact, 10) || 3));
        const score = prob * imp;

        let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        if (score >= 20) severity = 'Critical';
        else if (score >= 12) severity = 'High';
        else if (score >= 6) severity = 'Medium';

        return NextResponse.json({
          success: true,
          provider: `Groq (${groqRes.model})`,
          risk: {
            ...parsed,
            probability: prob,
            impact: imp,
            score,
            severity,
            checklist: (parsed.checklist || []).map((text: string, i: number) => ({
              id: `chk-inc-${Date.now()}-${i}`,
              title: text,
              completed: false
            }))
          }
        });
      } catch (e) {
        console.warn('Groq Incident-to-Risk JSON parse error:', e);
      }
    }

    // 2. Secondary: Google Gemini Fallback
    const geminiRes = await callGeminiAI({
      prompt: systemPrompt,
      temperature: 0.25,
      jsonMode: true
    });

    if (geminiRes.success && geminiRes.content) {
      try {
        const parsed = JSON.parse(geminiRes.content);
        const prob = Math.min(5, Math.max(1, parseInt(parsed.probability, 10) || 3));
        const imp = Math.min(5, Math.max(1, parseInt(parsed.impact, 10) || 3));
        const score = prob * imp;

        let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        if (score >= 20) severity = 'Critical';
        else if (score >= 12) severity = 'High';
        else if (score >= 6) severity = 'Medium';

        return NextResponse.json({
          success: true,
          provider: `Google Gemini (${geminiRes.model})`,
          risk: {
            ...parsed,
            probability: prob,
            impact: imp,
            score,
            severity,
            checklist: (parsed.checklist || []).map((text: string, i: number) => ({
              id: `chk-inc-${Date.now()}-${i}`,
              title: text,
              completed: false
            }))
          }
        });
      } catch (e) {}
    }

    // Smart Rule-Based Fallback
    return NextResponse.json({
      success: true,
      provider: 'Rule-Based Incident Transformer',
      risk: {
        title: `Post-Mortem: ${incidentTitle || 'Operational Production Incident'}`,
        category: 'Operational',
        description: `Operational recurrence threat derived from incident report: "${(incidentText || incidentTitle).slice(0, 200)}..."`,
        rootCause: 'Unmitigated upstream timeout and failure to enforce automated retry policies.',
        probability: 3,
        impact: 4,
        score: 12,
        severity: 'High',
        suggestedOwner: 'Yash Raj',
        suggestedOwnerRole: 'Operations Lead',
        mitigationPlan: 'Deploy automated monitoring alerts and enforce architectural circuit breakers.',
        contingencyPlan: 'Trigger secondary standby runbook and notify on-call engineering lead.',
        checklist: [
          { id: `chk-1`, title: 'Review post-mortem root cause analysis with operations team', completed: false },
          { id: `chk-2`, title: 'Implement automated health ping alarm thresholds', completed: false },
          { id: `chk-3`, title: 'Update incident runbook documentation', completed: false }
        ],
        recommendedControl: {
          title: 'Automated Circuit Breaker & Health Alarms',
          type: 'Preventative',
          description: 'Automated detection of consecutive node dropouts with failover trigger.'
        },
        estimatedImpactUsd: 25000
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
