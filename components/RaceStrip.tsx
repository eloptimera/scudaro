"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LastRace, NextRace } from "@/lib/f1";

// three.js is only downloaded when a track exists and the browser reaches this component.
const Track3D = dynamic(() => import("./Track3D"), { ssr: false });

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
  const winner = last?.results[0];

  return (
    <section className="rb" aria-label="Race details">
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
              <h3>{last.session === "Race" ? "Last result" : "Latest session"}</h3>
              <p>{last.session === "Race" ? last.name : `${last.session} · ${last.name}`}</p>
            </div>
            {winner && (
              <p className="rb__winner">
                <span>{last.session === "Race" || last.session === "Sprint" ? "Winner" : "Fastest"}</span> <strong>{winner.driver}</strong> <em>{winner.team}</em>
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
