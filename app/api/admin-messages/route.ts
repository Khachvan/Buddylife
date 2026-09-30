import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { isUuid } from "../../../lib/qr-attribution";
import { hasSameOrigin } from "../../../lib/request-security";

const NO_STORE = { "Cache-Control": "no-store" };
const COLUMNS = `id, name, email, phone, business, message, language, page, source, notified, handled_at AS "handledAt", is_test AS "isTest", created_at AS "createdAt"`;

export async function GET() {
  try {
    await ensureSchema();
    const rows = await getSql().query(`SELECT ${COLUMNS} FROM contact_messages ORDER BY created_at DESC LIMIT 500`);
    return Response.json({ messages: rows }, { headers: NO_STORE });
  } catch (error) {
    logEvent("error", "/api/admin-messages", "Messages could not be loaded", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Messages are temporarily unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!isUuid(id)) return Response.json({ error: "Invalid message identity" }, { status: 400 });
    const sql = getSql();
    const rows =
      typeof body.handled === "boolean"
        ? await sql.query(`UPDATE contact_messages SET handled_at = ${body.handled ? "NOW()" : "NULL"} WHERE id = $1 RETURNING ${COLUMNS}`, [id])
        : typeof body.isTest === "boolean"
          ? await sql.query(`UPDATE contact_messages SET is_test = $2 WHERE id = $1 RETURNING ${COLUMNS}`, [id, body.isTest])
          : [];
    if (!rows.length) return Response.json({ error: "Message not found" }, { status: 404 });
    return Response.json({ ok: true, message: rows[0] });
  } catch (error) {
    logEvent("error", "/api/admin-messages", "Message update failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Update failed" }, { status: 503 });
  }
}
