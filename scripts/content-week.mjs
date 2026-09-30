#!/usr/bin/env node
// Prints the publishing plan for the coming days from content/posts, in Yerevan time.
// Usage: node scripts/content-week.mjs [--days 7]
// Use it before planning a week: empty days are marked, so a chat session can fill them
// with `pnpm post:new -- --publish-at <day>T09:00:00+04:00 ...`.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const daysIndex = args.indexOf("--days");
const days = Math.min(Math.max(Number(daysIndex === -1 ? 7 : args[daysIndex + 1]) || 7, 1), 31);
const YEREVAN_OFFSET_MS = 4 * 60 * 60 * 1000;
const yerevanDay = (ms) => new Date(ms + YEREVAN_OFFSET_MS).toISOString().slice(0, 10);
const yerevanTime = (ms) => new Date(ms + YEREVAN_OFFSET_MS).toISOString().slice(11, 16);

const directory = path.join(process.cwd(), "content", "posts");
const files = existsSync(directory) ? readdirSync(directory).filter((name) => name.endsWith(".json")).sort() : [];
const byDay = new Map();
for (const file of files) {
  let post;
  try {
    post = JSON.parse(readFileSync(path.join(directory, file), "utf8"));
  } catch {
    continue;
  }
  if (post.status !== "scheduled" && post.status !== "published") continue;
  const at = Date.parse(post.publishAt);
  if (Number.isNaN(at)) continue;
  const day = yerevanDay(at);
  if (!byDay.has(day)) byDay.set(day, []);
  byDay.get(day).push({ at, file, post });
}

const now = Date.now();
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
let empty = 0;
console.log(`Publishing plan, next ${days} day(s), Yerevan time (+04:00)`);
for (let index = 0; index < days; index += 1) {
  const ms = now + index * 24 * 60 * 60 * 1000;
  const day = yerevanDay(ms);
  const label = `${weekday.format(new Date(`${day}T00:00:00Z`))} ${day}`;
  const items = (byDay.get(day) || []).sort((a, b) => a.at - b.at);
  if (!items.length) {
    empty += 1;
    console.log(`${label}  EMPTY  -> --publish-at ${day}T09:00:00+04:00`);
    continue;
  }
  console.log(label);
  for (const { at, file, post } of items) {
    console.log(`  ${yerevanTime(at)}  ${String(post.language).toUpperCase()}  ${at > now ? "scheduled" : "live     "}  ${post.title}  (${file})`);
  }
}
console.log(`${days - empty} day(s) planned, ${empty} empty.`);
