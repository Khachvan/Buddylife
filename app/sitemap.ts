import type { MetadataRoute } from "next";

const routes = [
  ["", "weekly", 1],
  ["/pet-parents", "monthly", 0.9],
  ["/for-business", "monthly", 0.9],
  ["/features", "monthly", 0.85],
  ["/learn", "weekly", 0.9],
  ["/learn/preventive-care", "monthly", 0.8],
  ["/learn/summer-safety", "monthly", 0.8],
  ["/learn/indoor-cat-enrichment", "monthly", 0.8],
  ["/learn/everyday-pet-parent-problems", "monthly", 0.85],
  ["/learn/organize-pet-information-and-care-dates", "monthly", 0.85],
  ["/learn/weekly-pet-care-organization-routine", "monthly", 0.85],
  ["/learn/pet-care-handover-note", "monthly", 0.85],
  ["/learn/first-week-pet-information-starter-kit", "monthly", 0.85],
  ["/learn/five-minute-pet-admin-reset", "monthly", 0.85],
  ["/learn/what-to-do-when-pet-goes-missing", "monthly", 0.9],
  ["/learn/help-pet-when-guests-visit", "monthly", 0.85],
  ["/learn/moving-home-with-a-pet", "monthly", 0.85],
  ["/learn/help-pet-adjust-to-changed-daily-routine", "monthly", 0.85],
  ["/verification", "monthly", 0.7],
  ["/privacy", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(([route, changeFrequency, priority]) => ({
    url: `https://buddylife.am${route}`,
    lastModified: new Date("2026-09-25"),
    changeFrequency,
    priority,
  }));
}
