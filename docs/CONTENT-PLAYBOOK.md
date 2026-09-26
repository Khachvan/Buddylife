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

## 5. Scheduling workflow from chat

1. Create the post files (one per language) and the cover image.
2. Run `pnpm content` and `pnpm check:fast`; both must pass.
3. Commit on a branch named `codex/<topic>-<YYYYMMDD>` or `claude/<topic>`, push, and open
   a pull request to `main`. CI runs the same checks and Vercel builds a Preview.
4. Merge the pull request the same day it is approved. Production deploys from `main` and
   the post becomes visible at its `publishAt` time.
5. Verify: `https://buddylife.am/<lang>/learn/<slug>` (Armenian has no prefix), the Learn
   hub, and the sitemap. Backoffice → Posts shows it under "From the repository".

## 6. What not to do

- Never run `vercel deploy` or any CLI production deploy; merging into `main` is the release.
- Never put secrets, tokens or connection strings in content or commits.
- Do not edit backoffice (database) posts from the repository; they are managed at
  backoffice.buddylife.am.
- Do not regenerate or rename a cover after the post is live; add a new file instead.
