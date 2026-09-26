#!/usr/bin/env node
// Scaffolds a repository post file. Example:
//   node scripts/new-post.mjs --title "Autumn walks" --lang en --publish-at 2026-10-01T09:00:00+04:00 \
//     --category "Everyday care" --cover /posts/2026-10-01/autumn-walks.jpg --video https://youtube.com/shorts/abc123
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
};
const slugify = (value) => value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const title = option("title");
const language = option("lang", "hy");
const slug = option("slug") || slugify(title);
if (!title || !slug) {
  console.error("Usage: node scripts/new-post.mjs --title \"...\" [--slug latin-slug] [--lang hy|ru|en|fa] [--publish-at ISO] [--category ...] [--excerpt ...] [--cover /posts/...] [--video URL] [--status draft|scheduled|published]");
  process.exit(1);
}
const publishAt = option("publish-at") || new Date().toISOString();
const status = option("status") || (Date.parse(publishAt) > Date.now() ? "scheduled" : "published");
const day = publishAt.slice(0, 10);
const directory = path.join(process.cwd(), "content", "posts");
mkdirSync(directory, { recursive: true });
const file = path.join(directory, `${day}-${slug}.${language}.json`);
if (existsSync(file)) {
  console.error(`${file} already exists`);
  process.exit(1);
}
const post = {
  slug,
  language,
  title,
  excerpt: option("excerpt"),
  category: option("category"),
  cover: option("cover") || null,
  video: option("video") ? { url: option("video") } : null,
  status,
  publishAt,
  body: "## First heading\nWrite the opening paragraph here.\n\n- A list item\n- Another list item\n\nClosing paragraph.",
};
writeFileSync(file, `${JSON.stringify(post, null, 2)}\n`);
console.log(`Created ${path.relative(process.cwd(), file)} (${status}, publishAt ${publishAt}). Edit the body, add the cover under public${post.cover || "/posts/..."}, then run: pnpm content`);
