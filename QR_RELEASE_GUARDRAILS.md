# BuddyLife QR release guardrails

Owner: BuddyLife

Last verified: 2026-08-29 (Asia/Yerevan)

## Environment ownership

| Environment | Neon resource | Allowed data |
| --- | --- | --- |
| Local | `buddylife-development-preview` | Development and marked test data only |
| Preview | `buddylife-development-preview` | QA and marked test data only |
| Production | `buddylife-registrations` | Live registrations and final QR data |

The Production and non-Production Neon project identifiers must be different. Confirm the environment mapping before every migration or deployment without printing credentials.

## Non-negotiable protections

- Never connect Local or Preview to `buddylife-registrations`.
- Never migrate, seed, copy into, delete from, or edit Production without explicit owner approval for that exact action.
- Never overwrite or re-date an existing registration.
- QR fields on ordinary registrations remain nullable and backward-compatible.
- QR reporting excludes bot and marked test activity from business totals.
- Store no raw IP addresses and never expose connection strings, tokens, credential hashes, or private QR manifests.
- Keep QR assignment history immutable: moving a sticker ends the old assignment and creates a new one.
- Do not generate printable permanent QR identities in a disposable Preview database.

## Required release sequence

1. Verify the database resource and environment scope.
2. Run local lint, type, build, migration-idempotency, and attribution security checks.
3. Apply migrations only to the non-Production database.
4. Deploy only to Vercel Preview.
5. Use temporary QRs and records marked `is_test = true` for scan-to-registration QA.
6. Confirm the existing website, Learn pages, CMS, normal registrations, and backoffice registration views still work.
7. Confirm QR scans, visitors, form opens, registrations, conversion totals, venue history, CSV export, and SVG decoding.
8. Present the Preview URL, test evidence, database scope, data impact, and rollback plan to the owner.
9. Obtain explicit approval before a Production migration or promotion.
10. After an approved Production release, smoke-test `buddylife.am` and `backoffice.buddylife.am` before creating the final QR inventory.

## Permanent 100-sticker batch gate

Generate the final `BL-0001` through `BL-0100` inventory in Production only after the reviewed release is approved and stable. Retain one untouched private manifest, place each URL into the approved artwork, decode-test every exported print file, and do not regenerate public tokens after printing.

## Rollback rules

- A website regression uses the last verified Vercel deployment rollback.
- A database migration must be additive and forward-compatible; do not use destructive rollback SQL against live registration tables.
- If attribution fails but registrations still work, pause QR distribution and preserve scan/audit records while fixing the issue in Local and Preview.
- If registrations are affected, stop the release, restore the last verified website deployment, and do not change live rows while investigating.
