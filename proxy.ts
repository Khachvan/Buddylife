import { NextRequest, NextResponse } from "next/server";
import { validBackofficeSession } from "./lib/backoffice-auth";
import { hasSameOrigin } from "./lib/request-security";
import { DEFAULT_LOCALE, isLocale, localePath, splitLocale } from "./lib/locale";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host")?.split(":")[0] || "";
  const isBackofficeHost = host === "backoffice.buddylife.am";
  const isPublicAsset = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(path);
  const isStaticFile = /\.[a-z0-9]+$/i.test(path);
  const { locale: pathLocale, path: barePath } = splitLocale(path);
  // Locale handling applies to public pages only. The checks run on the path
  // with any language prefix removed, so /ru/admin can never bypass auth below.
  const isLocalizablePage =
    !isBackofficeHost &&
    !isStaticFile &&
    !barePath.startsWith("/api/") &&
    !barePath.startsWith("/_next/") &&
    !barePath.startsWith("/q/") &&
    !barePath.startsWith("/media/") &&
    !barePath.startsWith("/admin") &&
    !barePath.startsWith("/backoffice") &&
    !barePath.includes("/opengraph-image");

  if (isLocalizablePage) {
    const legacyLanguage = request.nextUrl.searchParams.get("lang");
    const isRead = request.method === "GET" || request.method === "HEAD";

    // /hy/... and legacy ?lang=xx links move permanently to the canonical path.
    if (isRead && (pathLocale === DEFAULT_LOCALE || (legacyLanguage !== null && pathLocale === null))) {
      const target = pathLocale === DEFAULT_LOCALE ? DEFAULT_LOCALE : isLocale(legacyLanguage) ? legacyLanguage : DEFAULT_LOCALE;
      const destination = new URL(localePath(target, `${barePath}${request.nextUrl.search}`), request.url);
      return NextResponse.redirect(destination, 308);
    }

    // /ru/learn is served by the /learn page with lang=ru.
    if (pathLocale && pathLocale !== DEFAULT_LOCALE) {
      const rewritten = request.nextUrl.clone();
      rewritten.pathname = barePath;
      rewritten.searchParams.set("lang", pathLocale);
      const localizedHeaders = new Headers(request.headers);
      localizedHeaders.set("x-buddylife-lang", pathLocale);
      return NextResponse.rewrite(rewritten, { request: { headers: localizedHeaders } });
    }
  }

  const requestedLanguage = request.nextUrl.searchParams.get("lang");
  const language = isLocale(requestedLanguage) ? requestedLanguage : DEFAULT_LOCALE;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-buddylife-lang", language);
  const continueRequest = () => NextResponse.next({ request: { headers: requestHeaders } });
  const backofficePublic =
    path === "/backoffice" ||
    path === "/api/backoffice-login" ||
    path === "/api/backoffice-logout";
  const backofficeProtected =
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/api/admin-") ||
    path === "/api/seo-health";

  // Every state-changing backoffice request must come from the page itself.
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (
    isMutation &&
    (isBackofficeHost || backofficeProtected || path === "/api/backoffice-login") &&
    !hasSameOrigin(request)
  )
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

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
