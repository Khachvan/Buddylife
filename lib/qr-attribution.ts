import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const QR_FIRST_COOKIE = "buddylife_qr_first";
export const QR_LAST_COOKIE = "buddylife_qr_last";
export const QR_VISITOR_COOKIE = "buddylife_qr_visitor";
export const QR_SESSION_COOKIE = "buddylife_qr_session";
export const QR_ATTRIBUTION_SECONDS = 60 * 60 * 24 * 30;

type ScanReference = {
  scanId: string;
  scannedAt: string;
};

function getSecret() {
  return process.env.QR_ATTRIBUTION_SECRET?.trim() || null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function encodeScanReference(reference: ScanReference) {
  const secret = getSecret();
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify(reference)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function decodeScanReference(value?: string | null): ScanReference | null {
  const secret = getSecret();
  if (!secret || !value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!isUuid(parsed.scanId) || Number.isNaN(Date.parse(parsed.scannedAt))) return null;
    return { scanId: parsed.scanId, scannedAt: parsed.scannedAt };
  } catch {
    return null;
  }
}

export function anonymousKey(value: string) {
  const secret = getSecret();
  return secret
    ? createHmac("sha256", secret).update(value).digest("hex")
    : createHash("sha256").update(value).digest("hex");
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isPublicQrToken(value: string) {
  return /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

export function safeDestination(value: unknown) {
  const candidate = String(value || "/?join=parent").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/?join=parent";
  try {
    const url = new URL(candidate, "https://buddylife.am");
    const blocked = ["/admin", "/api", "/backoffice", "/q"];
    if (url.origin !== "https://buddylife.am" || blocked.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
      return "/?join=parent";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/?join=parent";
  }
}

export function likelyBot(userAgent: string) {
  return /bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|linkedinbot/i.test(userAgent);
}

export function deviceClass(userAgent: string) {
  if (/ipad|tablet|kindle/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function referrerHost(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).hostname.slice(0, 160) || null;
  } catch {
    return null;
  }
}

export const attributionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: QR_ATTRIBUTION_SECONDS,
  path: "/",
};
