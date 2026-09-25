export const POST_LANGUAGES = ["hy", "ru", "en", "fa"] as const;
export type PostLanguage = (typeof POST_LANGUAGES)[number];
export const POST_STATUSES = ["draft", "scheduled", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export type PostState = "draft" | "scheduled" | "live" | "archived";

export type PostInput = {
  slug: string;
  language: PostLanguage;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  coverMediaId: string | null;
  status: PostStatus;
  publishAt: string | null;
};

export type PostRecord = PostInput & {
  id: string;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicPost = {
  id: string;
  slug: string;
  language: PostLanguage;
  category: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  publishAt: string;
};

export type BodyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export const POST_LIMITS = { slug: 80, category: 60, title: 160, excerpt: 400, body: 20000 };
export const DEFAULT_COVER = "/og.webp";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 3 && value.length <= POST_LIMITS.slug;
}

/** Latin-only slug; returns an empty string for titles with no Latin letters or digits. */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, POST_LIMITS.slug)
    .replace(/-+$/g, "");
}

export function isPostLanguage(value: unknown): value is PostLanguage {
  return typeof value === "string" && (POST_LANGUAGES as readonly string[]).includes(value);
}

export function effectiveState(post: { status: PostStatus; publishAt: string | null }, now = new Date()): PostState {
  if (post.status === "draft") return "draft";
  if (post.status === "archived") return "archived";
  if (post.publishAt && new Date(post.publishAt).getTime() > now.getTime()) return "scheduled";
  return "live";
}

/** Body format: "## Heading" lines, "- item" list lines, blank lines separate paragraphs. */
export function renderBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };
  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    if (line.startsWith("## ")) { flushParagraph(); flushList(); blocks.push({ type: "heading", text: line.slice(3).trim() }); continue; }
    if (/^[-*•]\s+/.test(line)) { flushParagraph(); list.push(line.replace(/^[-*•]\s+/, "")); continue; }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isoOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

export function normalizePostInput(input: unknown, now = new Date()): { ok: true; value: PostInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Post data is missing" };
  const raw = input as Record<string, unknown>;
  const title = text(raw.title, POST_LIMITS.title);
  if (!title) return { ok: false, error: "A title is required" };
  const slug = text(raw.slug, POST_LIMITS.slug).toLowerCase();
  if (!isValidSlug(slug)) return { ok: false, error: "Use a slug with lowercase Latin letters, digits and hyphens (3 to 80 characters)" };
  if (!isPostLanguage(raw.language)) return { ok: false, error: "Choose a language" };
  const status = typeof raw.status === "string" && (POST_STATUSES as readonly string[]).includes(raw.status) ? (raw.status as PostStatus) : null;
  if (!status) return { ok: false, error: "Choose a publishing status" };
  const coverMediaId = typeof raw.coverMediaId === "string" && UUID.test(raw.coverMediaId) ? raw.coverMediaId : null;
  const parsedPublishAt = isoOrNull(raw.publishAt);
  if (parsedPublishAt === undefined) return { ok: false, error: "The publish date is not valid" };
  let publishAt = parsedPublishAt;
  if (status === "scheduled" && !publishAt) return { ok: false, error: "Choose the date and time to publish" };
  if (status === "published" && !publishAt) publishAt = now.toISOString();
  return {
    ok: true,
    value: {
      slug,
      language: raw.language,
      category: text(raw.category, POST_LIMITS.category),
      title,
      excerpt: text(raw.excerpt, POST_LIMITS.excerpt),
      body: typeof raw.body === "string" ? raw.body.replace(/\r\n?/g, "\n").slice(0, POST_LIMITS.body) : "",
      coverMediaId,
      status,
      publishAt,
    },
  };
}

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") return new Date(value).toISOString();
  return null;
}

type PostRow = Record<string, unknown>;

export function toPostRecord(row: PostRow): PostRecord {
  const coverMediaId = typeof row.coverMediaId === "string" ? row.coverMediaId : null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    language: row.language as PostLanguage,
    category: String(row.category || ""),
    title: String(row.title),
    excerpt: String(row.excerpt || ""),
    body: String(row.body || ""),
    coverMediaId,
    coverUrl: coverMediaId ? `/media/${coverMediaId}` : null,
    status: row.status as PostStatus,
    publishAt: iso(row.publishAt),
    createdAt: iso(row.createdAt) || "",
    updatedAt: iso(row.updatedAt) || "",
  };
}

