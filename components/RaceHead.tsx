"use client";

import { useEffect, useState } from "react";
import type { LastRace, NextRace } from "@/lib/f1";
import { useI18n } from "./I18nProvider";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60) };
}
const pad = (n: number) => String(n).padStart(2, "0");

/** Race title, circuit and countdown. Shown on the "timing screen" the cockpit zoom ends on. */
export default function RaceHead({ next, last }: { next: NextRace | null; last: LastRace | null }) {
  const { t } = useI18n();
  const [now, setNow] = useState<number | null>(null); // null until mounted → no hydration mismatch
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!next && !last) return null;
  const left = next && now !== null ? parts(new Date(next.startsAt).getTime() - now) : null;

  return (
    <header className="rb__head">
      <div>
        <p className="rb__eyebrow">{next ? t("race.eyebrowNext", { round: next.round }) : t("race.eyebrowLast")}</p>
        <h2 id="rb-title" className="rb__title">{next ? next.name : last?.name}</h2>
        {next && <p className="rb__sub">{[next.circuit, next.country].filter(Boolean).join(" · ")}</p>}
      </div>
      {next && (
        <div className="rb__count" role="timer" aria-label={t("race.timer")}>
          {(["d", "h", "m"] as const).map((k) => (
            <div key={k} className="rb__tile">
              <strong>{left ? pad(left[k]) : "--"}</strong>
              <span>{k === "d" ? t("race.days") : k === "h" ? t("race.hours") : t("race.min")}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
