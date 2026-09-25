import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config.ts";

test("every route gets the security header baseline and private areas are noindex", async () => {
  const rules = await nextConfig.headers!();
  const all = rules.find((rule) => rule.source === "/:path*" && !rule.has);
  assert.ok(all, "catch-all header rule exists");
  const get = (key: string) => all.headers.find((header) => header.key === key)?.value || "";
  assert.match(get("Content-Security-Policy"), /frame-ancestors 'none'/);
  assert.match(get("Content-Security-Policy"), /object-src 'none'/);
  assert.equal(get("X-Frame-Options"), "DENY");
  assert.equal(get("X-Content-Type-Options"), "nosniff");
  assert.ok(get("Referrer-Policy"));

  for (const source of ["/backoffice", "/admin", "/admin/:path*", "/api/:path*"]) {
    const rule = rules.find((candidate) => candidate.source === source);
    assert.ok(rule, `${source} has private headers`);
    assert.ok(rule.headers.some((header) => header.key === "X-Robots-Tag" && header.value.includes("noindex")));
  }
  const cms = rules.find((candidate) => candidate.source === "/api/content");
  assert.ok(cms, "/api/content has its own cache rule");
  assert.match(cms.headers.find((header) => header.key === "Cache-Control")?.value || "", /s-maxage=60/);
  assert.ok(rules.indexOf(cms) > rules.indexOf(rules.find((rule) => rule.source === "/api/:path*")!), "cache rule comes after the private catch-all so it wins");
});
