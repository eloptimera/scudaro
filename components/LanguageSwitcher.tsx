"use client";

import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, localePath, stripLocale, type Locale } from "@/lib/i18n/config";
import { useI18n } from "./I18nProvider";

/** Language picker. Remembers the choice in a cookie so the next visit opens in the same language. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();

  const onChange = (next: Locale) => {
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* cookies blocked: the URL still carries the language */
    }
    // A full navigation, so <html lang/dir> and every server-rendered string switch together.
    window.location.assign(localePath(next, stripLocale(pathname)) + window.location.search + window.location.hash);
  };

  return (
    <label className={`lang ${className}`.trim()}>
      <span className="sr-only">{t("lang.label")}</span>
      <select value={locale} onChange={(e) => onChange(e.target.value as Locale)} aria-label={t("lang.label")}>
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}
