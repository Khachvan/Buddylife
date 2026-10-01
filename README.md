# BuddyLife Armenia

Marketing site, Learn hub and backoffice for [buddylife.am](https://buddylife.am), the pet-care
platform for Armenia. Public pages are served in Armenian (default), Russian, English and Persian
using path locales (`/`, `/ru`, `/en`, `/fa`). The backoffice at `backoffice.buddylife.am` manages
banner copy, early registrations and venue QR stickers.

## Stack

- Next.js App Router with React 19, deployed on Vercel from GitHub (`Khachvan/Buddylife`)
- Neon Postgres via `@neondatabase/serverless`; SQL migrations live in `drizzle/`
- Tailwind CSS 4 plus hand-written styles in `app/globals.css`
- Node.js tests via `node --test`, ESLint 9, TypeScript strict mode

## Requirements

- Node.js 22.13 or newer (CI uses Node 24)
- pnpm 11 (`corepack enable` picks the version from `package.json`)

## Backoffice

The backoffice at `backoffice.buddylife.am` (locally `/backoffice`) is protected by the
`BACKOFFICE_*` environment variables and offers:

- **Posts** (`/admin/posts`): write Learn articles in Armenian, Russian, English or Persian, keep
  them as drafts, publish immediately, schedule a publish date and time, or archive them. Scheduled
  posts go live on their own at the chosen time and appear on the Learn hub, the home page preview,
  their own `/learn/<slug>` page and the sitemap.
- **Media library** (`/admin/media`): upload JPEG, PNG, WebP or GIF images up to 4 MB. Files are
  stored in the database and served from `/media/<id>` with long CDN caching.
- **Banner copy** (`/admin`): the rotating home-page headlines per language.
- **Registrations** (`/admin/registrations/*`): early-access sign-ups with CSV export and test
  flags.
- **QR sticker tracking** (`/admin/qrs`): create QR codes on the rectangle, circle or paw artwork,
  assign them to venues, download print-ready SVGs, and see scans, visitors, form opens and
  attributed registrations per sticker.
- **Database** (`/admin/database`): environment, connected Neon host, table counts, and a
  one-click way to apply pending SQL migrations from `drizzle/`, with links to the Vercel storage
  and Neon dashboards.

## Content from chat

Codex or Claude publish articles, visuals, shorts and videos by committing files:
`content/posts/<date>-<slug>.<lang>.json` plus covers under `public/posts/`, with
`publishAt` for scheduling and `video.url` for YouTube, Shorts or Vimeo. Validate with
`pnpm content`, open a pull request, merge. Full rules in
[docs/CONTENT-PLAYBOOK.md](./docs/CONTENT-PLAYBOOK.md); the division of work between Codex and Claude Code is in
[docs/CODEX-BRIEF.md](./docs/CODEX-BRIEF.md), and the product backlog in [docs/PRODUCT-BACKLOG.md](./docs/PRODUCT-BACKLOG.md).

## Local development

```bash
pnpm install
pnpm vercel:env:local   # pulls Development env vars into .env.local (see VERCEL_ENVIRONMENTS.md)
pnpm dev
```

`.env.example` lists every variable the app reads. Never commit `.env.local`.

Without access to Neon, set `DATABASE_URL=pglite:.data/pglite` in `.env.local`. The app then runs
PGlite, a file-based Postgres engine, in-process; open `/admin/database` and apply the migrations to
create every table. The `.data/` folder is gitignored and PGlite is never bundled into deployments.

## Checks

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm test`          | Unit tests for QR attribution, request security, locales, tracking, content |
| `pnpm content`       | Validates every post file under `content/posts` and its assets       |
| `pnpm check:fast`    | Tests plus focused lint on the security-critical modules            |
| `pnpm check:release` | `check:fast` plus the full production build; required before a PR   |
| `pnpm lint`          | Repository-wide lint (diagnostic)                                   |

## Release

Every change ships through a branch and a pull request. Vercel builds a Preview for each branch;
merging into `main` deploys production. CLI deploys are not used. Details, environment mapping and
rollback are in [VERCEL_ENVIRONMENTS.md](./VERCEL_ENVIRONMENTS.md); testing rules are in
[TESTING.md](./TESTING.md).

## Project layout

- `app/` routes, layouts and the client site component (`app/site.tsx` holds the multilingual copy)
- `app/api/` public endpoints (`register`, `track`, `content`) and backoffice endpoints (`admin-*`); `app/media/[id]` serves uploaded images
- `app/q/[token]` QR sticker redirect with signed attribution cookies
- `lib/` auth, database (Neon plus the local PGlite adapter), migrations, posts, media, locale, QR attribution, QR image rendering and tracking helpers
- `proxy.ts` locale rewrites, backoffice session and same-origin enforcement
- `drizzle/` ordered SQL migrations, applied from `/admin/database` or with `pnpm db:migrate`
- `scripts/` image rendering and migration utilities

## Further reading

- [DESIGN.md](./DESIGN.md), [UX-CONTRACT.md](./UX-CONTRACT.md), [design-qa.md](./design-qa.md)
- [QR_ATTRIBUTION_ARCHITECTURE.md](./QR_ATTRIBUTION_ARCHITECTURE.md), [QR_IMPLEMENTATION_STATUS.md](./QR_IMPLEMENTATION_STATUS.md), [QR_RELEASE_GUARDRAILS.md](./QR_RELEASE_GUARDRAILS.md)

## Backoffice accounts and article control

- **Accounts:** the owner login comes from the environment (`BACKOFFICE_*`). Additional accounts are created in Backoffice → Accounts and stored in `backoffice_users` with salted scrypt hashes. Roles: `owner` (everything) and `editor` (articles, uploads, scheduling, order and visibility, website content, messages, stats — not accounts or the database). The middleware enforces roles from the signed session cookie; deactivating an account blocks new sign-ins and an open session ends within 8 hours.
- **Order and visibility:** Backoffice → Posts lists every article on the site, whatever its source (backoffice, repository or built-in). Pin puts an article first on the Learn hub and home preview; hide removes it from the hub, its own URL (404) and the sitemap without deleting it. Settings live in `cms_article_settings`, keyed by slug, and reach visitors within about 30 seconds.
- An assistant such as ChatGPT can use the backoffice through its own editor account in a browser; it then has exactly the rights of an editor.
