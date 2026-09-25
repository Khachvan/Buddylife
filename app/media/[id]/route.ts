import { getSql } from "../../../lib/database";
import { MEDIA_TYPES } from "../../../lib/media";
import { isUuid } from "../../../lib/qr-attribution";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  try {
    const rows = await getSql()`
      SELECT content_type AS "contentType", file_name AS "fileName", encode(data, 'base64') AS "base64"
      FROM cms_media WHERE id = ${id} LIMIT 1
    `;
    const media = rows[0];
    if (!media) return new Response("Not found", { status: 404 });
    const contentType = MEDIA_TYPES[String(media.contentType)] ? String(media.contentType) : "application/octet-stream";
    const bytes = Buffer.from(String(media.base64), "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        // Media ids never change content, so browsers and the CDN may keep them for a year.
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
        "Content-Disposition": `inline; filename="${String(media.fileName).replace(/[^A-Za-z0-9._-]+/g, "-")}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Media unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
