# BuddyLife plan — October 2026

Written 30 September 2026 from the site review, the Armenian market scan and the numbers
(Vercel: 211 visitors / 459 views in 30 days, 70% bounce, Facebook the only referrer;
database: 17 registrations, none since 1 September; Google: 2 referrals a month).

Three owners. **Claude Code** owns the website and its development (buddylife.am, Learn,
registrations, backoffice, QR attribution; this file and `docs/PRODUCT-BACKLOG.md`).
**Codex** owns content and social drafts under `docs/CODEX-BRIEF.md`. **Owner** (Khachatur)
owns accounts, partners, publishing and money. The BuddyLife application (pet profiles,
health passport, reminders, in-app directory) is built by the owner's dev team and is out of
scope for this plan. Nothing here authorises spending or account changes.

## Goals for 31 October

| Metric | Now | Target | Where to read it |
| --- | --- | --- | --- |
| Visitors / month | 211 (57% Armenia) | 500 (≥70% Armenia) | Vercel Analytics → backoffice Stats |
| Google share of visits | ~1% | 10% (25% by December) | Search Console, Stats |
| Join form → registration | 5% in September | 20% | Stats |
| Registrations / month | 2 | 40 pet parents, 10 businesses | Backoffice → Registrations |
| QR stickers placed / scans | 1 / 1 | 10 venues / 50 scans | Backoffice → QR |
| Published guides (hy + ru) | 9 static + 2 | +8 topics (16 files) | `pnpm content:week` |

## Week 1 (1–5 October) — measure and stop the bleeding

**Claude Code**
1. Backoffice **Stats** page: visitors (Vercel API when the token works, otherwise the
   database), form opens → registrations by week, by source, by language, top articles,
   QR scans; test events excluded (`source=internal`).
2. Join promise: one sentence on the home hero, the modal and the press band —
   "Early access + the Yerevan pet-care checklist by email · launch in Yerevan [month]" —
   in hy/ru/en/fa (copy from Codex, markup here). Email confirmation with the checklist PDF.
3. Consent sheet as a slim bottom bar on phones; never over the hero button.
4. Contact paths: email and WhatsApp/Telegram links in header, footer and the business
   page. (Owner provides the number/handle.)
5. Google Search Console: add the property, submit the sitemap, add `lastmod` to the
   sitemap. (Owner adds the DNS TXT record.)

**Codex**
- Week plan with `pnpm content:week`; publish Monday, Wednesday, Friday at 09:00 Yerevan:
  24/7 clinics in Yerevan, vaccination calendar, pet-friendly places — hy and ru first,
  en later; each with a "Short answer" block and clickable sources.
- Social drafts for every article (Facebook post, Instagram post + story) the same day.
- Rewrite the hero and join copy per item 2 (drafts in `content/social/hero-headlines.md`).

**Owner**
- Choose the launch month to print on the site. Provide WhatsApp/Telegram contact.
- Add the Search Console DNS record when asked. Post the three articles on Facebook and
  Instagram; put buddylife.am in the Instagram bio.

## Week 2 (6–12 October) — businesses and Russian

**Claude Code**
1. Founding-partner offer page (`/for-business`): what a partner gets, free for founding
   partners, 3-field form (business, category, phone) + WhatsApp link, `business` audience
   tracked separately.
2. Accessibility pass: 12 px labels → 14 px, 44 px targets on text links, visible focus.
3. Home page: remove the duplicated feature list, move Learn above Trust; article hero
   `sizes` attribute; sharper Russian hero copy.
4. Article template: "Short answer" box, provider list block (name, address, phone, map
   link), clickable sources — so Codex can use them from JSON.

**Codex**
- Care costs in Yerevan, choosing a groomer, first week with an adopted animal (partner
  post with a rescue), each hy + ru; social drafts.
- Russian versions of the three best-read static guides (admin reset, changed routine,
  handover note).

**Owner**
- Sign 5 founding partners (start with clinics that already have sites: VetExpress, Joli,
  VetHome; groomers: Groom, BB Grooming). Place QR stickers in the first 5 venues.
- Reply to registrations from the first two weeks (the backoffice has emails and phones).

## Weeks 3–4 (13–31 October) — directory and retention

**Claude Code**
1. Website provider listing (backlog item 2): a public page of founding partners by
   category and city with a "request a quote" form, tracked as `quote_requested`. This is
   a website page for lead capture; the in-app directory belongs to the app team.
2. Founding partners section on the home page fed by backoffice content keys.
3. Weekly email digest to registered users: the week's guides (Resend is already
   connected). Unsubscribe link and consent line on the form.
4. Social insight in the backoffice Stats page: reach and engagement of the Facebook and
   Instagram pages next to site visits, once the accounts are connected read-only.

**Codex**
- Travelling inside Armenia with a pet, insurance explainer (EFES, INGO, Nairi), adoption
  handover kit copy; two shorts (vertical) from the best-read guides.

**Owner**
- Press launch date fixed and announced; 10 partners listed; 10 QR venues live.

## Ongoing rules

- Production changes only by merging into `main`; Codex touches only `content/`,
  `public/posts/`, `public/videos/` (CI enforces both).
- Every Monday: read the Stats page, compare with the targets table, adjust the week plan.
- Every article: hy + ru at minimum, `publishAt` 09:00 Yerevan, cover 1200×800 under
  400 KB, social draft the same day.
- Test data is deleted after every check; test events carry `source=internal`.

## Not doing in October

Anything belonging to the application (it is the dev team's), payments, booking engine, paid ads. The directory and the content base come
first; ads are only worth buying once the join conversion is back above 20%.
