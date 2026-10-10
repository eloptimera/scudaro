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
