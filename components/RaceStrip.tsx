"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LastRace, NextRace } from "@/lib/f1";
import { useI18n } from "./I18nProvider";

// three.js is only downloaded when a track exists and the browser reaches this component.
const Track3D = dynamic(() => import("./Track3D"), { ssr: false });

/** Race week board: next race with countdown + 3D circuit, and the last result. Always visible. */
export default function RaceStrip({ next, last }: { next: NextRace | null; last: LastRace | null }) {
  const { t, locale } = useI18n();
  const sessionName = (label: string) => t(`session.${label.toLowerCase()}`);
  const [now, setNow] = useState<number | null>(null); // null until mounted → no hydration mismatch
  const [showAll, setShowAll] = useState(false); // phone only: the top 10 sit in a dropdown

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!next && !last) return null;

  const when = (iso: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
      new Date(iso),
    );
  const winner = last?.results[0];

  return (
    <section className="rb" aria-label={t("rb.aria")}>
      <div className="rb__grid">
        {next && (
          <div className="rb__left">
            {next.track && <Track3D points={next.track} label={next.circuit || next.name} />}
            <ul className="rb__sessions">
              {next.sessions.map((s) => (
                <li key={s.label} className={s.label === "Race" ? "is-race" : undefined}>
                  <span>{sessionName(s.label)}</span>
                  <span>{now === null ? "" : when(s.startsAt)}</span>
                </li>
              ))}
            </ul>
            <p className="rb__note">{t("rb.note")}</p>
          </div>
        )}

        {last && (
          <div className="rb__right">
            <div className="rb__rhead">
              <h3>{last.session === "Race" ? t("rb.lastResult") : t("rb.latestSession")}</h3>
              <p>{last.session === "Race" ? last.name : `${sessionName(last.session)} · ${last.name}`}</p>
            </div>
            {winner && (
              <p className="rb__winner">
                <span>{last.session === "Race" || last.session === "Sprint" ? t("rb.winner") : t("rb.fastest")}</span> <strong>{winner.driver}</strong> <em>{winner.team}</em>
              </p>
            )}
            <button
              type="button"
              className="rb__drop"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              aria-controls="rb-table"
            >
              <span>{t("rb.top10")}</span>
              <span aria-hidden="true">{showAll ? "−" : "+"}</span>
            </button>
            <ol className={`rb__table${showAll ? "" : " is-collapsed"}`} id="rb-table">
              <li className="rb__row rb__row--head" aria-hidden="true">
                <span>{t("rb.pos")}</span><span>{t("rb.driver")}</span><span className="rb__team">{t("rb.team")}</span><span>{t("rb.time")}</span>
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
