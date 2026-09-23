-- Supabase PostgreSQL Schema for Risk Register Copilot

-- 1. Create Risks Table
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

-- 2. Create Projects Table
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

-- 3. Create Team Members Table
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

-- Row Level Security (RLS) Policies (Enable Public Access for MVP)
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on risks" ON risks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on risks" ON risks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on risks" ON risks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on risks" ON risks FOR DELETE USING (true);

CREATE POLICY "Allow public select on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public select on team_members" ON team_members FOR SELECT USING (true);
