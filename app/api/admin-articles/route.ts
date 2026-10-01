import { educationSlugs, hub } from "../../learn-copy";
import { ARTICLE_ACTIONS, type ArticleAction } from "../../../lib/article-settings";
import { applyArticleAction, loadArticleSettingsFresh } from "../../../lib/article-settings-store";
import { loadRepositoryPosts } from "../../../lib/content-posts-store";
import { getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { effectiveState, isValidSlug, type PostState } from "../../../lib/posts";
import { listAllPosts } from "../../../lib/posts-store";
import { hasSameOrigin } from "../../../lib/request-security";

const NO_STORE = { "Cache-Control": "no-store" };

type ArticleRow = { slug: string; title: string; source: "backoffice" | "repository" | "built-in"; languages: string[]; state: PostState; publishAt: string | null };

// One row per article (slug) across every source, so position and visibility are managed in one list.
async function listArticles(): Promise<ArticleRow[]> {
  const rows = new Map<string, ArticleRow>();
  const add = (slug: string, title: string, source: ArticleRow["source"], language: string, state: PostState, publishAt: string | null) => {
    const existing = rows.get(slug);
    if (!existing) {
      rows.set(slug, { slug, title, source, languages: [language], state, publishAt });
      return;
    }
    if (!existing.languages.includes(language)) existing.languages.push(language);
    if (state === "live") existing.state = "live";
    if (language === "hy") existing.title = title;
    if (publishAt && (!existing.publishAt || publishAt > existing.publishAt)) existing.publishAt = publishAt;
  };
  const [cmsPosts, repositoryPosts] = await Promise.all([listAllPosts(getSql()).catch(() => []), loadRepositoryPosts()]);
  for (const post of cmsPosts) add(post.slug, post.title, "backoffice", post.language, effectiveState(post), post.publishAt);
  for (const post of repositoryPosts) add(post.slug, post.title, "repository", post.language, effectiveState(post), post.publishAt);
  hub.hy.topics.forEach((topic, index) => {
    const slug = educationSlugs[index];
    if (slug && !rows.has(slug)) rows.set(slug, { slug, title: topic[1], source: "built-in", languages: ["hy", "ru", "en", "fa"], state: "live", publishAt: null });
  });
  return [...rows.values()];
}

export async function GET() {
  try {
    const [articles, settings] = await Promise.all([listArticles(), loadArticleSettingsFresh()]);
    return Response.json({ articles, settings }, { headers: NO_STORE });
  } catch (error) {
    logEvent("error", "/api/admin-articles", "Articles could not be loaded", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Articles are temporarily unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = await request.json();
    const slug = String(body.slug || "");
    const action = String(body.action || "") as ArticleAction;
    if (!isValidSlug(slug)) return Response.json({ error: "Invalid article" }, { status: 400 });
    if (!ARTICLE_ACTIONS.includes(action)) return Response.json({ error: "Unsupported article action" }, { status: 400 });
    const settings = await applyArticleAction(slug, action);
    logEvent("info", "/api/admin-articles", "Article setting changed", { slug, action });
    return Response.json({ ok: true, settings });
  } catch (error) {
    logEvent("error", "/api/admin-articles", "Article setting failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "The change could not be saved" }, { status: 503 });
  }
}
