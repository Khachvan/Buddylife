ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS visualization_shape TEXT NOT NULL DEFAULT 'rectangle'
  CHECK (visualization_shape IN ('rectangle', 'circle', 'paw'));

CREATE INDEX IF NOT EXISTS qr_codes_created_idx
  ON qr_codes (created_at DESC);
