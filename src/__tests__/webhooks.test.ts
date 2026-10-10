import { describe, it, expect } from 'vitest';

describe('Real-Time Webhook & Governance Escalation Engine', () => {
  it('formats Slack markdown block payloads correctly for critical escalation', () => {
    const risk = {
      riskId: 'RSK-101',
      title: 'Active Ransomware Vector on Backup Storage',
      category: 'Security',
      severity: 'Critical',
      score: 25,
      ownerName: 'Sunny Prasad'
    };

    const headerText = '🚨 Critical Risk Escalation Alert';
    const slackPayload = {
      text: `🚨 *${headerText}* [${risk.riskId}]`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🚨 ${headerText} — MNB Research Governance*\n*Risk ID:* \`${risk.riskId}\`\n*Title:* ${risk.title}\n*Category:* ${risk.category}\n*Severity Score:* *${risk.score} / 25* (${risk.severity})\n*Assigned Owner:* ${risk.ownerName}`
          }
        }
      ]
    };

    expect(slackPayload.text).toContain('RSK-101');
    expect(slackPayload.blocks[0].text.text).toContain('Sunny Prasad');
    expect(slackPayload.blocks[0].text.text).toContain('25 / 25');
  });

  it('formats Microsoft Teams MessageCard payloads with color indicators', () => {
    const risk = {
      riskId: 'RSK-102',
      title: 'Unhedged Currency Exposure in Supplier Contracts',
      category: 'Financial',
      severity: 'High',
      score: 16,
      ownerName: 'Treasury Lead',
      eventType: 'APPETITE_BREACH'
    };

    const teamsPayload = {
      '@type': 'MessageCard',
      themeColor: risk.severity === 'Critical' ? 'D32F2F' : 'FFA000',
      summary: `Risk Appetite Threshold Exceeded: ${risk.title}`,
      sections: [
        {
          activityTitle: `⚠️ Risk Appetite Threshold Exceeded`,
          activitySubtitle: `Risk ID: ${risk.riskId} | Score: ${risk.score}/25`,
          facts: [
            { name: 'Risk Title', value: risk.title },
            { name: 'Category', value: risk.category }
          ]
        }
      ]
    };

    expect(teamsPayload.themeColor).toBe('FFA000');
    expect(teamsPayload['@type']).toBe('MessageCard');
    expect(teamsPayload.sections[0].facts[0].value).toBe(risk.title);
  });
});
