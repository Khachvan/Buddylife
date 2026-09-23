# BuddyLife QR tracking implementation status

Updated: 2026-08-31 (Asia/Yerevan)

## Implemented locally

- permanent `/q/[token]` redirect route with a safe BuddyLife-only destination;
- anonymous visitor and 30-minute session identifiers;
- signed first-touch and last-touch QR attribution with a 30-day window;
- bot/test exclusions and no raw IP storage;
- QR-to-registration linkage derived on the server, not trusted from browser parameters;
- committed, idempotent core and QR database migrations;
- versioned QR assignments so moving a sticker does not rewrite old results;
- reusable venue records for cafés with more than one sticker;
- protected `/admin/qrs` inventory and metrics dashboard;
- Preview-only creation of one temporary, individually tracked QR at a time;
- rectangle, circle or paw printable visualization selected before creation;
- editable QR name, status and safe destination;
- one high-fidelity **Manage QR** popup per inventory card for identity, design, destination, venue assignment, reassignment and guarded unassignment;
- assign, move and unassign venue workflows;
- scans, unique visitors, form opens, registrations and conversion metrics;
- on-demand per-QR visitor drill-down with pseudonymous visitor references, scan/session activity, latest visit context and attributed registration contact details;
- privacy separation between anonymous visits and people who voluntarily submitted registration information;
- CSV inventory/placement manifest export;
- individual printable SVG QR downloads using high error correction and an unchanged four-module quiet zone;
- prominent human-readable QR names, newest-first inventory order and post-creation focus/highlight;
- explicit per-QR selection, select-all-shown scope and exact selected counts;
- one-click bulk download of selected designed SVGs in a single ZIP archive;
- clearer individual “Download designed SVG” actions and QR-shape previews in the inventory;
- expiring environment-backed backoffice sessions;
- backward-compatible non-QR registration and CMS reads before migration.

## Verification completed

- focused ESLint review for all new and changed QR/authentication files;
- Next.js production build and TypeScript checks;
- signed-cookie tamper test;
- safe-destination allowlist test;
- backoffice credential/session verification test;
- QR SVG encoder smoke test;
- read-only QR visitor and registration detail queries against the isolated non-Production database;
- whitespace and patch-integrity check.
- individual QR creation and rectangle/circle/paw persistence;
- live SVG download, render and barcode decode to the exact server-generated URL;
- CSV export including the visualization shape;
- signed scan → form-open → attributed-registration flow;
- clean non-QR registration and duplicate-registration protection;
- total and per-QR analytics plus protected visitor/registration detail;
- same-origin mutation rejection and unauthenticated admin redirect;
- owner-authorized Preview login and protected API access;
- focused lint, production build, strict premium UI audit and two-file ZIP integrity test for the named-inventory and bulk-download update;
- targeted lint, TypeScript, local production build and Vercel Production build for the unified QR management popup;
- semantic dialog focus trap, Escape close, trigger-focus restoration, native field validation and responsive bottom-sheet review;
- Production QR unknown-token route returned the expected safe redirect after deployment, confirming the live QR schema connection;
- public site, backoffice login and protected-admin redirect smoke tests passed after deployment;
- Production QR URL-origin incident reproduced from runtime logs: an SVG generated through the backoffice had encoded `backoffice.buddylife.am` because the request origin was used as a fallback;
- all QR URL surfaces now use the environment-safe public QR origin: inventory API, copy-link action, individual SVG, CSV manifest and bulk ZIP artwork;
- Production generation is additionally pinned in code to `https://buddylife.am`, while Preview remains isolated on its stable Preview alias;
- existing artwork that already contains `backoffice.buddylife.am/q/...` is repaired by a permanent host-preserving redirect to `https://buddylife.am/q/...`;
- a real Production SVG was rendered to PNG and decoded with macOS Vision as `https://buddylife.am/q/235275822b854e9faba73b7e594257f1`;
- the decoded Production URL returned HTTP 307 to `https://buddylife.am/?join=parent`, and the legacy backoffice-host URL returned HTTP 308 to the same public QR route;
- individual SVG, CSV inventory and bulk ZIP checks all contained the public `buddylife.am` QR URL;

## Environment isolation completed

- `buddylife-registrations` is connected to Production only.
- `buddylife-development-preview` is connected to Preview and Development only.
- Their `NEON_PROJECT_ID` values were verified as different without exposing credentials.
- `0000_buddylife_core.sql` through `0003_qr_preview_safety_columns.sql` were applied successfully to the non-Production database.
- The non-Production database has all eight required tables and no permanent QR inventory yet.
- After explicit owner approval on 2026-08-31, the same additive migration set was applied to Production and a second migration pass confirmed the ledger is current.
- Production keeps its separate `buddylife-registrations` database, existing administrator credential hashes, and newly generated Production-only backoffice-session and QR-attribution signing secrets.

## Preview status

The unified QR management update remains available in the isolated Preview environment at:

`https://buddylife-qr-preview.vercel.app/admin/qrs`

The final QR-host compatibility Preview is deployment `dpl_HPSTQ7qhqvy15xoyzrkkj1YrjMXC`, which is `READY`. Local lint, TypeScript and production build checks passed on 2026-08-31. The owner explicitly approved the Preview for Production release.

## Production status

Owner-approved Production deployment `dpl_B3BScoEKgXBzAhZUKZyvSGXC5TLq` is `READY` and serves both `https://buddylife.am` and `https://backoffice.buddylife.am` as of 2026-08-31 (Asia/Yerevan).

The owner-requested Production backoffice credential update remains active. The username/password hashes remain server-only, the session-signing secret was rotated, and an HTTPS login plus authenticated `/admin/qrs` request both returned HTTP 200.

Post-release smoke tests:

- `https://buddylife.am/` returned HTTP 200;
- `https://backoffice.buddylife.am/backoffice` returned HTTP 200;
- authenticated `https://backoffice.buddylife.am/admin/qrs` returned HTTP 200;
- unauthenticated `https://backoffice.buddylife.am/admin/qrs` returned the expected HTTP 307 redirect to `/backoffice`;
- an unknown valid-format Production QR token returned the expected safe redirect to `/?qr_status=unknown`;
- a real Production QR decoded to `https://buddylife.am/q/235275822b854e9faba73b7e594257f1` and redirected to `https://buddylife.am/?join=parent`;
- the same token on the legacy backoffice hostname returned HTTP 308 to the public QR route, so previously downloaded artwork remains usable;
- the new deployment had no error-level runtime logs at the post-release scan.

Do not create the permanent `BL-0001` through `BL-0100` inventory until the separate print-production gate is explicitly approved.

## Controlled Preview sequence

1. Run the production build gate.
2. Deploy the source to Vercel Preview with the isolated Preview database.
3. Open `/admin/qrs` and create temporary Preview QRs individually. Do not create the final 100 permanent identities.
4. Assign at least two temporary test QRs to two test venues.
5. Scan both URLs from separate mobile sessions and complete one safe test registration.
6. Confirm per-QR scans, unique visitors, form opens and registration attribution.
7. Confirm ordinary registrations and existing CMS views still work.
8. Human QA the Preview before any Production promotion.

## Print-production gate

Do not send artwork to print until the Production redirect endpoint and the exact 100 public URLs have passed physical phone scans. After that, download the CSV manifest and each SVG, place them into the selected approved sticker design, retain a private master manifest, and decode-test every final print file.
