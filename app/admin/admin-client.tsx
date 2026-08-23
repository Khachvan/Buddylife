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

export default function AdminClient() {
  const [data, setData] = useState<any>({
    content: {},
    registrations: [],
    events: [],
  });
  const [saved, setSaved] = useState("");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    fetch("/api/admin-content")
      .then(async (response) => {
        if (!response.ok) throw new Error(`CMS service returned ${response.status}`);
        return response.json();
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
  const joins = data.events.filter(
    (x: any) => x.eventType === "join_opened",
  ).length;
  const completions = data.events.filter(
    (x: any) => x.eventType === "registration_completed",
  ).length;
  const conversion = joins
    ? `${Math.round((completions / joins) * 100)}%`
    : "—";
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
          <b>{data.registrations.length}</b>
          <span>Total early registrations</span>
        </article>
        <article>
          <b>{joins}</b>
          <span>Join form opens</span>
        </article>
        <article>
          <b>{conversion}</b>
          <span>Form-open conversion</span>
        </article>
        <article>
          <b>
            {data.registrations.filter((x: any) => x.role === "parent").length}
          </b>
          <span>Pet parents</span>
        </article>
        <article>
          <b>
            {
              data.registrations.filter((x: any) => x.role === "business")
                .length
            }
          </b>
          <span>Businesses</span>
        </article>
      </section>
      {loadError && <section className="adminServiceError" role="alert"><b>CMS data connection needs attention</b><p>{loadError}</p><button type="button" onClick={() => window.location.reload()}>Reload</button></section>}
      <section className="adminRegistrationLinks">
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
          {data.registrations.map((r: any) => (
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
