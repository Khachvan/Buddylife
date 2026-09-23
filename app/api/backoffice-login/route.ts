import { cookies } from "next/headers";
import { createBackofficeSession, validBackofficeCredentials } from "../../../lib/backoffice-auth";
import { hasSameOrigin } from "../../../lib/request-security";
export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { username, password } = await request.json();
  if (!validBackofficeCredentials(String(username || ""), String(password || ""))) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const jar = await cookies();
  try {
    jar.set("buddylife_backoffice", createBackofficeSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 60 * 60 * 8, path: "/" });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Backoffice authentication is not configured" }, { status: 503 });
  }
}
