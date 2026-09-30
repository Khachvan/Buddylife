"use client";

import { useEffect, useMemo, useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business: string | null;
  message: string;
  language: string;
  page: string | null;
  source: string | null;
  notified: boolean;
  handledAt: string | null;
  isTest: boolean;
  createdAt: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function MessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<"open" | "handled" | "all">("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      fetch("/api/admin-messages", { cache: "no-store" })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
          setMessages(payload.messages || []);
        })
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Messages could not be loaded"))
        .finally(() => setLoading(false));
    });
  }, []);

  const visible = useMemo(
    () => messages.filter((item) => filter === "all" || (filter === "handled" ? Boolean(item.handledAt) : !item.handledAt)),
    [messages, filter],
  );
  const open = messages.filter((item) => !item.handledAt && !item.isTest).length;

  async function update(id: string, patch: { handled?: boolean; isTest?: boolean }) {
    const response = await fetch("/api/admin-messages", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.message) setMessages((items) => items.map((item) => (item.id === id ? payload.message : item)));
  }

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE CMS</p>
          <h1>Messages</h1>
          <p>Everything sent through the &quot;Write to us&quot; form. Reply from your own mailbox; mark a message handled when it is answered.</p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">CMS overview</a>
          <select aria-label="Filter messages" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
            <option value="open">Open</option>
            <option value="handled">Handled</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <section className="adminStats compact">
        <article><b>{open}</b><span>Open messages</span></article>
        <article><b>{messages.filter((item) => item.business && !item.isTest).length}</b><span>From businesses</span></article>
        <article><b>{messages.filter((item) => !item.isTest).length}</b><span>Total</span></article>
      </section>

      {error && <div className="adminServiceError" role="alert"><b>Messages need attention</b><p>{error}</p></div>}

      <section className="adminPanel">
        {loading && <p className="adminEmpty">Loading messages…</p>}
        {!loading && !visible.length && <p className="adminEmpty">No messages here.</p>}
        <div className="messageList">
          {visible.map((item) => (
            <article key={item.id} className={`messageCard ${item.handledAt ? "handled" : ""} ${item.isTest ? "test" : ""}`}>
              <header>
                <div>
                  <b>{item.name}</b>{item.business ? <span> · {item.business}</span> : null}
                  <small>
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                    {item.phone ? <> · <a href={`tel:${item.phone}`}>{item.phone}</a></> : null}
                    {" · "}{item.language.toUpperCase()} · {formatDate(item.createdAt)}
                    {item.page ? <> · from {item.page}</> : null}
                    {!item.notified ? <> · <em>email notification not sent</em></> : null}
                  </small>
                </div>
                <div className="messageActions">
                  <button type="button" className="button secondary" onClick={() => update(item.id, { handled: !item.handledAt })}>{item.handledAt ? "Reopen" : "Mark handled"}</button>
                  <button type="button" className="cmsDanger" onClick={() => update(item.id, { isTest: !item.isTest })}>{item.isTest ? "Not a test" : "Mark as test"}</button>
                </div>
              </header>
              <p>{item.message}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
