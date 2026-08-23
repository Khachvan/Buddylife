import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { BACKOFFICE_SESSION } from "./lib/backoffice-auth";

const publicPaths = [
  "/access",
  "/api/unlock",
  "/favicon.svg",
  "/buddylife-favicon.png",
  "/buddylife-logo-clean.webp",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host")?.split(":")[0] || "";
  const isBackofficeHost = host === "backoffice.buddylife.am";
  const isPublicAsset = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(path);
  const backofficePublic = path === "/backoffice" || path === "/api/backoffice-login" || path === "/api/backoffice-logout";
  const backofficeProtected = path === "/admin" || path.startsWith("/admin/") || path === "/api/admin-content";

  if (isBackofficeHost && path === "/") return NextResponse.redirect(new URL("/backoffice", request.url));
  if ((isBackofficeHost || backofficePublic || backofficeProtected) && (path.startsWith("/_next/") || isPublicAsset || backofficePublic)) return NextResponse.next();
  if (isBackofficeHost || backofficeProtected) {
    if (request.cookies.get("buddylife_backoffice")?.value === BACKOFFICE_SESSION) return NextResponse.next();
    if (!isBackofficeHost && host && host !== "localhost") return NextResponse.redirect("https://backoffice.buddylife.am/backoffice");
    return NextResponse.redirect(new URL("/backoffice", request.url));
  }
  if (
    publicPaths.some((item) => path === item) ||
    path.startsWith("/_next/") ||
    isPublicAsset
  )
    return NextResponse.next();
  const pin = process.env.SITE_PIN;
  const expected = pin ? createHash("sha256").update(pin).digest("hex") : "";
  if (expected && request.cookies.get("buddylife_access")?.value === expected)
    return NextResponse.next();
  return NextResponse.redirect(new URL("/access", request.url));
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
