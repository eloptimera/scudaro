/** Every language the shop is available in: the 24 official EU languages plus Arabic and Chinese. */
export const LOCALES = [
  { code: "en", name: "English" },
  { code: "bg", name: "Български" },
  { code: "hr", name: "Hrvatski" },
  { code: "cs", name: "Čeština" },
  { code: "da", name: "Dansk" },
  { code: "nl", name: "Nederlands" },
  { code: "et", name: "Eesti" },
  { code: "fi", name: "Suomi" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "el", name: "Ελληνικά" },
  { code: "hu", name: "Magyar" },
  { code: "ga", name: "Gaeilge" },
  { code: "it", name: "Italiano" },
  { code: "lv", name: "Latviešu" },
  { code: "lt", name: "Lietuvių" },
  { code: "mt", name: "Malti" },
  { code: "pl", name: "Polski" },
  { code: "pt", name: "Português" },
  { code: "ro", name: "Română" },
  { code: "sk", name: "Slovenčina" },
  { code: "sl", name: "Slovenščina" },
  { code: "es", name: "Español" },
  { code: "sv", name: "Svenska" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
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
