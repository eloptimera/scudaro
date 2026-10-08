import type { Money } from "./types";

/** Order value above which shipping is free. Keep in sync with the shipping rate in Shopify. */
export const FREE_SHIPPING_THRESHOLD: Money = { amount: 80, currencyCode: "EUR" };
