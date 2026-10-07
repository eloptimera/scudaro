export type Money = { amount: number; currencyCode: string };

export type Img = { url: string; alt: string };

export type Variant = {
  id: string;
  title: string; // e.g. "M"
  availableForSale: boolean;
  price: Money;
  compareAt: Money | null;
};

export type ProductKind = "tee" | "hoodie" | "other";

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  kind: ProductKind;
  tag?: string;
  /** Large faded word behind the garment in the carousel. */
  word: string;
  /** Accent colour used for the glow behind the garment. */
  tile: string;
  /** Only used by the SVG placeholder when a product has no image. */
  shirt: string;
  ink: string;
  images: Img[];
  variants: Variant[];
  price: Money;
  compareAt: Money | null;
};

export type CartLine = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: Money; // unit price
  image: Img | null;
};

export type Cart = {
  id: string | null;
  /** Shopify-hosted checkout URL. Null in demo mode. */
  checkoutUrl: string | null;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};
