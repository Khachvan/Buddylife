"use client";

import { FormEvent, useEffect, useState } from "react";

type Role = "owner" | "editor";
type User = { id: string; username: string; role: Role; active: boolean; createdAt: string; lastLoginAt: string | null };

function formatDate(value: string | null) {
  if (!value) return "never";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
  return payload;
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      fetch("/api/admin-users", { cache: "no-store" })
        .then(readJson)
        .then((payload) => setUsers(payload.users || []))
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Accounts could not be loaded"))
        .finally(() => setLoading(false));
    });
  }, []);

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const payload = await fetch("/api/admin-users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(readJson);
      const user: User = payload.user;
      setUsers((current) => (current.some((item) => item.id === user.id) ? current.map((item) => (item.id === user.id ? user : item)) : [...current, user]));
      return user;
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The account could not be saved");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const user = await send({ action: "create", username: data.get("username"), password: data.get("password"), role: data.get("role") });
    if (user) {
      form.reset();
      setMessage(`Account "${user.username}" created. Share the login and password with that person privately.`);
    }
  }

  async function resetPassword(user: User, form: HTMLFormElement) {
    const password = new FormData(form).get("password");
    const updated = await send({ action: "update", id: user.id, password });
    if (updated) {
      form.reset();
      setMessage(`Password changed for "${user.username}".`);
    }
  }

  return (
    <main className="adminPage">
      <div className="adminTop">
        <div>
          <p className="eyebrow">BUDDYLIFE CMS</p>
          <h1>Accounts</h1>
          <p>Give each person, or an assistant such as ChatGPT, their own login. Editors can write, upload, schedule, hide and order articles, edit website content and read messages. Only the owner manages accounts and the database.</p>
        </div>
        <div className="adminActions">
          <a className="button secondary" href="/admin">CMS overview</a>
        </div>
      </div>

      {message && <div className="qrNotice" role="status">{message}</div>}
      {error && <div className="adminServiceError" role="alert"><b>Accounts need attention</b><p>{error}</p></div>}

      <div className="cmsLayout">
        <section className="adminPanel">
          <div className="adminPanelHead"><h2>People with access</h2></div>
          {loading && <p className="adminEmpty">Loading accounts…</p>}
          <div className="messageList">
            <article className="messageCard">
              <header><div><b>owner</b><small>Owner · the main login from the site settings · cannot be removed here</small></div></header>
            </article>
            {users.map((user) => (
              <article key={user.id} className={`messageCard ${user.active ? "" : "handled"}`}>
                <header>
                  <div>
                    <b>{user.username}</b>
                    <small>{user.role === "owner" ? "Owner" : "Editor"} · {user.active ? "active" : "deactivated"} · created {formatDate(user.createdAt)} · last sign-in {formatDate(user.lastLoginAt)}</small>
                  </div>
                  <div className="messageActions">
                    <button type="button" className="button secondary" disabled={busy} onClick={() => send({ action: "update", id: user.id, role: user.role === "owner" ? "editor" : "owner" })}>{user.role === "owner" ? "Make editor" : "Make owner"}</button>
                    <button type="button" className="cmsDanger" disabled={busy} onClick={() => send({ action: "update", id: user.id, active: !user.active })}>{user.active ? "Deactivate" : "Reactivate"}</button>
                  </div>
                </header>
                <form className="cmsForm userPassword" onSubmit={(event) => { event.preventDefault(); void resetPassword(user, event.currentTarget); }}>
                  <label>
                    New password
                    <input name="password" type="password" minLength={12} maxLength={200} required autoComplete="new-password" />
                  </label>
                  <button className="button secondary" type="submit" disabled={busy}>Change password</button>
                </form>
              </article>
            ))}
            {!loading && !users.length && <p className="adminEmpty">No additional accounts yet. Create one on the right.</p>}
          </div>
        </section>

        <section className="adminPanel">
          <div className="adminPanelHead"><h2>New account</h2></div>
          <form className="cmsForm" onSubmit={create}>
            <label>
              Login
              <input name="username" required minLength={3} maxLength={40} pattern="[a-z0-9][a-z0-9._\-]{2,39}" autoComplete="off" placeholder="for example ani or chatgpt" />
              <span className="cmsHelp">Lowercase letters, digits, dots, dashes or underscores.</span>
            </label>
            <label>
              Password
              <input name="password" type="password" required minLength={12} maxLength={200} autoComplete="new-password" />
              <span className="cmsHelp">At least 12 characters. It is stored only as a salted hash and cannot be read back.</span>
            </label>
            <label>
              Role
              <select name="role" defaultValue="editor">
                <option value="editor">Editor — articles, uploads, scheduling, website content, messages</option>
                <option value="owner">Owner — everything, including accounts and the database</option>
              </select>
            </label>
            <div className="cmsActions">
              <button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : "Create account"}</button>
            </div>
          </form>
          <p className="cmsHelp" style={{ marginTop: 14 }}>A deactivated account cannot sign in again; a session that is already open ends within 8 hours.</p>
        </section>
      </div>
    </main>
  );
}
