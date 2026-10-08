"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Collection } from "@/lib/types";
import CollectionVisual from "./CollectionVisual";
import { formatMoney } from "@/lib/format";

/* ---------- Scroll-driven 3D carousel ----------
   The page scrolls normally. The stage sticks while you scroll past it, and the scroll progress
   (0 → n-1) decides which item sits in the middle. No scroll hijacking: after the last item
   the page simply continues down. */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Pure: where one item sits for a given distance `d` (in items) from the centre. */
function itemStyle(d: number, spacing: number) {
  const ad = Math.abs(d);
  const s = Math.sign(d);
  const x = s * (Math.min(ad, 1) * spacing + Math.max(ad - 1, 0) * spacing * 0.7);
  const z = -Math.min(ad, 2) * 260;
  const rot = -clamp(d, -1.5, 1.5) * 32;
  const scale = 1 - Math.min(ad, 1) * 0.08;
  const opacity = clamp(1 - Math.max(ad - 0.3, 0) * 0.55, 0, 1);
  const blur = Math.min(ad, 1) * 2.5;
  return {
    transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`,
    opacity,
    filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none",
    zIndex: Math.round(100 - ad * 10),
    pointerEvents: opacity < 0.05 ? ("none" as const) : ("auto" as const),
  };
}

export default function Stage({ collections }: { collections: Collection[] }) {
  const router = useRouter();
  const n = collections.length;
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const goToRef = useRef<(i: number) => void>(() => {});
  const targetRef = useRef(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!wrap || !stage || !header || n < 1) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos = 0;
    let target = 0;
    let lastShown = -1;
    let raf: number | null = null;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;

    const metrics = () => {
      const top = header.offsetHeight;
      document.documentElement.style.setProperty("--header-h", `${top}px`);
      const total = wrap.offsetHeight - stage.offsetHeight;
      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      return { top, total, wrapTop };
    };

    const readScroll = () => {
      const { top, total, wrapTop } = metrics();
      const scrolled = clamp(window.scrollY - (wrapTop - top), 0, total);
      target = total > 0 && n > 1 ? (scrolled / total) * (n - 1) : 0;
      targetRef.current = target;
      return { scrolled, total };
    };

    const layout = () => {
      const w = stage.clientWidth;
      // Neighbour spacing follows the (CSS-defined) item width so bigger items don't collide.
      const itemW = itemRefs.current[0]?.offsetWidth ?? 0;
      const spacing = w < 700 ? w * 0.5 : itemW ? Math.min(itemW * 1.15, w * 0.36) : Math.min(w * 0.27, 360);
      const centre = Math.round(pos);
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const st = itemStyle(i - pos, spacing);
        el.style.transform = st.transform;
        el.style.opacity = String(st.opacity);
        el.style.filter = st.filter;
        el.style.zIndex = String(st.zIndex);
        el.style.pointerEvents = st.pointerEvents;
        if (centre === i) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      });
      const idx = clamp(centre, 0, n - 1);
      if (idx !== lastShown) {
        lastShown = idx;
        setShown(idx);
      }
    };

    const tick = () => {
      const diff = target - pos;
      pos = reduceMotion || Math.abs(diff) < 0.001 ? target : pos + diff * 0.14;
      layout();
      raf = pos === target ? null : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const goTo = (i: number) => {
      const { top, total, wrapTop } = metrics();
      const k = clamp(i, 0, n - 1);
      const y = wrapTop - top + (n > 1 ? (k / (n - 1)) * total : 0);
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    };
    goToRef.current = goTo;

    // Gentle snap to the nearest item once scrolling stops inside the stage.
    const scheduleSnap = () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        const { scrolled, total } = readScroll();
        if (scrolled <= 0 || scrolled >= total) return;
        if (Math.abs(target - Math.round(target)) > 0.02) goTo(Math.round(target));
      }, 160);
    };

    const onScroll = () => {
      readScroll();
      kick();
      scheduleSnap();
      hintRef.current?.classList.toggle("is-gone", window.scrollY > 40);
    };
    const onResize = () => {
      readScroll();
      layout();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    readScroll();
    pos = target;
    layout();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(snapTimer);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [n]);

  if (n === 0) return null;

  const current = collections[Math.min(shown, n - 1)];
  const step = (delta: number) => goToRef.current(Math.round(targetRef.current) + delta);

  return (
    <section
      ref={wrapRef}
      className="stage-wrap"
      id="stage-wrap"
      aria-label="Collections – scroll to browse"
      style={{ "--n": n } as CSSProperties}
    >
      <div className="stage" ref={stageRef}>
        <div className="stage__ghost" aria-hidden="true">{current.word}</div>

        <div className="stage__track">
          {collections.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="stage__item"
              style={{ ...itemStyle(i, 340), "--tile": c.tile } as CSSProperties}
              aria-label={`View ${c.title}`}
              onClick={() =>
                i === Math.round(targetRef.current) ? router.push(`/collections/${c.handle}`) : goToRef.current(i)
              }
            >
              <CollectionVisual collection={c} priority={i < 3} />
            </button>
          ))}
        </div>

        <div className="stage__info">
          <div className="stage__text" aria-live="polite">
            <div className="stage__swap" key={shown}>
              <p className="stage__eyebrow">Collections — {shown + 1} / {n}</p>
              <h2 className="stage__title">{current.title}</h2>
              {current.description && <p className="stage__desc">{current.description}</p>}
            </div>
          </div>
          <div className="stage__controls">
            <p className="stage__price">{current.price ? `From ${formatMoney(current.price)}` : ""}</p>
            <div className="stage__arrows">
              <button className="arrow" onClick={() => step(-1)} aria-label="Previous collection">&larr;</button>
              <button className="arrow" onClick={() => step(1)} aria-label="Next collection">&rarr;</button>
            </div>
            <Link className="btn btn--outline" href={`/collections/${current.handle}`}>Explore</Link>
          </div>
        </div>

        <p className="stage__hint" ref={hintRef} aria-hidden="true">Scroll &darr;</p>
      </div>
    </section>
  );
}
