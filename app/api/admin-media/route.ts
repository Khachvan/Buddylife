import { getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { imageDimensions, mediaUrl, safeFileName, validateMediaUpload, type MediaRecord } from "../../../lib/media";
import { isUuid } from "../../../lib/qr-attribution";
import { hasSameOrigin } from "../../../lib/request-security";

const NO_STORE = { "Cache-Control": "no-store" };
const COLUMNS = `id, file_name AS "fileName", content_type AS "contentType", byte_size AS "byteSize", width, height, alt_text AS "altText", created_at AS "createdAt"`;

function toRecord(row: Record<string, unknown>): MediaRecord {
  const createdAt = row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt);
  return {
    id: String(row.id),
    fileName: String(row.fileName),
    contentType: String(row.contentType),
    byteSize: Number(row.byteSize),
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    altText: String(row.altText || ""),
    createdAt,
    url: mediaUrl(String(row.id)),
  };
}

function unavailable(error: unknown, message: string) {
  const detail = error instanceof Error ? error.message : "Unknown error";
  logEvent("error", "/api/admin-media", message, { error: detail });
  const missingTable = /cms_media|does not exist/i.test(detail);
  return Response.json(
    { error: missingTable ? "The media tables are not installed yet. Apply pending migrations from the Database page." : message },
    { status: 503, headers: NO_STORE },
  );
}

export async function GET() {
  try {
    const rows = await getSql().query(`SELECT ${COLUMNS} FROM cms_media ORDER BY created_at DESC LIMIT 500`);
    return Response.json({ media: rows.map(toRecord) }, { headers: NO_STORE });
  } catch (error) {
    return unavailable(error, "Media library could not be loaded");
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const sql = getSql();
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return Response.json({ error: "Choose an image to upload" }, { status: 400 });
      const problem = validateMediaUpload(file);
      if (problem) return Response.json({ error: problem }, { status: 400 });
      const bytes = new Uint8Array(await file.arrayBuffer());
      const dimensions = imageDimensions(bytes);
      const id = crypto.randomUUID();
      const altText = String(form.get("altText") || "").trim().slice(0, 200);
      const base64 = Buffer.from(bytes).toString("base64");
      const rows = await sql.query(
        `INSERT INTO cms_media (id, file_name, content_type, byte_size, width, height, alt_text, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, decode($8, 'base64'))
         RETURNING ${COLUMNS}`,
        [id, safeFileName(file.name, file.type), file.type, bytes.byteLength, dimensions?.width ?? null, dimensions?.height ?? null, altText, base64],
      );
      logEvent("info", "/api/admin-media", "Media uploaded", { id, bytes: bytes.byteLength, type: file.type });
      return Response.json({ ok: true, media: toRecord(rows[0]) }, { status: 201 });
    }

    const body = await request.json();
    const action = String(body.action || "");
    const id = String(body.id || "");
    if (!isUuid(id)) return Response.json({ error: "Invalid media identity" }, { status: 400 });

    if (action === "delete") {
      const rows = await sql`DELETE FROM cms_media WHERE id = ${id} RETURNING id`;
      if (!rows.length) return Response.json({ error: "Image not found" }, { status: 404 });
      logEvent("info", "/api/admin-media", "Media deleted", { id });
      return Response.json({ ok: true });
    }

    if (action === "update") {
      const altText = String(body.altText || "").trim().slice(0, 200);
      const rows = await sql.query(`UPDATE cms_media SET alt_text = $1 WHERE id = $2 RETURNING ${COLUMNS}`, [altText, id]);
      if (!rows.length) return Response.json({ error: "Image not found" }, { status: 404 });
      return Response.json({ ok: true, media: toRecord(rows[0]) });
    }

    return Response.json({ error: "Unsupported media action" }, { status: 400 });
  } catch (error) {
    return unavailable(error, "Media change failed");
  }
}
