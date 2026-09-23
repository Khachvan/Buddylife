CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('parent', 'business')),
  name TEXT,
  pet_type TEXT,
  business_name TEXT,
  category TEXT,
  social TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  province TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  venue TEXT,
  is_test BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registrations_role_created_idx
  ON registrations (role, created_at DESC);

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS medium TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS campaign TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  page TEXT,
  language TEXT,
  audience TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
  ON analytics_events (event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS cms_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
