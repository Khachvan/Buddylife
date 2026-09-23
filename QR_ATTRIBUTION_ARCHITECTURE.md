# BuddyLife numbered QR inventory and attribution architecture

Status: **PREVIEW QA — foundation, individual creation and backoffice analytics deployed**
Scope: 100 preprinted BuddyLife stickers, later assignment to cafés/venues/placements, per-QR traffic and registration attribution, and aggregate reporting in the BuddyLife backoffice.

## 1. Recommended product model

Print 100 permanent QR identities, not 100 venue-specific links.

Each sticker has:

- a visible serial such as `BL-0001`, `BL-0002`, … `BL-0100`;
- a different, non-sequential public token encoded in its QR;
- a permanent short URL such as `https://buddylife.am/q/7KQ4N9XD`;
- the approved BuddyLife Pet Friendly design.

The visible serial helps staff find and assign the sticker. The random token prevents easy guessing and enumeration. Neither value changes when the sticker is renamed, moved or assigned to a different venue.

Do not encode the café name, UTM values or final landing page directly into the printed QR. Those values belong in the database and can be edited later.

## 2. User and data flow

```text
Sticker BL-0007
      │ scan
      ▼
buddylife.am/q/<permanent-token>
      │
      ├── resolve active QR assignment
      ├── record scan + anonymous visitor/session
      ├── store signed first-party attribution
      ▼
BuddyLife landing page / registration modal
      │ register
      ▼
Registration linked server-side to QR, assignment and venue
      │
      ▼
Backoffice totals + per-QR/venue conversion reporting
```

Example: `BL-0007` can be printed before its destination is known. In the backoffice it can later be named “Green Bean Café — entrance” and assigned to that location. Its printed QR does not change.

## 3. Data model

### `qr_codes` — permanent printed inventory

| Column | Purpose |
| --- | --- |
| `id uuid primary key` | Internal identity |
| `serial text unique` | Human-readable `BL-0001` |
| `public_token text unique` | Random token encoded in the QR |
| `display_name text` | Editable backoffice name |
| `status text` | `unassigned`, `active`, `paused`, `retired` |
| `default_destination text` | Same-origin route, normally `/?join=parent` |
| `design_version text` | Which approved sticker template was printed |
| `batch_code text` | Print batch, e.g. `PF-2026-01` |
| `created_at`, `updated_at` | Audit timestamps |

`serial` and `public_token` are immutable after printing. `display_name`, status and destination are editable.

### `qr_placements` — café/location record

| Column | Purpose |
| --- | --- |
| `id uuid primary key` | Placement identity |
| `name text` | Editable venue or placement name |
| `venue_type text` | café, restaurant, clinic, shelter, event, other |
| `address text`, `city text`, `province text` | Optional location data |
| `contact_name text`, `contact_details text` | Optional private operational contact |
| `notes text` | Internal note |
| `is_active boolean` | Archive without deletion |
| `created_at`, `updated_at` | Audit timestamps |

This table should be called “placements” in the database even if the UI says “Venues.” It keeps the design usable for events, counters, posters and future non-venue placements.

### `qr_assignments` — versioned QR-to-placement history

| Column | Purpose |
| --- | --- |
| `id uuid primary key` | Assignment identity |
| `qr_code_id uuid` | Printed QR |
| `placement_id uuid` | Café/location/placement |
| `label_snapshot text` | Name at assignment time for reporting |
| `destination_path text` | Landing route for this assignment |
| `assigned_at`, `ended_at` | Active period |
| `created_by text` | Admin audit identity |

Never overwrite historical assignment data when a sticker moves. End the old assignment and create a new one. Every scan stores the active assignment ID, so old conversions remain attributed to the correct location.

### `qr_scans` — raw scan events

| Column | Purpose |
| --- | --- |
| `id uuid primary key` | Scan event |
| `qr_code_id`, `qr_assignment_id` | Exact printed QR and assignment |
| `visitor_id_hash text` | Pseudonymous visitor identifier |
| `session_id uuid` | One browsing session |
| `scanned_at timestamptz` | Scan time |
| `language text` | Landing language if known |
| `landing_path text` | Resolved destination |
| `device_class text` | mobile/tablet/desktop, when safely derived |
| `is_bot boolean`, `is_test boolean` | Reporting exclusions |

Do not store raw IP addresses. If rate limiting or abuse detection requires an IP-derived value, store only a rotating salted hash with a short retention policy.

### Registration attribution additions

Add nullable columns to `registrations`:

- `first_qr_scan_id`
- `last_qr_scan_id`
- `qr_code_id`
- `qr_assignment_id`
- `attribution_captured_at`

Keep the existing `source`, `medium`, `campaign` and `venue` text fields as readable snapshots and for non-QR campaigns. For a QR registration, the server fills these from the trusted database assignment instead of accepting them from client-submitted text.

### Optional `qr_daily_stats`

Store daily aggregates by QR and assignment:

- raw scans;
- unique visitors;
- unique sessions;
- registration starts;
- valid registrations;
- test registrations;
- conversions.

At BuddyLife’s present scale, the dashboard can query raw rows first. Add daily aggregation before scan volume threatens Neon’s 0.5 GB Free-plan storage. A good policy is to retain raw scans for 90 days and retain daily totals indefinitely.

## 4. Attribution rules

Report these separately:

1. **Scans:** every accepted human GET request.
2. **Unique visitors:** distinct first-party visitor identifiers.
3. **Unique sessions:** visits separated by the session timeout.
4. **Registration starts:** registration modal/form opened after QR attribution.
5. **Registrations:** valid, non-test records attributed to the QR.
6. **Conversion rate:** valid registrations ÷ unique visitors.

Recommended conversion rule:

- primary attribution: the last QR scanned within 30 days before registration;
- secondary/assisted attribution: preserve the first QR scanned in that period;
- if a person scans café A and later café B before registering, B receives the primary conversion and A remains visible as first-touch assistance;
- duplicate registration attempts do not create additional conversions;
- test scans and test registrations are excluded by default.

The exact attribution window should be a backoffice setting later. Start with 30 days.

## 5. Public redirect endpoint

Create a dynamic Next.js Route Handler:

`GET /q/[token]`

Responsibilities:

1. Validate the random token and QR status.
2. Resolve the active assignment and safe same-origin destination.
3. Ignore `HEAD` requests and identify obvious preview crawlers/bots.
4. Create or refresh signed, first-party visitor and QR-attribution cookies.
5. Record the scan using Neon.
6. Redirect to the BuddyLife landing page, normally with the parent registration modal open.

Requirements:

- Node.js runtime for Neon access;
- dynamic/no-store behavior so every real scan is processed;
- no arbitrary external redirect URLs; destination paths must pass a same-origin allowlist;
- redirect still works if analytics storage temporarily fails;
- unknown/retired tokens go to a friendly BuddyLife fallback page, not a technical error;
- rate limiting and bot/test flags prevent inflated public reporting.

The QR payload remains short, improving scan reliability and allowing higher physical error correction.

## 6. Reliable registration linkage

The current site already copies UTM and `venue` query parameters into registrations. That is useful, but client-provided text can be lost or spoofed.

For the QR system:

1. `/q/[token]` writes a signed HttpOnly attribution cookie containing a server-verifiable reference.
2. The registration endpoint reads that cookie server-side.
3. It resolves the QR and assignment from Neon.
4. It writes immutable attribution IDs and readable snapshots into the registration row.
5. It records a `registration_completed` event containing the QR and assignment IDs, but no contact details.

The attribution survives navigation around the BuddyLife website and does not depend on keeping venue names in the URL.

## 7. Backoffice experience

Add `/admin/qrs` with four views.

### Overview

- total scans;
- unique visitors;
- valid registrations;
- overall QR conversion rate;
- active, unassigned, paused and retired sticker counts;
- date-range comparison.

### QR inventory

Table fields:

- serial;
- editable display name;
- active placement;
- status;
- scans;
- unique visitors;
- registrations;
- conversion rate;
- last scan;
- actions.

Filters: date range, status, venue type, city/province, print batch and search.

### QR detail

- stable short URL and downloadable QR image;
- current assignment and assignment history;
- editable name, placement, destination and status;
- daily scan/visitor/registration chart;
- on-demand recent visitor list with a short pseudonymous reference, scan/session totals, first/latest visit, device class, language, referrer host and landing path;
- attributed registrations list with submitted name/business, email, phone, location and registration details;
- test-mode link;
- audit history.

### Placements

- create/edit/archive café or location records;
- assign any unassigned serial;
- end or move an assignment without destroying historical reporting;
- compare placements by traffic and conversion.

The backoffice should be mobile-friendly so a team member can stand inside a café, read `BL-0037` from the sticker and assign it immediately.

## 8. Admin APIs

Suggested protected endpoints:

- `GET /api/admin/qrs` — paginated inventory and aggregates
- `POST /api/admin/qrs/batch` — create a controlled batch such as 100 codes
- `GET /api/admin/qrs/[id]` — detail and assignment history
- `GET /api/admin-qrs/[id]/visitors` — protected, no-store visitor and attributed-registration drill-down
- `PATCH /api/admin/qrs/[id]` — rename, pause or update safe destination
- `POST /api/admin/qrs/[id]/assignments` — assign/reassign placement
- `POST /api/admin/qrs/[id]/test` — create an excluded test scan
- `GET /api/admin/qr-analytics` — date-filtered aggregate report
- `GET /api/admin/qr-analytics/export` — CSV export
- `GET/POST/PATCH /api/admin/placements` — placement management

Use server-side aggregate queries. The visitor drill-down is loaded only when an administrator opens it and is capped to the 250 most recent visitor and registration records; complete totals remain server-calculated.

## 9. Security, privacy and data quality

- Keep the public token random and separate from the visible sequential serial.
- Do not expose internal UUIDs in printed links.
- Sign attribution cookies and give them a defined expiry.
- Treat attribution cookies in line with BuddyLife’s consent/privacy policy; update the privacy notice before launch.
- Never store registration contact details in scan events or analytics metadata.
- Require backoffice authentication for every QR write and analytics endpoint.
- Add CSRF protection or same-origin verification to admin mutations.
- Replace the current static backoffice session value with an environment-backed, expiring signed session before QR administration expands.
- Add rate limiting for the redirect and admin mutation routes.
- Use `is_test` and `is_bot` exclusions consistently.
- Record an audit event whenever a code is renamed, paused, reassigned or retired.

## 10. Database and migration improvements

The current application creates/changes tables inside `ensureSchema()` during requests. Before adding QR tables:

1. define the schema in Drizzle;
2. generate committed, versioned SQL migrations;
3. apply migrations to the Development database;
4. apply and test on the isolated Preview Neon branch;
5. apply to Production only after Preview QA and approval;
6. keep environment URLs and secrets separate.

Request-time `CREATE TABLE`/`ALTER TABLE` logic should be retired after migrations are established. It adds runtime latency and makes schema releases harder to audit.

## 11. QR asset generation

Reuse the approved sticker design as the immutable template and replace only:

- the QR matrix;
- the visible serial number;
- optionally a small print-batch code.

Generate one print package containing:

- 100 high-resolution sticker files;
- vector QR assets where the print supplier supports them;
- print-ready PDF sheets with bleed/cut lines agreed with the supplier;
- a CSV manifest mapping serial → public token → short URL → asset filename;
- a checksum/validation report proving every rendered QR resolves to the expected token.

Print safeguards:

- preserve a four-module quiet zone;
- use dark QR modules on a light, non-transparent field;
- use Q or H error correction where the design allows it;
- never stretch or soften the QR image;
- test a physical proof on multiple iOS and Android devices, at angles, in low light and behind glass;
- avoid glossy glare directly over the QR.

## 12. Implementation phases

### Phase 0 — finalize requirements

Confirm naming, attribution window, default destination, whether stickers can be reassigned, location fields, privacy/consent behavior, reporting retention and the chosen final design template.

### Phase 1 — data and redirect foundation

- Drizzle schema and migrations;
- QR/placement/assignment tables;
- registration attribution columns;
- `/q/[token]` redirect and signed attribution;
- bot/test handling;
- automated endpoint and database tests.

### Phase 2 — backoffice management

- QR inventory and detail pages;
- placement creation and assignment workflow;
- rename/pause/reassign controls;
- aggregate dashboards and CSV export;
- audit log and mobile QA.

### Phase 3 — first 100-sticker batch

- batch creation in Development;
- generation of 100 unique assets from the approved design;
- automated decode verification;
- physical proof print and scan testing;
- Preview QA using Preview-only codes/database;
- owner approval before Production batch creation and final printing.

### Phase 4 — Production release

- production migration;
- validated Preview promotion/merge;
- `buddylife.am/q/<token>` smoke tests;
- backoffice assignment and report tests;
- registration attribution test using a clearly marked test code;
- begin daily Neon usage monitoring and data-quality review.

## 13. Acceptance criteria

- Every printed sticker has a unique QR and visible serial.
- Renaming or assigning a QR in the backoffice requires no reprint.
- A scan appears under the correct QR and assignment.
- A registration after a scan is linked to that QR server-side.
- First- and last-touch remain correct when two different stickers are scanned.
- Reassigning a sticker does not rewrite its historical venue data.
- Totals reconcile with per-QR totals for the same filters.
- Test and bot activity is excluded from default reports.
- Duplicate registrations do not inflate conversions.
- Disabled QR codes use the safe fallback behavior.
- Development, Preview and Production data remain isolated.
- A production regression can be rolled back without losing QR or registration records.

## 14. Decisions needed before coding

1. Is `BL-0001` the preferred visible numbering format?
2. Can a physical sticker ever move to another venue, or is assignment permanent?
3. Should the default scan open the parent registration modal immediately?
4. Is 30 days the desired registration-attribution window?
5. Do you want first-touch and last-touch reporting, or only last-touch?
6. Which venue fields are required: name, type, address, city, province, contact and notes?
7. Should backoffice users be able to change only the name/assignment, or also the landing destination?
8. How long should raw scan events be kept before only daily totals remain?
9. Which one of the approved sticker designs is the master template for all 100 units?
10. Should the first batch be exactly 100 Production codes, or include additional replacement/test codes?
