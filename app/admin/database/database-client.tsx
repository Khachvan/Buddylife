"use client";

import { DatabaseZap, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Status = {
  environment: string;
  host: string;
  engine: string;
  migrations: { files: Array<{ filename: string; appliedAt: string | null }>; pending: string[] };
  tables: Array<{ table: string; present: boolean; rows: number | null }>;
  managedIn: { vercelStorage: string; vercelEnv: string; neonConsole: string };
};

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
  return payload;
}

export default function DatabaseClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await fetch("/api/admin-database", { cache: "no-store" }).then(readJson));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Database status could not be loaded");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function migrate() {
    if (!status) return;
    const list = status.migrations.pending.join(", ");
    if (!window.confirm(`Apply ${status.migrations.pending.length} pending migration(s) to the ${status.environment} database (${status.host})?\n\n${list}`)) return;
    setWorking(true);
    setMessage("");
    setError("");
    try {
      const payload = await fetch("/api/admin-database", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "migrate" }) }).then(readJson);
      setMessage(`Applied: ${(payload.applied || []).join(", ") || "nothing to apply"}.`);
      await load();
    } catch (migrateError) {
      setError(migrateError instanceof Error ? migrateError.message : "Migration failed");
    } finally {
      setWorking(false);
    }
  }

  const pending = status?.migrations.pending.length ?? 0;

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE DATA</p>
          <h1>Database</h1>
          <p>Neon Postgres managed through the Vercel storage integration. Each Vercel environment points at its own database.</p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">CMS overview</a>
          <button className="button" type="button" onClick={load} disabled={loading}><RefreshCw size={16} aria-hidden="true" /> Refresh</button>
        </div>
      </div>

      {message && <div className="qrNotice" role="status">{message}</div>}
      {error && <div className="adminServiceError" role="alert"><b>Database needs attention</b><p>{error}</p></div>}

      {status && (
        <>
          <section className="adminStats compact">
            <article><b>{status.environment}</b><span>Vercel environment</span></article>
            <article><b>{status.engine || "Postgres"}</b><span>Engine</span></article>
            <article><b>{status.migrations.files.length - pending}/{status.migrations.files.length}</b><span>Migrations applied</span></article>
            <article><b>{status.tables.filter((table) => table.present).length}</b><span>Tables present</span></article>
          </section>
          <p className="adminMetricNote">Connected host: {status.host}. Connection strings stay in Vercel and are never shown here.</p>

          <section className="adminPanel">
            <div className="adminPanelHead">
              <h2>Schema migrations</h2>
              {pending > 0 ? (
                <button className="button" type="button" onClick={migrate} disabled={working}><DatabaseZap size={16} aria-hidden="true" /> {working ? "Applying…" : `Apply ${pending} pending`}</button>
              ) : <span className="cmsStatus live">Up to date</span>}
            </div>
            <p className="cmsHelp">Migrations are the SQL files in the repository’s drizzle folder. They only add tables and columns, never delete data. Apply them here after deploying code that needs new tables.</p>
            <div className="adminTable">
              <div className="tableRow tableHead"><span>File</span><span>Status</span><span>Applied</span><span></span></div>
              {status.migrations.files.map((file) => (
                <div className="tableRow" key={file.filename}>
                  <span>{file.filename}</span>
                  <span><b className={file.appliedAt ? "statusValid" : "statusTest"}>{file.appliedAt ? "Applied" : "Pending"}</b></span>
                  <span>{file.appliedAt ? new Date(file.appliedAt).toLocaleString("en-GB") : "—"}</span>
                  <span></span>
                </div>
              ))}
            </div>
          </section>

          <section className="adminPanel">
            <h2>Tables</h2>
            <div className="dbGrid">
              {status.tables.map((table) => (
                <article className="mediaCard" key={table.table}>
                  <b>{table.table}</b>
                  <small>{table.present ? `${table.rows} row${table.rows === 1 ? "" : "s"}` : "not installed"}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="adminPanel seoDestinations">
            <div><p className="eyebrow">MANAGE IN VERCEL</p><h2>Storage and secrets</h2><p>Databases, connection strings and backups are managed in the Vercel dashboard and the Neon console.</p></div>
            <div className="seoToolLinks">
              <a href={status.managedIn.vercelStorage} target="_blank" rel="noreferrer"><b>Vercel storage</b><span>Neon databases connected to this project <ExternalLink size={12} aria-hidden="true" /></span></a>
              <a href={status.managedIn.vercelEnv} target="_blank" rel="noreferrer"><b>Environment variables</b><span>DATABASE_URL per environment <ExternalLink size={12} aria-hidden="true" /></span></a>
              <a href={status.managedIn.neonConsole} target="_blank" rel="noreferrer"><b>Neon console</b><span>Branches, backups and SQL editor <ExternalLink size={12} aria-hidden="true" /></span></a>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
