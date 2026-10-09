"use client";

import { useEffect, useState } from "react";
import type { LastRace, NextRace } from "@/lib/f1";

function countdown(ms: number): string {
  if (ms <= 0) return "Lights out";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
}

/** Next race with a live countdown. Click it to open the result of the last race. */
export default function RaceStrip({ next, last }: { next: NextRace | null; last: LastRace | null }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null); // null until mounted → no hydration mismatch

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!next && !last) return null;

  const when = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
      new Date(iso),
    );
  const winner = last?.results[0];

  return (
    <section className="race" aria-label="Formula 1 race info">
      <button
        type="button"
        className="race__bar"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="race-panel"
      >
        <span className="race__label">{next ? "Next race" : "Last race"}</span>
        <span className="race__name">{next ? next.name : last?.name}</span>
        {next && (
          <span className="race__when">
            {now === null ? "" : `${when(next.startsAt)} · ${countdown(new Date(next.startsAt).getTime() - now)}`}
          </span>
        )}
        <span className="race__toggle" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="race__panel" id="race-panel">
          {next && (
            <div className="race__col">
              <h3>{next.name}</h3>
              <p className="race__meta">{[next.circuit, next.country].filter(Boolean).join(" · ")}</p>
              <ul className="race__sessions">
                {next.sessions.map((s) => (
                  <li key={s.label}>
                    <span>{s.label}</span>
                    <span>{now === null ? "" : when(s.startsAt)}</span>
                  </li>
                ))}
              </ul>
              <p className="race__tz">Times shown in your local time.</p>
            </div>
          )}
          {last && (
            <div className="race__col">
              <h3>Last result · {last.name}</h3>
              {winner && <p className="race__meta">Winner: <strong>{winner.driver}</strong> ({winner.team})</p>}
              <ol className="race__results">
                {last.results.map((r) => (
                  <li key={r.driverId + r.pos}>
                    <span className="race__pos">{r.pos}</span>
                    <span className="race__driver">{r.driver}</span>
                    <span className="race__team">{r.team}</span>
                    <span className="race__time">{r.time}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
