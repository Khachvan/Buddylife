// Per-article settings that apply to every article on the site, wherever it comes from
// (backoffice, repository or built-in): hidden from the site, and pinned position on the hub.
export type ArticleSetting = { hidden: boolean; position: number | null };
export type ArticleSettings = Record<string, ArticleSetting>;

export type ArticleAction = "hide" | "show" | "pin" | "unpin" | "up" | "down";
export const ARTICLE_ACTIONS: readonly ArticleAction[] = ["hide", "show", "pin", "unpin", "up", "down"];

export function isHidden(settings: ArticleSettings, slug: string) {
  return Boolean(settings[slug]?.hidden);
}

/** Pinned articles first (lowest position first), everything else keeps its incoming order. Hidden ones are dropped. */
export function orderArticles<T extends { slug: string }>(items: T[], settings: ArticleSettings): T[] {
  const visible = items.filter((item) => !isHidden(settings, item.slug));
  const pinned = visible
    .filter((item) => typeof settings[item.slug]?.position === "number")
    .sort((a, b) => (settings[a.slug].position as number) - (settings[b.slug].position as number));
  const rest = visible.filter((item) => typeof settings[item.slug]?.position !== "number");
  return [...pinned, ...rest];
}

/** Returns the new pinned order (slugs, top first) after applying a position action. */
export function applyPinAction(pinned: string[], slug: string, action: ArticleAction): string[] {
  const without = pinned.filter((item) => item !== slug);
  const index = pinned.indexOf(slug);
  if (action === "pin") return [slug, ...without];
  if (action === "unpin") return without;
  if (index === -1) return pinned;
  if (action === "up" && index > 0) {
    const next = [...pinned];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    return next;
  }
  if (action === "down" && index < pinned.length - 1) {
    const next = [...pinned];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    return next;
  }
  return pinned;
}
