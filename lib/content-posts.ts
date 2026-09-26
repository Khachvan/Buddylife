// Repository-managed posts: one JSON file per post and language under content/posts/.
// This module is dependency-free so `node scripts/validate-content.ts` and the
// unit tests can load it directly.

export const CONTENT_LANGUAGES = ["hy", "ru", "en", "fa"] as const;
export const CONTENT_STATUSES = ["draft", "scheduled", "published", "archived"] as const;
export const CONTENT_LIMITS = { slug: 80, category: 60, title: 160, excerpt: 400, body: 20000 };

export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type PostVideo = { url: string; title?: string; orientation?: "landscape" | "portrait"; captions?: string };

export type ContentPost = {
  slug: string;
  language: ContentLanguage;
  title: string;
  excerpt: string;
  category: string;
  body: string;
  cover: string | null;
  video: PostVideo | null;
  status: ContentStatus;
  publishAt: string | null;
  updatedAt: string | null;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTPS = /^https:\/\/[^\s]+$/i;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function iso(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

export function validateContentPost(input: unknown): { ok: true; value: ContentPost } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["the file must contain a JSON object"] };
  const raw = input as Record<string, unknown>;

  const slug = text(raw.slug).toLowerCase();
  if (!SLUG.test(slug) || slug.length < 3 || slug.length > CONTENT_LIMITS.slug) errors.push("slug must use lowercase Latin letters, digits and hyphens (3 to 80 characters)");
  const language = text(raw.language);
  if (!(CONTENT_LANGUAGES as readonly string[]).includes(language)) errors.push(`language must be one of ${CONTENT_LANGUAGES.join(", ")}`);
  const title = text(raw.title);
  if (!title) errors.push("title is required");
  if (title.length > CONTENT_LIMITS.title) errors.push(`title must be ${CONTENT_LIMITS.title} characters or fewer`);
  const excerpt = text(raw.excerpt);
  if (excerpt.length > CONTENT_LIMITS.excerpt) errors.push(`excerpt must be ${CONTENT_LIMITS.excerpt} characters or fewer`);
  const category = text(raw.category);
  if (category.length > CONTENT_LIMITS.category) errors.push(`category must be ${CONTENT_LIMITS.category} characters or fewer`);
  const body = typeof raw.body === "string" ? raw.body.replace(/\r\n?/g, "\n") : "";
  if (!body.trim()) errors.push("body is required");
  if (body.length > CONTENT_LIMITS.body) errors.push(`body must be ${CONTENT_LIMITS.body} characters or fewer`);

  let cover: string | null = null;
  if (raw.cover !== undefined && raw.cover !== null && raw.cover !== "") {
    const value = text(raw.cover);
    if (value.startsWith("/") && !value.startsWith("//")) cover = value;
    else if (HTTPS.test(value)) cover = value;
    else errors.push("cover must be a path under public/ (starting with /) or an https URL");
  }

  let video: PostVideo | null = null;
  if (raw.video !== undefined && raw.video !== null) {
    const v = raw.video as Record<string, unknown>;
    const url = text(typeof raw.video === "string" ? raw.video : v.url);
    if (!HTTPS.test(url) && !(url.startsWith("/") && !url.startsWith("//"))) errors.push("video.url must be an https URL or a path under public/");
    const orientation = text(v.orientation);
    if (orientation && orientation !== "landscape" && orientation !== "portrait") errors.push('video.orientation must be "landscape" or "portrait"');
    const captions = text(v.captions);
    if (captions && !(captions.startsWith("/") && captions.endsWith(".vtt"))) errors.push("video.captions must be a .vtt file under public/, for example /videos/clip.en.vtt");
    video = { url, ...(text(v.title) ? { title: text(v.title).slice(0, 160) } : {}), ...(orientation ? { orientation: orientation as "landscape" | "portrait" } : {}), ...(captions ? { captions } : {}) };
  }

  const status = (text(raw.status) || "published") as ContentStatus;
  if (!(CONTENT_STATUSES as readonly string[]).includes(status)) errors.push(`status must be one of ${CONTENT_STATUSES.join(", ")}`);
  const publishAt = iso(raw.publishAt);
  if (publishAt === undefined) errors.push("publishAt must be an ISO 8601 date-time, for example 2026-10-01T09:00:00+04:00");
  if ((status === "published" || status === "scheduled") && !publishAt) errors.push("publishAt is required for published and scheduled posts");
  const updatedAt = iso(raw.updatedAt);
  if (updatedAt === undefined) errors.push("updatedAt must be an ISO 8601 date-time when present");

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: { slug, language: language as ContentLanguage, title, excerpt, category, body, cover, video, status, publishAt: publishAt ?? null, updatedAt: updatedAt ?? null },
  };
}

/** How a post video should be rendered. YouTube (including Shorts) and Vimeo embed; files play inline; everything else links out. */
export function videoEmbed(video: PostVideo): { kind: "iframe"; src: string; provider: string } | { kind: "file"; src: string } | { kind: "link"; href: string; provider: string } {
  const url = video.url;
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${youtube[1]}`, provider: "YouTube" };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}`, provider: "Vimeo" };
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return { kind: "file", src: url };
  const provider = /instagram\.com/i.test(url) ? "Instagram" : /tiktok\.com/i.test(url) ? "TikTok" : /facebook\.com|fb\.watch/i.test(url) ? "Facebook" : "video";
  return { kind: "link", href: url, provider };
}

export function isShort(video: PostVideo) {
  return video.orientation === "portrait" || /youtube\.com\/shorts\//.test(video.url) || /instagram\.com\/reel/.test(video.url) || /tiktok\.com/.test(video.url);
}
