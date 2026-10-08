"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function Newsletter() {
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setState("done");
        setMsg("Thanks! You're on the list.");
        form.reset();
      } else {
        setState("error");
        setMsg(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="newsletter" onSubmit={onSubmit}>
      <label htmlFor="email">Get notified about the next drop</label>
      <div className="newsletter__row">
        <input id="email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
        <button className="btn btn--light" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      {/* Honeypot for bots – hidden from people and assistive tech. */}
      <input className="newsletter__hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="newsletter__consent">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to receive emails from Scudaro about new drops. I can unsubscribe at any time.{" "}
          <Link href="/policies/privacy-policy">Privacy policy</Link>
        </span>
      </label>
      <p className="newsletter__msg" role="status">{msg}</p>
    </form>
  );
}
