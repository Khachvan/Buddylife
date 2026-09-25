import { getSql, type Sql } from "./database";
import { DEFAULT_COVER, isValidSlug, toPostRecord, type PostRecord, type PublicPost } from "./posts";

type PostRow = Record<string, unknown>;

function toPublicPost(row: PostRow): PublicPost {
  const record = toPostRecord(row);
  return {
    id: record.id,
    slug: record.slug,
    language: record.language,
    category: record.category,
    title: record.title,
    excerpt: record.excerpt,
    coverUrl: record.coverUrl || DEFAULT_COVER,
    publishAt: record.publishAt || record.createdAt,
  };
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

/** Public pages call this; a missing database or an unapplied migration simply yields no CMS posts. */
export async function loadPublicPosts(): Promise<PublicPost[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await listPublishedPosts(getSql());
  } catch {
    return [];
  }
}

export async function loadPublishedPost(slug: string, language: string): Promise<PostRecord | null> {
  if (!process.env.DATABASE_URL || !isValidSlug(slug)) return null;
  try {
    return await getPublishedPost(getSql(), slug, language);
  } catch {
    return null;
  }
}
