"use client";
import { useEffect, useState } from "react";

const fields = [
  ["banner_1_hy", "Banner 1 · Armenian"],
  ["banner_1_ru", "Banner 1 · Russian"],
  ["banner_1_en", "Banner 1 · English"],
  ["banner_2_hy", "Banner 2 · Armenian"],
  ["banner_2_ru", "Banner 2 · Russian"],
  ["banner_2_en", "Banner 2 · English"],
  ["banner_3_hy", "Banner 3 · Armenian"],
  ["banner_3_ru", "Banner 3 · Russian"],
  ["banner_3_en", "Banner 3 · English"],
];

type Registration = {
  id: string;
  role: "parent" | "business";
  email?: string | null;
  phone?: string | null;
  province?: string | null;
  createdAt: string;
  isTest?: boolean;
};

type AnalyticsEvent = {
  id: string;
  eventType: string;
  metadata?: Record<string, unknown> | null;
};

type BackofficeData = {
  content: Record<string, string>;
  registrations: Registration[];
  events: AnalyticsEvent[];
};

type CampaignFunnel = {
  campaign: string;
  contentViews: Set<string>;
  joins: Set<string>;
  completions: Set<string>;
};

function sessionOf(event: AnalyticsEvent) {
  const session = event.metadata?.sessionId;
  return typeof session === "string" && session ? session : event.id;
}

export default function AdminClient() {
  const [data, setData] = useState<BackofficeData>({ content: {}, registrations: [], events: [] });
  const [saved, setSaved] = useState("");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    fetch("/api/admin-content")
      .then(async (response) => {
        if (!response.ok) throw new Error(`CMS service returned ${response.status}`);
        return response.json() as Promise<Partial<BackofficeData>>;
      })
      .then((payload) => setData({ content: payload.content || {}, registrations: payload.registrations || [], events: payload.events || [] }))
      .catch(() => setLoadError("Registration data is temporarily unavailable. Please reload after the secure connection is restored."));
  }, []);
  async function save(key: string, value: string) {
    await fetch("/api/admin-content", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaved(key);
    window.setTimeout(() => setSaved(""), 1200);
  }
  const validRegistrations = data.registrations.filter((x) => !x.isTest);
  const uniqueRegistrations = Array.from(new Map(validRegistrations.map((x) => [`${x.role}:${String(x.email || "").toLowerCase()}:${String(x.phone || "").replace(/\D/g, "")}`, x])).values());
  const joinEvents = data.events.filter((x) => x.eventType === "join_opened");
  const joins = new Set(joinEvents.map(sessionOf)).size;
  const completions = uniqueRegistrations.length;
  const conversion = joins
    ? `${Math.round((completions / joins) * 100)}%`
    : "—";
  const funnels = new Map<string, CampaignFunnel>();
  for (const event of data.events) {
    const campaign = String(event.metadata?.campaign || "").trim();
    if (!campaign || campaign === "none") continue;
    const current = funnels.get(campaign) || { campaign, contentViews: new Set<string>(), joins: new Set<string>(), completions: new Set<string>() };
    const session = sessionOf(event);
    if (event.eventType === "view_content") current.contentViews.add(session);
    if (event.eventType === "join_opened") current.joins.add(session);
    if (event.eventType === "registration_completed") current.completions.add(session);
    funnels.set(campaign, current);
  }
  const campaignRows = Array.from(funnels.values())
    .map((row) => ({ campaign: row.campaign, contentViews: row.contentViews.size, joins: row.joins.size, completions: row.completions.size }))
    .sort((a, b) => b.contentViews - a.contentViews || b.joins - a.joins);
  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE CMS</p>
          <h1>Website management</h1>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="https://buddylife.am/">View website</a>
          <a className="button" href="/api/backoffice-logout">Log out</a>
        </div>
      </div>
      <section className="adminStats">
        <article>
          <b>{uniqueRegistrations.length}</b>
          <span>Unique valid registrations</span>
        </article>
        <article>
          <b>{joins}</b>
          <span>Unique join sessions</span>
        </article>
        <article>
          <b>{conversion}</b>
          <span>Unique registration conversion</span>
        </article>
        <article>
          <b>
            {uniqueRegistrations.filter((x) => x.role === "parent").length}
          </b>
          <span>Pet parents</span>
        </article>
        <article>
          <b>
            {
              uniqueRegistrations.filter((x) => x.role === "business")
                .length
            }
          </b>
          <span>Businesses</span>
        </article>
      </section>
      <p className="adminMetricNote">Test records are excluded. Duplicate contacts count once. A join session is counted once per browser session.</p>
      <section className="adminPanel">
        <h2>Organic campaign funnel</h2>
        <p>First-party Learn views, join openings and completed registrations grouped by campaign. Internal admin and backoffice page views are not included.</p>
        <div className="adminTable">
          <div className="tableRow tableHead"><span>Campaign</span><span>Learn views</span><span>Join opens</span><span>Completed</span></div>
          {campaignRows.length ? campaignRows.map((row) => <div className="tableRow" key={row.campaign}><span>{row.campaign}</span><span>{row.contentViews}</span><span>{row.joins}</span><span>{row.completions}</span></div>) : <p className="adminEmpty">Campaign activity will appear after the updated tracking is live.</p>}
        </div>
      </section>
      {loadError && <section className="adminServiceError" role="alert"><b>CMS data connection needs attention</b><p>{loadError}</p><button type="button" onClick={() => window.location.reload()}>Reload</button></section>}
      <section className="adminRegistrationLinks">
        <a href="/admin/qrs"><span>▦</span><div><b>QR sticker tracking</b><small>Assign venues and measure scans, visitors and registrations</small></div><strong>Open →</strong></a>
        <a href="/admin/seo"><span>↗</span><div><b>SEO performance</b><small>Indexing readiness, search visibility and Vercel performance</small></div><strong>Open →</strong></a>
        <a href="/admin/registrations/parents"><span>🐾</span><div><b>Pet parent registrations</b><small>Search, review locations and export contacts</small></div><strong>Open →</strong></a>
        <a href="/admin/registrations/businesses"><span>✦</span><div><b>Business registrations</b><small>Review business interest, categories and regions</small></div><strong>Open →</strong></a>
      </section>
      <section className="adminPanel">
        <h2>Rotating banner copy</h2>
        <p>Edit the headline text. Empty fields use the website defaults.</p>
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            <textarea
              defaultValue={data.content[key] || ""}
              onBlur={(e) => save(key, e.target.value)}
            />
            {saved === key && <small>Saved ✓</small>}
          </label>
        ))}
      </section>
      <section className="adminPanel">
        <h2>Registration interest by province</h2>
        <div className="adminTable">
          <div className="tableRow tableHead">
            <span>Type</span>
            <span>Contact</span>
            <span>Province</span>
            <span>Date</span>
          </div>
          {data.registrations.map((r) => (
            <div className="tableRow" key={r.id}>
              <span>{r.role}</span>
              <span>{r.email || r.phone || "—"}</span>
              <span>{r.province || "—"}</span>
              <span>{r.createdAt}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
