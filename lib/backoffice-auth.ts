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

export type BackofficeSession = { user: string; role: "owner" | "editor"; expiresAt: number };

export function createBackofficeSession(user = "owner", role: "owner" | "editor" = "owner") {
  if (!sessionSecret()) throw new Error("BACKOFFICE_SESSION_SECRET is not configured");
  const payload = Buffer.from(JSON.stringify({ expiresAt: Date.now() + SESSION_SECONDS * 1000, nonce: crypto.randomUUID(), user, role })).toString("base64url");
  return `${payload}.${sessionSignature(payload)}`;
}

/** The signed-in account, or null. Sessions created before accounts existed count as the owner. */
export function readBackofficeSession(value?: string | null): BackofficeSession | null {
  if (!sessionSecret() || !value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sessionSignature(payload);
  if (!safeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!Number.isFinite(parsed.expiresAt) || parsed.expiresAt <= Date.now()) return null;
    return { user: typeof parsed.user === "string" && parsed.user ? parsed.user : "owner", role: parsed.role === "editor" ? "editor" : "owner", expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export function validBackofficeSession(value?: string | null) {
  return readBackofficeSession(value) !== null;
}
