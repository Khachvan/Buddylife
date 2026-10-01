import { getSql } from "./database";
import { applyPinAction, type ArticleAction, type ArticleSettings } from "./article-settings";

const CACHE_MS = 30 * 1000;
const store = globalThis as unknown as { __buddylifeArticleSettings?: { at: number; settings: ArticleSettings }; __buddylifeArticleSettingsReady?: Promise<void> };

function ensureTable() {
  if (!store.__buddylifeArticleSettingsReady) {
    store.__buddylifeArticleSettingsReady = (async () => {
      await getSql()`
        CREATE TABLE IF NOT EXISTS cms_article_settings (
          slug TEXT PRIMARY KEY,
          hidden BOOLEAN NOT NULL DEFAULT FALSE,
          position INTEGER,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      store.__buddylifeArticleSettingsReady = undefined;
      throw error;
    });
  }
  return store.__buddylifeArticleSettingsReady;
}

async function readSettings(): Promise<ArticleSettings> {
  await ensureTable();
  const rows = await getSql()`SELECT slug, hidden, position FROM cms_article_settings`;
  const settings: ArticleSettings = {};
  for (const row of rows) settings[String(row.slug)] = { hidden: Boolean(row.hidden), position: row.position == null ? null : Number(row.position) };
  return settings;
}

/** Public pages call this. Cached briefly; a missing database or table simply means "no settings". */
export async function loadArticleSettings(): Promise<ArticleSettings> {
  if (!process.env.DATABASE_URL) return {};
  const cached = store.__buddylifeArticleSettings;
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.settings;
  try {
    const settings = await readSettings();
    store.__buddylifeArticleSettings = { at: Date.now(), settings };
    return settings;
  } catch {
    return cached?.settings || {};
  }
}

/** Backoffice: always fresh. */
export async function loadArticleSettingsFresh(): Promise<ArticleSettings> {
  const settings = await readSettings();
  store.__buddylifeArticleSettings = { at: Date.now(), settings };
  return settings;
}

export async function applyArticleAction(slug: string, action: ArticleAction): Promise<ArticleSettings> {
  await ensureTable();
  const sql = getSql();
  if (action === "hide" || action === "show") {
    await sql`
      INSERT INTO cms_article_settings (slug, hidden, updated_at) VALUES (${slug}, ${action === "hide"}, NOW())
      ON CONFLICT (slug) DO UPDATE SET hidden = EXCLUDED.hidden, updated_at = NOW()
    `;
    return loadArticleSettingsFresh();
  }
  const current = await readSettings();
  const pinned = Object.entries(current)
    .filter(([, value]) => typeof value.position === "number")
    .sort((a, b) => (a[1].position as number) - (b[1].position as number))
    .map(([key]) => key);
  const next = applyPinAction(pinned, slug, action);
  // Rewrite positions as 1..n so they stay compact and unambiguous.
  await sql`UPDATE cms_article_settings SET position = NULL, updated_at = NOW() WHERE position IS NOT NULL`;
  for (const [index, item] of next.entries()) {
    await sql`
      INSERT INTO cms_article_settings (slug, position, updated_at) VALUES (${item}, ${index + 1}, NOW())
      ON CONFLICT (slug) DO UPDATE SET position = EXCLUDED.position, updated_at = NOW()
    `;
  }
  return loadArticleSettingsFresh();
}
