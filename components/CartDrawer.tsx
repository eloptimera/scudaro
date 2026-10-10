"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import LocalLink from "./LocalLink";
import { formatMoney } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

export default function CartDrawer() {
  const { cart, isOpen, busy, error, close, setQuantity, remove } = useCart();
  const { t, rich, locale } = useI18n();
  const money = (m: { amount: number; currencyCode: string }) => formatMoney(m, locale);
  const ref = useRef<HTMLDialogElement>(null);

  // Keep the native <dialog> in sync with React state.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  // Esc / light-dismiss close the dialog natively – mirror that back into state.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => close();
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, [close]);

  // Fallback light-dismiss for browsers without <dialog closedby> (e.g. Safari).
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if ("closedBy" in HTMLDialogElement.prototype) return;
    const d = ref.current;
    if (!d || e.target !== d) return;
    const r = d.getBoundingClientRect();
    const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
    if (!inside) d.close();
  };

  const lines = cart?.lines ?? [];
  const live = Boolean(cart?.checkoutUrl);
  const dismiss = { closedby: "any" } as Record<string, string>;

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="drawer-title" onClick={onDialogClick} {...dismiss}>
      <div className="drawer__head">
        <h2 id="drawer-title" className="drawer__title">{t("cart.title", { count: cart?.totalQuantity ?? 0 })}</h2>
        <button className="drawer__close" onClick={close} aria-label={t("cart.close")}>&times;</button>
      </div>

      {lines.length > 0 && cart && (() => {
        const left = Math.max(0, FREE_SHIPPING_THRESHOLD.amount - cart.subtotal.amount);
        const pct = Math.min(100, (cart.subtotal.amount / FREE_SHIPPING_THRESHOLD.amount) * 100);
        return (
          <div className="ship">
            <p className="ship__text">
              {left > 0
                ? rich("cart.shipMore", { amount: <strong key="a">{money({ amount: left, currencyCode: cart.subtotal.currencyCode })}</strong> })
                : <strong>{t("cart.shipDone")}</strong>}
            </p>
            <div className="ship__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })()}

      <div className="drawer__body">
        {lines.length === 0 ? (
          <p className="drawer__empty">{t("cart.empty")}</p>
        ) : (
          lines.map((l) => (
            <div className="line" key={l.id}>
              <div className="line__thumb">
                {l.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image.url} alt={l.image.alt} loading="lazy" />
                )}
              </div>
              <div>
                <p className="line__title">
                  <LocalLink href={`/products/${l.handle}`} onClick={close}>{l.title}</LocalLink>
                </p>
                {l.variantTitle !== "Default Title" && <p className="line__variant">{l.variantTitle}</p>}
                <div className="qty">
                  <button onClick={() => setQuantity(l.id, l.quantity - 1)} disabled={busy} aria-label={t("cart.dec", { title: l.title })}>&minus;</button>
                  <span aria-live="polite">{l.quantity}</span>
                  <button onClick={() => setQuantity(l.id, l.quantity + 1)} disabled={busy || l.quantity >= 20} aria-label={t("cart.inc", { title: l.title })}>+</button>
                </div>
              </div>
              <div className="line__side">
                <span>{money({ amount: l.price.amount * l.quantity, currencyCode: l.price.currencyCode })}</span>
                <button className="line__remove" onClick={() => remove(l.id)} disabled={busy}>{t("cart.remove")}</button>
              </div>
            </div>
          ))
        )}
        {error && <p className="pdp__error" role="alert">{error}</p>}
      </div>

      {lines.length > 0 && cart && (
        <div className="drawer__foot">
          <p className="drawer__sub"><span>{t("cart.subtotal")}</span><span>{money(cart.subtotal)}</span></p>
          <p className="drawer__note">
            {live ? t("cart.noteLive") : t("cart.noteDemo")}
          </p>
          {live ? (
            <a className="btn btn--light btn--block" href={cart.checkoutUrl as string}>{t("cart.checkout")}</a>
          ) : (
            <button className="btn btn--light btn--block" disabled>{t("cart.checkout")}</button>
          )}
        </div>
      )}
    </dialog>
  );
}
