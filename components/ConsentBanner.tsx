"use client";

import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, writeConsent } from "@/lib/consent";
import { useI18n } from "./I18nProvider";
import LocalLink from "./LocalLink";

/** Asks once. Accept and Reject are equally prominent (EU rules); nothing marketing-related loads before a choice. */
export default function ConsentBanner() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(readConsent() === null);
    const hide = () => setShow(false);
    window.addEventListener(CONSENT_EVENT, hide);
    return () => window.removeEventListener(CONSENT_EVENT, hide);
  }, []);

  if (!show) return null;
  return (
    <div className="consent" role="region" aria-label={t("consent.label")}>
      <p>
        {t("consent.text")} <LocalLink href="/cookies">{t("consent.more")}</LocalLink>
      </p>
      <div className="consent__actions">
        <button type="button" className="consent__btn" onClick={() => writeConsent("denied")}>{t("consent.reject")}</button>
        <button type="button" className="consent__btn" onClick={() => writeConsent("granted")}>{t("consent.accept")}</button>
      </div>
    </div>
  );
}
