# Codex operating brief: content, scheduling and social

Codex owns the content channel of BuddyLife. Claude Code owns code, product and releases.
This split keeps pull requests small and reviews fast. Everything Codex produces is a file
in this repository; nothing needs a login or a secret.

## What Codex does

| Area | Deliverable | Where |
| --- | --- | --- |
| Articles (Learn hub) | Written, scheduled and published in the backoffice, like any editor | backoffice.buddylife.am → Posts |
| Visuals | Cover 1200×800 JPEG/WebP under 400 KB, uploaded in the backoffice | Posts → Cover image → Upload |
| Shorts and videos | YouTube/Shorts/Vimeo link pasted into the post's Video field, or a short MP4 up to 4 MB uploaded there | Posts → Video |
| Scheduling | "Schedule for" date and time in the post; the site publishes on its own | Posts → Publishing |
| Social drafts | Captions per channel with the article's public link, as a file in the repository | `content/social/` |

**Primary channel is the backoffice.** Codex signs in with its own editor account (the owner
creates it in Backoffice → Accounts and gives Codex the login), creates the post in each
language, uploads the cover, sets the video, and schedules it. The public link is shown in
the editor as soon as the slug is typed (`https://buddylife.am/<lang>/learn/<slug>`), so
social captions can carry the final link before the article is live. Nothing needs a merge.

**Fallback channel is the repository.** Posts may still be added as JSON files under
`content/posts/` on a `codex/<topic>-<YYYYMMDD>` branch with a pull request. Those pull
requests merge automatically once the quality gate passes (`.github/workflows/auto-merge-content.yml`);
never ask the owner to merge. Formats and rules are in [CONTENT-PLAYBOOK.md](./CONTENT-PLAYBOOK.md).

## What Codex does not do

- No changes under `app/`, `lib/`, `proxy.ts`, `next.config.ts`, `drizzle/`, `scripts/`,
  `tests/`, `package.json` or the lockfile. If a content task needs a code change, write it
  as a one-line request in the pull request description and leave the code alone.
- No `vercel` commands, no environment variables, no backoffice logins, no database access.
- No edits to backoffice (database) posts; those belong to the owner in the backoffice.
- No new folders outside `content/` and `public/posts/`, `public/videos/`.

## Editorial plan (first eight weeks)

Search intent first, in Armenian and Russian, then English. One article per topic per
language, one short per week, one social post per article per channel.

1. Where to microchip and register a dog or cat in Yerevan, step by step
2. 24/7 veterinary clinics in Yerevan: what to check before you go
3. Annual vaccination calendar for dogs and cats in Armenia
4. Pet-friendly cafés and parks in Yerevan (ties into the QR venue programme)
5. First week with an adopted animal (partner post with a rescue organisation)
6. How much pet care costs in Yerevan: a realistic yearly budget
7. Choosing a groomer: questions to ask
8. Travelling inside Armenia with a pet: car, train, hotels

Every article ends with the join call to action the site already renders.

## October plan

The week-by-week content list and targets are in [`PLAN-OCTOBER-2026.md`](./PLAN-OCTOBER-2026.md). Follow its week order; every article ships in Armenian and Russian first.

## Social conventions

- 3–4 posts a week in total across Instagram and Facebook, not more. Rhythm: Monday community
  question, Wednesday guide, Friday guide or real-interface reel, Sunday one useful tip.
- One language per post. Armenian by default; a separate Russian post for topics with Russian
  demand (registration, clinics, costs). English stays on the website.
- 1–3 sentences, one concrete tip or one question, one call to action. Facebook: concise
  native text and the verified link. Instagram: link in bio plus one story frame with the
  link. Stories only when something is live. 3–5 hashtags.
- Visuals: BuddyLife editorial illustrations are the default while there is no real material;
  screen recordings of the live site, branded checklist cards and the team's own pets are also
  fine. Never present AI imagery as a real clinic, venue, customer or result; never invent
  testimonials, partners, venues, prices or launch dates.
- File per week: `content/social/<YYYY-MM-DD>-week.md` with one section per post (channel,
  day and time in Yerevan time, language, caption, hashtags, asset path, tracked link with
  `utm_source`, `utm_medium`, `utm_campaign`). The owner approves the week once on Monday.
- Community work is part of every week and is recorded: follow 20 relevant Armenian
  accounts, leave 10 genuine comments, share each guide in 3 Facebook groups with a personal
  sentence, answer group questions with the matching guide, draft 3 partner outreach messages.
- No paid ads or boosts. Measure link clicks and registrations (backoffice Stats), not views.
- Do not post from Codex; the owner publishes.

## Health rules for the channel

- One topic per pull request; content and images together.
- The `codex/` branch is deleted after merge.
- Plan a week at a time: the backoffice "Next 7 days" planner (or `pnpm content:week` for
  repository posts) shows the empty days. Schedule the week's posts in one sitting.
- Social posts go out after the article's publish time, never before, so the link resolves.
- `pnpm content` must be green; a red validator means the pull request is not ready.
- Never overwrite a live post's slug or cover; create a new file for a new version.
