"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import type { Quote } from "@/lib/builder";
import { PRINTS, colorHex, luminance } from "@/lib/builder";
import AddToCart from "./AddToCart";
import QuoteAudio from "./QuoteAudio";
import GarmentBack, { PRINT_AREA } from "./GarmentBack";
import { quoteAudioFor } from "@/lib/quoteAudio";

type Garment = "tee" | "hoodie";
const GARMENTS: { id: Garment; label: string }[] = [
  { id: "tee", label: "T-shirt" },
  { id: "hoodie", label: "Hoodie" },
];

/** Where a print proof sits, `d` places from the centre. Only transform + opacity + a little blur. */
function slot(d: number) {
  const ad = Math.abs(d);
  const s = Math.sign(d);
  const x = s * (Math.min(ad, 1) * 118 + Math.max(ad - 1, 0) * 62); // % of the proof's own width
  const rot = -Math.max(-1.5, Math.min(1.5, d)) * 30;
  return {
    transform: `translate(-50%, -50%) translateX(${x}%) translateZ(${-Math.min(ad, 2) * 140}px) rotateY(${rot}deg) scale(${1 - Math.min(ad, 1) * 0.1})`,
    opacity: ad < 0.4 ? 0 : ad > 2.5 ? 0 : Math.max(0.2, 0.9 - Math.max(ad - 1, 0) * 0.5),
    filter: ad < 0.4 ? "none" : `blur(${Math.min(ad, 2) * 0.8}px)`,
    zIndex: 40 - Math.round(ad * 10),
  };
}

export default function Builder({ quotes }: { quotes: Quote[] }) {
  const [garment, setGarment] = useState<Garment>("hoodie");
  const [quoteKey, setQuoteKey] = useState(quotes[0]?.key ?? "");
  const [color, setColor] = useState<string | null>(null);
  const drag = useRef<{ x: number } | null>(null);

  // Only quotes that exist on the chosen garment.
  const list = useMemo(() => quotes.filter((q) => q[garment]), [quotes, garment]);
  const idx = Math.max(0, list.findIndex((q) => q.key === quoteKey));
  const current = list[idx];
  const product = current?.[garment];

  const go = useCallback(
    (i: number) => {
      const q = list[Math.max(0, Math.min(list.length - 1, i))];
      if (q) setQuoteKey(q.key);
    },
    [list],
  );

  if (!current || !product) {
    return (
      <section className="build">
        <h1 className="build__title">Build yours</h1>
        <p style={{ color: "var(--muted)" }}>Nothing to build yet – check back soon.</p>
        <Link href="/products" className="btn btn--light">Shop all products</Link>
      </section>
    );
  }

  const fabric = colorHex(color);
  const dark = luminance(fabric) < 0.2;
  const art = PRINTS[current.key];
  const ink = dark && art.dark ? art.dark : art.light;
  const area = PRINT_AREA[garment];
  const audio = quoteAudioFor(product.handle);

  const down = (e: PointerEvent) => { drag.current = { x: e.clientX }; };
  const up = (e: PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="build" aria-labelledby="build-title">
      <header className="build__head">
        <Link href="/products" className="shop__crumb"><span aria-hidden="true">&larr;</span> All products</Link>
        <p className="shop__eyebrow">Scudaro · Build yours</p>
        <h1 id="build-title" className="build__title">Build yours</h1>
      </header>

      <div className="build__grid">
        <div className="build__left">
          <p className="build__step"><span>1</span> Choose your piece</p>
          <div className="build__garments" role="group" aria-label="Piece">
            {GARMENTS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`chip chip--lg${garment === g.id ? " is-active" : ""}`}
                aria-pressed={garment === g.id}
                onClick={() => setGarment(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <p className="build__step"><span>2</span> Spin to your print</p>
          <div
            className="build__stage"
            role="group"
            aria-roledescription="carousel"
            aria-label="Prints"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
              if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
            }}
            onPointerDown={down}
            onPointerUp={up}
            onPointerCancel={() => (drag.current = null)}
          >
            {list.map((q, i) => {
              if (i === idx) return null;
              const st = slot(i - idx);
              const proof = PRINTS[q.key];
              return (
                <button
                  key={q.key}
                  type="button"
                  className="build__proof"
                  style={{ transform: st.transform, opacity: st.opacity, filter: st.filter, zIndex: st.zIndex, pointerEvents: st.opacity < 0.05 ? "none" : "auto" } as CSSProperties}
                  aria-label={`${q.name}, ${i + 1} of ${list.length}`}
                  tabIndex={-1}
                  onClick={() => go(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proof.light} alt="" draggable={false} decoding="async" />
                </button>
              );
            })}

            <div className="build__center">
              <GarmentBack kind={garment} color={fabric}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <image key={`${current.key}-${ink}`} className="print" href={ink} x={area.x} y={area.y} width={area.w} height={area.h} preserveAspectRatio="xMidYMid meet" />
              </GarmentBack>
            </div>
          </div>

          <div className="build__nav">
            <button type="button" className="build__arrow" aria-label="Previous print" onClick={() => go(idx - 1)} disabled={idx === 0}>&larr;</button>
            <p className="build__quote" aria-live="polite">
              <strong>{current.name}</strong>
              <span>{idx + 1} / {list.length}</span>
            </p>
            <button type="button" className="build__arrow" aria-label="Next print" onClick={() => go(idx + 1)} disabled={idx === list.length - 1}>&rarr;</button>
          </div>
        </div>

        <div className="build__right">
          <p className="build__step"><span>3</span> Colour &amp; size</p>
          <h2 className="build__name">{current.name} · {garment === "tee" ? "T-shirt" : "Hoodie"}</h2>
          {audio && <QuoteAudio key={audio} src={audio} />}
          <AddToCart key={product.id} product={product} preferColor={color ?? undefined} onColor={setColor} />
        </div>
      </div>
    </section>
  );
}
