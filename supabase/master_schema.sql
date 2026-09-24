-- ====================================================================
-- MNB RESEARCH · RISK REGISTER COPILOT
-- MASTER PRODUCTION POSTGRESQL SCHEMA (100% FAIL-SAFE & IDEMPOTENT)
-- ====================================================================

-- 1. RISKS TABLE
CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  probability INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
  score INT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  owner_avatar TEXT,
  co_owner_name TEXT,
  co_owner_role TEXT,
  mitigation_plan TEXT NOT NULL,
  contingency_plan TEXT NOT NULL,
  mitigation_progress INT DEFAULT 0,
  due_date DATE,
  checklist JSONB DEFAULT '[]'::jsonb,
  activity_logs JSONB DEFAULT '[]'::jsonb,
  ai_suggested BOOLEAN DEFAULT false,
  ai_confidence INT DEFAULT 90,
  estimated_impact_usd NUMERIC,
  last_updated TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
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

-- 3. TEAM MEMBERS TABLE
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

-- 4. SOC2 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS risk_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  actor_name TEXT DEFAULT 'Sunny Prasad',
  actor_role TEXT DEFAULT 'Business Operations Intern',
  changes_summary TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS risk_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANALYTICS SUMMARY SQL VIEW
CREATE OR REPLACE VIEW v_risk_analytics_summary AS
SELECT 
  COUNT(*)::INT AS total_risks,
  COUNT(*) FILTER (WHERE severity = 'Critical')::INT AS critical_count,
  COUNT(*) FILTER (WHERE severity = 'High')::INT AS high_count,
  COUNT(*) FILTER (WHERE severity = 'Medium')::INT AS medium_count,
  COUNT(*) FILTER (WHERE severity = 'Low')::INT AS low_count,
  COUNT(*) FILTER (WHERE status = 'Open')::INT AS open_count,
  COUNT(*) FILTER (WHERE status = 'Mitigated' OR status = 'Closed')::INT AS mitigated_count,
  COALESCE(SUM(estimated_impact_usd), 0)::NUMERIC AS total_financial_exposure_usd,
  COALESCE(ROUND(AVG(mitigation_progress)), 0)::INT AS avg_mitigation_readiness_pct
FROM risks;

-- 8. FAIL-SAFE REALTIME WEBSOCKET PUBLICATION (SAFE TO RUN MULTIPLE TIMES)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'risks'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE risks;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'projects'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'team_members'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'risk_audit_logs'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE risk_audit_logs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = 'risk_notifications'::regclass) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE risk_notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity);
CREATE INDEX IF NOT EXISTS idx_risks_category ON risks(category);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on risks" ON risks;
DROP POLICY IF EXISTS "Allow public insert on risks" ON risks;
DROP POLICY IF EXISTS "Allow public update on risks" ON risks;
DROP POLICY IF EXISTS "Allow public delete on risks" ON risks;
DROP POLICY IF EXISTS "Allow public select on projects" ON projects;
DROP POLICY IF EXISTS "Allow public insert on projects" ON projects;
DROP POLICY IF EXISTS "Allow public update on projects" ON projects;
DROP POLICY IF EXISTS "Allow public select on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow public select on risk_audit_logs" ON risk_audit_logs;
DROP POLICY IF EXISTS "Allow public insert on risk_audit_logs" ON risk_audit_logs;
DROP POLICY IF EXISTS "Allow public select on system_settings" ON system_settings;
DROP POLICY IF EXISTS "Allow public select on risk_notifications" ON risk_notifications;

CREATE POLICY "Allow public select on risks" ON risks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on risks" ON risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on risks" ON risks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on risks" ON risks FOR DELETE USING (true);

CREATE POLICY "Allow public select on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on projects" ON projects FOR UPDATE USING (true);

CREATE POLICY "Allow public select on team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public select on risk_audit_logs" ON risk_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on risk_audit_logs" ON risk_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on system_settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public select on risk_notifications" ON risk_notifications FOR SELECT USING (true);

-- 11. AUTOMATED AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION fn_log_risk_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO risk_audit_logs (risk_id, action_type, changes_summary, old_data, new_data)
    VALUES (
      NEW.id, 'UPDATE',
      CONCAT('Updated risk record: P=', NEW.probability, ', I=', NEW.impact, ', Status=', NEW.status),
      to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO risk_audit_logs (risk_id, action_type, changes_summary, old_data)
    VALUES (OLD.id, 'DELETE', CONCAT('Deleted risk item: ', OLD.title), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_risk_changes ON risks;
CREATE TRIGGER trg_log_risk_changes AFTER UPDATE OR DELETE ON risks FOR EACH ROW EXECUTE FUNCTION fn_log_risk_changes();

-- 12. INITIAL MNB RESEARCH SEED DATA
INSERT INTO projects (id, name, code, description, lead_name, total_risks, critical_risks, mitigation_progress, status, last_updated)
VALUES 
  ('proj-1', 'AI Implementation', 'AI-IMP', 'Enterprise generative AI copilot integration for automated document analysis and risk synthesis.', 'Sunny Prasad (Business Operations Intern)', 24, 3, 68, 'At Risk', 'Just now'),
  ('proj-2', 'Client Onboarding', 'CL-ONB', 'Standardization of enterprise client onboarding workflow and automated SLA verification.', 'Yash Raj (Operations Lead)', 12, 2, 81, 'On Track', '1 hour ago'),
  ('proj-3', 'Operations Automation', 'OPS-AUTO', 'Internal business process automation for cross-departmental compliance auditing.', 'Ritika (Product Manager)', 18, 4, 54, 'At Risk', '3 hours ago')
ON CONFLICT (id) DO UPDATE SET last_updated = EXCLUDED.last_updated;

INSERT INTO team_members (id, name, role, email, avatar, department, assigned_risks_count, open_risks_count, critical_risks_count, mitigation_progress)
VALUES
  ('usr-1', 'Sunny Prasad', 'Business Operations Intern', 'sunny.prasad@mnbresearch.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 'MNB Research · Business Operations', 6, 3, 1, 78),
  ('usr-2', 'Yash Raj', 'Operations Lead', 'yash.raj@mnbresearch.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 'Business Operations', 5, 3, 1, 65),
  ('usr-3', 'Ritika', 'Product Manager', 'ritika@mnbresearch.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', 'Product Strategy', 5, 2, 1, 82),
  ('usr-4', 'Sumit', 'Resource Manager', 'sumit@mnbresearch.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 'Resource Allocation', 4, 2, 1, 70),
  ('usr-5', 'Devyash', 'Data Quality Analyst', 'devyash@mnbresearch.com', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', 'Data Governance', 4, 1, 0, 90)
ON CONFLICT (id) DO NOTHING;

INSERT INTO risks (
  id, title, description, category, probability, impact, score, severity, status, 
  project_id, project_name, owner_id, owner_name, owner_role, owner_avatar, 
  mitigation_plan, contingency_plan, mitigation_progress, due_date, checklist, activity_logs, 
  ai_suggested, ai_confidence, estimated_impact_usd, last_updated
)
VALUES 
(
  'RSK-105',
  'Multi-Region PostgreSQL Row Locking during Migration Window',
  'Concurrent schema updates during peak billing traffic may trigger deadlock timeouts and stall write operations.',
  'Technical', 5, 4, 20, 'Critical', 'Open',
  'proj-1', 'AI Implementation',
  'usr-1', 'Sunny Prasad', 'Business Operations Intern',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'Execute database migrations in batch chunks during off-peak window (2 AM EST) with read-only replica fallback.',
  'Automate instant point-in-time restore (PITR) within 5 minutes of deadlock detection.',
  40, '2026-10-15',
  '[{"id":"chk-1","title":"Provision read-only PostgreSQL replica","completed":true,"completedAt":"Yesterday"},{"id":"chk-2","title":"Benchmark batch migration scripts in staging","completed":false}]'::jsonb,
  '[{"id":"act-1","author":"Sunny Prasad","timestamp":"10 min ago","action":"Escalated risk score to Critical due to traffic spike forecast.","type":"mitigation_update"}]'::jsonb,
  true, 96, 50000, 'Just now'
),
(
  'RSK-102',
  'Third-Party API Rate Limit Throttling on Data Synthesis Pipeline',
  'Upstream vendor API limits may restrict real-time document analysis during end-of-quarter auditing spikes.',
  'Operational', 4, 4, 16, 'High', 'Monitoring',
  'proj-2', 'Client Onboarding',
  'usr-2', 'Yash Raj', 'Operations Lead',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'Implement Redis response caching and exponential backoff retry policy across API gateways.',
  'Failover to secondary backup API key pool with automatic circuit breaker routing.',
  75, '2026-10-20',
  '[{"id":"chk-3","title":"Configure Redis cache TTL for synthesis payloads","completed":true,"completedAt":"2 days ago"}]'::jsonb,
  '[{"id":"act-2","author":"Yash Raj","timestamp":"1 hour ago","action":"Configured Redis cache TTL.","type":"mitigation_update"}]'::jsonb,
  true, 92, 40000, '1 hour ago'
)
ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score, severity = EXCLUDED.severity, last_updated = EXCLUDED.last_updated;

INSERT INTO system_settings (key, value)
VALUES 
  ('matrix_scoring_thresholds', '{"critical": 17, "high": 10, "medium": 5, "low": 1}'::jsonb),
  ('workspace_branding', '{"name": "MNB Research Business Operations", "lead": "Sunny Prasad", "email": "sunny.prasad@mnbresearch.com"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
