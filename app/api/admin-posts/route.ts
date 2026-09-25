import { getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { normalizePostInput, toPostRecord } from "../../../lib/posts";
import { listAllPosts } from "../../../lib/posts-store";
import { isUuid } from "../../../lib/qr-attribution";
import { hasSameOrigin } from "../../../lib/request-security";

const NO_STORE = { "Cache-Control": "no-store" };

function unavailable(error: unknown, message: string) {
  const detail = error instanceof Error ? error.message : "Unknown error";
  logEvent("error", "/api/admin-posts", message, { error: detail });
  const missingTable = /cms_posts|does not exist/i.test(detail);
  return Response.json(
    { error: missingTable ? "The posts tables are not installed yet. Apply pending migrations from the Database page." : message },
    { status: 503, headers: NO_STORE },
  );
}

export async function GET() {
  try {
    return Response.json({ posts: await listAllPosts(getSql()) }, { headers: NO_STORE });
  } catch (error) {
    return unavailable(error, "Posts could not be loaded");
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const action = String(body.action || "");
  const sql = getSql();

  try {
    if (action === "delete") {
      const id = String(body.id || "");
      if (!isUuid(id)) return Response.json({ error: "Invalid post identity" }, { status: 400 });
      const rows = await sql`DELETE FROM cms_posts WHERE id = ${id} RETURNING id`;
      if (!rows.length) return Response.json({ error: "Post not found" }, { status: 404 });
      logEvent("info", "/api/admin-posts", "Post deleted", { id });
      return Response.json({ ok: true });
    }

    if (action === "save") {
      const normalized = normalizePostInput(body.post);
      if (!normalized.ok) return Response.json({ error: normalized.error }, { status: 400 });
      const post = normalized.value;
      const rawId = body.post && typeof body.post === "object" ? (body.post as Record<string, unknown>).id : null;
      const id = typeof rawId === "string" && isUuid(rawId) ? rawId : null;
      if (post.coverMediaId) {
        const media = await sql`SELECT id FROM cms_media WHERE id = ${post.coverMediaId} LIMIT 1`;
        if (!media.length) return Response.json({ error: "The selected cover image no longer exists" }, { status: 400 });
      }
      const conflicts = await sql`
        SELECT id FROM cms_posts WHERE slug = ${post.slug} AND language = ${post.language} AND id <> ${id || "00000000-0000-4000-8000-000000000000"} LIMIT 1
      `;
      if (conflicts.length) return Response.json({ error: "Another post in this language already uses that slug" }, { status: 409 });

      const rows = id
        ? await sql`
            UPDATE cms_posts
            SET slug = ${post.slug}, language = ${post.language}, category = ${post.category}, title = ${post.title},
                excerpt = ${post.excerpt}, body = ${post.body}, cover_media_id = ${post.coverMediaId},
                status = ${post.status}, publish_at = ${post.publishAt}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING id, slug, language, category, title, excerpt, body, cover_media_id AS "coverMediaId",
                      status, publish_at AS "publishAt", created_at AS "createdAt", updated_at AS "updatedAt"
          `
        : await sql`
            INSERT INTO cms_posts (id, slug, language, category, title, excerpt, body, cover_media_id, status, publish_at)
            VALUES (${crypto.randomUUID()}, ${post.slug}, ${post.language}, ${post.category}, ${post.title}, ${post.excerpt},
                    ${post.body}, ${post.coverMediaId}, ${post.status}, ${post.publishAt})
            RETURNING id, slug, language, category, title, excerpt, body, cover_media_id AS "coverMediaId",
                      status, publish_at AS "publishAt", created_at AS "createdAt", updated_at AS "updatedAt"
          `;
      if (!rows.length) return Response.json({ error: "Post not found" }, { status: 404 });
      logEvent("info", "/api/admin-posts", id ? "Post updated" : "Post created", { slug: post.slug, status: post.status });
      return Response.json({ ok: true, post: toPostRecord(rows[0]) }, { status: id ? 200 : 201 });
    }

    return Response.json({ error: "Unsupported post action" }, { status: 400 });
  } catch (error) {
    return unavailable(error, "Post could not be saved");
  }
}
