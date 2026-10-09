import type { Product } from "./types";

/** One quote with the garments it is sold on. Built from titles like "Grid Collection Hoodie - Tripod 10". */
export type Quote = { key: string; name: string; tee?: Product; hoodie?: Product };

/**
 * Pairs tees and hoodies by the quote part of the title (everything after the dash), case-insensitive.
 * Products without that pattern (caps etc.) are left out – the builder only does garments that exist in both forms.
 */
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
