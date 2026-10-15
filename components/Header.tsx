"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { stripLocale } from "@/lib/i18n/config";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import LocalLink from "./LocalLink";

export default function Header() {
  const rawPathname = usePathname();
  const pathname = stripLocale(rawPathname);
  const { count, open } = useCart();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu whenever the visitor navigates.
  useEffect(() => {
    setMenuOpen(false);
  }, [rawPathname]);

  // Close on Escape or when tapping outside the header pill.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  return (
    <header className="site-header site-header--solid">
      <div className="site-header__pill" ref={pillRef}>
        <button
          type="button"
          className="nav__burger"
          aria-label={t("nav.menu")}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>

        <nav className="nav nav--left" aria-label={t("nav.menu")}>
          <LocalLink href="/" className={pathname === "/" ? "is-active" : undefined}>{t("nav.home")}</LocalLink>
          <LocalLink href="/products" className={pathname === "/products" ? "is-active" : undefined}>{t("nav.shop")}</LocalLink>
          <LocalLink href="/about">{t("nav.about")}</LocalLink>
          <LocalLink href="/contact">{t("nav.contact")}</LocalLink>
        </nav>

        <LocalLink href="/" className="brand" aria-label={t("nav.brandHome")}>
          <Image src="/logo-black.png" alt="SCUDARO" width={647} height={213} priority />
        </LocalLink>

        <nav className="nav nav--right" aria-label={t("nav.account")}>
          <LanguageSwitcher className="lang--header" />
          <LocalLink href="/track-order" className="nav__pill nav__track" aria-label={t("nav.track")}>
            <svg className="nav__track-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
              <path d="M12 11v10" />
            </svg>
            <span className="nav__track-text">{t("nav.track")}</span>
          </LocalLink>
          <button
            className="nav__btn nav__pill nav__pill--solid"
            onClick={open}
            aria-label={t("nav.cartOpen", { count })}
          >
            {t("nav.cart")} <span className="cart-count">{count}</span>
          </button>
        </nav>

        <nav id="mobile-menu" className="mobile-menu" aria-label={t("nav.menu")} hidden={!menuOpen}>
          <LocalLink href="/" className={pathname === "/" ? "is-active" : undefined}>{t("nav.home")}</LocalLink>
          <LocalLink href="/products" className={pathname === "/products" ? "is-active" : undefined}>{t("nav.shop")}</LocalLink>
          <LocalLink href="/track-order" className={pathname === "/track-order" ? "is-active" : undefined}>{t("nav.track")}</LocalLink>
          <LocalLink href="/about" className={pathname === "/about" ? "is-active" : undefined}>{t("nav.about")}</LocalLink>
          <LocalLink href="/contact" className={pathname === "/contact" ? "is-active" : undefined}>{t("nav.contact")}</LocalLink>
        </nav>
      </div>
    </header>
  );
}
