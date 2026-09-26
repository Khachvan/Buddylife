import { getSql, type Sql } from "./database";
import { loadRepositoryPosts, loadVisibleRepositoryPosts } from "./content-posts-store";
import { DEFAULT_COVER, effectiveState, isValidSlug, toPostRecord, type PostRecord, type PublicPost } from "./posts";

type PostRow = Record<string, unknown>;

function recordToPublic(record: PostRecord): PublicPost {
  return {
    id: record.id,
    slug: record.slug,
    language: record.language,
    category: record.category,
    title: record.title,
    excerpt: record.excerpt,
    coverUrl: record.coverUrl || DEFAULT_COVER,
    publishAt: record.publishAt || record.createdAt,
    source: record.source,
  };
}

function toPublicPost(row: PostRow): PublicPost {
  return recordToPublic(toPostRecord(row));
}

const POST_COLUMNS = `
  id, slug, language, category, title, excerpt, body, cover_media_id AS "coverMediaId",
  status, publish_at AS "publishAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function listAllPosts(sql: Sql): Promise<PostRecord[]> {
  const rows = await sql.query(`SELECT ${POST_COLUMNS} FROM cms_posts ORDER BY COALESCE(publish_at, created_at) DESC, created_at DESC`);
  return rows.map(toPostRecord);
}

export async function listPublishedPosts(sql: Sql, limit = 100): Promise<PublicPost[]> {
  const rows = await sql.query(
    `SELECT ${POST_COLUMNS} FROM cms_posts
     WHERE status IN ('published', 'scheduled') AND publish_at IS NOT NULL AND publish_at <= NOW()
     ORDER BY publish_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map(toPublicPost);
}

export async function getPublishedPost(sql: Sql, slug: string, language: string): Promise<PostRecord | null> {
  const rows = await sql.query(
    `SELECT ${POST_COLUMNS} FROM cms_posts
     WHERE slug = $1 AND status IN ('published', 'scheduled') AND publish_at IS NOT NULL AND publish_at <= NOW()
     ORDER BY CASE WHEN language = $2 THEN 0 ELSE 1 END, publish_at DESC LIMIT 1`,
    [slug, language],
  );
  return rows[0] ? toPostRecord(rows[0]) : null;
}

async function loadDatabasePosts(): Promise<PublicPost[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await listPublishedPosts(getSql());
  } catch {
    return [];
  }
}

/** Public pages call this: backoffice posts plus repository posts, newest first. A missing database simply yields no CMS posts. */
export async function loadPublicPosts(): Promise<PublicPost[]> {
  const [database, repository] = await Promise.all([loadDatabasePosts(), loadVisibleRepositoryPosts()]);
  const merged = [...database, ...repository.map(recordToPublic)];
  return merged.sort((a, b) => b.publishAt.localeCompare(a.publishAt));
}

export async function loadPublishedPost(slug: string, language: string): Promise<PostRecord | null> {
  if (!isValidSlug(slug)) return null;
  if (process.env.DATABASE_URL) {
    try {
      const fromDatabase = await getPublishedPost(getSql(), slug, language);
      if (fromDatabase) return fromDatabase;
    } catch {
      // fall through to repository posts
    }
  }
  const candidates = (await loadRepositoryPosts()).filter((post) => post.slug === slug && effectiveState(post) === "live");
  return candidates.find((post) => post.language === language) || candidates[0] || null;
}
