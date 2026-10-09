# BuddyLife content playbook (for Codex, Claude and humans)

This is how articles, visuals, shorts and videos are created and scheduled from a chat
session. No backoffice login and no secrets are needed: content is committed to the
repository, validated by CI, and goes live on buddylife.am when the pull request is merged
into `main` and the scheduled time arrives.

## 1. Where things live

| Kind | Location | Rules |
| --- | --- | --- |
| Article / post | `content/posts/<YYYY-MM-DD>-<slug>.<lang>.json` | One file per language. `<lang>` is `hy`, `ru`, `en` or `fa`. Slug is Latin, lowercase, hyphenated. |
| Cover image | `public/posts/<YYYY-MM-DD>/<slug>.jpg` or `.webp` | 1200×800 or wider, 3:2 landscape, under 400 KB. Referenced as `/posts/<YYYY-MM-DD>/<slug>.jpg`. |
| Short or video | A YouTube, YouTube Shorts or Vimeo link in the post's `video.url` | Preferred. Small clips may be committed under `public/videos/` only when under 15 MB and referenced as `/videos/<name>.mp4`. Instagram, TikTok and Facebook links render as a "Watch on" button. |

Backoffice posts (written at backoffice.buddylife.am) and repository posts appear together
on the Learn hub and the home page, newest first. The backoffice Posts page lists
repository posts read-only under "From the repository".

## 2. Post file format

```json
{
  "slug": "autumn-walks",
  "language": "en",
  "title": "Autumn walks: keeping paws safe on wet leaves",
  "excerpt": "Short, practical steps for slippery pavements and damp coats.",
  "category": "Everyday care",
  "cover": "/posts/2026-10-01/autumn-walks.jpg",
  "video": { "url": "https://www.youtube.com/shorts/VIDEO_ID", "title": "Paw check in 30 seconds", "orientation": "portrait" },
  "status": "scheduled",
  "publishAt": "2026-10-01T09:00:00+04:00",
  "body": "## Check the pavement\nWet leaves hide sharp edges.\n\n- Dry paws after the walk\n- Check between the toes\n\nIf a paw stays sore, contact a veterinarian."
}
```

- `body`: lines starting with `## ` are headings, lines starting with `- ` are list items,
  blank lines separate paragraphs. No HTML.
- `status`: `published` (live once `publishAt` has passed), `scheduled` (same rule, use it
  for future dates), `draft` (never shown), `archived` (hidden again).
- `publishAt`: ISO 8601 with timezone. Yerevan is `+04:00`. Scheduling is automatic: no
  cron, no redeploy, the page checks the time on each request.
- `video`: optional. When present it replaces the hero image on the article page; the
  cover is still used on cards and share previews. Use `"orientation": "portrait"` for
  shorts and reels.
- Keep the same `slug` across languages so hreflang and language switching work.

Scaffold a file with `pnpm post:new -- --title "..." --lang en --publish-at 2026-10-01T09:00:00+04:00 --category "Everyday care" --cover /posts/2026-10-01/autumn-walks.jpg`.

### Body format

- `## ` starts a heading, `- ` a list item, an empty line separates paragraphs.
- Lines starting with `> ` form a highlighted callout. Put a **Short answer** callout of two
  or three sentences right after the first heading of every guide, so a reader on a phone gets
  the answer before the details.
- Any `https://` URL in the text becomes a clickable link (shown without the protocol). Write
  sources as full URLs in a closing "Sources" list; never paste HTML.
- Provider lists: one list item per place, `Name — address — phone`, so the owner can turn
  them into partner listings later.
- Paragraphs: 2–4 sentences. Split anything longer.

## 3. Visuals

- Generate or edit the image, export JPEG or WebP, 1200×800 minimum, 3:2, under 400 KB.
- Keep faces and text away from the outer 10% so cards and share previews can crop.
- Put the file under `public/posts/<YYYY-MM-DD>/` and reference it from `cover`.
- Do not commit files over 1 MB and never use `public/news` or pending folders.

## 4. Shorts and videos

- Upload the video to the BuddyLife YouTube channel (Shorts for vertical clips) or Vimeo,
  then paste the link into `video.url`. YouTube and Vimeo embed inline with no cookies
  until play.
- Instagram Reels, TikTok and Facebook links are shown as a "Watch on …" button because
  those platforms do not allow cookie-free embedding.
- A committed MP4 must be under 15 MB, H.264, and referenced as `/videos/<name>.mp4`. Add
  captions as a WebVTT file next to it and reference it in `video.captions`
  (`/videos/<name>.<lang>.vtt`).

## 5a. Scheduling in the backoffice (preferred)

1. Sign in at backoffice.buddylife.am with your editor account → Posts → New post.
2. Title, slug (Latin, lowercase), language, category, short description, body (`## `
   headings, `> ` short-answer callout, `- ` lists, https sources).
3. Cover: upload or pick from the media library. Video: paste a YouTube/Shorts/Vimeo link or
   upload a short MP4 up to 4 MB; choose "Vertical" for shorts and reels.
4. Copy the **Public link** shown under the category field for the social caption.
5. Publishing: "Schedule for" a date and time, or "Publish now". Create one post per language
   with the same slug. Done — no merge, no deploy.

## 5. Scheduling workflow from the repository (fallback)

1. Create the post files (one per language) and the cover image.
2. Run `pnpm content` and `pnpm check:fast`; both must pass.
3. Commit on a branch named `codex/<topic>-<YYYYMMDD>` or `claude/<topic>`, push, and open
   a pull request to `main`. CI runs the same checks and Vercel builds a Preview.
4. The pull request merges on its own once CI is green (content files only). Production
   deploys from `main` and the post becomes visible at its `publishAt` time.
5. Verify: `https://buddylife.am/<lang>/learn/<slug>` (Armenian has no prefix), the Learn
   hub, and the sitemap. Backoffice → Posts shows it under "From the repository".

### Planning a whole week

Run `pnpm content:week` first. It prints the next 7 days in Yerevan time with everything
already scheduled and marks empty days with a ready `--publish-at` value. Create one post
per empty day with `pnpm post:new`, put all of the week's files and covers in one pull
request (`codex/week-<YYYYMMDD>`), and run `pnpm content:week` again to confirm no day is
empty. After the merge the owner sees the same plan in Backoffice → Posts → "Next 7 days",
where backoffice posts can also be scheduled on a day with one click.

## 6. Social media drafts

For every article, write `content/social/<YYYY-MM-DD>-<slug>.md` with a section per channel
(Instagram, Facebook, Telegram), captions in Armenian and Russian, hashtags, the asset path
and the planned posting time in Yerevan time. Drafts are published by the owner through
Meta Business Suite or Telegram; nothing posts automatically from the repository.

## 7. What not to do

- Never run `vercel deploy` or any CLI production deploy; merging into `main` is the release.
- Never put secrets, tokens or connection strings in content or commits.
- Do not edit backoffice (database) posts from the repository; they are managed at
  backoffice.buddylife.am.
- Do not regenerate or rename a cover after the post is live; add a new file instead.
