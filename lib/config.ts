import type { Money } from "./types";

/** Order value above which shipping is free. Keep in sync with the shipping rate in Shopify. */
export const FREE_SHIPPING_THRESHOLD: Money = { amount: 99.99, currencyCode: "EUR" };

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
