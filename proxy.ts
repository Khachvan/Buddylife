import { NextRequest, NextResponse } from "next/server";
import { validBackofficeSession } from "./lib/backoffice-auth";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host")?.split(":")[0] || "";
  const requestedLanguage = request.nextUrl.searchParams.get("lang");
  const language = requestedLanguage === "ru" || requestedLanguage === "en" || requestedLanguage === "fa" ? requestedLanguage : "hy";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-buddylife-lang", language);
  const continueRequest = () => NextResponse.next({ request: { headers: requestHeaders } });
  const isBackofficeHost = host === "backoffice.buddylife.am";
  const isPublicAsset = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(path);
  const backofficePublic =
    path === "/backoffice" ||
    path === "/api/backoffice-login" ||
    path === "/api/backoffice-logout";
  const backofficeProtected =
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/api/admin-") ||
    path === "/api/seo-health";

  if (isBackofficeHost && path.startsWith("/q/")) {
    const publicQrUrl = new URL(path, "https://buddylife.am");
    publicQrUrl.search = request.nextUrl.search;
    return NextResponse.redirect(publicQrUrl, 308);
  }
  if (isBackofficeHost && path === "/")
    return NextResponse.redirect(new URL("/backoffice", request.url));
  if (
    (isBackofficeHost || backofficePublic || backofficeProtected) &&
    (path.startsWith("/_next/") || isPublicAsset || backofficePublic)
  )
    return continueRequest();
  if (isBackofficeHost || backofficeProtected) {
    if (
      validBackofficeSession(request.cookies.get("buddylife_backoffice")?.value)
    )
      return continueRequest();
    if (!isBackofficeHost && host && host !== "localhost")
      return NextResponse.redirect(
        "https://backoffice.buddylife.am/backoffice",
      );
    return NextResponse.redirect(new URL("/backoffice", request.url));
  }
  return continueRequest();
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
