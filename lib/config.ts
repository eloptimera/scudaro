import type { Money } from "./types";

/** Order value above which shipping is free. Keep in sync with the shipping rate in Shopify. */
export const FREE_SHIPPING_THRESHOLD: Money = { amount: 99.99, currencyCode: "EUR" };

/** Social profiles linked from the footer. */
export const SOCIAL = [
  { name: "Instagram", href: "https://www.instagram.com/scudaro.clothing/" },
  { name: "TikTok", href: "https://www.tiktok.com/@scudaroclo" },
] as const;

/**
 * Seller details shown in the footer (required on a shop selling to EU consumers).
 * Fill these in – empty fields are simply not shown.
 */
export const COMPANY = {
  name: "",
  orgNumber: "",
  address: "",
  email: "",
};

/**
 * Customer reviews received via social media, shown on the shop page.
 * `quote` is the original (Swedish); `en` is a faithful English translation shown in every other language.
 */
export const REVIEWS = [
  {
    name: "Filip S.",
    product: "Hoodie",
    quote: "Grym kvalitet på huvan! Varm, skön och motivet fick flera kommentarer när vi kollade på racet i helgen.",
    en: "Great quality on the hoodie! Warm, comfy, and the print got several comments when we watched the race this weekend.",
  },
  {
    name: "Alexander K.",
    product: null,
    quote: "Har letat efter merch som inte bara ser ut som en gigantisk reklam-sponsoring – här har vi det.",
    en: "I've been looking for merch that doesn't just look like one giant sponsorship ad – this is it.",
  },
  {
    name: "Oskar T.",
    product: "Cap",
    quote: "Grym keps! Sitter perfekt och detaljerna på broderiet är spot on.",
    en: "Great cap! Fits perfectly and the details on the embroidery are spot on.",
  },
] as const;

/**
 * Price reduction shown on the site: every product shows its previous price (current price + `amount`)
 * struck through in red, until `endsAt`. Afterwards nothing is shown – no code change needed.
 * EU/Swedish law: the struck-through price must be the lowest price actually charged in the 30 days
 * before the reduction, and a reduction can't run indefinitely. Keep `endsAt` close.
 * A compare-at price set in Shopify always takes precedence over this.
 */
export const PRICE_REDUCTION = {
  amount: 5,
  endsAt: "2026-11-01T00:00:00+01:00",
} as const;

/** Discount code promoted on the home page, shop page and every product page. Set to null to hide it everywhere. */
export const PROMO_CODE: { code: string; percent: number } | null = { code: "10OFF", percent: 10 };
