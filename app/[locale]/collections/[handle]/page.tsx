import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shop from "@/components/Shop";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getT } from "@/lib/i18n/server";
import { getCollection } from "@/lib/shopify";

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
