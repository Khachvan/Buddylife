"use client";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function AccessPage() {
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin: form.get("pin") }),
    });
    if (response.ok) window.location.href = "/";
    else setError("Incorrect PIN. Please try again.");
  }
  return (
    <main className="accessPage">
      <section className="accessCard">
        <Image
          src="/buddylife-logo-clean.webp"
          width={150}
          height={150}
          alt="BuddyLife"
          priority
        />
        <p className="eyebrow">PRIVATE PREVIEW</p>
        <h1>BuddyLife Armenia</h1>
        <p>This website is currently available to invited guests.</p>
        <form onSubmit={submit}>
          <label>
            Access PIN
            <input
              name="pin"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="accessError" role="alert">
              {error}
            </p>
          )}
          <button className="button">Open website</button>
        </form>
      </section>
    </main>
  );
}
