"use client";

import { ArrowDown, ArrowUp, CalendarClock, Copy, Eye, EyeOff, Link2, Pin, PinOff, Plus, Save, Trash2, Upload, Video } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { orderArticles, type ArticleAction, type ArticleSettings } from "../../../lib/article-settings";
import { localePath, localeUrl } from "../../../lib/locale";
import type { MediaRecord } from "../../../lib/media";
import { effectiveState, isValidSlug, slugify, type PostLanguage, type PostRecord, type PostState } from "../../../lib/posts";

type PublishMode = "draft" | "now" | "schedule" | "archived";
type SiteArticle = { slug: string; title: string; source: "backoffice" | "repository" | "built-in"; languages: string[]; state: PostState; publishAt: string | null };
const SOURCE_LABEL: Record<SiteArticle["source"], string> = { backoffice: "Backoffice", repository: "Repository", "built-in": "Built-in guide" };

type Draft = {
  id: string | null;
  title: string;
  slug: string;
  language: PostLanguage;
  category: string;
  excerpt: string;
  body: string;
  coverMediaId: string | null;
  videoUrl: string;
  videoOrientation: "landscape" | "portrait";
  mode: PublishMode;
  scheduleAt: string;
  publishAt: string | null;
};

const LANGUAGES: Array<[PostLanguage, string]> = [["hy", "Armenian"], ["ru", "Russian"], ["en", "English"], ["fa", "Persian"]];
const STATE_LABEL: Record<PostState, string> = { draft: "Draft", scheduled: "Scheduled", live: "Live", archived: "Archived" };

function emptyDraft(): Draft {
  return { id: null, title: "", slug: "", language: "hy", category: "", excerpt: "", body: "", coverMediaId: null, videoUrl: "", videoOrientation: "landscape", mode: "draft", scheduleAt: "", publishAt: null };
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function draftFromPost(post: PostRecord): Draft {
  const state = effectiveState(post);
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    language: post.language,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    coverMediaId: post.coverMediaId,
    videoUrl: post.videoUrl || "",
    videoOrientation: post.videoOrientation === "portrait" ? "portrait" : "landscape",
    mode: state === "draft" ? "draft" : state === "archived" ? "archived" : state === "scheduled" ? "schedule" : "now",
    scheduleAt: toLocalInput(post.publishAt),
    publishAt: post.publishAt,
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

// 09:00 on the chosen day, or one hour from now when that moment has already passed.
function defaultScheduleTime(day: Date) {
  const at = new Date(day);
  at.setHours(9, 0, 0, 0);
  if (at.getTime() <= Date.now()) {
    at.setTime(Date.now() + 60 * 60 * 1000);
    at.setSeconds(0, 0);
  }
  return at;
}

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
  return payload;
}

export default function PostsClient() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [repositoryPosts, setRepositoryPosts] = useState<PostRecord[]>([]);
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [filter, setFilter] = useState<"all" | PostState>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [articles, setArticles] = useState<SiteArticle[]>([]);
  const [settings, setSettings] = useState<ArticleSettings>({});
  const [ordering, setOrdering] = useState(false);
  const [weekStart] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [postsPayload, mediaPayload, articlesPayload] = await Promise.all([
        fetch("/api/admin-posts", { cache: "no-store" }).then(readJson),
        fetch("/api/admin-media", { cache: "no-store" }).then(readJson).catch(() => ({ media: [] })),
        fetch("/api/admin-articles", { cache: "no-store" }).then(readJson).catch(() => ({ articles: [], settings: {} })),
      ]);
      setArticles(articlesPayload.articles || []);
      setSettings(articlesPayload.settings || {});
      setPosts(postsPayload.posts || []);
      setRepositoryPosts(postsPayload.repositoryPosts || []);
      setMedia(mediaPayload.media || []);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Posts could not be loaded");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const visiblePosts = useMemo(
    () => posts.filter((post) => filter === "all" || effectiveState(post) === filter),
    [posts, filter],
  );
  const counts = useMemo(() => {
    const totals: Record<PostState, number> = { draft: 0, scheduled: 0, live: 0, archived: 0 };
    for (const post of [...posts, ...repositoryPosts]) totals[effectiveState(post)] += 1;
    return totals;
  }, [posts, repositoryPosts]);

  const week = useMemo(() => {
    const planned = [...posts, ...repositoryPosts].filter((post) => post.publishAt && ["scheduled", "live"].includes(effectiveState(post)));
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + index);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const items = planned
        .filter((post) => {
          const at = new Date(post.publishAt as string).getTime();
          return at >= day.getTime() && at < next.getTime();
        })
        .sort((a, b) => (a.publishAt as string).localeCompare(b.publishAt as string));
      return { day, items };
    });
  }, [posts, repositoryPosts, weekStart]);

  function scheduleOn(day: Date) {
    const at = defaultScheduleTime(day);
    setDraft({ ...emptyDraft(), mode: "schedule", scheduleAt: toLocalInput(at.toISOString()) });
    setMessage(`New post scheduled for ${formatDate(at.toISOString())}. Fill it in and press Create post.`);
    setError("");
    document.getElementById("post-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // The order visitors see: pinned first, then newest published, then the built-in guides.
  const siteOrder = useMemo(() => {
    const live = [...articles].sort((a, b) => (b.publishAt || "").localeCompare(a.publishAt || ""));
    const pinned = orderArticles(live.filter((item) => typeof settings[item.slug]?.position === "number"), Object.fromEntries(Object.entries(settings).map(([slug, value]) => [slug, { ...value, hidden: false }])));
    const rest = live.filter((item) => typeof settings[item.slug]?.position !== "number");
    return [...pinned, ...rest];
  }, [articles, settings]);
  const pinnedCount = siteOrder.filter((item) => typeof settings[item.slug]?.position === "number").length;

  async function articleAction(slug: string, action: ArticleAction) {
    setOrdering(true);
    setError("");
    try {
      const payload = await fetch("/api/admin-articles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, action }) }).then(readJson);
      setSettings(payload.settings || {});
      setMessage(action === "hide" ? "Hidden from the site." : action === "show" ? "Visible on the site again." : "Order updated. Visitors see the change within a minute.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The change could not be saved");
    } finally {
      setOrdering(false);
    }
  }

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));
  const cover = media.find((item) => item.id === draft.coverMediaId) || null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const status = draft.mode === "draft" ? "draft" : draft.mode === "archived" ? "archived" : draft.mode === "schedule" ? "scheduled" : "published";
    const publishAt =
      draft.mode === "schedule"
        ? draft.scheduleAt ? new Date(draft.scheduleAt).toISOString() : null
        : draft.mode === "now"
          ? draft.publishAt && new Date(draft.publishAt).getTime() <= Date.now() ? draft.publishAt : new Date().toISOString()
          : draft.publishAt;
    try {
      const payload = await fetch("/api/admin-posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "save",
          post: { id: draft.id, title: draft.title, slug: draft.slug, language: draft.language, category: draft.category, excerpt: draft.excerpt, body: draft.body, coverMediaId: draft.coverMediaId, videoUrl: draft.videoUrl.trim() || null, videoOrientation: draft.videoOrientation, status, publishAt },
        }),
      }).then(readJson);
      const saved: PostRecord = payload.post;
      setPosts((current) => {
        const others = current.filter((post) => post.id !== saved.id);
        return [saved, ...others].sort((a, b) => (b.publishAt || b.createdAt).localeCompare(a.publishAt || a.createdAt));
      });
      setDraft(draftFromPost(saved));
      setMessage(`Saved “${saved.title}” as ${STATE_LABEL[effectiveState(saved)].toLowerCase()}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Post could not be saved");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft.id || !window.confirm(`Delete “${draft.title}” permanently?`)) return;
    setSaving(true);
    try {
      await fetch("/api/admin-posts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", id: draft.id }) }).then(readJson);
      setPosts((current) => current.filter((post) => post.id !== draft.id));
      setDraft(emptyDraft());
      setMessage("Post deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Post could not be deleted");
    } finally {
      setSaving(false);
    }
  }

  async function uploadCover(file: File | null, kind: "cover" | "video" = "cover") {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set("altText", draft.title);
    try {
      const payload = await fetch("/api/admin-media", { method: "POST", body: form }).then(readJson);
      setMedia((current) => [payload.media, ...current]);
      if (kind === "video") update({ videoUrl: payload.media.url });
      else update({ coverMediaId: payload.media.id });
      setMessage(`Uploaded ${payload.media.fileName}.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const previewHref = draft.slug && isValidSlug(draft.slug) ? localePath(draft.language, `/learn/${draft.slug}`) : null;
  // The public address is fixed by the slug, so it can go into social posts before the article is live.
  const publicUrl = draft.slug && isValidSlug(draft.slug) ? localeUrl(draft.language, `/learn/${draft.slug}`) : null;
  const copyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage("Link copied.");
    } catch {
      setMessage(publicUrl);
    }
  };
  const imageMedia = media.filter((item) => !item.contentType.startsWith("video/"));

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE CMS</p>
          <h1>Posts</h1>
          <p>Write Learn articles, schedule them for a date and time, and manage what is live on buddylife.am.</p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">CMS overview</a>
          <button className="button" type="button" onClick={() => { setDraft(emptyDraft()); setMessage(""); setError(""); }}><Plus size={16} aria-hidden="true" /> New post</button>
        </div>
      </div>

      <section className="adminStats compact">
        <article><b>{counts.live}</b><span>Live</span></article>
        <article><b>{counts.scheduled}</b><span>Scheduled</span></article>
        <article><b>{counts.draft}</b><span>Drafts</span></article>
        <article><b>{counts.archived}</b><span>Archived</span></article>
      </section>
      <p className="adminMetricNote">Scheduled posts go live automatically at their publish time; no further action is needed. Counts include posts managed from the repository.</p>

      {message && <div className="qrNotice" role="status">{message}</div>}
      {error && <div className="adminServiceError" role="alert"><b>Posts need attention</b><p>{error}</p></div>}

      <section className="adminPanel cmsWeekPanel" aria-label="Next 7 days">
        <div className="adminPanelHead">
          <h2>Next 7 days</h2>
          <span className="cmsHelp">Everything that goes live this week, from the backoffice and the repository. Times are shown in your local time.</span>
        </div>
        <div className="cmsWeek">
          {week.map(({ day, items }) => (
            <article key={day.getTime()} className={`cmsWeekDay ${items.length ? "" : "empty"}`}>
              <header>
                <b>{new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(day)}</b>
                <span>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(day)}</span>
              </header>
              {items.map((post) => {
                const state = effectiveState(post);
                const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(post.publishAt as string));
                const label = <><small>{time} · {post.language.toUpperCase()} · {post.source === "cms" ? "CMS" : "Repo"}</small><span>{post.title}</span></>;
                return post.source === "cms" ? (
                  <button type="button" key={post.id} className={`cmsWeekItem ${state}`} onClick={() => { setDraft(draftFromPost(post)); setMessage(""); setError(""); }}>{label}</button>
                ) : (
                  <div key={post.id} className={`cmsWeekItem ${state}`}>{label}</div>
                );
              })}
              {!items.length && <p className="cmsHelp">Nothing planned</p>}
              <button type="button" className="cmsWeekAdd" onClick={() => scheduleOn(day)}><Plus size={13} aria-hidden="true" /> Schedule</button>
            </article>
          ))}
        </div>
      </section>

      <section className="adminPanel cmsWeekPanel" aria-label="Order and visibility on the site">
        <div className="adminPanelHead">
          <h2>Order and visibility on the site</h2>
          <span className="cmsHelp">Every article on buddylife.am, in the order visitors see it. Pin to put an article first, hide to take it off the site without deleting it.</span>
        </div>
        <div className="siteOrder">
          {siteOrder.map((article, index) => {
            const setting = settings[article.slug];
            const pinned = typeof setting?.position === "number";
            const hidden = Boolean(setting?.hidden);
            return (
              <div key={article.slug} className={`siteOrderRow ${hidden ? "hidden" : ""} ${pinned ? "pinned" : ""}`}>
                <span className="siteOrderIndex">{pinned ? <Pin size={14} aria-label="Pinned" /> : index + 1}</span>
                <span className="siteOrderTitle">
                  <b>{article.title}</b>
                  <small>{SOURCE_LABEL[article.source]} · {article.languages.map((code) => code.toUpperCase()).join(" ")} · /learn/{article.slug}{article.state !== "live" ? ` · ${STATE_LABEL[article.state].toLowerCase()}` : ""}{hidden ? " · hidden from the site" : ""}</small>
                </span>
                <span className="siteOrderActions">
                  {pinned ? (
                    <>
                      <button type="button" title="Move up" aria-label={`Move ${article.title} up`} disabled={ordering || index === 0} onClick={() => articleAction(article.slug, "up")}><ArrowUp size={15} /></button>
                      <button type="button" title="Move down" aria-label={`Move ${article.title} down`} disabled={ordering || index >= pinnedCount - 1} onClick={() => articleAction(article.slug, "down")}><ArrowDown size={15} /></button>
                      <button type="button" title="Unpin" aria-label={`Unpin ${article.title}`} disabled={ordering} onClick={() => articleAction(article.slug, "unpin")}><PinOff size={15} /></button>
                    </>
                  ) : (
                    <button type="button" title="Pin to the top" aria-label={`Pin ${article.title} to the top`} disabled={ordering} onClick={() => articleAction(article.slug, "pin")}><Pin size={15} /></button>
                  )}
                  <button type="button" title={hidden ? "Show on the site" : "Hide from the site"} aria-label={`${hidden ? "Show" : "Hide"} ${article.title}`} disabled={ordering} onClick={() => articleAction(article.slug, hidden ? "show" : "hide")}>{hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                </span>
              </div>
            );
          })}
          {!siteOrder.length && !loading && <p className="adminEmpty">No articles yet.</p>}
        </div>
      </section>

      <div className="cmsLayout">
        <section className="adminPanel">
          <div className="adminPanelHead">
            <h2>All posts</h2>
            <select aria-label="Filter posts" value={filter} onChange={(event) => setFilter(event.target.value as "all" | PostState)}>
              <option value="all">All</option>
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="cmsList">
            {loading && <p className="adminEmpty">Loading posts…</p>}
            {!loading && !visiblePosts.length && <p className="adminEmpty">No posts here yet. Create one on the right.</p>}
            {visiblePosts.map((post) => {
              const state = effectiveState(post);
              return (
                <button type="button" key={post.id} className={`cmsListItem ${draft.id === post.id ? "active" : ""}`} onClick={() => { setDraft(draftFromPost(post)); setMessage(""); setError(""); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverUrl || "/og.webp"} alt="" />
                  <span>
                    <b>{post.title}</b>
                    <small>{post.language.toUpperCase()} · /learn/{post.slug} · {state === "scheduled" ? `goes live ${formatDate(post.publishAt)}` : state === "live" ? `since ${formatDate(post.publishAt)}` : `updated ${formatDate(post.updatedAt)}`}</small>
                  </span>
                  <span className={`cmsStatus ${state}`}>{STATE_LABEL[state]}</span>
                </button>
              );
            })}
          </div>
          {repositoryPosts.length > 0 && (
            <>
              <div className="adminPanelHead" style={{ marginTop: 22 }}><h2>From the repository</h2><span className="cmsHelp">edited through Codex or Git</span></div>
              <div className="cmsList">
                {repositoryPosts.filter((post) => filter === "all" || effectiveState(post) === filter).map((post) => {
                  const state = effectiveState(post);
                  return (
                    <div key={post.id} className="cmsListItem" style={{ cursor: "default" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.coverUrl || "/og.webp"} alt="" />
                      <span>
                        <b>{post.title}</b>
                        <small>{post.language.toUpperCase()} · /learn/{post.slug} · {post.video ? "video · " : ""}{state === "scheduled" ? `goes live ${formatDate(post.publishAt)}` : state === "live" ? `since ${formatDate(post.publishAt)}` : post.file}</small>
                      </span>
                      <span className={`cmsStatus ${state}`}>{STATE_LABEL[state]}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="adminPanel" id="post-editor">
          <div className="adminPanelHead">
            <h2>{draft.id ? "Edit post" : "New post"}</h2>
            {previewHref && draft.id && <a className="button secondary" href={previewHref} target="_blank" rel="noreferrer"><Eye size={16} aria-hidden="true" /> Open page</a>}
          </div>
          <form className="cmsForm" onSubmit={save}>
            <label>
              Title
              <input required maxLength={160} value={draft.title} onChange={(event) => update({ title: event.target.value, slug: draft.slug || slugify(event.target.value) })} />
            </label>
            <div className="cmsRow">
              <label>
                Slug (URL)
                <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={80} value={draft.slug} onChange={(event) => update({ slug: event.target.value.toLowerCase() })} placeholder="summer-walk-safety" />
              </label>
              <label>
                Language
                <select value={draft.language} onChange={(event) => update({ language: event.target.value as PostLanguage })}>
                  {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="cmsRow">
              <label>
                Category label
                <input maxLength={60} value={draft.category} onChange={(event) => update({ category: event.target.value })} placeholder="Everyday care" />
              </label>
              <div className="cmsField">
                Cover image
                <div className="cmsCover">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="cmsThumb" src={cover.url} alt={cover.altText} />
                  ) : <span className="cmsThumb" aria-hidden="true" />}
                  <select value={draft.coverMediaId || ""} onChange={(event) => update({ coverMediaId: event.target.value || null })}>
                    <option value="">Default BuddyLife image</option>
                    {imageMedia.map((item) => <option key={item.id} value={item.id}>{item.fileName}</option>)}
                  </select>
                </div>
                <span className="cmsHelp">
                  <label className="cmsUpload"><Upload size={14} aria-hidden="true" /> {uploading ? "Uploading…" : "Upload new image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={uploading} onChange={(event) => uploadCover(event.target.files?.[0] || null)} /></label>
                  {" "}or manage all images in the <a href="/admin/media">media library</a>.
                </span>
              </div>
            </div>
            {publicUrl && (
              <div className="cmsLinkBox" role="status">
                <Link2 size={15} aria-hidden="true" />
                <span><b>Public link</b> (ready for social posts; it opens once the article is live): <a href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a></span>
                <button type="button" className="button secondary" onClick={copyUrl}><Copy size={14} aria-hidden="true" /> Copy</button>
              </div>
            )}
            <div className="cmsField">
              <span><Video size={14} aria-hidden="true" /> Video (optional)</span>
              <div className="cmsRow">
                <input type="url" value={draft.videoUrl} onChange={(event) => update({ videoUrl: event.target.value })} placeholder="YouTube, Shorts or Vimeo link — or upload a clip" />
                <select value={draft.videoOrientation} onChange={(event) => update({ videoOrientation: event.target.value as "landscape" | "portrait" })} aria-label="Video orientation">
                  <option value="landscape">Landscape video</option>
                  <option value="portrait">Vertical (short / reel)</option>
                </select>
              </div>
              <span className="cmsHelp">
                <label className="cmsUpload"><Upload size={14} aria-hidden="true" /> {uploading ? "Uploading…" : "Upload a short MP4 (up to 4 MB)"}<input type="file" accept="video/mp4,video/webm" hidden disabled={uploading} onChange={(event) => uploadCover(event.target.files?.[0] || null, "video")} /></label>
                {" "}A video replaces the cover image on the article page; the cover is still used on cards and when the link is shared.
                {draft.videoUrl && <> <button type="button" className="cmsLinkButton" onClick={() => update({ videoUrl: "" })}>Remove video</button></>}
              </span>
            </div>
            <label>
              Short description
              <textarea maxLength={400} rows={3} style={{ minHeight: 90 }} value={draft.excerpt} onChange={(event) => update({ excerpt: event.target.value })} placeholder="One or two sentences shown on the Learn hub and in search results." />
            </label>
            <label>
              Body
              <textarea maxLength={20000} value={draft.body} onChange={(event) => update({ body: event.target.value })} placeholder={"## First heading\nParagraph text.\n\n- List item\n- Another item"} />
              <span className="cmsHelp">Start a line with <code>## </code> for a heading and <code>- </code> for a list item. Leave an empty line between paragraphs.</span>
            </label>

            <fieldset className="cmsPublish">
              <legend className="cmsHelp"><CalendarClock size={14} aria-hidden="true" /> Publishing</legend>
              <label><input type="radio" name="mode" checked={draft.mode === "draft"} onChange={() => update({ mode: "draft" })} /> Keep as draft</label>
              <label><input type="radio" name="mode" checked={draft.mode === "now"} onChange={() => update({ mode: "now" })} /> Publish now{draft.publishAt && draft.mode === "now" ? ` (live since ${formatDate(draft.publishAt)})` : ""}</label>
              <label><input type="radio" name="mode" checked={draft.mode === "schedule"} onChange={() => update({ mode: "schedule" })} /> Schedule for</label>
              {draft.mode === "schedule" && (
                <input type="datetime-local" required value={draft.scheduleAt} onChange={(event) => update({ scheduleAt: event.target.value })} aria-label="Publish date and time" />
              )}
              <label><input type="radio" name="mode" checked={draft.mode === "archived"} onChange={() => update({ mode: "archived" })} /> Archive (hidden from the site)</label>
            </fieldset>

            <div className="cmsActions">
              <button className="button" type="submit" disabled={saving}><Save size={16} aria-hidden="true" /> {saving ? "Saving…" : draft.id ? "Save changes" : "Create post"}</button>
              {draft.id && <button className="cmsDanger" type="button" onClick={remove} disabled={saving}><Trash2 size={15} aria-hidden="true" /> Delete</button>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
