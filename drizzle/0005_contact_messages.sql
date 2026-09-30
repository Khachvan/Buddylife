CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business TEXT,
  message TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hy',
  page TEXT,
  source TEXT,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  handled_at TIMESTAMPTZ,
  is_test BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);
