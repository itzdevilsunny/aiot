-- ====================================================================
-- MNB RESEARCH · RISK REGISTER COPILOT
-- ENTERPRISE ADD-ONS: SOC2 AUDIT TRAIL, AUTOMATED TRIGGERS, VIEWS & NOTIFICATIONS
-- ====================================================================

-- 1. DEDICATED SOC2 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS risk_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'ESCALATION'
  actor_name TEXT DEFAULT 'Sunny Prasad',
  actor_role TEXT DEFAULT 'Business Operations Intern',
  changes_summary TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SYSTEM SETTINGS TABLE (WORKSPACE & SCORING MATRIX THRESHOLDS)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTIFICATION LOGS TABLE (SLACK & EMAIL ESCALATIONS)
CREATE TABLE IF NOT EXISTS risk_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'SLACK', 'EMAIL', 'JIRA'
  status TEXT NOT NULL, -- 'DELIVERED', 'FAILED'
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HIGH-PERFORMANCE ANALYTICS SUMMARY SQL VIEW
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

-- 5. AUTOMATED POSTGRESQL AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION fn_log_risk_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO risk_audit_logs (risk_id, action_type, changes_summary, old_data, new_data)
    VALUES (
      NEW.id,
      'UPDATE',
      CONCAT('Updated risk record: P=', NEW.probability, ', I=', NEW.impact, ', Status=', NEW.status),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO risk_audit_logs (risk_id, action_type, changes_summary, old_data)
    VALUES (
      OLD.id,
      'DELETE',
      CONCAT('Deleted risk item: ', OLD.title),
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- BIND TRIGGER TO RISKS TABLE
DROP TRIGGER IF EXISTS trg_log_risk_changes ON risks;
CREATE TRIGGER trg_log_risk_changes
AFTER UPDATE OR DELETE ON risks
FOR EACH ROW
EXECUTE FUNCTION fn_log_risk_changes();

-- 6. ENABLE REAL-TIME BROADCAST ON NEW TABLES
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE risk_audit_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE risk_notifications;
COMMIT;

-- 7. RLS SECURITY POLICIES FOR NEW TABLES
ALTER TABLE risk_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on risk_audit_logs" ON risk_audit_logs;
DROP POLICY IF EXISTS "Allow public insert on risk_audit_logs" ON risk_audit_logs;
DROP POLICY IF EXISTS "Allow public select on system_settings" ON system_settings;
DROP POLICY IF EXISTS "Allow public select on risk_notifications" ON risk_notifications;

CREATE POLICY "Allow public select on risk_audit_logs" ON risk_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on risk_audit_logs" ON risk_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on system_settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public select on risk_notifications" ON risk_notifications FOR SELECT USING (true);

-- 8. SEED SYSTEM SETTINGS DEFAULTS
INSERT INTO system_settings (key, value)
VALUES 
  ('matrix_scoring_thresholds', '{"critical": 17, "high": 10, "medium": 5, "low": 1}'::jsonb),
  ('workspace_branding', '{"name": "MNB Research Business Operations", "lead": "Sunny Prasad", "email": "sunny.prasad@mnbresearch.com"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
