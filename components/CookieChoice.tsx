"use client";

import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, writeConsent, type Consent } from "@/lib/consent";
import { useI18n } from "./I18nProvider";

/** Lets visitors change their marketing-cookie choice at any time (the cookie page). */
export default function CookieChoice() {
  const { t } = useI18n();
  const [value, setValue] = useState<Consent | null>(null);

  useEffect(() => {
    setValue(readConsent());
    const on = (e: Event) => setValue((e as CustomEvent<Consent>).detail);
    window.addEventListener(CONSENT_EVENT, on);
    return () => window.removeEventListener(CONSENT_EVENT, on);
  }, []);

  return (
    <div className="consent__actions consent__actions--inline">
      <button type="button" className="consent__btn" aria-pressed={value === "denied"} onClick={() => writeConsent("denied")}>{t("consent.reject")}</button>
      <button type="button" className="consent__btn" aria-pressed={value === "granted"} onClick={() => writeConsent("granted")}>{t("consent.accept")}</button>
    </div>
  );
}
