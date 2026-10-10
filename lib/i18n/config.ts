/**
 * Every language the shop is available in: the 24 official EU languages plus Arabic and Chinese.
 * Listed alphabetically by English name (Arabic, Bulgarian, Chinese, ...). `flag` is the ISO country file in /public/flags.
 */
export const LOCALES = [
  { code: "ar", name: "العربية", flag: "sa" },
  { code: "bg", name: "Български", flag: "bg" },
  { code: "zh", name: "中文", flag: "cn" },
  { code: "hr", name: "Hrvatski", flag: "hr" },
  { code: "cs", name: "Čeština", flag: "cz" },
  { code: "da", name: "Dansk", flag: "dk" },
  { code: "nl", name: "Nederlands", flag: "nl" },
  { code: "en", name: "English", flag: "gb" },
  { code: "et", name: "Eesti", flag: "ee" },
  { code: "fi", name: "Suomi", flag: "fi" },
  { code: "fr", name: "Français", flag: "fr" },
  { code: "de", name: "Deutsch", flag: "de" },
  { code: "el", name: "Ελληνικά", flag: "gr" },
  { code: "hu", name: "Magyar", flag: "hu" },
  { code: "ga", name: "Gaeilge", flag: "ie" },
  { code: "it", name: "Italiano", flag: "it" },
  { code: "lv", name: "Latviešu", flag: "lv" },
  { code: "lt", name: "Lietuvių", flag: "lt" },
  { code: "mt", name: "Malti", flag: "mt" },
  { code: "pl", name: "Polski", flag: "pl" },
  { code: "pt", name: "Português", flag: "pt" },
  { code: "ro", name: "Română", flag: "ro" },
  { code: "sk", name: "Slovenčina", flag: "sk" },
  { code: "sl", name: "Slovenščina", flag: "si" },
  { code: "es", name: "Español", flag: "es" },
  { code: "sv", name: "Svenska", flag: "se" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";
const RTL = new Set<string>(["ar"]);

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && LOCALES.some((l) => l.code === v);
export const dirOf = (l: Locale): "rtl" | "ltr" => (RTL.has(l) ? "rtl" : "ltr");

/** Shopify Storefront `LanguageCode` for a locale. Unsupported or unpublished languages fall back to the default (see lib/shopify.ts). */
export function shopifyLanguage(l: Locale): string {
  if (l === "pt") return "PT_PT";
  if (l === "zh") return "ZH_CN";
  return l.toUpperCase();
}

/** `/products` → `/de/products`. The default language has no prefix. Hash-only links keep the hash. */
export function localePath(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/")) return href;
  if (href === "/") return `/${locale}`;
  if (href.startsWith("/#") || href.startsWith("/?")) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/** `/de/products` → `/products`. */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (isLocale(seg)) return pathname.slice(seg.length + 1) || "/";
  return pathname || "/";
}
