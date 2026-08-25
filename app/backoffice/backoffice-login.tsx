"use client";
import Image from "next/image";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

export default function BackofficeLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/backoffice-login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
    if (response.ok) window.location.href = "/admin";
    else { setError("Incorrect login or password."); setLoading(false); }
  }
  return <main className="backofficeLogin"><section className="backofficeLoginCard">
    <Image src="/buddylife-logo-clean.webp" alt="BuddyLife" width={210} height={70} priority />
    <p className="eyebrow">SECURE BACKOFFICE</p><h1>Welcome back</h1><p>Sign in to manage BuddyLife content and early registrations.</p>
    <form onSubmit={submit}>
      <label><span>Login</span><div><UserRound aria-hidden="true" /><input name="username" autoComplete="username" required /></div></label>
      <label><span>Password</span><div><LockKeyhole aria-hidden="true" /><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
      {error && <p className="backofficeError" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form><small>BuddyLife Armenia · Authorized access only</small>
  </section></main>;
}
