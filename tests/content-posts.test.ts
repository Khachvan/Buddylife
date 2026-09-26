import assert from "node:assert/strict";
import test from "node:test";

import { isShort, validateContentPost, videoEmbed } from "../lib/content-posts.ts";

test("a complete repository post validates and normalises", () => {
  const result = validateContentPost({ slug: "Autumn-Walks", language: "en", title: " Autumn walks ", body: "## H\nText", publishAt: "2026-10-01T09:00:00+04:00", cover: "/posts/2026-10-01/autumn.jpg", video: { url: "https://youtu.be/abc123def", orientation: "portrait" } });
  assert.ok(result.ok);
  assert.equal(result.value.slug, "autumn-walks");
  assert.equal(result.value.title, "Autumn walks");
  assert.equal(result.value.status, "published");
  assert.equal(result.value.publishAt, "2026-10-01T05:00:00.000Z");
  assert.deepEqual(result.value.video, { url: "https://youtu.be/abc123def", orientation: "portrait" });
});

test("missing or invalid fields are reported together", () => {
  const result = validateContentPost({ slug: "x", language: "de", title: "", body: "", status: "live", publishAt: "tomorrow", cover: "cover.jpg" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((e) => e.includes("slug")));
    assert.ok(result.errors.some((e) => e.includes("language")));
    assert.ok(result.errors.some((e) => e.includes("title")));
    assert.ok(result.errors.some((e) => e.includes("body")));
    assert.ok(result.errors.some((e) => e.includes("status")));
    assert.ok(result.errors.some((e) => e.includes("publishAt")));
    assert.ok(result.errors.some((e) => e.includes("cover")));
  }
  const draft = validateContentPost({ slug: "draft-post", language: "hy", title: "Draft", body: "text", status: "draft" });
  assert.ok(draft.ok);
});

test("videos embed for YouTube and Vimeo, play inline for files, and link out otherwise", () => {
  assert.deepEqual(videoEmbed({ url: "https://www.youtube.com/watch?v=abc123def&t=10" }), { kind: "iframe", src: "https://www.youtube-nocookie.com/embed/abc123def", provider: "YouTube" });
  assert.deepEqual(videoEmbed({ url: "https://www.youtube.com/shorts/abc123def" }), { kind: "iframe", src: "https://www.youtube-nocookie.com/embed/abc123def", provider: "YouTube" });
  assert.deepEqual(videoEmbed({ url: "https://vimeo.com/123456" }), { kind: "iframe", src: "https://player.vimeo.com/video/123456", provider: "Vimeo" });
  assert.deepEqual(videoEmbed({ url: "/videos/clip.mp4" }), { kind: "file", src: "/videos/clip.mp4" });
  assert.deepEqual(videoEmbed({ url: "https://www.instagram.com/reel/xyz/" }), { kind: "link", href: "https://www.instagram.com/reel/xyz/", provider: "Instagram" });
  assert.equal(isShort({ url: "https://www.youtube.com/shorts/abc123def" }), true);
  assert.equal(isShort({ url: "https://vimeo.com/1" }), false);
  assert.equal(isShort({ url: "https://vimeo.com/1", orientation: "portrait" }), true);
});
