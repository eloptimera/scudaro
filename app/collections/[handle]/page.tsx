import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shop from "@/components/Shop";
import { getCollection } from "@/lib/shopify";

type Props = { params: Promise<{ handle: string }> };

// Rendered per request (data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const found = await getCollection(handle);
  if (!found) return {};
  return { title: found.collection.title, description: found.collection.description.slice(0, 160) || undefined };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const found = await getCollection(handle);
  if (!found) notFound();

  const { collection, products } = found;

  return (
    <>
      <div className="shop" style={{ paddingBottom: 0 }}>
        <Link href="/" className="pdp__crumbs">&larr; All collections</Link>
      </div>
      <Shop products={products} title={collection.title} />
    </>
  );
}
