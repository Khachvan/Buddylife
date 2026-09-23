import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const SESSION_SECONDS = 60 * 60 * 8;

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function safeEqual(left: string, right: string) { return Boolean(left && right) && left.length === right.length && timingSafeEqual(Buffer.from(left), Buffer.from(right)); }
function sessionSecret() { return process.env.BACKOFFICE_SESSION_SECRET?.trim() || ""; }
function sessionSignature(payload: string) { return createHmac("sha256", sessionSecret()).update(payload).digest("base64url"); }

export function validBackofficeCredentials(username: string, password: string) {
  return safeEqual(digest(username), process.env.BACKOFFICE_USERNAME_SHA256?.trim() || "")
    && safeEqual(digest(password), process.env.BACKOFFICE_PASSWORD_SHA256?.trim() || "");
}

export function createBackofficeSession() {
  if (!sessionSecret()) throw new Error("BACKOFFICE_SESSION_SECRET is not configured");
  const payload = Buffer.from(JSON.stringify({ expiresAt: Date.now() + SESSION_SECONDS * 1000, nonce: crypto.randomUUID() })).toString("base64url");
  return `${payload}.${sessionSignature(payload)}`;
}

export function validBackofficeSession(value?: string | null) {
  if (!sessionSecret() || !value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = sessionSignature(payload);
  if (!safeEqual(signature, expected)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isFinite(parsed.expiresAt) && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}
