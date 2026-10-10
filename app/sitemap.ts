import type { MetadataRoute } from "next";
import { INFO_LOCALES } from "@/lib/content/info";
import { DEFAULT_LOCALE, LOCALES, localePath } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/i18n/seo";
import { getCollections, getProducts } from "@/lib/shopify";

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** One entry per language of a page, each pointing at all its language versions (hreflang). */
function entries(base: string, path: string, codes: readonly string[]): Entry[] {
  const languages: Record<string, string> = {};
  for (const c of codes) languages[c] = base + localePath(c as never, path);
  languages["x-default"] = base + localePath(DEFAULT_LOCALE, path);
  return codes.map((c) => ({ url: base + localePath(c as never, path), alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const all = LOCALES.map((l) => l.code);
  const out: Entry[] = [
    ...entries(base, "/", all),
    ...entries(base, "/products", all),
    // Hand-written pages exist in English and Swedish only; other languages canonicalise to English.
    ...["/about", "/faq", "/size-guide", "/care"].flatMap((p) => entries(base, p, INFO_LOCALES)),
  ];
  try {
    const [products, collections] = await Promise.all([getProducts(), getCollections()]);
    for (const p of products) out.push(...entries(base, `/products/${p.handle}`, all));
    for (const c of collections) out.push(...entries(base, `/collections/${c.handle}`, all));
  } catch {
    // Shopify unreachable: still serve the static pages rather than failing the build.
  }
  return out;
}
