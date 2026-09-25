import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2] ?? "v6";
if (!/^v\d+$/.test(version)) {
  throw new Error(`Invalid candidate version: ${version}`);
}
const sourceDir = path.join(root, "design-sources", `learn-editorial-${version}-candidates`);
const reviewDir = path.resolve(
  root,
  "..",
  "buddylife_marketing_plan",
  "visual_reviews",
  "2026-09-10",
  `learn-diversity-${version}`,
);
const logoPath = path.join(root, "public", "buddylife-logo-clean.png");

const slugs = [
  "preventive-care",
  "summer-safety",
  "indoor-cat-enrichment",
  "everyday-pet-parent-problems",
  "weekly-pet-care-organization-routine",
  "five-minute-pet-admin-reset",
  "first-week-pet-information-starter-kit",
];

const frame = Buffer.from(`
  <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#2d164f"/>
        <stop offset="0.58" stop-color="#6036c6"/>
        <stop offset="1" stop-color="#dc3a84"/>
      </linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#2d164f" flood-opacity="0.20"/>
      </filter>
    </defs>
    <rect x="18" y="18" width="1164" height="764" rx="34" fill="none" stroke="url(#brand)" stroke-width="5"/>
    <g filter="url(#shadow)">
      <rect x="50" y="48" width="270" height="54" rx="27" fill="url(#brand)" fill-opacity="0.94"/>
      <text x="185" y="82" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="19" font-weight="800" letter-spacing="2.2">BUDDYLIFE • LEARN</text>
      <rect x="1020" y="620" width="140" height="140" rx="28" fill="#ffffff" fill-opacity="0.96" stroke="#6036c6" stroke-opacity="0.16"/>
    </g>
  </svg>
`);

const logo = await sharp(logoPath).resize(110, 110, { fit: "contain" }).png().toBuffer();

for (const slug of slugs) {
  const source = path.join(sourceDir, `${slug}.png`);
  const output = path.join(reviewDir, `learn-${slug}-candidate.jpg`);
  await sharp(source)
    .resize(1200, 800, { fit: "cover", position: "centre" })
    .composite([
      { input: frame, left: 0, top: 0 },
      { input: logo, left: 1035, top: 635 },
    ])
    .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
    .toFile(output);
  console.log(path.relative(root, output));
}
