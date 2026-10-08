import "server-only";
import { headers } from "next/headers";
import { MOCK_COLLECTIONS, MOCK_PRODUCTS, mockCollectionProducts } from "./mock";
import type { Cart, CartLine, Collection, Img, Money, Product, ProductKind, Variant } from "./types";

/* ------------------------------------------------------------------ *
 * Shopify Storefront API client.
 * Falls back to the demo catalogue only when no store is configured.
 * With a store configured, errors are thrown (never silently replaced
 * by fake products).
 * ------------------------------------------------------------------ */

/**
 * Explicit, pinned Storefront API version (a new version ships every quarter and each is supported for
 * at least 12 months). Override with SHOPIFY_API_VERSION, e.g. when upgrading.
 */
export const API_VERSION = process.env.SHOPIFY_API_VERSION?.trim() || "2026-10";
if (!/^\d{4}-(01|04|07|10)$/.test(API_VERSION)) {
  throw new Error(`Invalid SHOPIFY_API_VERSION "${API_VERSION}" – expected e.g. 2026-10`);
}

const rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
export const storeDomain = rawDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
if (storeDomain && !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(storeDomain)) {
  throw new Error("SHOPIFY_STORE_DOMAIN must be a bare domain such as your-store.myshopify.com");
}

// Server-only secrets. Never prefix these with NEXT_PUBLIC_ – that would ship them to the browser.
const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
const publicToken = process.env.SHOPIFY_STOREFRONT_TOKEN?.trim();

/** Shopify is "on" as soon as a store domain is set. A token is optional (see authHeaders). */
export const isShopifyEnabled = Boolean(storeDomain);

async function authHeaders(forCart: boolean): Promise<Record<string, string>> {
  if (privateToken) {
    const h: Record<string, string> = { "Shopify-Storefront-Private-Token": privateToken };
    if (forCart) {
      // Forward the shopper's IP so Shopify rate-limits per buyer, not per server.
      try {
        const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
        if (ip) h["Shopify-Storefront-Buyer-IP"] = ip;
      } catch {
        /* outside a request scope */
      }
    }
    return h;
  }
  if (publicToken) return { "X-Shopify-Storefront-Access-Token": publicToken };
  return {}; // tokenless access: products + cart only, lower query-complexity limit (1,000)
}

type GqlOptions = { revalidate?: number; tags?: string[] };

async function storefront<T>(query: string, variables: Record<string, unknown> = {}, opts: GqlOptions = {}): Promise<T> {
  const res = await fetch(`https://${storeDomain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders(opts.revalidate === undefined)),
    },
    body: JSON.stringify({ query, variables }),
    ...(opts.revalidate !== undefined
      ? { next: { revalidate: opts.revalidate, tags: opts.tags } }
      : { cache: "no-store" as const }),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 500);
    throw new Error(`Shopify Storefront API ${res.status} ${res.statusText} (version ${API_VERSION}, store ${storeDomain}): ${body}`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(`Shopify Storefront API: ${json.errors.map((e) => e.message).join("; ")}`);
  return json.data as T;
}

/* ----------------------------- Products ----------------------------- */

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    images(first: 4) { nodes { url altText } }
    variants(first: 12) {
      nodes {
        id
        title
        selectedOptions { name value }
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
  }
`;

type RawMoney = { amount: string; currencyCode: string };
type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  images: { nodes: { url: string; altText: string | null }[] };
  variants: {
    nodes: {
      id: string;
      title: string;
      selectedOptions: { name: string; value: string }[];
      availableForSale: boolean;
      price: RawMoney;
      compareAtPrice: RawMoney | null;
    }[];
  };
};

const money = (m: RawMoney): Money => ({ amount: Number(m.amount), currencyCode: m.currencyCode });

function kindOf(p: RawProduct): ProductKind {
  const s = `${p.productType} ${p.title}`.toLowerCase();
  if (s.includes("hoodie")) return "hoodie";
  if (s.includes("tee") || s.includes("t-shirt") || s.includes("shirt")) return "tee";
  return "other";
}

/**
 * Optional styling hints via Shopify product tags:
 *   tile:#1d4f91   accent glow colour in the carousel
 *   word:APEX      big faded word behind the garment (defaults to first word of the title)
 *   badge:New      small label on the product card
 */
function tagValue(tags: string[], key: string): string | undefined {
  const t = tags.find((x) => x.toLowerCase().startsWith(`${key}:`));
  return t ? t.slice(key.length + 1).trim() : undefined;
}

function toProduct(p: RawProduct): Product {
  const variants: Variant[] = p.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    options: v.selectedOptions?.length ? v.selectedOptions : [{ name: "Size", value: v.title }],
    availableForSale: v.availableForSale,
    price: money(v.price),
    compareAt: v.compareAtPrice ? money(v.compareAtPrice) : null,
  }));
  const cheapest = variants.reduce((a, b) => (b.price.amount < a.price.amount ? b : a), variants[0]);
  const hex = tagValue(p.tags, "tile");
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    kind: kindOf(p),
    tag: tagValue(p.tags, "badge"),
    word: (tagValue(p.tags, "word") ?? p.title.split(/[\s–-]+/)[0] ?? p.title).toUpperCase(),
    tile: hex && /^#[0-9a-f]{3,8}$/i.test(hex) ? hex : "#c4161c",
    shirt: "#0e0e10",
    ink: "#f4f4f2",
    images: p.images.nodes.map((i): Img => ({ url: i.url, alt: i.altText ?? p.title })),
    variants,
    price: cheapest?.price ?? { amount: 0, currencyCode: "EUR" },
    compareAt: cheapest?.compareAt && cheapest.compareAt.amount > cheapest.price.amount ? cheapest.compareAt : null,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyEnabled) return MOCK_PRODUCTS;
  const data = await storefront<{ products: { nodes: RawProduct[] } }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Products {
        products(first: 24, sortKey: CREATED_AT, reverse: true) { nodes { ...ProductFields } }
      }
    `,
    {},
    { revalidate: 300, tags: ["products"] },
  );
  return data.products.nodes.filter((p) => p.variants.nodes.length > 0).map(toProduct);
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!isShopifyEnabled) return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
  const data = await storefront<{ product: RawProduct | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Product($handle: String!) {
        product(handle: $handle) { ...ProductFields }
      }
    `,
    { handle },
    { revalidate: 300, tags: ["products"] },
  );
  return data.product && data.product.variants.nodes.length ? toProduct(data.product) : null;
}

/* ---------------------------- Collections ---------------------------- */

const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    image { url altText }
    products(first: 20) {
      nodes {
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

type RawCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  products: {
    nodes: {
      featuredImage: { url: string; altText: string | null } | null;
      priceRange: { minVariantPrice: RawMoney };
    }[];
  };
};

/** Shopify's built-in "Home page" collection (handle `frontpage`) just mirrors the whole catalogue. */
const HIDDEN_COLLECTIONS = new Set(["frontpage"]);

function toCollection(c: RawCollection): Collection {
  const firstImage = c.image ?? c.products.nodes.find((p) => p.featuredImage)?.featuredImage ?? null;
  const prices = c.products.nodes.map((p) => money(p.priceRange.minVariantPrice));
  const cheapest = prices.length ? prices.reduce((a, b) => (b.amount < a.amount ? b : a)) : null;
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    word: (c.title.trim().split(/\s+/)[0] ?? c.title).toUpperCase(), // whitespace only, so "T-shirts" stays whole
    tile: "#c4161c",
    kind: "other",
    shirt: "#0e0e10",
    ink: "#f4f4f2",
    image: firstImage ? { url: firstImage.url, alt: firstImage.altText ?? c.title } : null,
    price: cheapest,
  };
}

/** All non-empty collections, newest first – these are the slides of the home carousel. */
export async function getCollections(): Promise<Collection[]> {
  if (!isShopifyEnabled) return MOCK_COLLECTIONS;
  const data = await storefront<{ collections: { nodes: RawCollection[] } }>(
    /* GraphQL */ `
      ${COLLECTION_FRAGMENT}
      query Collections {
        collections(first: 12, sortKey: ID, reverse: true) { nodes { ...CollectionFields } }
      }
    `,
    {},
    { revalidate: 300, tags: ["collections"] },
  );
  return data.collections.nodes
    .filter((c) => !HIDDEN_COLLECTIONS.has(c.handle) && c.products.nodes.length > 0)
    .map(toCollection);
}

/** One collection plus the products in it (for /collections/[handle]). */
export async function getCollection(handle: string): Promise<{ collection: Collection; products: Product[] } | null> {
  if (!isShopifyEnabled) {
    const collection = MOCK_COLLECTIONS.find((c) => c.handle === handle);
    return collection ? { collection, products: mockCollectionProducts(handle) } : null;
  }
  const data = await storefront<{ collection: (RawCollection & { products: { nodes: RawProduct[] } }) | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Collection($handle: String!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          image { url altText }
          products(first: 24) {
            nodes {
              ...ProductFields
              featuredImage { url altText }
              priceRange { minVariantPrice { amount currencyCode } }
            }
          }
        }
      }
    `,
    { handle },
    { revalidate: 300, tags: ["collections", "products"] },
  );
  const raw = data.collection;
  if (!raw) return null;
  const nodes = raw.products.nodes as unknown as (RawProduct & RawCollection["products"]["nodes"][number])[];
  return {
    collection: toCollection({ ...raw, products: { nodes } }),
    products: nodes.filter((p) => p.variants.nodes.length > 0).map(toProduct),
  };
}

/* ------------------------------- Cart -------------------------------- */

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 25) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url altText }
            product { handle title images(first: 1) { nodes { url altText } } }
          }
        }
      }
    }
  }
`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: RawMoney;
        image: { url: string; altText: string | null } | null;
        product: { handle: string; title: string; images: { nodes: { url: string; altText: string | null }[] } };
      };
    }[];
  };
};

function toCart(c: RawCart): Cart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: money(c.cost.subtotalAmount),
    lines: c.lines.nodes.map((l): CartLine => {
      const img = l.merchandise.image ?? l.merchandise.product.images.nodes[0] ?? null;
      return {
        id: l.id,
        variantId: l.merchandise.id,
        handle: l.merchandise.product.handle,
        title: l.merchandise.product.title,
        variantTitle: l.merchandise.title,
        quantity: l.quantity,
        price: money(l.merchandise.price),
        image: img ? { url: img.url, alt: img.altText ?? l.merchandise.product.title } : null,
      };
    }),
  };
}

type CartPayload = { cart: RawCart | null; userErrors: { message: string }[] };

function unwrap(p: CartPayload): Cart {
  if (p.userErrors?.length) throw new Error(p.userErrors.map((e) => e.message).join("; "));
  if (!p.cart) throw new Error("Shopify returned no cart");
  return toCart(p.cart);
}

export async function shopifyGetCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(
    /* GraphQL */ `${CART_FRAGMENT} query Cart($id: ID!) { cart(id: $id) { ...CartFields } }`,
    { id: cartId },
  );
  return data.cart ? toCart(data.cart) : null;
}

export async function shopifyCreateCart(variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartCreate: CartPayload }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartCreate($lines: [CartLineInput!]) {
        cartCreate(input: { lines: $lines }) { cart { ...CartFields } userErrors { message } }
      }
    `,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  return unwrap(data.cartCreate);
}

export async function shopifyAddLine(cartId: string, variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartLinesAdd: CartPayload }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
      }
    `,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  return unwrap(data.cartLinesAdd);
}

export async function shopifyUpdateLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartLinesUpdate: CartPayload }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
      }
    `,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  return unwrap(data.cartLinesUpdate);
}

export async function shopifyRemoveLine(cartId: string, lineId: string): Promise<Cart> {
  const data = await storefront<{ cartLinesRemove: CartPayload }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { message } }
      }
    `,
    { cartId, lineIds: [lineId] },
  );
  return unwrap(data.cartLinesRemove);
}
