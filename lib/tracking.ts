// First-party analytics events accepted by /api/track. Anything else is dropped.
export const TRACKED_EVENTS = new Set([
  "view_content",
  "join_opened",
  "registration_completed",
  "language_changed",
  "audience_selected",
  "education_opened",
]);

// Metadata keys the site sends. Unknown keys are ignored so the events table
// cannot be used as free-form storage.
const METADATA_KEYS = ["sessionId", "article", "source", "medium", "campaign", "content", "view", "venue"] as const;
const AUDIENCES = new Set(["parent", "business"]);
const LANGUAGES = new Set(["hy", "ru", "en", "fa"]);

export const MAX_TRACKING_BODY_BYTES = 4096;
const MAX_VALUE_LENGTH = 200;

export type TrackingEvent = {
  eventType: string;
  page: string | null;
  language: string | null;
  audience: string | null;
  metadata: Record<string, string>;
};

function text(value: unknown, max = MAX_VALUE_LENGTH) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().slice(0, max);
}

export function sanitizeTrackingEvent(body: unknown): TrackingEvent | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  const eventType = text(input.eventType, 64);
  if (!TRACKED_EVENTS.has(eventType)) return null;

  const language = text(input.language, 8);
  const audience = text(input.audience, 16);
  const metadata: Record<string, string> = {};
  const rawMetadata = input.metadata && typeof input.metadata === "object" ? (input.metadata as Record<string, unknown>) : {};
  for (const key of METADATA_KEYS) {
    const value = text(rawMetadata[key]);
    if (value) metadata[key] = value;
  }

  return {
    eventType,
    page: text(input.page) || null,
    language: LANGUAGES.has(language) ? language : null,
    audience: AUDIENCES.has(audience) ? audience : null,
    metadata,
  };
}
