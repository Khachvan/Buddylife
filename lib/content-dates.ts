// Real content dates used by article structured data and the sitemap.
// Update the matching entry whenever a page's content materially changes.

export const ARTICLE_PUBLISHED: Record<string, string> = {
  "preventive-care": "2026-08-24",
  "summer-safety": "2026-08-24",
  "indoor-cat-enrichment": "2026-08-24",
  "everyday-pet-parent-problems": "2026-08-26",
  "organize-pet-information-and-care-dates": "2026-08-28",
  "weekly-pet-care-organization-routine": "2026-08-30",
  "pet-care-handover-note": "2026-09-06",
  "first-week-pet-information-starter-kit": "2026-09-09",
  "five-minute-pet-admin-reset": "2026-09-11",
  "help-pet-when-guests-visit": "2026-09-16",
  "moving-home-with-a-pet": "2026-09-18",
  "what-to-do-when-pet-goes-missing": "2026-09-23",
  "help-pet-adjust-to-changed-daily-routine": "2026-09-25",
};

// Last material copy change for the non-article pages.
export const PAGE_UPDATED: Record<string, string> = {
  "": "2026-09-23",
  "/pet-parents": "2026-09-23",
  "/for-business": "2026-09-23",
  "/features": "2026-09-23",
  "/verification": "2026-09-23",
  "/privacy": "2026-09-23",
  "/terms": "2026-09-23",
};

export function articlePublished(slug: string): string {
  return ARTICLE_PUBLISHED[slug] || "2026-08-24";
}

export function newestArticleDate(): string {
  return Object.values(ARTICLE_PUBLISHED).sort().at(-1) || "2026-08-24";
}
