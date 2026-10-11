"use client";

import { useState } from "react";
import type { TrackText } from "@/lib/content/info";
import type { TrackResult } from "@/lib/track";

type View =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "result"; result: TrackResult };

export default function TrackOrder({ text }: { text: TrackText }) {
  const [view, setView] = useState<View>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setView({ kind: "loading" });
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ order: data.get("order"), email: data.get("email") }),
      });
      if (res.ok) return setView({ kind: "result", result: (await res.json()) as TrackResult });
      const code = res.status === 404 ? text.notFound : res.status === 400 ? text.invalid : res.status === 429 ? text.rate : text.unavailable;
      setView({ kind: "error", message: code });
    } catch {
      setView({ kind: "error", message: text.unavailable });
    }
  }

  const busy = view.kind === "loading";

  return (
    <>
      <form className="track__form" onSubmit={onSubmit} noValidate>
        <div className="track__field">
          <label htmlFor="track-order">{text.orderLabel}</label>
          <input id="track-order" name="order" type="text" inputMode="text" autoComplete="off" placeholder={text.orderHint} required />
        </div>
        <div className="track__field">
          <label htmlFor="track-email">{text.emailLabel}</label>
          <input id="track-email" name="email" type="email" autoComplete="email" placeholder="you@email.com" required />
        </div>
        <button type="submit" className="btn btn--light" disabled={busy}>
          {busy ? text.loading : text.button}
        </button>
      </form>

      <div className="track__out" aria-live="polite">
        {view.kind === "error" && <p className="track__error" role="alert">{view.message}</p>}

        {view.kind === "result" && (
          <section className="track__card" aria-label={text.orderTitle}>
            <p className="track__order">{text.orderTitle} {view.result.order}</p>
            <p className="track__status">
              <span className="track__label">{text.statusLabel}</span>
              <strong>{text.status[view.result.status]}</strong>
            </p>
            <p className="track__text">{text.statusText[view.result.status]}</p>
            {view.result.shipments.map((s) => (
              <div className="track__ship" key={s.number}>
                {s.carrier && <p><span className="track__label">{text.carrierLabel}</span> {s.carrier}</p>}
                <p><span className="track__label">{text.numberLabel}</span> {s.number}</p>
                {s.url && (
                  <a className="btn btn--light" href={s.url} target="_blank" rel="noopener noreferrer">{text.trackLabel}</a>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
