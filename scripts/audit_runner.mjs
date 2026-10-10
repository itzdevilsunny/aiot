import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { createClient } from '@supabase/supabase-js';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

function loadEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');
loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const BASE_URL = 'http://localhost:3000';

const results = {
  authentication: [],
  supabase: [],
  workflow: [],
  ai: []
};

function logResult(category, name, passed, details) {
  results[category].push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category.toUpperCase()}] ${name}: ${details}`);
}

function extractCookies(res) {
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers.getSetCookie();
  }
  const single = res.headers.get('set-cookie');
  return single ? [single] : [];
}

async function runAuthAudit() {
  console.log('\n========================================');
  console.log('1. RUNNING PRIORITY 1: AUTHENTICATION AUDIT');
  console.log('========================================');

  // Test 1: Unauthenticated request to /api/risks
  try {
    const res = await fetch(`${BASE_URL}/api/risks`, { redirect: 'manual' });
    const isProtected = res.status === 401;
    logResult('authentication', 'Unauthenticated API Request Blocked', isProtected, `Status: ${res.status}`);
  } catch (e) {
    logResult('authentication', 'Unauthenticated API Request Blocked', false, e.message);
  }

  // Test 2: Unauthenticated request to /
  try {
    const res = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
    const isRedirect = res.status === 307 && res.headers.get('location')?.includes('/login');
    logResult('authentication', 'Unauthenticated Page Request Redirected to /login', isRedirect, `Status: ${res.status}, Location: ${res.headers.get('location')}`);
  } catch (e) {
    logResult('authentication', 'Unauthenticated Page Request Redirected to /login', false, e.message);
  }

  // Test 3: Authenticate with valid credentials
  let authCookie = '';
  let authToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sunny.prasad@mnbresearch.com', password: 'password123' })
    });
    const data = await res.json();
    const rawCookies = extractCookies(res);
    authCookie = rawCookies.map(c => c.split(';')[0]).join('; ');
    authToken = data.token;

    const hasCookies = res.status === 200 && data.success && authCookie.includes('mnb_auth_token');
    logResult('authentication', 'Authentication & Cookie Issuance', hasCookies, `User: ${data.user?.name}, Token: ${authToken ? 'Issued' : 'Missing'}`);
  } catch (e) {
    logResult('authentication', 'Authentication & Cookie Issuance', false, e.message);
  }

  // Test 4: Access protected /api/risks with session cookie
  try {
    const res = await fetch(`${BASE_URL}/api/risks`, {
      headers: { Cookie: authCookie }
    });
    const data = await res.json();
    const isAuthed = res.status === 200 && data.success && Array.isArray(data.risks);
    logResult('authentication', 'Authenticated Access with Valid Session Cookie', isAuthed, `Status: ${res.status}, Records returned: ${data.count}`);
  } catch (e) {
    logResult('authentication', 'Authenticated Access with Valid Session Cookie', false, e.message);
  }

  // Test 5: Verify /api/auth/me returns valid user
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: authCookie }
    });
    const data = await res.json();
    const isValid = res.status === 200 && data.isAuthenticated && data.user?.email === 'sunny.prasad@mnbresearch.com';
    logResult('authentication', 'Server-Side Session Introspection (/api/auth/me)', isValid, `Authenticated: ${data.isAuthenticated}, User: ${data.user?.name}`);
  } catch (e) {
    logResult('authentication', 'Server-Side Session Introspection (/api/auth/me)', false, e.message);
  }

  // Test 6: Forged fake token rejection
  try {
    const res = await fetch(`${BASE_URL}/api/risks`, {
      headers: { Cookie: 'mnb_auth_token=forged_invalid_garbage_token; mnb_auth_user=fake@hacker.com' }
    });
    const isRejected = res.status === 401;
    logResult('authentication', 'Forged Token Rejection', isRejected, `Status: ${res.status} (Rejected)`);
  } catch (e) {
    logResult('authentication', 'Forged Token Rejection', false, e.message);
  }

  // Test 7: Logout clears cookies and terminates session
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: authCookie }
    });
    const rawCookies = extractCookies(res);
    const isCleared = rawCookies.some(c => c.includes('mnb_auth_token=;') || c.includes('Max-Age=0'));
    logResult('authentication', 'Logout Session Invalidation', isCleared, `Cookies deleted on response`);
  } catch (e) {
    logResult('authentication', 'Logout Session Invalidation', false, e.message);
  }

  return authCookie;
}

async function runSupabaseAudit(authCookie) {
  console.log('\n========================================');
  console.log('2. RUNNING PRIORITY 2: SUPABASE POSTGRESQL AUDIT');
  console.log('========================================');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logResult('supabase', 'Supabase Configuration Check', false, 'Missing SUPABASE_URL or SUPABASE_KEY in environment');
    return;
  }

  logResult('supabase', 'Supabase Credentials Available', true, `URL: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  // 1. Direct Ping & Select
  try {
    const { data, count, error } = await supabase.from('risks').select('*', { count: 'exact' });
    if (error) {
      logResult('supabase', 'Direct Supabase Select Query', false, error.message);
    } else {
      logResult('supabase', 'Direct Supabase Select Query', true, `Successfully read ${data.length} records directly from Supabase PostgreSQL`);
    }
  } catch (e) {
    logResult('supabase', 'Direct Supabase Select Query', false, e.message);
  }

  // 2. Uniquely identifiable test record lifecycle
  const testId = `RSK-VERIFY-${Date.now().toString().slice(-6)}`;
  const testRisk = {
    id: testId,
    title: `Automated Production Persistence Verification Risk (${testId})`,
    description: 'Unique test risk created to verify live Supabase PostgreSQL persistence across render and vercel.',
    category: 'Technical',
    probability: 4,
    impact: 4,
    score: 16,
    severity: 'High',
    status: 'Open',
    project_id: 'proj-1',
    project_name: 'AI Implementation',
    owner_id: 'usr-1',
    owner_name: 'Sunny Prasad',
    owner_role: 'Business Operations Intern & Risk Lead',
    mitigation_plan: 'Automated verification test mitigation plan.',
    contingency_plan: 'Automated failover contingency procedure.',
    mitigation_progress: 25,
    due_date: '2026-10-31',
    estimated_impact_usd: 40000,
    last_updated: 'Just now'
  };

  // Step 2a: Insert record
  try {
    const { error: insertErr } = await supabase.from('risks').insert(testRisk);
    if (insertErr) {
      logResult('supabase', 'Supabase INSERT Test Record', false, insertErr.message);
    } else {
      logResult('supabase', 'Supabase INSERT Test Record', true, `Inserted ${testId} into Supabase risks table`);
    }
  } catch (e) {
    logResult('supabase', 'Supabase INSERT Test Record', false, e.message);
  }

  // Step 2b: Query record back directly
  try {
    const { data: fetchRow, error: fetchErr } = await supabase.from('risks').select('*').eq('id', testId).single();
    const insertedOk = !fetchErr && fetchRow && fetchRow.id === testId;
    logResult('supabase', 'Supabase SELECT Verification', insertedOk, insertedOk ? `Record ${testId} confirmed present in Supabase with score ${fetchRow.score}` : fetchErr?.message);
  } catch (e) {
    logResult('supabase', 'Supabase SELECT Verification', false, e.message);
  }

  // Step 2c: Update record in Supabase
  try {
    const { error: updateErr } = await supabase.from('risks').update({ mitigation_progress: 85, score: 8, severity: 'Medium' }).eq('id', testId);
    if (updateErr) {
      logResult('supabase', 'Supabase UPDATE Test Record', false, updateErr.message);
    } else {
      const { data: updatedRow } = await supabase.from('risks').select('*').eq('id', testId).single();
      const updatedOk = updatedRow && updatedRow.mitigation_progress === 85 && updatedRow.score === 8;
      logResult('supabase', 'Supabase UPDATE Test Record', updatedOk, updatedOk ? `Updated progress to 85% and score to 8 in Supabase` : 'Update check failed');
    }
  } catch (e) {
    logResult('supabase', 'Supabase UPDATE Test Record', false, e.message);
  }

  // Step 2d: Verify Backend API fetches the record from Supabase
  try {
    const apiRes = await fetch(`${BASE_URL}/api/risks?search=${testId}`, {
      headers: { Cookie: authCookie }
    });
    const apiData = await apiRes.json();
    const foundInApi = apiData.success && apiData.risks.some(r => r.id === testId);
    logResult('supabase', 'Backend API Authoritative Sync from Supabase', foundInApi, foundInApi ? `Backend retrieved Supabase record ${testId}` : 'Not found in API response');
  } catch (e) {
    logResult('supabase', 'Backend API Authoritative Sync from Supabase', false, e.message);
  }

  // Step 2e: Clean up test record from Supabase
  try {
    const { error: delErr } = await supabase.from('risks').delete().eq('id', testId);
    if (delErr) {
      logResult('supabase', 'Supabase DELETE Cleanup', false, delErr.message);
    } else {
      const { data: checkDeleted } = await supabase.from('risks').select('*').eq('id', testId);
      const isGone = checkDeleted && checkDeleted.length === 0;
      logResult('supabase', 'Supabase DELETE Cleanup', isGone, isGone ? `Cleaned up test record ${testId} safely` : 'Record still present');
    }
  } catch (e) {
    logResult('supabase', 'Supabase DELETE Cleanup', false, e.message);
  }
}

async function runWorkflowAudit(authCookie) {
  console.log('\n========================================');
  console.log('3. RUNNING PRIORITY 3: COMPLETE 12-STEP WORKFLOW AUDIT');
  console.log('========================================');

  const testRiskId = `RSK-FLOW-${Date.now().toString().slice(-4)}`;

  // Step 1: Create risk
  let createdRisk = null;
  try {
    const res = await fetch(`${BASE_URL}/api/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        id: testRiskId,
        title: `Workflow Verification Threat ${testRiskId}`,
        description: 'End-to-end multi-stage lifecycle test threat.',
        category: 'Financial',
        probability: 4,
        impact: 5,
        ownerName: 'Sunny Prasad',
        ownerRole: 'Risk Lead',
        projectName: 'AI Implementation',
        treatmentStrategy: 'Mitigate',
        mitigationPlan: 'Implement redundant API proxies and multi-cloud failover.',
        dueDate: '2026-10-30',
        estimatedImpactUsd: 125000
      })
    });
    const data = await res.json();
    createdRisk = data.risk;
    logResult('workflow', 'Step 1: Create Risk Record', data.success && !!createdRisk, `Created ${testRiskId} with calculated score: ${createdRisk?.score} (${createdRisk?.severity})`);
  } catch (e) {
    logResult('workflow', 'Step 1: Create Risk Record', false, e.message);
  }

  // Step 2: Assess probability & impact
  const scoreCorrect = createdRisk?.score === 20 && createdRisk?.severity === 'Critical';
  logResult('workflow', 'Step 2: Assess Score (4 × 5 = 20 Critical)', scoreCorrect, `Computed: ${createdRisk?.score}, Severity: ${createdRisk?.severity}`);

  // Step 3: Owner Assignment
  const ownerAssigned = createdRisk?.ownerName === 'Sunny Prasad';
  logResult('workflow', 'Step 3: Assign Risk Owner', ownerAssigned, `Owner: ${createdRisk?.ownerName}`);

  // Step 4: Link Control
  try {
    const res = await fetch(`${BASE_URL}/api/controls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        code: `CTL-FLOW-${Date.now().toString().slice(-4)}`,
        title: `Automated Redundant Proxy Control for ${testRiskId}`,
        category: 'Technical',
        type: 'Preventative',
        implementationStatus: 'Implemented',
        testStatus: 'Passed',
        linkedRiskIds: [testRiskId],
        effectivenessRating: 85
      })
    });
    const data = await res.json();
    logResult('workflow', 'Step 4: Link Control', data.success, `Created control: ${data.control?.code} linked to ${testRiskId}`);
  } catch (e) {
    logResult('workflow', 'Step 4: Link Control', false, e.message);
  }

  // Step 5: Create Mitigation Action
  try {
    const res = await fetch(`${BASE_URL}/api/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        title: `Deploy Multi-Cloud Failover for ${testRiskId}`,
        riskId: testRiskId,
        riskTitle: createdRisk?.title || testRiskId,
        ownerName: 'Sunny Prasad',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-10-25'
      })
    });
    const data = await res.json();
    logResult('workflow', 'Step 5: Create Mitigation Action', data.success, `Action ${data.action?.id} created with SLA dueDate: ${data.action?.dueDate}`);
  } catch (e) {
    logResult('workflow', 'Step 5: Create Mitigation Action', false, e.message);
  }

  // Step 6: Attach Evidence
  try {
    const res = await fetch(`${BASE_URL}/api/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        title: `Failover Stress Test Report for ${testRiskId}`,
        type: 'Test Report',
        controlCode: 'CTL-SEC-01',
        linkedRiskIds: [testRiskId],
        verificationStatus: 'Verified',
        validityExpiryDate: '2027-01-01'
      })
    });
    const data = await res.json();
    logResult('workflow', 'Step 6: Attach Compliance Evidence', data.success, `Evidence ${data.evidence?.id} registered and verified`);
  } catch (e) {
    logResult('workflow', 'Step 6: Attach Compliance Evidence', false, e.message);
  }

  // Step 7: Reassess Residual Exposure
  try {
    const res = await fetch(`${BASE_URL}/api/risks/${testRiskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        residualProbability: 2,
        residualImpact: 3,
        residualScore: 6,
        residualSeverity: 'Low',
        mitigationProgress: 80
      })
    });
    const data = await res.json();
    const updated = data.success && data.risk?.residualScore === 6;
    logResult('workflow', 'Step 7: Reassess Residual Exposure', updated, `Residual Score updated from 20 to 6 (Low Severity)`);
  } catch (e) {
    logResult('workflow', 'Step 7: Reassess Residual Exposure', false, e.message);
  }

  // Step 8: Submit Approval Request
  let approvalId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/approvals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        riskId: testRiskId,
        riskTitle: createdRisk?.title || testRiskId,
        type: 'Residual Risk Acceptance',
        requestedBy: 'Sunny Prasad',
        approverName: 'Sumit (Resource Manager)',
        reason: 'Verification workflow formal residual risk approval.'
      })
    });
    const data = await res.json();
    approvalId = data.approval?.id;
    logResult('workflow', 'Step 8: Submit Governance Approval', data.success && !!approvalId, `Approval request ${approvalId} submitted`);
  } catch (e) {
    logResult('workflow', 'Step 8: Submit Governance Approval', false, e.message);
  }

  // Step 9: Approve Approval Request
  if (approvalId) {
    try {
      const res = await fetch(`${BASE_URL}/api/approvals/${approvalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: authCookie },
        body: JSON.stringify({
          status: 'Approved',
          comments: 'Approved by governance auditor in verification test.'
        })
      });
      const data = await res.json();
      logResult('workflow', 'Step 9: Process Governance Decision', data.success && data.approval?.status === 'Approved', `Approval ${approvalId} status: Approved`);
    } catch (e) {
      logResult('workflow', 'Step 9: Process Governance Decision', false, e.message);
    }
  }

  // Step 10: Audit Log Verification
  try {
    const res = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { Cookie: authCookie }
    });
    const data = await res.json();
    const hasLog = data.success && data.auditLogs.some(l => l.riskId === testRiskId);
    logResult('workflow', 'Step 10: Immutable Audit Log Recorded', hasLog, `Audit log entry found for ${testRiskId}`);
  } catch (e) {
    logResult('workflow', 'Step 10: Immutable Audit Log Recorded', false, e.message);
  }

  // Step 11: Export Data
  try {
    const res = await fetch(`${BASE_URL}/api/export?format=csv`, {
      headers: { Cookie: authCookie }
    });
    const text = await res.text();
    const isCsv = res.status === 200 && text.includes('Risk ID') && text.includes(testRiskId);
    logResult('workflow', 'Step 11: Export Register (CSV Format)', isCsv, `CSV exported with headers and test record`);
  } catch (e) {
    logResult('workflow', 'Step 11: Export Register (CSV Format)', false, e.message);
  }

  // Step 12: Delete Test Risk
  try {
    const res = await fetch(`${BASE_URL}/api/risks/${testRiskId}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie }
    });
    const data = await res.json();
    logResult('workflow', 'Step 12: Lifecycle Clean-up & Closure', data.success, `Test risk ${testRiskId} cleaned up`);
  } catch (e) {
    logResult('workflow', 'Step 12: Lifecycle Clean-up & Closure', false, e.message);
  }
}

async function runAiAudit(authCookie) {
  console.log('\n========================================');
  console.log('4. RUNNING PRIORITY 4: AI PROVIDERS AUDIT');
  console.log('========================================');

  // Test Groq directly
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    logResult('ai', 'Groq API Configuration', false, 'Missing GROQ_API_KEY in environment');
  } else {
    try {
      const startTime = Date.now();
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: 'Respond with exactly: PING_OK' }],
          max_tokens: 10
        })
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      const passed = res.ok && content?.includes('PING_OK');
      logResult('ai', 'Groq Live API Call (qwen/qwen3.8-27b)', passed, `Latency: ${Date.now() - startTime}ms, Response: "${content}"`);
    } catch (e) {
      logResult('ai', 'Groq Live API Call', false, e.message);
    }
  }

  // Test Gemini directly
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    logResult('ai', 'Google Gemini API Configuration', false, 'Missing GEMINI_API_KEY in environment');
  } else {
    try {
      const startTime = Date.now();
      const model = 'models/gemini-3.8-flash';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'close'
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with exactly: PING_OK' }] }]
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const passed = res.ok && text?.includes('PING_OK');
      logResult('ai', `Google Gemini Live API Call (${model})`, passed, `Latency: ${Date.now() - startTime}ms, Response: "${text}"`);
    } catch (e) {
      logResult('ai', 'Google Gemini Live API Call', false, e.message);
    }
  }

  // Test Application AI Route (/api/telemetry-insight)
  try {
    const startTime = Date.now();
    const res = await fetch(`${BASE_URL}/api/telemetry-insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: authCookie },
      body: JSON.stringify({
        criticalCount: 2,
        highCount: 3,
        topRiskTitle: 'Payment Gateway Key Exhaustion'
      })
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && typeof data.insight === 'string' && data.insight.length > 10;
    logResult('ai', 'Application AI Synthesis Route (/api/telemetry-insight)', passed, `Latency: ${Date.now() - startTime}ms, Insight: "${data.insight?.slice(0, 60)}..."`);
  } catch (e) {
    logResult('ai', 'Application AI Synthesis Route', false, e.message);
  }
}

async function main() {
  const authCookie = await runAuthAudit();
  await runSupabaseAudit(authCookie);
  await runWorkflowAudit(authCookie);
  await runAiAudit(authCookie);

  console.log('\n========================================');
  console.log('AUDIT SUMMARY');
  console.log('========================================');
  let totalTests = 0;
  let passedTests = 0;
  for (const [category, tests] of Object.entries(results)) {
    const passed = tests.filter(t => t.passed).length;
    totalTests += tests.length;
    passedTests += passed;
    console.log(`${category.toUpperCase()}: ${passed}/${tests.length} passed`);
  }
  console.log(`TOTAL: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
}

main().catch(err => {
  console.error('Fatal audit runner error:', err);
  process.exit(1);
});
