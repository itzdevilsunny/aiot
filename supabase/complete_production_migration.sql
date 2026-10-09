-- ====================================================================
-- MNB RESEARCH · RISK REGISTER COPILOT
-- COMPLETE PRODUCTION SUPABASE POSTGRESQL MIGRATION & DATA SEED
-- Generated: 2026-10-09T12:19:21.356Z
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  lead_name TEXT NOT NULL,
  total_risks INT DEFAULT 0,
  critical_risks INT DEFAULT 0,
  mitigation_progress INT DEFAULT 0,
  status TEXT DEFAULT 'Active',
  last_updated TEXT
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  department TEXT,
  assigned_risks_count INT DEFAULT 0,
  open_risks_count INT DEFAULT 0,
  critical_risks_count INT DEFAULT 0,
  mitigation_progress INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  department TEXT,
  affected_process TEXT,
  probability INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
  score INT NOT NULL,
  severity TEXT NOT NULL,
  inherent_probability INT,
  inherent_impact INT,
  inherent_score INT,
  inherent_severity TEXT,
  residual_probability INT,
  residual_impact INT,
  residual_score INT,
  residual_severity TEXT,
  lifecycle_stage TEXT DEFAULT 'Assess',
  treatment_strategy TEXT DEFAULT 'Mitigate',
  above_appetite BOOLEAN DEFAULT false,
  status TEXT NOT NULL,
  project_id TEXT,
  project_name TEXT,
  owner_id TEXT,
  owner_name TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  mitigation_plan TEXT,
  contingency_plan TEXT,
  mitigation_progress INT DEFAULT 0,
  due_date DATE,
  checklist JSONB DEFAULT '[]'::jsonb,
  activity_logs JSONB DEFAULT '[]'::jsonb,
  linked_control_ids JSONB DEFAULT '[]'::jsonb,
  linked_action_ids JSONB DEFAULT '[]'::jsonb,
  linked_evidence_ids JSONB DEFAULT '[]'::jsonb,
  ai_suggested BOOLEAN DEFAULT false,
  ai_confidence INT DEFAULT 90,
  estimated_impact_usd NUMERIC,
  last_updated TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS controls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  objective TEXT,
  owner_name TEXT NOT NULL,
  owner_role TEXT,
  implementation_status TEXT DEFAULT 'Implemented',
  effectiveness TEXT DEFAULT 'Effective',
  test_status TEXT DEFAULT 'Passed',
  last_test_date DATE,
  next_test_date DATE,
  linked_risk_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mitigation_actions (
  id TEXT PRIMARY KEY,
  risk_id TEXT NOT NULL,
  risk_title TEXT,
  linked_control_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  assigned_owner_name TEXT NOT NULL,
  assigned_owner_role TEXT,
  priority TEXT DEFAULT 'High',
  start_date DATE,
  due_date DATE,
  status TEXT DEFAULT 'In Progress',
  progress_pct INT DEFAULT 0,
  verification_status TEXT DEFAULT 'Pending Verification',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TEXT
);

CREATE TABLE IF NOT EXISTS evidence_records (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  file_url TEXT NOT NULL,
  linked_risk_id TEXT,
  linked_control_id TEXT,
  uploaded_by TEXT NOT NULL,
  upload_timestamp TIMESTAMPTZ DEFAULT NOW(),
  description TEXT,
  validity_expiry_date DATE,
  verification_status TEXT DEFAULT 'Verified',
  verifier_name TEXT,
  checksum TEXT
);

CREATE TABLE IF NOT EXISTS key_risk_indicators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  linked_risk_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  measurement_unit TEXT NOT NULL,
  data_source TEXT DEFAULT 'Telemetry Script',
  current_value NUMERIC NOT NULL,
  warning_threshold NUMERIC NOT NULL,
  critical_threshold NUMERIC NOT NULL,
  reporting_frequency TEXT DEFAULT 'Weekly',
  trend_direction TEXT DEFAULT 'Stable',
  trigger_status TEXT DEFAULT 'Normal',
  observations JSONB DEFAULT '[]'::jsonb,
  last_updated TEXT
);

CREATE TABLE IF NOT EXISTS risk_reviews (
  id TEXT PRIMARY KEY,
  risk_id TEXT NOT NULL,
  risk_title TEXT,
  review_date DATE NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  previous_score INT,
  new_score INT,
  summary TEXT,
  findings TEXT,
  next_review_date DATE,
  status TEXT DEFAULT 'Completed'
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  risk_id TEXT NOT NULL,
  risk_title TEXT,
  type TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  approver_name TEXT NOT NULL,
  residual_score INT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  decision_comments TEXT,
  created_timestamp TIMESTAMPTZ DEFAULT NOW(),
  decided_timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS risk_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  changes_summary TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time broadcasts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'risks'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE risks;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-201', 'Payment Gateway Key Exhaustion', 'Our primary payment gateway uses legacy RSA-2048 keys with high session concurrency. During peak transaction bursts, cryptographic key exhaustion causes timeout errors and potential transaction drops.', 'Technical', 4, 5, 20, 'Critical', 4, 5, 20, 'Critical', 2, 3, 6, 'Medium', 'Open', 'Sunny Prasad', 'Business Operations Intern & Risk Lead', 'Implement a key rotation strategy and upgrade to elliptic curve cryptography (ECC) to reduce computational overhead during high-concurrency events. Deploy load balancing across multiple gateway instances to distribute cryptographic load and prevent single-point-of-failure exhaustion. Conduct stress testing under simulated peak transaction bursts to validate the new infrastructure''s capacity before the next major sales event.', 100, 85000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-201', 'Legacy Payment Gateway Key Exhaustion', 'Our primary payment gateway uses legacy RSA-2048 keys with high session concurrency. During peak transaction bursts, cryptographic key exhaustion causes timeout errors and potential transaction drops.', 'Technical', 4, 5, 20, 'Critical', 4, 5, 20, 'Critical', 3, 4, 12, 'High', 'Open', 'Sunny Prasad', 'Business Operations Intern & Risk Lead', 'Initiate an immediate technical audit of the payment gateway''s cryptographic infrastructure to assess current key rotation policies and concurrency limits. Implement a phased migration strategy to modern elliptic curve cryptography (ECC) or RSA-4096 to reduce computational overhead per transaction. Deploy load balancing mechanisms specifically optimized for cryptographic operations and establish real-time monitoring alerts for key exhaustion thresholds to prevent service degradation during peak loads.', 0, 85000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-168', 'Automated E2E Test Risk - Cloud Failover Verification', '', 'Technical', 4, 4, 16, 'High', 4, 4, 16, 'High', 3, 3, 9, 'Medium', 'Monitoring', 'Sunny Prasad', 'Business Operations Intern & Risk Lead', 'Run multi-region synthetic canary test.', 75, 48000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-105', 'Multi-Region PostgreSQL Row Locking during Migration Window', 'Concurrent schema updates during peak billing traffic may trigger deadlock timeouts and stall write operations across regional databases.', 'Technical', 5, 4, 20, 'Critical', 5, 4, 20, 'Critical', 4, 4, 16, 'High', 'Open', 'Sunny Prasad', 'Business Operations Intern', 'Execute database migrations in batch chunks during off-peak window (2 AM EST) with read-only replica fallback.', 40, 50000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-101', 'Client Onboarding Documentation slips', 'Third-party compliance documentation verification delays cause slips in client onboarding schedules across enterprise accounts.', 'Schedule', 4, 4, 16, 'High', 4, 4, 16, 'High', 3, 3, 9, 'Medium', 'Open', 'Yash Raj', 'Operations Lead', 'Deploy automated document extraction validation tool and assign dedicated onboarding coordinator.', 45, 15000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-102', 'Third-Party API Rate Limit Throttling', 'Upstream vendor API rate limits restrict real-time document synthesis during end-of-quarter auditing spikes.', 'Technical', 4, 4, 16, 'High', 4, 4, 16, 'High', 2, 3, 6, 'Medium', 'Monitoring', 'Ritika', 'Product Manager', 'Implement Redis response caching and exponential backoff retry policy across API gateways.', 75, 40000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO risks (id, title, description, category, probability, impact, score, severity, inherent_probability, inherent_impact, inherent_score, inherent_severity, residual_probability, residual_impact, residual_score, residual_severity, status, owner_name, owner_role, mitigation_plan, mitigation_progress, estimated_impact_usd) VALUES ('RSK-103', 'Key Personnel Release Unavailability', 'Senior backend engineers assigned to high-priority customer support escalations during release week window.', 'Resource', 4, 3, 12, 'High', 4, 3, 12, 'High', 3, 3, 9, 'Medium', 'Open', 'Sumit', 'Resource Manager', 'Reallocate specialized React/Node developers from secondary internal tooling squad.', 30, 12000) ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score;
INSERT INTO controls (id, name, description, category, type, owner_name, effectiveness, test_status) VALUES ('CTRL-106', 'Automated HSM Key Pool Monitoring & Session Throttling', 'Hardware Security Module daemon continuously tracks key lifecycle and alerts on pool exhaustion.', 'Technical', 'Preventive', 'Sunny Prasad', 'Effective', 'Passed') ON CONFLICT (id) DO NOTHING;
INSERT INTO controls (id, name, description, category, type, owner_name, effectiveness, test_status) VALUES ('CTRL-105', 'Automated HSM Key Pool Monitoring & Session Throttling', 'Hardware Security Module daemon continuously tracks key lifecycle and alerts on pool exhaustion.', 'Technical', 'Preventive', 'Sunny Prasad', 'Effective', 'Passed') ON CONFLICT (id) DO NOTHING;
INSERT INTO controls (id, name, description, category, type, owner_name, effectiveness, test_status) VALUES ('CTRL-101', 'Automated OCR & Document Validation Service', 'Real-time schema validation script parsing customer identification documents upon upload.', 'Operational', 'Preventive', 'Yash Raj', 'Effective', 'Passed') ON CONFLICT (id) DO NOTHING;
INSERT INTO controls (id, name, description, category, type, owner_name, effectiveness, test_status) VALUES ('CTRL-102', 'Multi-Region Read-Only Database Replica', 'Secondary PostgreSQL replica configured with failover routing during batch migrations.', 'Technical', 'Corrective', 'Sunny Prasad', 'Partially Effective', 'Failed') ON CONFLICT (id) DO NOTHING;
INSERT INTO controls (id, name, description, category, type, owner_name, effectiveness, test_status) VALUES ('CTRL-103', 'Redis API Rate Limit & Exponential Backoff', 'API gateway circuit breaker limiting requests to 500 req/min per tenant.', 'Technical', 'Preventive', 'Ritika', 'Effective', 'Passed') ON CONFLICT (id) DO NOTHING;
INSERT INTO controls (id, name, description, category, type, owner_name, effectiveness, test_status) VALUES ('CTRL-104', 'Cross-Training & Secondary Release Lead Assignment', 'Formal rotation policy ensuring secondary engineer is qualified to run deployment playbooks.', 'Resource', 'Detective', 'Sumit', 'Ineffective', 'Pending Test') ON CONFLICT (id) DO NOTHING;
INSERT INTO mitigation_actions (id, risk_id, risk_title, title, description, assigned_owner_name, priority, status, progress_pct) VALUES ('ACT-105', 'RSK-201', 'Payment Gateway Key Exhaustion', 'Implement Ephemeral Session Key Cycling in Production API', 'Update gateway crypto service to cycle ephemeral keys and allocate buffer pool.', 'Sunny Prasad', 'High', 'Completed', 100) ON CONFLICT (id) DO NOTHING;
INSERT INTO mitigation_actions (id, risk_id, risk_title, title, description, assigned_owner_name, priority, status, progress_pct) VALUES ('ACT-104', 'RSK-201', 'Legacy Payment Gateway Key Exhaustion', 'Implement Ephemeral Session Key Cycling in Production API', 'Update gateway crypto service to cycle ephemeral keys and allocate buffer pool.', 'Sunny Prasad', 'High', 'In Progress', 35) ON CONFLICT (id) DO NOTHING;
INSERT INTO mitigation_actions (id, risk_id, risk_title, title, description, assigned_owner_name, priority, status, progress_pct) VALUES ('ACT-101', 'RSK-101', 'Client Onboarding Delay', 'Deploy OCR validation middleware to staging', 'Integrate Tesseract OCR engine with fast API endpoint for instant file validation.', 'Yash Raj', 'High', 'In Progress', 75) ON CONFLICT (id) DO NOTHING;
INSERT INTO mitigation_actions (id, risk_id, risk_title, title, description, assigned_owner_name, priority, status, progress_pct) VALUES ('ACT-102', 'RSK-105', 'Multi-Region PostgreSQL Row Locking during Migration Window', 'Benchmark batch migration script in staging environment', 'Run 10,000 synthetic transaction updates with locks enabled to measure latency.', 'Sunny Prasad', 'High', 'Blocked', 40) ON CONFLICT (id) DO NOTHING;
INSERT INTO mitigation_actions (id, risk_id, risk_title, title, description, assigned_owner_name, priority, status, progress_pct) VALUES ('ACT-103', 'RSK-102', 'Third-Party API Rate Limit Throttling', 'Configure Redis cache TTL buffer rules', 'Set 60-second TTL cache for all idempotent document synthesis response payloads.', 'Ritika', 'Medium', 'Completed', 100) ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_records (id, file_name, file_type, file_size, file_url, linked_risk_id, uploaded_by, verification_status, checksum) VALUES ('EVD-104', 'HSM_Key_Cycling_FIPS_140_3_Validation.pdf', 'application/pdf', 2450000, '/uploads/evidence/HSM_Key_Cycling_FIPS_140_3_Validation.pdf', 'RSK-201', 'Sunny Prasad', 'Verified', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_records (id, file_name, file_type, file_size, file_url, linked_risk_id, uploaded_by, verification_status, checksum) VALUES ('EVD-101', 'SOC2_Access_Control_Review_Q3.pdf', 'application/pdf', 2450000, '/uploads/SOC2_Access_Control_Review_Q3.pdf', 'RSK-101', 'Yash Raj', 'Verified', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_records (id, file_name, file_type, file_size, file_url, linked_risk_id, uploaded_by, verification_status, checksum) VALUES ('EVD-102', 'Postgres_Replica_Failover_Test.log', 'text/plain', 420000, '/uploads/Postgres_Replica_Failover_Test.log', 'RSK-105', 'Sunny Prasad', 'Pending', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_records (id, file_name, file_type, file_size, file_url, linked_risk_id, uploaded_by, verification_status, checksum) VALUES ('EVD-103', 'API_Gateway_RateLimit_Benchmark.csv', 'text/csv', 180000, '/uploads/API_Gateway_RateLimit_Benchmark.csv', 'RSK-102', 'Ritika', 'Expired', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO key_risk_indicators (id, name, description, linked_risk_id, owner_name, measurement_unit, current_value, warning_threshold, critical_threshold, trigger_status) VALUES ('KRI-101', 'Privileged Access Exception Rate', 'Percentage of privileged database access requests missing prior approval ticket.', 'RSK-105', 'Sunny Prasad', '% of logins', 4.8, 2, 5, 'Warning') ON CONFLICT (id) DO NOTHING;
INSERT INTO key_risk_indicators (id, name, description, linked_risk_id, owner_name, measurement_unit, current_value, warning_threshold, critical_threshold, trigger_status) VALUES ('KRI-102', 'Third-Party API Latency (p99)', '99th percentile response time for external document processing endpoints.', 'RSK-102', 'Ritika', 'ms', 840, 600, 1200, 'Warning') ON CONFLICT (id) DO NOTHING;
INSERT INTO approval_requests (id, risk_id, risk_title, type, requested_by, approver_name, residual_score, reason, status, decision_comments) VALUES ('APP-102', 'RSK-201', 'Payment Gateway Key Exhaustion', 'Risk Acceptance', 'Sunny Prasad (Business Operations Intern & Risk Lead)', 'Yash Raj (Operations Lead)', 6, 'Mitigation completed with automated HSM session key rotation. Residual exposure of score 6 is well within operational appetite (limit: 15).', 'Approved', 'Approved by Yash Raj. Technical mitigation and FIPS compliance validated. Risk accepted.') ON CONFLICT (id) DO NOTHING;
INSERT INTO approval_requests (id, risk_id, risk_title, type, requested_by, approver_name, residual_score, reason, status, decision_comments) VALUES ('APR-101', 'RSK-105', 'Multi-Region PostgreSQL Row Locking during Migration Window', 'Risk Acceptance', 'Sunny Prasad', 'Sumit (Resource Manager)', 16, 'Temporary acceptance requested while failover script is refactored.', 'Pending', NULL) ON CONFLICT (id) DO NOTHING;
