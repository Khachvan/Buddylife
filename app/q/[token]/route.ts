import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import {
  anonymousKey,
  attributionCookieOptions,
  deviceClass,
  decodeScanReference,
  encodeScanReference,
  isPublicQrToken,
  likelyBot,
  QR_FIRST_COOKIE,
  QR_LAST_COOKIE,
  QR_SESSION_COOKIE,
  QR_VISITOR_COOKIE,
  referrerHost,
  safeDestination,
} from "../../../lib/qr-attribution";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

export async function HEAD() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!isPublicQrToken(token)) return fallbackRedirect(request, "invalid");

  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT
        c.id AS "qrCodeId",
        c.status,
        c.default_destination AS "defaultDestination",
        a.id AS "assignmentId",
        a.destination_path AS "assignmentDestination"
      FROM qr_codes c
      LEFT JOIN LATERAL (
        SELECT id, destination_path
        FROM qr_assignments
        WHERE qr_code_id = c.id AND ended_at IS NULL
        ORDER BY assigned_at DESC
        LIMIT 1
      ) a ON TRUE
      WHERE c.public_token = ${token}
      LIMIT 1
    `;
    const qr = rows[0];
    if (!qr || qr.status === "retired" || qr.status === "paused") {
      return fallbackRedirect(request, qr?.status || "unknown");
    }

    const destination = safeDestination(qr.assignmentDestination || qr.defaultDestination);
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = likelyBot(userAgent);
    const visitorId = request.cookies.get(QR_VISITOR_COOKIE)?.value || crypto.randomUUID();
    const sessionId = request.cookies.get(QR_SESSION_COOKIE)?.value || crypto.randomUUID();
    const scanId = crypto.randomUUID();
    const scannedAt = new Date().toISOString();

    await sql`
      INSERT INTO qr_scans (
        id, qr_code_id, qr_assignment_id, visitor_key, session_key, landing_path,
        language, referrer_host, device_class, is_bot, is_test, scanned_at
      ) VALUES (
        ${scanId}, ${qr.qrCodeId}, ${qr.assignmentId || null}, ${anonymousKey(visitorId)},
        ${anonymousKey(sessionId)}, ${destination}, ${request.headers.get("accept-language")?.slice(0, 24) || null},
        ${referrerHost(request.headers.get("referer"))}, ${deviceClass(userAgent)}, ${isBot}, FALSE, ${scannedAt}
      )
    `;

    const response = NextResponse.redirect(new URL(destination, request.url), 307);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.cookies.set(QR_VISITOR_COOKIE, visitorId, { ...attributionCookieOptions, maxAge: 60 * 60 * 24 * 365 });
    response.cookies.set(QR_SESSION_COOKIE, sessionId, { ...attributionCookieOptions, maxAge: 60 * 30 });

    if (!isBot) {
      const reference = encodeScanReference({ scanId, scannedAt });
      if (reference) {
        if (!decodeScanReference(request.cookies.get(QR_FIRST_COOKIE)?.value)) response.cookies.set(QR_FIRST_COOKIE, reference, attributionCookieOptions);
        response.cookies.set(QR_LAST_COOKIE, reference, attributionCookieOptions);
      }
    }
    return response;
  } catch (error) {
    logEvent("error", `/q/${token}`, "QR resolution failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return fallbackRedirect(request, "unavailable");
  }
}

function fallbackRedirect(request: NextRequest, reason: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("qr_status", reason);
  const response = NextResponse.redirect(url, 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
