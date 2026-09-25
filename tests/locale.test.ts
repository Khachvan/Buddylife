import assert from "node:assert/strict";
import test from "node:test";

import { localeAlternates, localePath, localeUrl, splitLocale } from "../lib/locale.ts";
import { articlePublished, newestArticleDate } from "../lib/content-dates.ts";

test("Armenian stays unprefixed and other languages get a path prefix", () => {
  assert.equal(localePath("hy", "/learn"), "/learn");
  assert.equal(localePath("ru", "/learn"), "/ru/learn");
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(localePath("fa", "/learn/summer-safety"), "/fa/learn/summer-safety");
});

test("legacy lang query is dropped and other query/hash kept", () => {
  assert.equal(localePath("ru", "/?join=parent&lang=en#top"), "/ru?join=parent#top");
  assert.equal(localePath("hy", "/ru/learn?lang=ru&utm_source=qr"), "/learn?utm_source=qr");
});

test("existing prefixes are replaced, not stacked", () => {
  assert.equal(localePath("en", "/ru/features"), "/en/features");
  assert.equal(localePath("hy", "/fa"), "/");
});

test("splitLocale only matches whole path segments", () => {
  assert.deepEqual(splitLocale("/ru/learn"), { locale: "ru", path: "/learn" });
  assert.deepEqual(splitLocale("/ru"), { locale: "ru", path: "/" });
  assert.deepEqual(splitLocale("/runner"), { locale: null, path: "/runner" });
  assert.deepEqual(splitLocale("/ru/admin"), { locale: "ru", path: "/admin" });
});

test("alternates and absolute URLs", () => {
  assert.deepEqual(localeAlternates("/learn"), { hy: "/learn", ru: "/ru/learn", en: "/en/learn", fa: "/fa/learn", "x-default": "/learn" });
  assert.equal(localeUrl("fa", "/"), "https://buddylife.am/fa");
});

test("content dates are real per article", () => {
  assert.equal(articlePublished("what-to-do-when-pet-goes-missing"), "2026-09-23");
  assert.equal(articlePublished("preventive-care"), "2026-08-24");
  assert.equal(newestArticleDate(), "2026-09-23");
});
