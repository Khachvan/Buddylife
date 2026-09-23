// Path-based language URLs.
// Armenian (the default) lives at the bare path: /learn
// Other languages are prefixed:                 /ru/learn, /en/learn, /fa/learn
// Legacy ?lang= URLs are permanently redirected to these paths by proxy.ts.

export const LOCALES = ["hy", "ru", "en", "fa"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "hy";
export const SITE_ORIGIN = "https://buddylife.am";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Split "/ru/learn/x" into { locale: "ru", path: "/learn/x" }. Unprefixed paths have locale null. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const match = /^\/(hy|ru|en|fa)(?=\/|$)(.*)$/.exec(pathname);
  if (!match) return { locale: null, path: pathname || "/" };
  return { locale: match[1] as Locale, path: match[2] || "/" };
}

/**
 * Build the public URL path for a page in a language.
 * Accepts an href with an optional query string and hash; any `lang` query parameter is dropped.
 */
export function localePath(locale: Locale, href: string): string {
  const url = new URL(href, SITE_ORIGIN);
  url.searchParams.delete("lang");
  const { path } = splitLocale(url.pathname);
  const prefixed = locale === DEFAULT_LOCALE ? path : path === "/" ? `/${locale}` : `/${locale}${path}`;
  return `${prefixed}${url.search}${url.hash}`;
}

/** Absolute URL for a page in a language. */
export function localeUrl(locale: Locale, href: string): string {
  return `${SITE_ORIGIN}${localePath(locale, href)}`;
}

/** hreflang map for Next.js metadata `alternates.languages`, including x-default. */
export function localeAlternates(href: string): Record<string, string> {
  return {
    hy: localePath("hy", href),
    ru: localePath("ru", href),
    en: localePath("en", href),
    fa: localePath("fa", href),
    "x-default": localePath(DEFAULT_LOCALE, href),
  };
}
