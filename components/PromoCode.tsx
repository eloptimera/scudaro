"use client";

import { useState } from "react";
import { PROMO_CODE } from "@/lib/config";
import { useI18n } from "./I18nProvider";

/** Discount code with a copy button. `variant` only changes the look: a full-width bar (home) or a boxed callout. */
export default function PromoCode({ variant = "box" }: { variant?: "bar" | "box" }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  if (!PROMO_CODE) return null;
  const { code, percent } = PROMO_CODE;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard blocked – the code is still visible to type in. */
    }
  }

  return (
    <div className={`promo promo--${variant}`}>
      <p className="promo__text">
        <strong>{t("promo.off", { percent })}</strong> {t("promo.use")}
      </p>
      <button type="button" className="promo__code" onClick={copy} aria-label={t("promo.copyLabel", { code })}>
        <span className="promo__value">{code}</span>
        <span className="promo__action" aria-live="polite">{copied ? t("promo.copied") : t("promo.copy")}</span>
      </button>
    </div>
  );
}
