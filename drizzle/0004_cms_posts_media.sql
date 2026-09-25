CREATE TABLE IF NOT EXISTS cms_media (
  id UUID PRIMARY KEY,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT NOT NULL DEFAULT '',
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_media_created_idx ON cms_media (created_at DESC);

CREATE TABLE IF NOT EXISTS cms_posts (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hy' CHECK (language IN ('hy', 'ru', 'en', 'fa')),
  category TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  cover_media_id UUID REFERENCES cms_media(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  publish_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug, language)
);

CREATE INDEX IF NOT EXISTS cms_posts_public_idx ON cms_posts (status, publish_at DESC);
