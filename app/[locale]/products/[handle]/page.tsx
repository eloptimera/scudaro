import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import RelatedProducts from "@/components/RelatedProducts";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getProduct, getProducts } from "@/lib/shopify";

type Props = { params: Promise<{ locale: string; handle: string }> };

// Cached (ISR): built on the first visit, then served from Vercel's cache and refreshed in the background at most
// every 5 minutes. Shopify webhooks -> /api/revalidate refresh it immediately. Never force-dynamic: rendering every hit
// (bots crawling 26 languages x every product) used up the team's whole Active CPU quota.
export const revalidate = 300;
export function generateStaticParams() {
  return []; // nothing at build time (a Shopify hiccup can't fail a deploy); every page is cached on first visit
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProduct(handle, locale);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    alternates: alternatesFor(locale, `/products/${handle}`),
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProduct(handle, locale);
  if (!product) notFound();

  // Other buyable products for "You may also like" (a failure here must never break the product page).
  const others = await getProducts(locale)
    .then((all) => all.filter((p) => p.id !== product.id && p.variants.some((v) => v.availableForSale)))
    .catch(() => []);

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts products={others} />
    </>
  );
}
