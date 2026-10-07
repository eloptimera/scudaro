"use server";

import { addToCart, getCart, removeLine, updateLine } from "@/lib/cart";
import type { Cart } from "@/lib/types";

// Server actions are public endpoints: validate everything that arrives from the client.
const okId = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 200;
const okQty = (v: unknown, min: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= 20;

export async function getCartAction(): Promise<Cart> {
  return getCart();
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<Cart> {
  if (!okId(variantId) || !okQty(quantity, 1)) throw new Error("Invalid input");
  return addToCart(variantId, quantity);
}

export async function updateLineAction(lineId: string, quantity: number): Promise<Cart> {
  if (!okId(lineId) || !okQty(quantity, 0)) throw new Error("Invalid input");
  return updateLine(lineId, quantity);
}

export async function removeLineAction(lineId: string): Promise<Cart> {
  if (!okId(lineId)) throw new Error("Invalid input");
  return removeLine(lineId);
}
