import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = String(body.eventType || "").trim();
    if (!eventType) return Response.json({ error: "Missing event type" }, { status: 400 });
    await ensureSchema();
    await getSql()`
      INSERT INTO analytics_events (id, event_type, page, language, audience, metadata)
      VALUES (${crypto.randomUUID()}, ${eventType}, ${String(body.page || "") || null}, ${String(body.language || "") || null}, ${String(body.audience || "") || null}, ${JSON.stringify(body.metadata || {})}::jsonb)
    `;
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    logEvent("error", "/api/track", "Analytics event storage failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ ok: false }, { status: 202 });
  }
}
