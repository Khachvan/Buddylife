"use client";

import { useEffect, useMemo, useState } from "react";

type EventRow = { week?: string; period?: string; source?: string; language?: string; eventType: string; sessions: number };
type CountRow = { week?: string; period?: string; role?: string; count: number };
type ArticleRow = { article: string; sessions: number };

type Stats = {
  generatedAt: string;
  eventWeeks: EventRow[];
  registrationWeeks: CountRow[];
  scanWeeks: CountRow[];
  sources: EventRow[];
  languages: EventRow[];
  articles: ArticleRow[];
  totals: EventRow[];
  registrationTotals: CountRow[];
  scanTotals: CountRow[];
};

const FUNNEL = ["view_content", "join_opened", "registration_completed"] as const;
const LABEL: Record<string, string> = { view_content: "Article readers", join_opened: "Join form opened", registration_completed: "Registered (event)" };

function pct(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

function sum(rows: EventRow[], filter: (row: EventRow) => boolean) {
  return rows.filter(filter).reduce((total, row) => total + Number(row.sessions || 0), 0);
}

function weekLabel(week: string) {
  const date = new Date(`${week}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? week : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

export default function StatsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      fetch("/api/admin-stats", { cache: "no-store" })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
          return payload as Stats;
        })
        .then(setStats)
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Statistics could not be loaded"));
    });
  }, []);

  const periods = useMemo(() => {
    if (!stats) return [];
    return (["7d", "30d"] as const).map((period) => {
      const of = (eventType: string) => sum(stats.totals, (row) => row.period === period && row.eventType === eventType);
      const registrations = stats.registrationTotals.filter((row) => row.period === period);
      const parents = registrations.filter((row) => row.role === "parent").reduce((total, row) => total + Number(row.count), 0);
      const businesses = registrations.filter((row) => row.role === "business").reduce((total, row) => total + Number(row.count), 0);
      const scans = stats.scanTotals.filter((row) => row.period === period).reduce((total, row) => total + Number(row.count), 0);
      return { period, readers: of("view_content"), joins: of("join_opened"), completed: of("registration_completed"), parents, businesses, scans };
    });
  }, [stats]);

  const weeks = useMemo(() => {
    if (!stats) return [];
    const keys = new Set<string>();
    for (const row of [...stats.eventWeeks, ...stats.registrationWeeks, ...stats.scanWeeks]) if (row.week) keys.add(row.week);
    return [...keys].sort().map((week) => {
      const of = (eventType: string) => sum(stats.eventWeeks, (row) => row.week === week && row.eventType === eventType);
      const regs = (role: string) => stats.registrationWeeks.filter((row) => row.week === week && row.role === role).reduce((total, row) => total + Number(row.count), 0);
      const scans = stats.scanWeeks.filter((row) => row.week === week).reduce((total, row) => total + Number(row.count), 0);
      return { week, readers: of("view_content"), joins: of("join_opened"), parents: regs("parent"), businesses: regs("business"), scans };
    });
  }, [stats]);

  const breakdown = (rows: EventRow[], key: "source" | "language") => {
    const names = [...new Set(rows.map((row) => String(row[key] || "unknown")))];
    return names
      .map((name) => {
        const of = (eventType: string) => sum(rows, (row) => String(row[key] || "unknown") === name && row.eventType === eventType);
        return { name, readers: of("view_content"), joins: of("join_opened"), completed: of("registration_completed") };
      })
      .sort((a, b) => b.readers + b.joins + b.completed - (a.readers + a.joins + a.completed));
  };

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE CMS</p>
          <h1>Stats</h1>
          <p>Readers, join opens and registrations from the site&apos;s own tracking. Traffic and countries live in Vercel Web Analytics.</p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">CMS overview</a>
          <a className="button secondary" href="https://vercel.com/pet18/buddylife-landing/analytics" target="_blank" rel="noreferrer">Vercel Analytics ↗</a>
        </div>
      </div>

      {error && <div className="adminServiceError" role="alert"><b>Stats need attention</b><p>{error}</p></div>}
      {!stats && !error && <p className="adminEmpty">Loading…</p>}

      {stats && (
        <>
          <section className="adminStats">
            {periods.map((row) => (
              <article key={row.period} className="statsPeriod">
                <b>{row.parents + row.businesses}</b>
                <span>Registrations, last {row.period === "7d" ? "7" : "30"} days</span>
                <small>{row.parents} parents · {row.businesses} businesses · {row.scans} QR scans</small>
                <small>{row.readers} article readers → {row.joins} join opens → {row.completed} completed ({pct(row.completed, row.joins)})</small>
              </article>
            ))}
          </section>
          <p className="adminMetricNote">Counts are unique browser sessions. Our own checks (<code>?utm_source=internal</code>) and test records are excluded. Generated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(stats.generatedAt))}.</p>

          <section className="adminPanel">
            <div className="adminPanelHead"><h2>By week</h2><span className="cmsHelp">last 8 weeks, weeks start on Monday</span></div>
            <div className="statsTable" style={{ "--cols": "1.2fr 1fr 1fr 1fr 1fr 1fr" } as React.CSSProperties}>
              <div className="statsHead"><span>Week of</span><span>Readers</span><span>Join opens</span><span>Parents</span><span>Businesses</span><span>QR scans</span></div>
              {weeks.length ? weeks.map((row) => (
                <div className="statsRow" key={row.week}><span>{weekLabel(row.week)}</span><span>{row.readers}</span><span>{row.joins}</span><span>{row.parents}</span><span>{row.businesses}</span><span>{row.scans}</span></div>
              )) : <p className="adminEmpty">No activity yet.</p>}
            </div>
          </section>

          <div className="cmsLayout">
            <section className="adminPanel">
              <div className="adminPanelHead"><h2>Where visitors come from</h2><span className="cmsHelp">last 30 days, from utm_source</span></div>
              <div className="statsTable" style={{ "--cols": "1.4fr 1fr 1fr 1fr" } as React.CSSProperties}>
                <div className="statsHead"><span>Source</span><span>Readers</span><span>Join opens</span><span>Registered</span></div>
                {breakdown(stats.sources, "source").map((row) => (
                  <div className="statsRow" key={row.name}><span>{row.name}</span><span>{row.readers}</span><span>{row.joins}</span><span>{row.completed}</span></div>
                ))}
              </div>
            </section>
            <section className="adminPanel">
              <div className="adminPanelHead"><h2>By language</h2><span className="cmsHelp">last 30 days</span></div>
              <div className="statsTable" style={{ "--cols": "1.4fr 1fr 1fr 1fr" } as React.CSSProperties}>
                <div className="statsHead"><span>Language</span><span>Readers</span><span>Join opens</span><span>Registered</span></div>
                {breakdown(stats.languages, "language").map((row) => (
                  <div className="statsRow" key={row.name}><span>{row.name.toUpperCase()}</span><span>{row.readers}</span><span>{row.joins}</span><span>{row.completed}</span></div>
                ))}
              </div>
            </section>
          </div>

          <section className="adminPanel" style={{ marginTop: 22 }}>
            <div className="adminPanelHead"><h2>Most read guides</h2><span className="cmsHelp">last 30 days, unique readers</span></div>
            <div className="statsTable" style={{ "--cols": "3fr 1fr" } as React.CSSProperties}>
              <div className="statsHead"><span>Guide</span><span>Readers</span></div>
              {stats.articles.length ? stats.articles.map((row) => (
                <div className="statsRow" key={row.article}><span><a href={`/learn/${row.article}`} target="_blank" rel="noreferrer">{row.article}</a></span><span>{row.sessions}</span></div>
              )) : <p className="adminEmpty">No article views yet.</p>}
            </div>
          </section>

          <p className="adminMetricNote">
            Funnel labels: {FUNNEL.map((key) => LABEL[key]).join(" → ")}. Registrations count database rows; the event count can differ slightly when a browser blocks tracking.
          </p>
        </>
      )}
    </main>
  );
}
