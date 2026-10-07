import type { Product, ProductKind } from "./types";

/**
 * Demo catalogue. Used only while Shopify is not connected
 * (SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_TOKEN missing).
 */
const SIZES = ["S", "M", "L", "XL"];
const CUR = "SEK";

type Seed = {
  n: number;
  handle: string;
  title: string;
  kind: ProductKind;
  price: number;
  was?: number;
  tile: string;
  shirt: string;
  ink: string;
  word: string;
  tag?: string;
  description: string;
};

const seeds: Seed[] = [
  { n: 1, handle: "apex-oversized-tee", title: "Apex – Oversized Tee", kind: "tee", price: 599, was: 749, tile: "#1d4f91", shirt: "#0e0e10", ink: "#f4f4f2", word: "APEX", tag: "New",
    description: "Heavyweight cotton, boxy fit and a back print you can spot from the first corner." },
  { n: 2, handle: "paddock-oversized-tee", title: "Paddock – Oversized Tee", kind: "tee", price: 599, tile: "#c4161c", shirt: "#c4161c", ink: "#f4f4f2", word: "PADDOCK",
    description: "Racing red in a proper heavyweight weave. Oversized, soft but substantial." },
  { n: 3, handle: "slipstream-oversized-tee", title: "Slipstream – Oversized Tee", kind: "tee", price: 599, was: 749, tile: "#e8a317", shirt: "#0e0e10", ink: "#e8a317", word: "SLIP", tag: "New",
    description: "Black tee with a gold back print. Limited run, no reprints." },
  { n: 4, handle: "parc-ferme-hoodie", title: "Parc Fermé – Hoodie", kind: "hoodie", price: 1149, tile: "#4a4f57", shirt: "#d9d9d4", ink: "#0e0e10", word: "PARC",
    description: "After the finish line. Heavyweight off-white hoodie with a large back print." },
  { n: 5, handle: "chicane-hoodie", title: "Chicane – Hoodie", kind: "hoodie", price: 1149, tile: "#c4161c", shirt: "#c4161c", ink: "#f4f4f2", word: "CHICANE",
    description: "Red hoodie for cold mornings in the pits. Boxy, sturdy and built to last." },
  { n: 6, handle: "pit-lane-oversized-tee", title: "Pit Lane – Oversized Tee", kind: "tee", price: 599, tile: "#4a4f57", shirt: "#0e0e10", ink: "#f4f4f2", word: "PIT",
    description: "The essential. Black, heavy and as good in the garage as in the city." },
];

export const MOCK_PRODUCTS: Product[] = seeds.map((s) => ({
  id: `mock-${s.n}`,
  handle: s.handle,
  title: s.title,
  description: s.description,
  kind: s.kind,
  tag: s.tag,
  word: s.word,
  tile: s.tile,
  shirt: s.shirt,
  ink: s.ink,
  images: [],
  price: { amount: s.price, currencyCode: CUR },
  compareAt: s.was ? { amount: s.was, currencyCode: CUR } : null,
  variants: SIZES.map((size) => ({
    id: `mock-${s.n}-${size}`,
    title: size,
    availableForSale: !(s.n === 3 && size === "XL"), // one sold-out size to show the state
    price: { amount: s.price, currencyCode: CUR },
    compareAt: s.was ? { amount: s.was, currencyCode: CUR } : null,
  })),
}));
