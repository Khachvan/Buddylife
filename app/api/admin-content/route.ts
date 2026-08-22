import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import {
  analyticsEvents,
  contentItems,
  registrations,
} from "../../../db/schema";
const OWNER = "khachvantsyan@gmail.com";
async function allowed() {
  const u = await getChatGPTUser();
  return u?.email.toLowerCase() === OWNER;
}
export async function GET() {
  if (!(await allowed()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  const [content, signups, events] = await Promise.all([
    db.select().from(contentItems),
    db.select().from(registrations),
    db.select().from(analyticsEvents),
  ]);
  return Response.json({
    content: Object.fromEntries(content.map((r) => [r.contentKey, r.value])),
    registrations: signups,
    events,
  });
}
export async function POST(request: Request) {
  if (!(await allowed()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const p = (await request.json()) as { key?: string; value?: string };
  if (!p.key) return Response.json({ error: "Key required" }, { status: 400 });
  const db = getDb();
  const existing = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.contentKey, p.key))
    .limit(1);
  if (existing.length)
    await db
      .update(contentItems)
      .set({ value: p.value || "", updatedAt: new Date().toISOString() })
      .where(eq(contentItems.contentKey, p.key));
  else
    await db
      .insert(contentItems)
      .values({ contentKey: p.key, value: p.value || "" });
  return Response.json({ ok: true });
}
