"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LastRace, NextRace } from "@/lib/f1";

// three.js is only downloaded when a track exists and the browser reaches this component.
const Track3D = dynamic(() => import("./Track3D"), { ssr: false });

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60) };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Race week board: next race with countdown + 3D circuit, and the last result. Always visible. */
export default function RaceStrip({ next, last }: { next: NextRace | null; last: LastRace | null }) {
  const [now, setNow] = useState<number | null>(null); // null until mounted → no hydration mismatch
  const [showAll, setShowAll] = useState(false); // phone only: the top 10 sit in a dropdown

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
  const left = next && now !== null ? parts(new Date(next.startsAt).getTime() - now) : null;
  const winner = last?.results[0];

  return (
    <section className="rb" aria-labelledby="rb-title">
      <header className="rb__head">
        <div>
          <p className="rb__eyebrow">{next ? `Race week · Round ${next.round}` : "Latest race"}</p>
          <h2 id="rb-title" className="rb__title">{next ? next.name : last?.name}</h2>
          {next && <p className="rb__sub">{[next.circuit, next.country].filter(Boolean).join(" · ")}</p>}
        </div>
        {next && (
          <div className="rb__count" role="timer" aria-label="Time until the race">
            {(["d", "h", "m"] as const).map((k) => (
              <div key={k} className="rb__tile">
                <strong>{left ? pad(left[k]) : "--"}</strong>
                <span>{k === "d" ? "Days" : k === "h" ? "Hours" : "Min"}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="rb__grid">
        {next && (
          <div className="rb__left">
            {next.track && <Track3D points={next.track} label={next.circuit || next.name} />}
            <ul className="rb__sessions">
              {next.sessions.map((s) => (
                <li key={s.label} className={s.label === "Race" ? "is-race" : undefined}>
                  <span>{s.label}</span>
                  <span>{now === null ? "" : when(s.startsAt)}</span>
                </li>
              ))}
            </ul>
            <p className="rb__note">Times shown in your local time.</p>
          </div>
        )}

        {last && (
          <div className="rb__right">
            <div className="rb__rhead">
              <h3>Last result</h3>
              <p>{last.name}</p>
            </div>
            {winner && (
              <p className="rb__winner">
                <span>Winner</span> <strong>{winner.driver}</strong> <em>{winner.team}</em>
              </p>
            )}
            <button
              type="button"
              className="rb__drop"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              aria-controls="rb-table"
            >
              <span>Top 10</span>
              <span aria-hidden="true">{showAll ? "−" : "+"}</span>
            </button>
            <ol className={`rb__table${showAll ? "" : " is-collapsed"}`} id="rb-table">
              <li className="rb__row rb__row--head" aria-hidden="true">
                <span>Pos</span><span>Driver</span><span className="rb__team">Team</span><span>Time</span>
              </li>
              {last.results.map((r, i) => (
                <li key={r.driverId + r.pos} className={`rb__row${i === 0 ? " is-first" : ""}`}>
                  <span className="rb__pos">{r.pos}</span>
                  <span className="rb__driver">{r.driver}</span>
                  <span className="rb__team">{r.team}</span>
                  <span className="rb__time">{r.time}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
