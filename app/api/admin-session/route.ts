import { cookies } from "next/headers";
import { readBackofficeSession } from "../../../lib/backoffice-auth";

export async function GET() {
  const session = readBackofficeSession((await cookies()).get("buddylife_backoffice")?.value);
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });
  return Response.json({ user: session.user, role: session.role, expiresAt: new Date(session.expiresAt).toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
