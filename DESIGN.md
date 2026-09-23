# BuddyLife interface design system

## 1. North Star

BuddyLife product screens should feel like a calm, capable operations studio: approachable enough for community work, precise enough for registration and QR administration. The experience is airy, warm and unmistakably Violet Bloom without becoming decorative or toy-like.

## 2. Visual register

- Use the established cream canvas, white working surfaces and restrained Violet Bloom accents.
- Let names and human-readable labels carry the strongest hierarchy; technical identifiers remain visible but secondary.
- Reserve green for verified, active and print-safe states. Reserve pink for brief emphasis and BuddyLife brand warmth.
- Avoid dense black dashboards, neon gradients, glass-heavy surfaces, ornamental illustration inside admin workflows and color-only status communication.

## 3. Runtime token ownership

The canonical runtime source is `app/globals.css`.

| Role                | Token             | Value     |
| ------------------- | ----------------- | --------- |
| Brand primary       | `--violet`        | `#6f42c1` |
| Brand warmth        | `--pink`          | `#e83e8c` |
| Primary text        | `--plum`          | `#2d163f` |
| Canvas              | `--cream`         | `#faf8fc` |
| Secondary text      | `--muted`         | `#6f6678` |
| Verified/print-safe | QR semantic color | `#0f5b3e` |

Do not add a second theme file or duplicate these values in a component. Screen-specific aliases may reference the runtime tokens in a scoped CSS block.

## 4. Typography

- Family: Arial with `Noto Sans Armenian` fallback, matching the current application.
- Page titles: bold, compact tracking and clear sentence case.
- Record names: the primary heading in list cards.
- Serial numbers, tokens and paths: monospaced where they function as identifiers.
- Eyebrows and status labels: compact uppercase only for short operational metadata.

## 5. Layout and density

- Admin pages use a clear page introduction, summary metrics, one primary work area and a stable list toolbar.
- Working surfaces use white backgrounds, 18–26 px radii and light violet borders.
- QR inventory uses two columns on wide screens and one column below 1000 px.
- Card actions wrap instead of clipping. Mobile preserves every action and repeats context rather than hiding fields.

## 6. Components and interaction

- Buttons combine intent and emphasis: gradient solid for the main safe action, white outline for secondary actions and text/soft surfaces for utilities.
- Inputs use 44 px minimum height, visible labels, violet focus rings and app-owned validation.
- Native select popups are accepted for the current short status and venue lists; their platform-owned open geometry is intentional.
- Search includes an app-owned clear button.
- Multi-selection uses a checkbox per QR, an explicit “select all shown” scope, exact selected count and a stable bulk-download bar.
- Creation returns to the owning list, places the newest QR first and focuses/highlights the new named record.
- Downloads are non-destructive: one QR downloads one designed SVG; multi-selection downloads one ZIP containing the same designed SVGs.

## 7. QR screen signature

The named QR identity cluster is the signature element: selection control, miniature printable-shape preview, prominent editable name and a subordinate serial chip. This makes the physical/operational name the fastest scanning cue while preserving the permanent technical identity.

## 8. Accessibility and motion

- Important controls target approximately 44 px and expose visible focus.
- Status always includes text, not color alone.
- Selection scope and selected count are readable and announced through normal semantic controls.
- Motion communicates insertion or selection only; reduced-motion mode removes transform effects and smooth scrolling.
- Empty data and no-search-results states remain distinct and provide a recovery action.

## 9. Release discipline

Website changes follow Local verification → Vercel Preview → human QA → Production approval. QR Preview continues to use the isolated Preview database and must never generate the final permanent Production inventory.
