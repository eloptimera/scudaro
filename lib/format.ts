import type { Money } from "./types";

/** Money formatted for a language, e.g. "79,98 €" in German and "€79.98" in English. */
export function formatMoney({ amount, currencyCode }: Money, locale = "en-GB"): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}
