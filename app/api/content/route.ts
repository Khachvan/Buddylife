import { ensureSchema, getSql } from "../../../lib/database";

const cacheHeaders = {
  "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id") || "local";
  try {
    await ensureSchema();
    const rows = await getSql()`SELECT key, value FROM cms_content`;
    console.info(JSON.stringify({ event: "cms_content_read", requestId, status: "ok", rows: rows.length, durationMs: Date.now() - startedAt }));
    return Response.json(
      { content: Object.fromEntries(rows.map((row) => [row.key, row.value])) },
      { headers: cacheHeaders },
    );
  } catch (error) {
    console.error(JSON.stringify({ event: "cms_content_read", requestId, status: "error", durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : "unknown" }));
    return Response.json({ content: {} }, { headers: cacheHeaders });
  }
}
