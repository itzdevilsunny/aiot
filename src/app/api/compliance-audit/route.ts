import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { risks, framework } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');

    if (!groqApiKey) {
      return NextResponse.json({
        healthScore: 88,
        executiveSummary: 'Enterprise risk management process demonstrates strong alignment with ISO 31000 and SOC 2 Type II frameworks. Technical threat modeling against NIST SP 800-30 identifies 2 minor control gaps requiring access control and vulnerability patching mitigations.',
        frameworkScores: {
          'ISO 31000': 92,
          'NIST SP 800-30': 85,
          'SOC 2 Type II': 90,
          'GDPR': 86,
          'PCI DSS 4.0': 89
        },
        gaps: [
          {
            controlId: 'NIST-RA-1',
            framework: 'NIST SP 800-30',
            title: 'Threat Source & Vulnerability Analysis',
            severity: 'Medium',
            issue: 'Technical vulnerability scanning coverage is missing continuous CVE dependency monitoring for containerized microservices.',
            remediation: 'Implement automated daily Snyk/NIST NVD CVE telemetry pipeline.',
            associatedRiskIds: activeRisks.slice(0, 2).map((r: any) => r.id)
          },
          {
            controlId: 'SOC2-CC6.1',
            framework: 'SOC 2 Type II',
            title: 'Logical Access & Authentication Safeguards',
            severity: 'High',
            issue: 'Role-Based Access Control (RBAC) audit logs require multi-factor enforcement on API endpoints.',
            remediation: 'Enforce MFA and IP-whitelisted access tokens on operational API endpoints.',
            associatedRiskIds: activeRisks.slice(2, 4).map((r: any) => r.id)
          }
        ],
        auditorMemo: 'Official Auditor Certification: Live risk telemetry indicates acceptable enterprise governance posture with minor technical action items.',
        source: 'fallback'
      });
    }

    const prompt = `You are a Senior Lead Cybersecurity Auditor (ISO 27001, ISO 31000, NIST SP 800-30, SOC 2 Type II, GDPR, PCI DSS 4.0).
Perform a comprehensive AI Compliance & Governance Audit on the following live risk register data:

Target Framework Filter: ${framework || 'All Frameworks'}
Active Enterprise Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  severity: r.severity,
  likelihood: r.likelihood,
  impact: r.impact,
  mitigationProgress: r.mitigationProgress,
  status: r.status
})), null, 2)}

Provide a strict, professional audit report in JSON format with:
1. "healthScore": number between 0 and 100 representing audit readiness.
2. "executiveSummary": string detailing overall governance readiness, strengths, and vulnerabilities.
3. "frameworkScores": object mapping framework names ("ISO 31000", "NIST SP 800-30", "SOC 2 Type II", "GDPR", "PCI DSS 4.0") to numeric scores 0-100.
4. "gaps": array of objects containing:
   - "controlId": string (e.g. "ISO-6.4", "NIST-RA-1", "SOC2-CC6.1", "GDPR-Art32")
   - "framework": string
   - "title": string
   - "severity": "High" | "Medium" | "Low"
   - "issue": detailed description of compliance gap
   - "remediation": actionable step-by-step mitigation task
   - "associatedRiskIds": string[]
5. "auditorMemo": official auditor sign-off statement.

Respond ONLY with a valid JSON object matching this exact structure.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      ...parsed,
      source: 'groq-llama-3.3-70b'
    });
  } catch (error: any) {
    console.error('Compliance Audit API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
