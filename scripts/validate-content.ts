// Validates every post file under content/posts and the assets they reference.
// Usage: node scripts/validate-content.ts   (also runs in `pnpm check:fast`)
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { validateContentPost } from "../lib/content-posts.ts";

const root = process.cwd();
const directory = path.join(root, "content", "posts");
const files = existsSync(directory) ? (await readdir(directory)).filter((name) => name.endsWith(".json")).sort() : [];
const problems: string[] = [];
const seen = new Map<string, string>();
let scheduled = 0;
let live = 0;

for (const file of files) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path.join(directory, file), "utf8"));
  } catch (error) {
    problems.push(`${file}: not valid JSON (${error instanceof Error ? error.message : "unknown"})`);
    continue;
  }
  const result = validateContentPost(parsed);
  if (!result.ok) {
    for (const error of result.errors) problems.push(`${file}: ${error}`);
    continue;
  }
  const post = result.value;
  const expectedSuffix = `-${post.slug}.${post.language}.json`;
  if (!file.endsWith(expectedSuffix)) problems.push(`${file}: rename to <YYYY-MM-DD>${expectedSuffix} so the file name matches slug and language`);
  const key = `${post.language}:${post.slug}`;
  if (seen.has(key)) problems.push(`${file}: duplicates ${seen.get(key)} (same slug and language)`);
  seen.set(key, file);
  if (post.cover && post.cover.startsWith("/") && !existsSync(path.join(root, "public", post.cover))) problems.push(`${file}: cover ${post.cover} does not exist under public/`);
  if (post.video && post.video.url.startsWith("/") && !existsSync(path.join(root, "public", post.video.url))) problems.push(`${file}: video ${post.video.url} does not exist under public/`);
  if (post.status === "published" || post.status === "scheduled") {
    if (post.publishAt && Date.parse(post.publishAt) > Date.now()) scheduled += 1;
    else live += 1;
  }
}

if (problems.length) {
  console.error(`content/posts: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`content/posts: ${files.length} file(s) valid, ${live} live, ${scheduled} scheduled`);
