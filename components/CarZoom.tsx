"use client";

import { useEffect, useRef } from "react";
import type { LastRace, NextRace } from "@/lib/f1";
import RaceHead from "./RaceHead";

/** Where the driver's seat is inside the picture (percent of width / height). */
const COCKPIT = { x: 45.4, y: 49.5 };
const MAX_ZOOM = 11;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ZOOM_END = 0.8; // the zoom is done at 80 % of the section; the rest is the timing screen settling in

/**
 * Scroll-driven zoom into the cockpit. Only `transform` and `opacity` change (compositor-only, no layout
 * or paint per frame), work is done once per animation frame, and nothing runs while the section is off screen.
 */
export default function CarZoom({ next, last }: { next: NextRace | null; last: LastRace | null }) {
  const wrapRef = useRef<HTMLElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const timingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const car = carRef.current;
    const fade = fadeRef.current;
    const hint = hintRef.current;
    const timing = timingRef.current;
    if (!wrap || !car || !fade || !hint) return;

    let raf = 0;
    let visible = false;
    let lastP = -1;

    const render = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
      if (Math.abs(p - lastP) < 0.0004) return;
      lastP = p;

      // Exponential zoom feels even: each bit of scrolling multiplies the size by the same factor.
      const z = clamp(p / ZOOM_END, 0, 1);
      const scale = Math.exp(z * Math.log(MAX_ZOOM));
      car.style.transform = `translate3d(-${COCKPIT.x}%, -${COCKPIT.y}%, 0) rotate(var(--rot, 0deg)) scale(${scale.toFixed(4)})`;
      // Into the dark cockpit: the picture goes black and the timing screen "zooms up" out of it.
      fade.style.opacity = String(clamp((p - 0.5) / 0.3, 0, 1));
      hint.style.opacity = String(clamp(1 - p * 8, 0, 1));
      if (timing) {
        const t = clamp((p - 0.6) / 0.28, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        timing.style.opacity = String(t);
        timing.style.transform = `scale(${(0.7 + 0.3 * eased).toFixed(4)})`;
        timing.style.visibility = t > 0 ? "visible" : "hidden";
      }
    };

    const schedule = () => {
      if (!raf && visible) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(wrap);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={wrapRef} className="carzoom" aria-label="Into the cockpit" style={{ ["--cx" as string]: `${COCKPIT.x}%`, ["--cy" as string]: `${COCKPIT.y}%` }}>
      <div className="carzoom__sticky">
        <div className="carzoom__car" ref={carRef}>
          {/* Plain <img>: it is scaled by transform, so next/image's resizing would only hurt sharpness. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/f1-car.webp" alt="Formula 1 car seen from above" width={1855} height={848} decoding="async" loading="lazy" draggable={false} />
        </div>
        <div className="carzoom__fade" ref={fadeRef} aria-hidden="true" />
        <div className="carzoom__timing" ref={timingRef} style={{ visibility: "hidden" }}>
          <RaceHead next={next} last={last} />
          {(next || last) && <p className="carzoom__more">Timing &amp; results &darr;</p>}
        </div>
        <p className="carzoom__hint" ref={hintRef}>Scroll to enter the cockpit &darr;</p>
      </div>
    </section>
  );
}
