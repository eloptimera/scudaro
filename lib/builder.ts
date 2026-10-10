import type { Product } from "./types";

/** One quote with the garments it is sold on. Built from titles like "Grid Collection Hoodie - Tripod 10". */
export type Quote = { key: string; name: string; tee?: Product; hoodie?: Product };

/**
 * Print artwork per quote (transparent webp in /public/prints, exported from the print PDFs).
 * `dark` is the version used on dark garments, when a separate one exists. The key is the quote part of the
 * product title, lower-cased, e.g. "Grid Collection Tee - Tripod 10" -> "tripod 10".
 * A quote without an entry here is not offered in the builder (it is still sold in the shop).
 */
export const PRINTS: Record<string, { light: string; dark?: string }> = {
  "gp2 14": { light: "/prints/gp2-14.webp" },
  "engine 14": { light: "/prints/engine-14.webp" },
  "tripod 10": { light: "/prints/tripod-10.webp" },
  "balls 3": { light: "/prints/balls-3.webp" },
  "i am stupid 16": { light: "/prints/i-am-stupid-16.webp", dark: "/prints/i-am-stupid-16-yellow.webp" },
};

/** Pairs tees and hoodies by the quote part of the title (everything after the dash), case-insensitive. */
export function groupQuotes(products: Product[]): Quote[] {
  const map = new Map<string, Quote>();
  for (const p of products) {
    if (p.kind !== "tee" && p.kind !== "hoodie") continue;
    const m = p.title.match(/\s[-–—]\s(.+)$/);
    const name = m?.[1]?.trim();
    if (!name) continue;
    const key = name.toLowerCase().replace(/\s+/g, " ");
    const q = map.get(key) ?? { key, name };
    q[p.kind] = p;
    map.set(key, q);
  }
  return [...map.values()];
}

/** Quotes that have artwork, in the order of PRINTS. */
export function buildableQuotes(products: Product[]): Quote[] {
  const all = groupQuotes(products);
  return Object.keys(PRINTS)
    .map((k) => all.find((q) => q.key === k))
    .filter((q): q is Quote => Boolean(q));
}

const COLORS: [RegExp, string][] = [
  [/white|arctic|natural|cream/i, "#f1f1ee"],
  [/charcoal|graphite/i, "#3a3a3e"],
  [/heather|grey|gray|ash|silver/i, "#a9a9ad"],
  [/black/i, "#161618"],
  [/navy|oxford/i, "#1c2b4d"],
  [/royal|blue|sky/i, "#2b5fb4"],
  [/red|burgundy|maroon|wine/i, "#9a1b22"],
  [/green|forest|olive|bottle/i, "#1f4d36"],
  [/pink|rose/i, "#e6a9b8"],
  [/yellow|gold|mustard/i, "#e3c23a"],
  [/orange/i, "#e06a1f"],
  [/purple|violet/i, "#4d2f7a"],
  [/brown|chocolate/i, "#4a3226"],
  [/sand|beige|stone/i, "#cdbf9f"],
];

/** Fabric colour for a Shopify colour name (best effort; unknown names get a neutral grey). */
export function colorHex(name: string | null): string {
  if (!name) return "#f1f1ee";
  return COLORS.find(([re]) => re.test(name))?.[1] ?? "#8a8a90";
}

/** Relative luminance 0..1 of a #rrggbb colour. */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
