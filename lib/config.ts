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
