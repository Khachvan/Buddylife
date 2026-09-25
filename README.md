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

## Local development

```bash
pnpm install
pnpm vercel:env:local   # pulls Development env vars into .env.local (see VERCEL_ENVIRONMENTS.md)
pnpm dev
```

`.env.example` lists every variable the app reads. Never commit `.env.local`.

## Checks

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm test`          | Unit tests for QR attribution, request security, locales, tracking  |
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
- `app/api/` public endpoints (`register`, `track`, `content`) and backoffice endpoints (`admin-*`)
- `app/q/[token]` QR sticker redirect with signed attribution cookies
- `lib/` auth, database, locale, QR attribution, QR image rendering and tracking helpers
- `proxy.ts` locale rewrites, backoffice session and same-origin enforcement
- `drizzle/` ordered SQL migrations applied with `pnpm db:migrate`
- `scripts/` image rendering and migration utilities

## Further reading

- [DESIGN.md](./DESIGN.md), [UX-CONTRACT.md](./UX-CONTRACT.md), [design-qa.md](./design-qa.md)
- [QR_ATTRIBUTION_ARCHITECTURE.md](./QR_ATTRIBUTION_ARCHITECTURE.md), [QR_IMPLEMENTATION_STATUS.md](./QR_IMPLEMENTATION_STATUS.md), [QR_RELEASE_GUARDRAILS.md](./QR_RELEASE_GUARDRAILS.md)
