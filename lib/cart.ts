import "server-only";
import { cookies } from "next/headers";
import { MOCK_PRODUCTS } from "./mock";
import {
  isShopifyEnabled,
  shopifyAddLine,
  shopifyCreateCart,
  shopifyGetCart,
  shopifyRemoveLine,
  shopifyUpdateLine,
} from "./shopify";
import type { Cart, CartLine } from "./types";

/**
 * One cart API for both modes:
 *  - Live:  the cookie holds the Shopify cart id; Shopify owns the cart and checkout.
 *  - Demo:  the cookie holds { variantId: quantity }; lines are resolved against the demo catalogue.
 */

const COOKIE = "scudaro_cart";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export const EMPTY_CART: Cart = {
  id: null,
  checkoutUrl: null,
  totalQuantity: 0,
  subtotal: { amount: 0, currencyCode: "SEK" },
  lines: [],
};

/* ------------------------------ Demo mode ------------------------------ */

type DemoMap = Record<string, number>;

function readDemo(raw: string | undefined): DemoMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: DemoMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 20) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function buildDemoCart(map: DemoMap): Cart {
  const lines: CartLine[] = [];
  for (const [variantId, quantity] of Object.entries(map)) {
    for (const p of MOCK_PRODUCTS) {
      const v = p.variants.find((x) => x.id === variantId);
      if (!v) continue;
      lines.push({
        id: variantId,
        variantId,
        handle: p.handle,
        title: p.title,
        variantTitle: v.title,
        quantity,
        price: v.price,
        image: null,
      });
    }
  }
  const subtotal = lines.reduce((sum, l) => sum + l.price.amount * l.quantity, 0);
  return {
    id: "demo",
    checkoutUrl: null,
    totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: { amount: subtotal, currencyCode: "SEK" },
    lines,
  };
}

/* -------------------------------- API --------------------------------- */

export async function getCart(): Promise<Cart> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!isShopifyEnabled) return buildDemoCart(readDemo(raw));
  if (!raw) return EMPTY_CART;
  const cart = await shopifyGetCart(raw);
  if (!cart) {
    store.delete(COOKIE); // expired / completed cart
    return EMPTY_CART;
  }
  return cart;
}

export async function addToCart(variantId: string, quantity: number): Promise<Cart> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;

  if (!isShopifyEnabled) {
    const map = readDemo(raw);
    const exists = MOCK_PRODUCTS.some((p) => p.variants.some((v) => v.id === variantId && v.availableForSale));
    if (!exists) throw new Error("Variant not available");
    map[variantId] = Math.min((map[variantId] ?? 0) + quantity, 20);
    store.set(COOKIE, JSON.stringify(map), COOKIE_OPTS);
    return buildDemoCart(map);
  }

  if (raw) {
    try {
      return await shopifyAddLine(raw, variantId, quantity);
    } catch {
      // cart may have expired or been completed – start a fresh one below
    }
  }
  const cart = await shopifyCreateCart(variantId, quantity);
  store.set(COOKIE, cart.id as string, COOKIE_OPTS);
  return cart;
}

export async function updateLine(lineId: string, quantity: number): Promise<Cart> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;

  if (!isShopifyEnabled) {
    const map = readDemo(raw);
    if (!(lineId in map)) return buildDemoCart(map);
    if (quantity <= 0) delete map[lineId];
    else map[lineId] = Math.min(quantity, 20);
    store.set(COOKIE, JSON.stringify(map), COOKIE_OPTS);
    return buildDemoCart(map);
  }

  if (!raw) return EMPTY_CART;
  return quantity <= 0 ? shopifyRemoveLine(raw, lineId) : shopifyUpdateLine(raw, lineId, quantity);
}

export async function removeLine(lineId: string): Promise<Cart> {
  return updateLine(lineId, 0);
}
