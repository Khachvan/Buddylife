import { cookies } from "next/headers";
import { createBackofficeSession, validBackofficeCredentials } from "../../../lib/backoffice-auth";
import { normalizeUsername } from "../../../lib/backoffice-users";
import { authenticateUser } from "../../../lib/backoffice-users-store";
import { logEvent } from "../../../lib/logging";
import { hasSameOrigin } from "../../../lib/request-security";

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { username, password } = await request.json();
  const name = String(username || "");
  const secret = String(password || "");
  // The owner login from the environment always works; other accounts live in the database.
  let session: { user: string; role: "owner" | "editor" } | null = validBackofficeCredentials(name, secret) ? { user: "owner", role: "owner" } : null;
  if (!session) {
    const account = await authenticateUser(normalizeUsername(name), secret);
    if (account) session = { user: account.username, role: account.role };
  }
  if (!session) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const jar = await cookies();
  try {
    jar.set("buddylife_backoffice", createBackofficeSession(session.user, session.role), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 8, path: "/" });
    logEvent("info", "/api/backoffice-login", "Backoffice sign-in", { user: session.user, role: session.role });
    return Response.json({ ok: true, role: session.role });
  } catch {
    return Response.json({ error: "Backoffice authentication is not configured" }, { status: 503 });
  }
}
