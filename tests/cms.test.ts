import assert from "node:assert/strict";
import test from "node:test";

import { effectiveState, isValidSlug, normalizePostInput, normalizeVideoUrl, renderBody, renderInline, slugify, toPostRecord } from "../lib/posts.ts";
import { imageDimensions, safeFileName, validateMediaUpload } from "../lib/media.ts";
import { normalizeContactInput } from "../lib/contact.ts";
import { applyPinAction, orderArticles } from "../lib/article-settings.ts";
import { hashPassword, passwordProblem, roleAllows, validUsername, verifyPassword } from "../lib/backoffice-users.ts";
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

test("callout lines and links render as their own blocks", () => {
  assert.deepEqual(renderBody("> Short answer: chip first,\n> then register.\n\nSee https://www.arlis.am/hy/acts/228544 for the law."), [
    { type: "callout", text: "Short answer: chip first, then register." },
    { type: "paragraph", text: "See https://www.arlis.am/hy/acts/228544 for the law." },
  ]);
  assert.deepEqual(renderInline("See https://www.arlis.am/hy/acts/228544 for the law."), [
    { type: "text", text: "See " },
    { type: "link", href: "https://www.arlis.am/hy/acts/228544", text: "www.arlis.am/hy/acts/228544" },
    { type: "text", text: " for the law." },
  ]);
  assert.deepEqual(renderInline("No links here"), [{ type: "text", text: "No links here" }]);
  assert.deepEqual(renderInline("<b>x</b> http://a.example/y."), [
    { type: "text", text: "<b>x</b> " },
    { type: "link", href: "http://a.example/y", text: "a.example/y" },
    { type: "text", text: "." },
  ]);
});

test("contact messages are validated and honeypot submissions are rejected", () => {
  const ok = normalizeContactInput({ name: " Ani ", email: "Ani@Example.com", message: "Hello, we run a clinic in Yerevan.", business: "Vet Ani", language: "ru", page: "/for-business" });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.value.email, "ani@example.com");
    assert.equal(ok.value.name, "Ani");
    assert.equal(ok.value.phone, null);
    assert.equal(ok.value.language, "ru");
  }
  assert.equal(normalizeContactInput({ name: "A", email: "nope", message: "Hello there friend" }).ok, false);
  assert.equal(normalizeContactInput({ name: "A", email: "a@b.co", message: "short" }).ok, false);
  assert.equal(normalizeContactInput({ name: "A", email: "a@b.co", message: "Hello there friend", website: "http://spam" }).ok, false);
  const fallback = normalizeContactInput({ name: "A", email: "a@b.co", message: "Hello there friend", language: "xx" });
  assert.ok(fallback.ok && fallback.value.language === "hy");
});

test("pinned articles lead, hidden ones disappear, the rest keep their order", () => {
  const items = [{ slug: "a" }, { slug: "b" }, { slug: "c" }, { slug: "d" }];
  const settings = { c: { hidden: false, position: 1 }, a: { hidden: false, position: 2 }, b: { hidden: true, position: null } };
  assert.deepEqual(orderArticles(items, settings).map((item) => item.slug), ["c", "a", "d"]);
  assert.deepEqual(applyPinAction(["c", "a"], "d", "pin"), ["d", "c", "a"]);
  assert.deepEqual(applyPinAction(["d", "c", "a"], "a", "up"), ["d", "a", "c"]);
  assert.deepEqual(applyPinAction(["d", "a", "c"], "d", "down"), ["a", "d", "c"]);
  assert.deepEqual(applyPinAction(["a", "d", "c"], "d", "unpin"), ["a", "c"]);
  assert.deepEqual(applyPinAction(["a"], "a", "up"), ["a"]);
});

test("account passwords are salted hashes and roles gate the owner-only areas", () => {
  const stored = hashPassword("correct horse battery");
  assert.ok(stored.startsWith("scrypt$"));
  assert.notEqual(stored, hashPassword("correct horse battery"));
  assert.equal(verifyPassword("correct horse battery", stored), true);
  assert.equal(verifyPassword("wrong horse battery", stored), false);
  assert.equal(verifyPassword("x", "not-a-hash"), false);
  assert.equal(passwordProblem("short"), "Use a password of at least 12 characters");
  assert.equal(passwordProblem("long enough password"), null);
  assert.equal(validUsername("chatgpt"), true);
  assert.equal(validUsername("Bad Name"), false);
  assert.equal(roleAllows("editor", "/admin/posts"), true);
  assert.equal(roleAllows("editor", "/api/admin-media"), true);
  assert.equal(roleAllows("editor", "/admin/users"), false);
  assert.equal(roleAllows("editor", "/api/admin-users"), false);
  assert.equal(roleAllows("editor", "/api/admin-database"), false);
  assert.equal(roleAllows("owner", "/admin/database"), true);
});

test("posts accept a YouTube link or an uploaded clip as video and reject anything else", () => {
  const base = { title: "T", slug: "video-test", language: "en", status: "draft" };
  const yt = normalizePostInput({ ...base, videoUrl: " https://youtube.com/shorts/abc123xyz ", videoOrientation: "portrait" });
  assert.ok(yt.ok && yt.value.videoUrl === "https://youtube.com/shorts/abc123xyz" && yt.value.videoOrientation === "portrait");
  const uploaded = normalizePostInput({ ...base, videoUrl: "/media/0f8a2b1c-1234-4abc-8def-0123456789ab" });
  assert.ok(uploaded.ok && uploaded.value.videoUrl === "/media/0f8a2b1c-1234-4abc-8def-0123456789ab" && uploaded.value.videoOrientation === null);
  const none = normalizePostInput({ ...base, videoUrl: "", videoOrientation: "portrait" });
  assert.ok(none.ok && none.value.videoUrl === null && none.value.videoOrientation === null);
  assert.equal(normalizePostInput({ ...base, videoUrl: "javascript:alert(1)" }).ok, false);
  assert.equal(normalizePostInput({ ...base, videoUrl: "http://insecure.example/clip.mp4" }).ok, false);
  assert.equal(normalizeVideoUrl("/media/not-a-uuid"), undefined);
  const record = toPostRecord({ id: "1", slug: "s", language: "hy", title: "x", status: "published", videoUrl: "https://vimeo.com/123", videoOrientation: "landscape" });
  assert.deepEqual(record.video, { url: "https://vimeo.com/123", orientation: "landscape" });
});
