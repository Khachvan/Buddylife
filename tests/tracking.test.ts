import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeTrackingEvent } from "../lib/tracking.ts";

test("known events keep only whitelisted metadata and valid locale/audience", () => {
  const event = sanitizeTrackingEvent({
    eventType: "join_opened",
    page: "/ru/learn",
    language: "ru",
    audience: "parent",
    metadata: { sessionId: "abc", campaign: "spring", injected: "x".repeat(5000), nested: { a: 1 } },
  });
  assert.deepEqual(event, {
    eventType: "join_opened",
    page: "/ru/learn",
    language: "ru",
    audience: "parent",
    metadata: { sessionId: "abc", campaign: "spring" },
  });
});

test("unknown events, unknown locales and oversized values are rejected or trimmed", () => {
  assert.equal(sanitizeTrackingEvent({ eventType: "drop_table" }), null);
  assert.equal(sanitizeTrackingEvent("view_content"), null);
  const event = sanitizeTrackingEvent({ eventType: "view_content", language: "xx", audience: "admin", metadata: { article: "a".repeat(400) } });
  assert.ok(event);
  assert.equal(event.language, null);
  assert.equal(event.audience, null);
  assert.equal(event.metadata.article.length, 200);
});
