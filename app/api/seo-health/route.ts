import { logEvent } from "../../../lib/logging";

export async function GET() {
  try {
    const [home, robots, sitemap] = await Promise.all([
      fetch("https://buddylife.am/", { cache: "no-store" }),
      fetch("https://buddylife.am/robots.txt", { cache: "no-store" }),
      fetch("https://buddylife.am/sitemap.xml", { cache: "no-store" }),
    ]);
    const [robotsText, sitemapText] = await Promise.all([robots.text(), sitemap.text()]);
    return Response.json({
      home: { ok: home.ok, status: home.status },
      robots: { ok: robots.ok && robotsText.includes("Sitemap:"), status: robots.status },
      sitemap: { ok: sitemap.ok && sitemapText.includes("buddylife.am/learn"), status: sitemap.status },
    });
  } catch (error) {
    logEvent("error", "/api/seo-health", "SEO health check failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Health check unavailable" }, { status: 503 });
  }
}
