import { ensureSchema, getSql } from "../../../lib/database";
import { normalizeContactInput } from "../../../lib/contact";
import { sendContactNotification } from "../../../lib/email";
import { logEvent } from "../../../lib/logging";
import { hasSameOrigin } from "../../../lib/request-security";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const normalized = normalizeContactInput(body);
  if (!normalized.ok) return Response.json({ error: normalized.error }, { status: 400 });
  const message = normalized.value;
  try {
    await ensureSchema();
    const sql = getSql();
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO contact_messages (id, name, email, phone, business, message, language, page, source)
      VALUES (${id}, ${message.name}, ${message.email}, ${message.phone}, ${message.business}, ${message.message}, ${message.language}, ${message.page}, ${message.source})
    `;
    // The owner gets the message by email with the sender as reply-to; a mail problem never fails the request.
    const mail = await sendContactNotification({ id, ...message });
    if (mail.sent) await sql`UPDATE contact_messages SET notified = TRUE WHERE id = ${id}`;
    logEvent("info", "/api/contact", "Contact message stored", { notified: mail.sent, hasBusiness: Boolean(message.business) });
    return Response.json({ ok: true, id, notified: mail.sent }, { status: 201 });
  } catch (error) {
    logEvent("error", "/api/contact", "Contact message failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "The message could not be sent right now" }, { status: 503 });
  }
}
