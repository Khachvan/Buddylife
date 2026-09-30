// Content branches (codex/*) may only add or change content. Usage:
//   node scripts/guard-content-branch.mjs <base-ref>
import { execFileSync } from "node:child_process";

const base = process.argv[2] || "origin/main";
const allowed = [/^content\//, /^public\/posts\//, /^public\/videos\//];
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const MAX_BEHIND = 40;
const mergeBase = git("merge-base", base, "HEAD");
const behind = Number(git("rev-list", "--count", `HEAD..${base}`));
const changed = git("diff", "--name-only", `${mergeBase}...HEAD`).split("\n").filter(Boolean);
const outside = changed.filter((file) => !allowed.some((pattern) => pattern.test(file)));
const problems = [];
if (outside.length) problems.push(`files outside the content folders:\n${outside.map((file) => `    ${file}`).join("\n")}`);
if (behind > MAX_BEHIND) problems.push(`the branch is ${behind} commits behind main (based on ${mergeBase.slice(0, 7)}). Start content branches from a fresh origin/main.`);

if (problems.length) {
  console.error("Content branch check failed:\n- " + problems.join("\n- "));
  console.error("\nCodex branches may only touch content/, public/posts/ and public/videos/. Code changes belong to Claude Code; see docs/CODEX-BRIEF.md.");
  process.exit(1);
}
console.log(`Content branch check passed: ${changed.length} content file(s), ${behind} commit(s) behind main.`);
