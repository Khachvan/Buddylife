# BuddyLife QR administration UX contract

This contract applies to the Preview QR administration workflow. Business and data rules remain owned by `QR_ATTRIBUTION_ARCHITECTURE.md`, `QR_RELEASE_GUARDRAILS.md` and `VERCEL_ENVIRONMENTS.md`.

## Canonical UI Map

| Capability      | Canonical owner                                       | Source of truth               | Allowed variants           | Verification                                  |
| --------------- | ----------------------------------------------------- | ----------------------------- | -------------------------- | --------------------------------------------- |
| Table Selection | QR card selection and bulk toolbar in `QrAdminClient` | `DESIGN.md` and this contract | all shown; individual      | keyboard, count and ZIP workflow              |
| Select/Listbox  | Native select                                         | `DESIGN.md` and this contract | platform-owned short lists | keyboard and real-browser popup               |
| Form            | QR create and inline forms in `QrAdminClient`         | this contract                 | create; edit; assign       | validation, duplicate prevention and recovery |

## QR workflow behavior

- Creation is pessimistic: show a busy state, wait for the server, then close the creator only after confirmed success.
- A newly created QR appears first, retains its human-readable name as the primary label, is highlighted briefly and receives focus.
- Search matches QR name, permanent serial and placement information. A non-empty query has an app-owned clear action.
- Selection scope is always “all shown,” never all hypothetical server results. Existing selection remains explicit when filters hide selected records.
- Individual download returns one designed SVG. Bulk download returns one ZIP containing the same designed SVG for every selected QR.
- A download does not mutate QR state and does not require confirmation.
- Server failures remain visible in the page error region and preserve the current selection or form values.

## Data and release boundaries

- The QR identity, public token, attribution and assignment lifecycle remain governed by `QR_ATTRIBUTION_ARCHITECTURE.md`.
- Local and Preview use only the isolated non-Production Neon resource as required by `QR_RELEASE_GUARDRAILS.md`.
- No Production migration, final permanent QR inventory or Production promotion occurs without explicit owner approval after human Preview QA.
