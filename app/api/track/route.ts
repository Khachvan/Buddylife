import { getDb } from "../../../db";
import { analyticsEvents } from "../../../db/schema";

const allowed = new Set([
  "join_opened",
  "audience_selected",
  "registration_completed",
  "language_changed",
  "education_opened",
]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const eventType = String(payload.eventType || "");
    if (!allowed.has(eventType))
      return Response.json({ error: "Unsupported event" }, { status: 400 });
    await getDb()
      .insert(analyticsEvents)
      .values({
        eventType,
        page: String(payload.page || "/").slice(0, 120),
        language: String(payload.language || "").slice(0, 8),
        audience: String(payload.audience || "").slice(0, 20),
        metadata: JSON.stringify(payload.metadata || {}),
      });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Event could not be saved" },
      { status: 500 },
    );
  }
}
