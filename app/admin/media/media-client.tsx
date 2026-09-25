"use client";

import { Copy, Trash2, Upload } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { MediaRecord } from "../../../lib/media";

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
  return payload;
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MediaClient() {
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetch("/api/admin-media", { cache: "no-store" }).then(readJson);
      setMedia(payload.media || []);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Media library could not be loaded");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) { setError("Choose an image first"); return; }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const payload = await fetch("/api/admin-media", { method: "POST", body: form }).then(readJson);
      setMedia((current) => [payload.media, ...current]);
      setMessage(`Uploaded ${payload.media.fileName}${payload.media.width ? ` (${payload.media.width}×${payload.media.height})` : ""}.`);
      event.currentTarget.reset();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: MediaRecord) {
    if (!window.confirm(`Delete ${item.fileName}? Posts using it will fall back to the default image.`)) return;
    try {
      await fetch("/api/admin-media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", id: item.id }) }).then(readJson);
      setMedia((current) => current.filter((entry) => entry.id !== item.id));
      setMessage(`Deleted ${item.fileName}.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Image could not be deleted");
    }
  }

  async function copyUrl(item: MediaRecord) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${item.url}`);
      setMessage(`Copied the link for ${item.fileName}.`);
    } catch {
      setError("The link could not be copied");
    }
  }

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE CMS</p>
          <h1>Media library</h1>
          <p>Upload visuals for posts and social sharing. Images are stored in the BuddyLife database and served from /media.</p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">CMS overview</a>
          <a className="button" href="/admin/posts">Posts</a>
        </div>
      </div>

      {message && <div className="qrNotice" role="status">{message}</div>}
      {error && <div className="adminServiceError" role="alert"><b>Media library needs attention</b><p>{error}</p></div>}

      <section className="adminPanel">
        <h2>Upload an image</h2>
        <form className="cmsForm" onSubmit={upload}>
          <div className="cmsRow">
            <label>
              Image file (JPEG, PNG, WebP or GIF, up to 4 MB)
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
            </label>
            <label>
              Alt text (describes the image for accessibility)
              <input name="altText" maxLength={200} placeholder="Dog resting on a sofa" />
            </label>
          </div>
          <div className="cmsActions">
            <button className="button" type="submit" disabled={uploading}><Upload size={16} aria-hidden="true" /> {uploading ? "Uploading…" : "Upload"}</button>
          </div>
        </form>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHead"><h2>All images</h2><span className="cmsHelp">{media.length} file{media.length === 1 ? "" : "s"}</span></div>
        {loading && <p className="adminEmpty">Loading images…</p>}
        {!loading && !media.length && <p className="adminEmpty">No images uploaded yet.</p>}
        <div className="mediaGrid">
          {media.map((item) => (
            <article className="mediaCard" key={item.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.altText} loading="lazy" />
              <b>{item.fileName}</b>
              <small>{item.width && item.height ? `${item.width}×${item.height} · ` : ""}{formatSize(item.byteSize)} · {new Date(item.createdAt).toLocaleDateString("en-GB")}</small>
              <div className="cmsActions">
                <button className="button secondary buttonSmall" type="button" onClick={() => copyUrl(item)}><Copy size={14} aria-hidden="true" /> Copy link</button>
                <button className="cmsDanger" type="button" onClick={() => remove(item)}><Trash2 size={14} aria-hidden="true" /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
