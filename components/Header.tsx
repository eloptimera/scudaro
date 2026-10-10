"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import LocalLink from "./LocalLink";

export default function Header({ accountUrl }: { accountUrl: string | null }) {
  const pathname = stripLocale(usePathname());
  const { count, open } = useCart();
  const { t } = useI18n();
  // The landing page keeps the transparent header over the 3D stage; every other page gets a white pill.
  const solid = pathname !== "/";

  return (
    <header className={`site-header${solid ? " site-header--solid" : ""}`}>
      <div className="site-header__pill">
        <nav className="nav nav--left" aria-label={t("nav.menu")}>
          <LocalLink href="/" className={pathname === "/" ? "is-active" : undefined}>{t("nav.home")}</LocalLink>
          <LocalLink href="/products" className={pathname === "/products" ? "is-active" : undefined}>{t("nav.shop")}</LocalLink>
          <LocalLink href="/#about">{t("nav.about")}</LocalLink>
          <LocalLink href="/#contact">{t("nav.contact")}</LocalLink>
        </nav>

        <LocalLink href="/" className="brand" aria-label={t("nav.brandHome")}>
          <Image src={solid ? "/logo-black.png" : "/logo-white.png"} alt="SCUDARO" width={647} height={213} priority />
        </LocalLink>

        <nav className="nav nav--right" aria-label={t("nav.account")}>
          <LanguageSwitcher className="lang--header" />
          {accountUrl && (
            <a href={accountUrl} className="nav__pill">{t("nav.login")}</a>
          )}
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
