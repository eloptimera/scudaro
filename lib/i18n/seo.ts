import { INFO_LOCALES } from "@/lib/content/info";
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from "./config";

/** Absolute site address for canonical / hreflang links. Set NEXT_PUBLIC_SITE_URL to override. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return prod ? `https://${prod}` : "http://localhost:3000";
}

/** `alternates` metadata: this page's canonical URL plus the same page in every other language. */
export function alternatesFor(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l.code] = localePath(l.code, path);
  languages["x-default"] = localePath(DEFAULT_LOCALE, path);
  return { canonical: localePath(locale, path), languages };
}

/**
 * Like `alternatesFor`, for the hand-written pages (FAQ, About, ...) that exist in English and Swedish only.
 * Other languages show the English text, so their canonical URL points at the English page.
 */
export function infoAlternatesFor(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const code of INFO_LOCALES) languages[code] = localePath(code, path);
  languages["x-default"] = localePath(DEFAULT_LOCALE, path);
  return { canonical: localePath(INFO_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE, path), languages };
}
