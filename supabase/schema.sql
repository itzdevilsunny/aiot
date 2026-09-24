-- ====================================================================
-- MNB RESEARCH · RISK REGISTER COPILOT
-- PRODUCTION SUPABASE POSTGRESQL DDL, REAL-TIME PUBLICATION & SEED DATA
-- ====================================================================

-- 1. DROP EXISTING TABLE IF RE-INITIALIZING (OPTIONAL)
-- DROP TABLE IF EXISTS risks CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS team_members CASCADE;

-- 2. CREATE RISKS TABLE
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

-- 3. CREATE PROJECTS TABLE
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

-- 4. CREATE TEAM MEMBERS TABLE
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

-- 5. ENABLE REAL-TIME WEBSOCKET BROADCASTS IN SUPABASE
BEGIN;
  -- Drop publication if exists or alter publication
  ALTER PUBLICATION supabase_realtime ADD TABLE risks;
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
COMMIT;

-- 6. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity);
CREATE INDEX IF NOT EXISTS idx_risks_category ON risks(category);
CREATE INDEX IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-executing
DROP POLICY IF EXISTS "Allow public select on risks" ON risks;
DROP POLICY IF EXISTS "Allow public insert on risks" ON risks;
DROP POLICY IF EXISTS "Allow public update on risks" ON risks;
DROP POLICY IF EXISTS "Allow public delete on risks" ON risks;

DROP POLICY IF EXISTS "Allow public select on projects" ON projects;
DROP POLICY IF EXISTS "Allow public insert on projects" ON projects;
DROP POLICY IF EXISTS "Allow public update on projects" ON projects;

DROP POLICY IF EXISTS "Allow public select on team_members" ON team_members;

-- Grant Anonymous & Authenticated full access for API Operations
CREATE POLICY "Allow public select on risks" ON risks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on risks" ON risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on risks" ON risks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on risks" ON risks FOR DELETE USING (true);

CREATE POLICY "Allow public select on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on projects" ON projects FOR UPDATE USING (true);

CREATE POLICY "Allow public select on team_members" ON team_members FOR SELECT USING (true);

-- 8. INITIAL REAL WORKABLE DATA SEED
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
ON CONFLICT (id) DO UPDATE SET 
  score = EXCLUDED.score,
  severity = EXCLUDED.severity,
  last_updated = EXCLUDED.last_updated;
