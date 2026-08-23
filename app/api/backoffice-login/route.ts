import { cookies } from "next/headers";
import { BACKOFFICE_SESSION, validBackofficeCredentials } from "../../../lib/backoffice-auth";
export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (!validBackofficeCredentials(String(username || ""), String(password || ""))) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const jar = await cookies();
  jar.set("buddylife_backoffice", BACKOFFICE_SESSION, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 8, path: "/" });
  return Response.json({ ok: true });
}
