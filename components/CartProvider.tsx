"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addToCartAction, getCartAction, removeLineAction, updateLineAction } from "@/app/actions";
import type { Cart } from "@/lib/types";
import { useI18n } from "./I18nProvider";

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
  const { locale, t } = useI18n();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCartAction(locale).then(setCart).catch(() => setCart(null));
  }, [locale]);

  const run = useCallback(async (fn: () => Promise<Cart>): Promise<Cart | null> => {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      setCart(next);
      return next;
    } catch {
      setError(t("cart.error"));
      return null;
    } finally {
      setBusy(false);
    }
  }, [t]);

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
        const next = await run(() => addToCartAction(variantId, 1, locale));
        if (!next) return false;
        // Shopify only adds what is in stock. If the variant did not make it into the cart, say so instead of
        // opening a drawer that looks like the add worked.
        if (!next.lines.some((l) => l.variantId === variantId && l.quantity > 0)) {
          setError(t("cart.soldOutVariant"));
          return false;
        }
        setOpen(true);
        return true;
      },
      setQuantity: async (lineId, quantity) => {
        await run(() => updateLineAction(lineId, quantity, locale));
      },
      remove: async (lineId) => {
        await run(() => removeLineAction(lineId, locale));
      },
    }),
    [cart, isOpen, busy, error, run, locale, t],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
