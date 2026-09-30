// Public build identity. The production drift watchdog compares this with main.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      ref: process.env.VERCEL_GIT_COMMIT_REF || null,
      environment: process.env.VERCEL_ENV || "local",
      deployment: process.env.VERCEL_DEPLOYMENT_ID || null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
