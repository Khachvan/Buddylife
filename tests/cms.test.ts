import assert from "node:assert/strict";
import test from "node:test";

import { effectiveState, isValidSlug, normalizePostInput, renderBody, slugify } from "../lib/posts.ts";
import { imageDimensions, safeFileName, validateMediaUpload } from "../lib/media.ts";
import { splitStatements } from "../lib/migrations.ts";

test("slugs are Latin, lowercase and hyphenated", () => {
  assert.equal(slugify("  Summer Walk Safety!  "), "summer-walk-safety");
  assert.equal(slugify("Ամառային անվտանգություն"), "");
  assert.equal(isValidSlug("summer-walk-safety"), true);
  assert.equal(isValidSlug("-bad"), false);
  assert.equal(isValidSlug("ab"), false);
});

test("post state follows status and publish time", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  assert.equal(effectiveState({ status: "draft", publishAt: null }, now), "draft");
  assert.equal(effectiveState({ status: "scheduled", publishAt: "2026-09-26T09:00:00Z" }, now), "scheduled");
  assert.equal(effectiveState({ status: "scheduled", publishAt: "2026-09-25T09:00:00Z" }, now), "live");
  assert.equal(effectiveState({ status: "published", publishAt: "2026-09-25T09:00:00Z" }, now), "live");
  assert.equal(effectiveState({ status: "archived", publishAt: "2026-09-25T09:00:00Z" }, now), "archived");
});

test("body renders headings, paragraphs and lists", () => {
  assert.deepEqual(renderBody("## Heading\nFirst line\nsecond line\n\n- one\n- two\n\nLast paragraph"), [
    { type: "heading", text: "Heading" },
    { type: "paragraph", text: "First line second line" },
    { type: "list", items: ["one", "two"] },
    { type: "paragraph", text: "Last paragraph" },
  ]);
});

test("post input is validated and publish time is filled for immediate publishing", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  const missingTitle = normalizePostInput({ slug: "x-y", language: "hy", status: "draft" }, now);
  assert.equal(missingTitle.ok, false);
  const badSlug = normalizePostInput({ title: "Hi", slug: "Bad Slug", language: "hy", status: "draft" }, now);
  assert.equal(badSlug.ok, false);
  const scheduledWithoutDate = normalizePostInput({ title: "Hi", slug: "hello", language: "ru", status: "scheduled" }, now);
  assert.equal(scheduledWithoutDate.ok, false);
  const published = normalizePostInput({ title: " Hi ", slug: "HELLO", language: "en", status: "published", coverMediaId: "nope", body: "a\r\nb" }, now);
  assert.ok(published.ok);
  assert.equal(published.value.publishAt, now.toISOString());
  assert.equal(published.value.slug, "hello");
  assert.equal(published.value.coverMediaId, null);
  assert.equal(published.value.body, "a\nb");
});

test("media uploads are limited to images under 4 MB and dimensions are read from headers", () => {
  assert.equal(validateMediaUpload({ type: "image/png", size: 10, name: "a.png" }), null);
  assert.match(validateMediaUpload({ type: "text/html", size: 10, name: "a.html" }) || "", /JPEG/);
  assert.match(validateMediaUpload({ type: "image/png", size: 5 * 1024 * 1024, name: "a.png" }) || "", /4 MB/);
  assert.equal(safeFileName("My Photo (1).JPG", "image/jpeg"), "My-Photo-1.jpg");
  const png = new Uint8Array(24);
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0x04, 0xb0, 0, 0, 0x03, 0x20]);
  assert.deepEqual(imageDimensions(png), { width: 1200, height: 800 });
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x10, 0x00, 0x08, 0x00]);
  assert.deepEqual(imageDimensions(gif), { width: 16, height: 8 });
});

test("migration files split into statements on semicolon line ends", () => {
  assert.deepEqual(splitStatements("CREATE TABLE a (x INT);\n\nCREATE INDEX i ON a (x);\n"), ["CREATE TABLE a (x INT)", "CREATE INDEX i ON a (x)"]);
});
