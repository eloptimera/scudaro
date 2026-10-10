import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shop from "@/components/Shop";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getT } from "@/lib/i18n/server";
import { getProducts } from "@/lib/shopify";

type Props = { params: Promise<{ locale: string }> };

// Rendered per request (product data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getT(locale);
  return { title: t("shop.all"), alternates: alternatesFor(locale, "/products") };
}

export default async function AllProducts({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [products, t] = await Promise.all([getProducts(locale), getT(locale)]);

  return <Shop products={products} title={t("shop.all")} crumb={{ href: "/", label: t("crumb.home") }} />;
}
