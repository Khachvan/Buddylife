import type { MetadataRoute } from "next";
import { ARTICLE_PUBLISHED, PAGE_UPDATED, newestArticleDate } from "../lib/content-dates";
import { LOCALES, localeUrl } from "../lib/locale";
import { loadPublicPosts } from "../lib/posts-store";

// Re-read CMS posts at most once an hour so scheduled posts join the sitemap after they go live.
export const revalidate = 3600;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const pages: Array<[route: string, changeFrequency: ChangeFrequency, priority: number, lastModified: string]> = [
  ["", "weekly", 1, PAGE_UPDATED[""]],
  ["/pet-parents", "monthly", 0.9, PAGE_UPDATED["/pet-parents"]],
  ["/for-business", "monthly", 0.9, PAGE_UPDATED["/for-business"]],
  ["/features", "monthly", 0.85, PAGE_UPDATED["/features"]],
  ["/learn", "weekly", 0.9, newestArticleDate()],
  ...Object.entries(ARTICLE_PUBLISHED).map(
    ([slug, date]): [string, ChangeFrequency, number, string] => [`/learn/${slug}`, "monthly", 0.85, date],
  ),
  ["/verification", "monthly", 0.7, PAGE_UPDATED["/verification"]],
  ["/privacy", "yearly", 0.3, PAGE_UPDATED["/privacy"]],
  ["/terms", "yearly", 0.3, PAGE_UPDATED["/terms"]],
];

// One entry per page per language, each listing all language versions (hreflang).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = pages.flatMap(([route, changeFrequency, priority, lastModified]) => {
    const href = route || "/";
    const languages = Object.fromEntries(LOCALES.map((locale) => [locale, localeUrl(locale, href)]));
    return LOCALES.map((locale) => ({
      url: localeUrl(locale, href),
      lastModified: new Date(lastModified),
      changeFrequency,
      priority,
      alternates: { languages: { ...languages, "x-default": localeUrl("hy", href) } },
    }));
  });
  const posts = await loadPublicPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: localeUrl(post.language, `/learn/${post.slug}`),
    lastModified: new Date(post.publishAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...staticEntries, ...postEntries];
}
