// Production may only be built from main. A production build from any other
// branch (a CLI deploy or a promoted preview) stops here.
const environment = process.env.VERCEL_ENV;
const ref = process.env.VERCEL_GIT_COMMIT_REF;
if (environment === "production" && ref && ref !== "main") {
  console.error(`\nBlocked: production build from branch "${ref}". Production deploys only from main.\nMerge a pull request into main instead; see VERCEL_ENVIRONMENTS.md.\n`);
  process.exit(1);
}
