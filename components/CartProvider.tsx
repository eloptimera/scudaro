"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addToCartAction, getCartAction, removeLineAction, updateLineAction } from "@/app/actions";
import type { Cart } from "@/lib/types";

type CartContextValue = {
  cart: Cart | null;
  count: number;
  isOpen: boolean;
  busy: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  add: (variantId: string) => Promise<boolean>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCartAction().then(setCart).catch(() => setCart(null));
  }, []);

  const run = useCallback(async (fn: () => Promise<Cart>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      setCart(await fn());
      return true;
    } catch {
      setError("Something went wrong updating your cart. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.totalQuantity ?? 0,
      isOpen,
      busy,
      error,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: async (variantId) => {
        const ok = await run(() => addToCartAction(variantId, 1));
        if (ok) setOpen(true);
        return ok;
      },
      setQuantity: async (lineId, quantity) => {
        await run(() => updateLineAction(lineId, quantity));
      },
      remove: async (lineId) => {
        await run(() => removeLineAction(lineId));
      },
    }),
    [cart, isOpen, busy, error, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
