# BuddyLife testing and model-routing guide

Updated: 25 September 2026 (Asia/Yerevan)

## Runtime and commands

- Node.js: 24 in CI; local engine requirement is Node.js 22.13 or newer.
- Package manager: pnpm 11.19.0 from the committed lockfile.
- Fast gate: `pnpm check:fast`.
- Release gate: `pnpm check:release`.
- Full legacy lint inventory: `pnpm lint`; this remains diagnostic until pre-existing repository-wide debt is resolved.

The fast gate runs deterministic Node tests and focused lint for the critical acquisition/security modules, including `lib/tracking.ts`. The release gate repeats the fast gate and then performs the full Next.js production build. A failed release gate blocks only the affected release.

## Covered behavior

- safe QR destinations preserve allowed public paths and reject external, admin, API, backoffice and chained QR targets;
- signed QR attribution round-trip, missing-secret fail-closed behavior and tamper detection;
- public QR token constraints;
- bot and device classification used by acquisition measurement;
- same-origin mutation protection, including missing-origin and mismatched-origin failures (enforced centrally in `proxy.ts` for every backoffice mutation);
- first-party tracking input sanitizing: only known event types, whitelisted metadata keys and bounded value lengths reach the database;
- the public `/api/content` cache rule ordering in `next.config.ts`;
- CMS post helpers: slug rules, draft/scheduled/live/archived state from status and publish time, body rendering, input validation;
- media upload validation, safe file names and header-based image dimensions;
- migration file statement splitting;
- Next.js compilation, type checking and route generation through the production build.

Fixtures are synthetic and local. Tests do not use Production registrations, customer contacts, publishing accounts, payment data or deployment secrets.

## Trigger rules

- Documentation-only handoff or index changes need link, owner, date, and status-consistency checks; they do not trigger `check:release` when application inputs are unchanged.
- Run `check:fast` after QR attribution, request-security, analytics-exclusion or tracking-consent changes.
- Run `check:release` before every Vercel Preview build and before promotion approval.
- Add focused regression coverage for a verified defect before or with its fix when practical.
- Browser-test affected real journeys on Preview after the release gate; human QA still precedes Production.
- Physical QR decode/scan checks remain required for print artwork and are not replaced by unit tests.
- Genuine Lead/ProviderLead validation must use a real voluntary registration; never create a fake Production registration.
- For browser-based checks, record each newly created tab's browser ID, tab ID, purpose, creator/run and retained or disposable state in the operating record. Close only this run's completed disposable tabs after checking for drafts, uploads and handoffs; preserve user-owned tabs and previews.

## CI status boundary

`.github/workflows/quality.yml` is configured for pull requests and pushes to `main`, with read-only repository permissions, locked dependency installation and a 15-minute job timeout. Configuration in the working tree is not proof that remote CI ran or that branch protection requires it. Remote execution and required-check enforcement remain pending until the owner’s normal commit/push/repository-settings workflow activates them.

## Local end-to-end harness

Set `DATABASE_URL=pglite:.data/pglite` plus test `BACKOFFICE_*` hashes and QR secrets in `.env.local`, run `pnpm dev`, sign in at `/backoffice`, and apply migrations from `/admin/database`. This gives a complete local database for exercising posts, scheduling, media uploads, QR creation, the `/q/<token>` redirect, form-open tracking and attributed registration without touching Neon. Verified on 25 September 2026: migrations 0000 to 0004 applied, image upload and serving, scheduled post going live at its publish time, QR scan → registration attribution with venue and serial recorded, printable SVG encoding the configured public origin.

## Known gaps

- the PGlite harness is manual; CI still runs only the deterministic unit tests and the build;
- no automated browser test for consent choice, Learn CTA UTM preservation, form validation, success/recovery UI or backoffice-host redirects;
- no automated rendered-image safe-zone/readability test;
- repository-wide lint has substantial pre-existing debt, so the blocking lint scope is intentionally focused and must not silently expand without a cleanup plan;
- Vercel/Neon capacity and Production API health remain operational checks, not unit tests.

## Task-based model routing

- Deterministic repeated checks: scripts/test runner, no LLM when possible.
- Small bounded change with clear acceptance: `gpt-5.6-luna`, medium effort, when offered by the selected host.
- Routine feature, test or CI implementation: `gpt-5.6-sol`, medium effort.
- Architecture, security, migrations, persistent unexplained failure or high-impact data work: `gpt-6-astra`, high effort, plus any required qualified human review.
- Escalate after at most two equivalent attempts and first distinguish infrastructure failure from reasoning failure.

This is routing guidance for future dispatched work. It does not change the model of the current task by itself, create a new task, authorize deployment, or replace specialist review.
