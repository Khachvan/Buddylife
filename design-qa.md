# Design QA — BuddyLife QR management popup

## Evidence

- Source design system: the existing BuddyLife backoffice cards, Violet Bloom palette, typography, buttons, field treatments, and approved QR artwork.
- Preview: `https://buddylife-qr-preview.vercel.app/admin/qrs`
- Deployment: `dpl_73Xc8xPNT9PhNgEgWyXtaQDUHS8T`
- Code evidence:
  - `app/admin/qrs/qr-admin-client.tsx`
  - `app/globals.css`
  - `app/api/admin-qrs/route.ts`

## Full-view comparison evidence

The popup implementation follows the existing BuddyLife backoffice hierarchy: a Violet Bloom identity header, white grouped settings surfaces, existing button language, and the current form tokens. Desktop uses a centered 920 px maximum dialog; widths at and below 700 px use a full-width bottom sheet with a single-column form and independently scrollable content.

## Focused-region comparison evidence

The previously separate Rename, Settings, Assign venue, and Unassign controls now resolve through one **Manage QR** action on every card. The dialog preserves the approved paw, circle, and rounded-rectangle choices and exposes name, status, destination, placement, sticker location, venue profile fields, notes, reassignment, and guarded unassignment in one place.

## Findings

- [P1] Final rendered popup QA requires an owner check on Preview.
  - Location: `/admin/qrs`, **Manage QR** on any inventory card.
  - Evidence: the in-app browser could not capture the protected Preview because the admin-enforced browser policy could not be verified.
  - Impact: code, lint, type, build, deployment, and route checks pass, but rendered spacing, scroll behavior, and field wrapping cannot be visually signed off through automation.
  - Fix: open the protected Preview, launch **Manage QR** at desktop and mobile widths, and complete the owner checklist below.

## Required fidelity surfaces

- Typography: existing backoffice font sizes, weights, labels, and Violet Bloom hierarchy are reused.
- Spacing and layout: grouped sections, 44 px controls, contained scrolling, and the mobile bottom-sheet breakpoint are implemented.
- Colors and tokens: current plum, violet, pink, muted, border, success, and danger language is reused.
- Image quality and asset fidelity: the approved paw, circle, and rounded-rectangle artwork remains available through the popup.
- Behavior: settings, design, destination, assignment, reassignment, and guarded unassignment are available from one action; individual and bulk downloads remain separate direct actions.
- Accessibility: semantic dialog, labelled title, initial focus, focus trap, Escape close, focus restoration, native labels, required fields, validation patterns, and disabled invalid states are implemented.

## Verification history

- Pass 1: consolidated all mutation controls into one dialog while preserving the inventory card hierarchy and direct download actions.
- Pass 2: added server-side validation for status, printable design, destination paths, placement identity, and reassignment invariants.
- Pass 3: targeted Prettier and ESLint passed; Next.js production build and Vercel Preview build passed.
- Pass 4: Preview deployment is READY and the protected `/admin/qrs` route returns the expected authenticated redirect when no session is supplied.
- Pass 5: rendered browser QA was blocked by the admin-enforced browser policy.

## Owner QA checklist

- Open **Manage QR** on one unassigned QR; confirm the popup opens immediately and the card stays in place after closing.
- Rename it, change its printable design, and save; confirm the card updates.
- Assign it to an existing venue, then reopen the popup and confirm that venue is selected.
- Choose **Create a new venue below**, enter a new venue and sticker location, and reassign it.
- Start **Unassign venue**, verify the confirmation appears, cancel once, then confirm once.
- Press Escape and use Tab/Shift+Tab to confirm focus stays inside the popup and returns to **Manage QR** on close.
- Repeat the layout check on a narrow/mobile window and confirm the bottom sheet scrolls without hiding either save action.
- Download the designed SVG afterward and scan it from a second phone.

final result: blocked
