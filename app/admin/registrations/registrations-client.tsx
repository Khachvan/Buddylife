"use client";

import { Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Role = "parent" | "business";

export default function RegistrationsClient({ audienceRole }: { audienceRole: Role }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin-content")
      .then(async (response) => {
        if (!response.ok) throw new Error(`CMS service returned ${response.status}`);
        return response.json();
      })
      .then((data) => setRegistrations((data.registrations || []).filter((item: any) => item.role === audienceRole)))
      .catch(() => setLoadError("Registration data is temporarily unavailable. Please reload after the secure connection is restored."))
      .finally(() => setLoading(false));
  }, [audienceRole]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return registrations;
    return registrations.filter((item) => Object.values(item).some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [query, registrations]);

  const provinces = new Set(registrations.map((item) => item.province).filter(Boolean)).size;
  const validRegistrations = registrations.filter((item) => !item.isTest);

  async function setTestStatus(id: string, isTest: boolean) {
    const response = await fetch("/api/admin-registration", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, isTest }),
    });
    if (response.ok) setRegistrations((items) => items.map((item) => item.id === id ? { ...item, isTest } : item));
  }

  function downloadCsv() {
    const fields = audienceRole === "parent"
      ? ["name", "petType", "email", "phone", "city", "province", "source", "campaign", "venue", "qrSerial", "qrName", "qrVenue", "isTest", "createdAt"]
      : ["businessName", "category", "email", "phone", "city", "province", "source", "campaign", "venue", "qrSerial", "qrName", "qrVenue", "isTest", "createdAt"];
    const escape = (value: unknown) => `"${String(value || "").replaceAll('"', '""')}"`;
    const csv = [fields.join(","), ...filtered.map((row) => fields.map((field) => escape(row[field])).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `buddylife-${audienceRole}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div><p className="eyebrow">BUDDYLIFE CMS</p><h1>{audienceRole === "parent" ? "Early registered pet parents" : "Early registered businesses"}</h1></div>
        <a className="button" href="/admin">CMS overview</a>
      </div>
      <nav className="adminNav" aria-label="Registration views">
        <a className={audienceRole === "parent" ? "active" : ""} href="/admin/registrations/parents">Pet parents</a>
        <a className={audienceRole === "business" ? "active" : ""} href="/admin/registrations/businesses">Businesses</a>
      </nav>
      <section className="adminStats compact">
        <article><b>{validRegistrations.length}</b><span>Valid registrations</span></article>
        <article><b>{provinces}</b><span>Provinces represented</span></article>
        <article><b>{filtered.length}</b><span>Visible results</span></article>
      </section>
      <section className="adminPanel">
        {loadError && <div className="adminServiceError" role="alert"><b>CMS data connection needs attention</b><p>{loadError}</p></div>}
        <div className="adminPanelHead">
          <label className="adminSearch"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, contact or location" /></label>
          <button className="button secondary" type="button" onClick={downloadCsv} disabled={!filtered.length}><Download aria-hidden="true" /> Export CSV</button>
        </div>
        <div className="adminTable registrationsTable">
          <div className="tableRow tableHead"><span>{audienceRole === "parent" ? "Name / pet" : "Business / category"}</span><span>Contact</span><span>Location / source</span><span>Status</span></div>
          {loading && <p className="adminEmpty">Loading registrations…</p>}
          {!loading && !filtered.length && <p className="adminEmpty">No matching registrations yet.</p>}
          {filtered.map((item) => (
            <div className="tableRow" key={item.id}>
              <span><b>{audienceRole === "parent" ? item.name || "—" : item.businessName || "—"}</b><small>{audienceRole === "parent" ? item.petType || "Pet type not provided" : item.category || "Category not provided"}</small></span>
              <span>{item.email || item.phone || "—"}<small>{item.email && item.phone ? item.phone : ""}</small></span>
              <span>{[item.city, item.province].filter(Boolean).join(", ") || "—"}<small>{[item.qrSerial, item.qrVenue || item.venue, item.source, item.campaign].filter(Boolean).join(" · ") || "Direct"}</small></span>
              <span><b className={item.isTest ? "statusTest" : "statusValid"}>{item.isTest ? "Test" : "Valid"}</b><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}</small><button className="registrationStatusButton" type="button" onClick={() => setTestStatus(item.id, !item.isTest)}>{item.isTest ? "Restore" : "Mark test"}</button></span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
