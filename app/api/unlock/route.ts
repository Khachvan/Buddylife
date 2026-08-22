import { createHash } from "node:crypto";
import { cookies } from "next/headers";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export async function POST(request: Request) {
  const { pin } = (await request.json()) as { pin?: string };
  const expected = process.env.SITE_PIN;
  if (!expected || digest(String(pin || "")) !== digest(expected))
    return Response.json({ error: "Invalid PIN" }, { status: 401 });
  const jar = await cookies();
  jar.set("buddylife_access", digest(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
  return Response.json({ ok: true });
}
