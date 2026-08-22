import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/access",
  "/api/unlock",
  "/favicon.svg",
  "/buddylife-logo-clean.webp",
];
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (publicPaths.some((item) => path === item) || path.startsWith("/_next/"))
    return NextResponse.next();
  const pin = process.env.SITE_PIN;
  const expected = pin ? createHash("sha256").update(pin).digest("hex") : "";
  if (expected && request.cookies.get("buddylife_access")?.value === expected)
    return NextResponse.next();
  return NextResponse.redirect(new URL("/access", request.url));
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
