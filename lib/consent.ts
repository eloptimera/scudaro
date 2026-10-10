/** Cookie consent for marketing cookies (Meta Pixel). Stored in a first-party cookie, 12 months. */
export const CONSENT_COOKIE = "scudaro_consent";
export const CONSENT_EVENT = "scudaro:consent";
export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)`));
    return (m?.[1] as Consent | undefined) ?? null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent) {
  try {
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  } catch {
    /* cookies blocked: the choice only lasts for this page view */
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: value }));
}
