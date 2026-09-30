// Contact messages from the website ("Write to us"): validation shared by the API and tests.
export const CONTACT_LIMITS = { name: 120, email: 200, phone: 40, business: 160, message: 2000, page: 200 } as const;

export type ContactInput = {
  name: string;
  email: string;
  phone: string | null;
  business: string | null;
  message: string;
  language: "hy" | "ru" | "en" | "fa";
  page: string | null;
  source: string | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normalizeContactInput(input: unknown): { ok: true; value: ContactInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Message data is missing" };
  const raw = input as Record<string, unknown>;
  // Bots fill every field; real visitors never see this one.
  if (text(raw.website, 200)) return { ok: false, error: "Message rejected" };
  const name = text(raw.name, CONTACT_LIMITS.name);
  const email = text(raw.email, CONTACT_LIMITS.email).toLowerCase();
  const message = text(raw.message, CONTACT_LIMITS.message);
  if (!name) return { ok: false, error: "Name is required" };
  if (!EMAIL.test(email)) return { ok: false, error: "A valid email address is required" };
  if (message.length < 10) return { ok: false, error: "The message is too short" };
  const language = raw.language === "ru" || raw.language === "en" || raw.language === "fa" ? raw.language : "hy";
  return {
    ok: true,
    value: {
      name,
      email,
      phone: text(raw.phone, CONTACT_LIMITS.phone) || null,
      business: text(raw.business, CONTACT_LIMITS.business) || null,
      message,
      language,
      page: text(raw.page, CONTACT_LIMITS.page) || null,
      source: text(raw.source, 120) || null,
    },
  };
}
