"use client";

import { Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Role = "parent" | "business";

export default function RegistrationsClient({ role }: { role: Role }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-content")
      .then((r) => r.json())
      .then((data) => setRegistrations((data.registrations || []).filter((item: any) => item.role === role)))
      .finally(() => setLoading(false));
  }, [role]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return registrations;
    return registrations.filter((item) => Object.values(item).some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [query, registrations]);

  const provinces = new Set(registrations.map((item) => item.province).filter(Boolean)).size;

  function downloadCsv() {
    const fields = role === "parent"
      ? ["name", "petType", "email", "phone", "city", "province", "createdAt"]
      : ["businessName", "category", "email", "phone", "city", "province", "createdAt"];
    const escape = (value: unknown) => `"${String(value || "").replaceAll('"', '""')}"`;
    const csv = [fields.join(","), ...filtered.map((row) => fields.map((field) => escape(row[field])).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `buddylife-${role}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div><p className="eyebrow">BUDDYLIFE CMS</p><h1>{role === "parent" ? "Early registered pet parents" : "Early registered businesses"}</h1></div>
        <a className="button" href="/admin">CMS overview</a>
      </div>
      <nav className="adminNav" aria-label="Registration views">
        <a className={role === "parent" ? "active" : ""} href="/admin/registrations/parents">Pet parents</a>
        <a className={role === "business" ? "active" : ""} href="/admin/registrations/businesses">Businesses</a>
      </nav>
      <section className="adminStats compact">
        <article><b>{registrations.length}</b><span>Total registrations</span></article>
        <article><b>{provinces}</b><span>Provinces represented</span></article>
        <article><b>{filtered.length}</b><span>Visible results</span></article>
      </section>
      <section className="adminPanel">
        <div className="adminPanelHead">
          <label className="adminSearch"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, contact or location" /></label>
          <button className="button secondary" type="button" onClick={downloadCsv} disabled={!filtered.length}><Download aria-hidden="true" /> Export CSV</button>
        </div>
        <div className="adminTable registrationsTable">
          <div className="tableRow tableHead"><span>{role === "parent" ? "Name / pet" : "Business / category"}</span><span>Contact</span><span>Location</span><span>Date</span></div>
          {loading && <p className="adminEmpty">Loading registrations…</p>}
          {!loading && !filtered.length && <p className="adminEmpty">No matching registrations yet.</p>}
          {filtered.map((item) => (
            <div className="tableRow" key={item.id}>
              <span><b>{role === "parent" ? item.name || "—" : item.businessName || "—"}</b><small>{role === "parent" ? item.petType || "Pet type not provided" : item.category || "Category not provided"}</small></span>
              <span>{item.email || item.phone || "—"}<small>{item.email && item.phone ? item.phone : ""}</small></span>
              <span>{[item.city, item.province].filter(Boolean).join(", ") || "—"}</span>
              <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "—"}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
