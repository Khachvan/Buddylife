import assert from "node:assert/strict";
import test from "node:test";

import {
  anonymousKey,
  decodeScanReference,
  deviceClass,
  encodeScanReference,
  isPublicQrToken,
  likelyBot,
  safeDestination,
} from "../lib/qr-attribution.ts";
import { hasSameOrigin } from "../lib/request-security.ts";

const UUID = "b1f24e80-65d4-4ef8-9daf-05b1735c9e33";

test("QR destinations preserve safe public paths and reject privileged or external targets", () => {
  assert.equal(safeDestination("/learn/pet-care?lang=hy#checklist"), "/learn/pet-care?lang=hy#checklist");
  for (const unsafe of [
    "https://evil.example/steal",
    "//evil.example/steal",
    "/admin/qrs",
    "/api/register",
    "/backoffice",
    "/q/another-token",
  ]) {
    assert.equal(safeDestination(unsafe), "/?join=parent", unsafe);
  }
});

test("signed QR references round-trip and a deliberate signature mutation is detected", () => {
  const previous = process.env.QR_ATTRIBUTION_SECRET;
  process.env.QR_ATTRIBUTION_SECRET = "test-only-secret-with-sufficient-entropy";
  try {
    const reference = { scanId: UUID, scannedAt: "2026-09-09T10:00:00.000Z" };
    const encoded = encodeScanReference(reference);
    assert.ok(encoded);
    assert.deepEqual(decodeScanReference(encoded), reference);
    const last = encoded.at(-1);
    const tampered = `${encoded.slice(0, -1)}${last === "A" ? "B" : "A"}`;
    assert.equal(decodeScanReference(tampered), null);
    assert.equal(decodeScanReference("malformed"), null);
  } finally {
    if (previous === undefined) delete process.env.QR_ATTRIBUTION_SECRET;
    else process.env.QR_ATTRIBUTION_SECRET = previous;
  }
});

test("missing QR signing secret fails closed while anonymous hashing remains deterministic", () => {
  const previous = process.env.QR_ATTRIBUTION_SECRET;
  delete process.env.QR_ATTRIBUTION_SECRET;
  try {
    assert.equal(encodeScanReference({ scanId: UUID, scannedAt: new Date().toISOString() }), null);
    assert.equal(decodeScanReference("anything"), null);
    assert.equal(anonymousKey("visitor-1"), anonymousKey("visitor-1"));
    assert.notEqual(anonymousKey("visitor-1"), anonymousKey("visitor-2"));
  } finally {
    if (previous !== undefined) process.env.QR_ATTRIBUTION_SECRET = previous;
  }
});

test("public QR token validation enforces format and length", () => {
  assert.equal(isPublicQrToken("abcDEF12_-"), true);
  assert.equal(isPublicQrToken("short"), false);
  assert.equal(isPublicQrToken("invalid token"), false);
  assert.equal(isPublicQrToken("x".repeat(65)), false);
});

test("bot, device and referrer-independent classification covers acquisition failure cases", () => {
  assert.equal(likelyBot("facebookexternalhit/1.1"), true);
  assert.equal(likelyBot("Mozilla/5.0 (iPhone) Safari"), false);
  assert.equal(deviceClass("Mozilla/5.0 (iPad)"), "tablet");
  assert.equal(deviceClass("Mozilla/5.0 (iPhone)"), "mobile");
  assert.equal(deviceClass("Mozilla/5.0 (Macintosh)"), "desktop");
});

test("same-origin mutation guard accepts the exact host and rejects missing or mismatched origins", () => {
  assert.equal(hasSameOrigin(new Request("https://backoffice.buddylife.am/api/admin-qrs", {
    headers: { origin: "https://backoffice.buddylife.am", host: "backoffice.buddylife.am" },
  })), true);
  assert.equal(hasSameOrigin(new Request("https://backoffice.buddylife.am/api/admin-qrs", {
    headers: { origin: "https://buddylife.am", host: "backoffice.buddylife.am" },
  })), false);
  assert.equal(hasSameOrigin(new Request("https://backoffice.buddylife.am/api/admin-qrs", {
    headers: { host: "backoffice.buddylife.am" },
  })), false);
});
