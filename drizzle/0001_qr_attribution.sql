CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial TEXT NOT NULL UNIQUE,
  public_token TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unassigned'
    CHECK (status IN ('unassigned', 'active', 'paused', 'retired')),
  default_destination TEXT NOT NULL DEFAULT '/?join=parent',
  design_version TEXT NOT NULL DEFAULT 'pending-final-artwork',
  batch_code TEXT NOT NULL DEFAULT 'PF-2026-01',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  venue_type TEXT NOT NULL DEFAULT 'cafe',
  address TEXT,
  city TEXT,
  province TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE RESTRICT,
  placement_id UUID NOT NULL REFERENCES qr_placements(id) ON DELETE RESTRICT,
  label_snapshot TEXT NOT NULL,
  location_label_snapshot TEXT,
  destination_path TEXT NOT NULL DEFAULT '/?join=parent',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_by TEXT NOT NULL DEFAULT 'backoffice'
);

CREATE UNIQUE INDEX IF NOT EXISTS qr_assignments_one_active_idx
  ON qr_assignments (qr_code_id)
  WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS qr_assignments_placement_idx
  ON qr_assignments (placement_id, assigned_at DESC);

CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE RESTRICT,
  qr_assignment_id UUID REFERENCES qr_assignments(id) ON DELETE SET NULL,
  visitor_key TEXT NOT NULL,
  session_key TEXT NOT NULL,
  landing_path TEXT NOT NULL,
  language TEXT,
  referrer_host TEXT,
  device_class TEXT,
  is_bot BOOLEAN NOT NULL DEFAULT FALSE,
  is_test BOOLEAN NOT NULL DEFAULT FALSE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS qr_scans_code_time_idx
  ON qr_scans (qr_code_id, scanned_at DESC);

CREATE INDEX IF NOT EXISTS qr_scans_assignment_time_idx
  ON qr_scans (qr_assignment_id, scanned_at DESC);

CREATE INDEX IF NOT EXISTS qr_scans_visitor_time_idx
  ON qr_scans (visitor_key, scanned_at DESC);

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS first_qr_scan_id UUID;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_qr_scan_id UUID;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS qr_code_id UUID;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS qr_assignment_id UUID;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS attribution_captured_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS registrations_qr_code_created_idx
  ON registrations (qr_code_id, created_at DESC)
  WHERE qr_code_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS qr_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL DEFAULT 'backoffice',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS qr_audit_log_code_created_idx
  ON qr_audit_log (qr_code_id, created_at DESC);

CREATE OR REPLACE VIEW qr_performance_daily AS
SELECT
  s.scanned_at::date AS day,
  s.qr_code_id,
  s.qr_assignment_id,
  COUNT(*) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS scans,
  COUNT(DISTINCT s.visitor_key) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS unique_visitors,
  COUNT(DISTINCT s.session_key) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS unique_sessions,
  COUNT(DISTINCT r.id) FILTER (WHERE NOT r.is_test) AS registrations
FROM qr_scans s
LEFT JOIN registrations r ON r.last_qr_scan_id = s.id
GROUP BY s.scanned_at::date, s.qr_code_id, s.qr_assignment_id;
