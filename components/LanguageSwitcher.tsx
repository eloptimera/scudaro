"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, localePath, stripLocale, type Locale } from "@/lib/i18n/config";
import { useI18n } from "./I18nProvider";

function Flag({ code }: { code: string }) {
  // Decorative: the language name always sits next to it. SVG files (not emoji) so Windows shows real flags too.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="lang__flag" src={`/flags/${code}.svg`} alt="" width={20} height={15} loading="lazy" />;
}

/** Language picker (flag + name, alphabetical). Real links, so it works without JS and crawlers can follow it. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState<CSSProperties>({});
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      const n = e.target as Node;
      if (!root.current?.contains(n) && !menu.current?.contains(n)) setOpen(false);
    };
    const close = () => setOpen(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      // The menu is rendered in <body> (the header is colour-blended, which would invert it) so it is positioned from the button.
      const r = root.current?.getBoundingClientRect();
      if (r) {
        const rtl = document.documentElement.dir === "rtl";
        const above = window.innerHeight - r.bottom < 400 && r.top > 400;
        setPos({
          ...(rtl ? { left: Math.max(8, r.left) } : { right: Math.max(8, window.innerWidth - r.right) }),
          ...(above ? { bottom: window.innerHeight - r.top + 8 } : { top: r.bottom + 8 }),
        });
      }
    }
    setOpen((o) => !o);
  };

  const base = stripLocale(pathname);

  const remember = (next: Locale) => {
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* cookies blocked: the URL still carries the language */
    }
  };

  return (
    <div ref={root} className={`lang ${className}`.trim()}>
      <button type="button" className="lang__btn" aria-expanded={open} aria-haspopup="true" aria-label={`${t("lang.label")}: ${current.name}`} onClick={toggle}>
        <Flag code={current.flag} />
        <span className="lang__name">{current.name}</span>
        <span className="lang__code" aria-hidden="true">{current.code}</span>
        <svg className="lang__chev" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
      </button>
      {open && createPortal(
        <ul ref={menu} className="lang__menu" style={pos} dir={document.documentElement.dir}>
          {LOCALES.map((l) => (
            <li key={l.code}>
              {/* Full navigation (not client routing) so <html lang/dir> and every server-rendered string switch together. */}
              <a href={localePath(l.code, base)} hrefLang={l.code} lang={l.code} aria-current={l.code === locale ? "true" : undefined} onClick={() => remember(l.code)}>
                <Flag code={l.flag} />
                <span>{l.name}</span>
              </a>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  );
}
