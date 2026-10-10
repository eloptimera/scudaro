"use server";

import { addToCart, getCart, removeLine, updateLine } from "@/lib/cart";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import type { Cart } from "@/lib/types";

// Server actions are public endpoints: validate everything that arrives from the client.
const okId = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 200;
const okQty = (v: unknown, min: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= 20;
const loc = (v: unknown): Locale => (isLocale(v) ? v : DEFAULT_LOCALE);

export async function getCartAction(locale: string): Promise<Cart> {
  return getCart(loc(locale));
}

export async function addToCartAction(variantId: string, quantity = 1, locale = DEFAULT_LOCALE as string): Promise<Cart> {
  if (!okId(variantId) || !okQty(quantity, 1)) throw new Error("Invalid input");
  return addToCart(variantId, quantity, loc(locale));
}

export async function updateLineAction(lineId: string, quantity: number, locale = DEFAULT_LOCALE as string): Promise<Cart> {
  if (!okId(lineId) || !okQty(quantity, 0)) throw new Error("Invalid input");
  return updateLine(lineId, quantity, loc(locale));
}

export async function removeLineAction(lineId: string, locale = DEFAULT_LOCALE as string): Promise<Cart> {
  if (!okId(lineId)) throw new Error("Invalid input");
  return removeLine(lineId, loc(locale));
}
