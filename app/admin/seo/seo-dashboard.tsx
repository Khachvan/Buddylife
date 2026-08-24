"use client";

import { useEffect, useState } from "react";

type Check = { label: string; detail: string; ok: boolean | null };

const trackedPages = [
  ["Homepage", "https://buddylife.am/"],
  ["Pet parents", "https://buddylife.am/pet-parents"],
  ["Businesses", "https://buddylife.am/for-business"],
  ["Learn hub", "https://buddylife.am/learn"],
  ["Preventive care", "https://buddylife.am/learn/preventive-care"],
  ["Summer safety", "https://buddylife.am/learn/summer-safety"],
  ["Indoor cat enrichment", "https://buddylife.am/learn/indoor-cat-enrichment"],
];

export default function SeoDashboard() {
  const [checks, setChecks] = useState<Check[]>([
    { label: "Public website", detail: "Checking crawl access…", ok: null },
    { label: "Robots directives", detail: "Checking robots.txt…", ok: null },
    { label: "XML sitemap", detail: "Checking sitemap.xml…", ok: null },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/", { redirect: "manual" }),
      fetch("/robots.txt").then(async (response) => ({ response, text: await response.text() })),
      fetch("/sitemap.xml").then(async (response) => ({ response, text: await response.text() })),
    ]).then(([home, robots, sitemap]) => {
      setChecks([
        { label: "Public website", detail: home.ok ? "Homepage is publicly crawlable." : `Homepage returned ${home.status}.`, ok: home.ok },
        { label: "Robots directives", detail: robots.response.ok && robots.text.includes("Sitemap:") ? "Search crawlers are allowed and the sitemap is declared." : "robots.txt needs attention.", ok: robots.response.ok && robots.text.includes("Sitemap:") },
        { label: "XML sitemap", detail: sitemap.response.ok && sitemap.text.includes("buddylife.am/learn") ? "Core pages and Learn articles are included." : "Sitemap needs attention.", ok: sitemap.response.ok && sitemap.text.includes("buddylife.am/learn") },
      ]);
    }).catch(() => setChecks((items) => items.map((item) => ({ ...item, detail: "Check could not complete. Try again.", ok: false }))));
  }, []);

  return (
    <main className="adminPage seoAdminPage">
      <div className="adminTop">
        <div><p className="eyebrow">BUDDYLIFE SEO</p><h1>Search performance</h1><p>Indexing readiness, Armenian search visibility and real-user performance.</p></div>
        <div className="adminActions"><a className="button secondary" href="/admin">CMS overview</a><a className="button" href="https://buddylife.am/" target="_blank" rel="noreferrer">View website</a></div>
      </div>

      <section className="seoCheckGrid">
        {checks.map((check) => <article key={check.label} className={check.ok === false ? "needsAttention" : ""}><span className="seoStatus">{check.ok === null ? "…" : check.ok ? "✓" : "!"}</span><div><b>{check.label}</b><p>{check.detail}</p></div></article>)}
      </section>

      <section className="adminPanel seoDestinations">
        <div><p className="eyebrow">LIVE DATA</p><h2>Performance tools</h2><p>These official dashboards remain the source of truth for search queries, indexing, traffic and Core Web Vitals.</p></div>
        <div className="seoToolLinks">
          <a href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fbuddylife.am%2F" target="_blank" rel="noreferrer"><b>Google Search Console</b><span>Queries, impressions, clicks and indexing →</span></a>
          <a href="https://vercel.com/pet18/buddylife-landing/analytics" target="_blank" rel="noreferrer"><b>Vercel Web Analytics</b><span>Visitors, referrers and page performance →</span></a>
          <a href="https://vercel.com/pet18/buddylife-landing/speed-insights" target="_blank" rel="noreferrer"><b>Vercel Speed Insights</b><span>Mobile and desktop Core Web Vitals →</span></a>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHead"><div><p className="eyebrow">INDEXING SET</p><h2>Priority pages</h2></div><a className="button secondary" href="https://buddylife.am/sitemap.xml" target="_blank" rel="noreferrer">Open sitemap</a></div>
        <div className="seoPageList">{trackedPages.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer"><span><b>{label}</b><small>{url}</small></span><strong>↗</strong></a>)}</div>
      </section>
    </main>
  );
}
