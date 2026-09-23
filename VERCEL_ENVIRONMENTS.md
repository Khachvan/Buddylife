# BuddyLife Vercel environment and release process

BuddyLife uses the existing Vercel project `buddylife-landing`, connected to the GitHub repository `Khachvan/buddylife-landing`.

## Environment model

| Environment | Purpose                                           | Database and secrets                                                                           |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Local       | Development on a trusted computer                 | Pulled from Vercel Development into ignored `.env.local`; uses `buddylife-development-preview` |
| Preview     | QA for branches and pull requests                 | Uses `buddylife-development-preview`; never use the Production database for destructive tests  |
| Production  | Live `buddylife.am` and `backoffice.buddylife.am` | Uses the production-only `buddylife-registrations` database                                    |

### Verified Neon topology

Verified on 2026-08-29 without exposing connection strings:

| Vercel environment | Neon resource                   | Vercel scope     |
| ------------------ | ------------------------------- | ---------------- |
| Development        | `buddylife-development-preview` | Development only |
| Preview            | `buddylife-development-preview` | Preview only     |
| Production         | `buddylife-registrations`       | Production only  |

The Production and non-Production `NEON_PROJECT_ID` values were compared locally and are different. The core and QR attribution migrations are applied only to `buddylife-development-preview`. Production has not been migrated by this setup.

Custom environments are intentionally not required. The current Pro plan supports one included custom environment, but BuddyLife should add `staging` only if Preview deployments become too short-lived for coordinated QA.

## One-time local setup

1. Install dependencies with `pnpm install`.
2. Run `pnpm vercel:pull:local` and select the existing `Pet / buddylife-landing` project if prompted.
3. Run `pnpm vercel:env:local` to refresh `.env.local`.
4. Never commit `.env.local`, Vercel tokens, database URLs, PINs, or bypass tokens.

The expected variables are documented in `.env.example`. Actual values belong in Vercel, scoped separately to Development, Preview, and Production.

## Normal change flow

1. Create a branch from current `main`.
2. Make and test changes locally.
3. Run `pnpm lint` to review lint debt, then run the production-blocking `pnpm verify` build before pushing.
4. Push the branch and open a pull request. Vercel Git integration creates a Preview deployment with its own URL.
5. Validate the Preview URL:
   - home, Learn listing, and every changed Learn detail route;
   - Armenian, Russian, English, and Persian article rendering, including right-to-left Persian layout;
   - Facebook and other share links without completing a public post;
   - registration and protected backoffice behavior using safe Preview data;
   - mobile layout, metadata, Open Graph image, analytics loading, and runtime errors.
6. Merge only after the GitHub build gate and human Preview review pass. Lint is reported but temporarily non-blocking because the existing application has a known lint backlog.
7. The merge to `main` creates the Production deployment and updates the production domains.
8. Smoke-test `buddylife.am` and `backoffice.buddylife.am`; record the deployment URL and result.

## Manual preview and controlled promotion

BuddyLife QR QA uses the stable Preview-only alias `https://buddylife-qr-preview.vercel.app`. Point this alias to the newest verified Preview deployment after each QR release so administrators do not reuse immutable generated Preview URLs with obsolete environment snapshots.

For a local Preview deployment:

```bash
pnpm deploy:preview
```

For a release that must reuse the exact tested artifact, disable automatic production promotion in Vercel first, then promote the validated Preview URL:

```bash
pnpm release:promote -- https://validated-preview-url.vercel.app
```

Do not enable manual promotion casually: it changes the current Git-based release behavior and should be agreed before changing the Vercel project setting.

## Rollback

If Production fails its smoke test, use Vercel's instant rollback and then investigate the failed change on a branch:

```bash
pnpm release:rollback
```

Rollback changes which deployment serves the production domains; it does not revert Git history.

## Required Vercel environment separation

- `DATABASE_URL`: currently separated: Preview/Development use `buddylife-development-preview`; Production uses `buddylife-registrations`. Preserve this mapping.
- `SITE_PIN`: separate non-production value; never reuse the production PIN in Preview.
- `SITES_BYPASS_TOKEN`: scope tightly and rotate if exposed.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`: normally Production only unless Preview verification is explicitly needed.
- `QR_ATTRIBUTION_SECRET`: a different high-entropy value in Development, Preview and Production. Rotating it expires existing anonymous QR attribution cookies but does not affect stored scans.
- `QR_PUBLIC_BASE_URL`: `https://buddylife.am` in Production and `https://buddylife-qr-preview.vercel.app` in Preview. QR artwork, copied links and manifests must never derive their public destination from the backoffice request host.
- `BACKOFFICE_USERNAME_SHA256` and `BACKOFFICE_PASSWORD_SHA256`: environment-specific SHA-256 credential hashes; never store the plain login values in Git.
- `BACKOFFICE_SESSION_SECRET`: a separate high-entropy secret used for expiring signed backoffice sessions. Rotating it signs every administrator out.

Vercel Analytics and Speed Insights do not require secrets in this application. Confirm Preview traffic is excluded from business reporting when interpreting launch metrics.
