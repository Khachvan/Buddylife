import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { hasSameOrigin } from "../../../lib/request-security";

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) return Response.json({ error: "Missing registration ID" }, { status: 400 });
    await ensureSchema();
    const rows = await getSql()`UPDATE registrations SET is_test = ${Boolean(body.isTest)} WHERE id = ${id} RETURNING id`;
    if (!rows.length) return Response.json({ error: "Registration not found" }, { status: 404 });
    logEvent("info", "/api/admin-registration", "Registration status updated", { isTest: Boolean(body.isTest) });
    return Response.json({ ok: true });
  } catch (error) {
    logEvent("error", "/api/admin-registration", "Registration status update failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Update failed" }, { status: 503 });
  }
}
