import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shop from "@/components/Shop";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getT } from "@/lib/i18n/server";
import { getCollection } from "@/lib/shopify";

type Props = { params: Promise<{ locale: string; handle: string }> };

// Rendered per request (data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  if (!isLocale(locale)) return {};
  const found = await getCollection(handle, locale);
  if (!found) return {};
  return {
    title: found.collection.title,
    description: found.collection.description.slice(0, 160) || undefined,
    alternates: alternatesFor(locale, `/collections/${handle}`),
  };
}

export default async function CollectionPage({ params }: Props) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();
  const [found, t] = await Promise.all([getCollection(handle, locale), getT(locale)]);
  if (!found) notFound();

  const { collection, products } = found;

  return <Shop products={products} title={collection.title} crumb={{ href: "/", label: t("crumb.collections") }} />;
}
