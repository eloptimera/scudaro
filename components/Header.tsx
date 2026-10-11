"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import LocalLink from "./LocalLink";

export default function Header() {
  const pathname = stripLocale(usePathname());
  const { count, open } = useCart();
  const { t } = useI18n();

  return (
    <header className="site-header site-header--solid">
      <div className="site-header__pill">
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
      </div>
    </header>
  );
}
