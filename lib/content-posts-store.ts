import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { validateContentPost, type ContentPost } from "./content-posts";
import { effectiveState, type PostRecord } from "./posts";

export const CONTENT_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const CACHE_MS = 30 * 1000;

type Cache = { at: number; posts: PostRecord[] };
const store = globalThis as unknown as { __buddylifeContentPosts?: Cache };

export function toRepositoryRecord(post: ContentPost, file: string): PostRecord {
  const stamp = post.publishAt || post.updatedAt || new Date(0).toISOString();
  return {
    id: `repo:${post.language}:${post.slug}`,
    slug: post.slug,
    language: post.language,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    coverMediaId: null,
    coverUrl: post.cover,
    status: post.status,
    publishAt: post.publishAt,
    createdAt: stamp,
    updatedAt: post.updatedAt || stamp,
    video: post.video,
    source: "repository",
    file,
  };
}

/** Every valid post file, all statuses. Invalid files are skipped with a warning so one bad file never breaks the site. */
export async function loadRepositoryPosts(): Promise<PostRecord[]> {
  const cached = store.__buddylifeContentPosts;
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.posts;
  let files: string[] = [];
  try {
    files = (await readdir(CONTENT_POSTS_DIR)).filter((name) => name.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const posts: PostRecord[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    try {
      const parsed = JSON.parse(await readFile(path.join(CONTENT_POSTS_DIR, file), "utf8"));
      const result = validateContentPost(parsed);
      if (!result.ok) {
        console.warn(JSON.stringify({ level: "warn", route: "content/posts", message: "Skipping invalid post file", file, errors: result.errors }));
        continue;
      }
      const key = `${result.value.language}:${result.value.slug}`;
      if (seen.has(key)) {
        console.warn(JSON.stringify({ level: "warn", route: "content/posts", message: "Duplicate slug and language", file }));
        continue;
      }
      seen.add(key);
      posts.push(toRepositoryRecord(result.value, file));
    } catch (error) {
      console.warn(JSON.stringify({ level: "warn", route: "content/posts", message: "Unreadable post file", file, error: error instanceof Error ? error.message : "unknown" }));
    }
  }
  posts.sort((a, b) => (b.publishAt || b.createdAt).localeCompare(a.publishAt || a.createdAt));
  store.__buddylifeContentPosts = { at: Date.now(), posts };
  return posts;
}

export async function loadVisibleRepositoryPosts(now = new Date()): Promise<PostRecord[]> {
  return (await loadRepositoryPosts()).filter((post) => effectiveState(post, now) === "live");
}
