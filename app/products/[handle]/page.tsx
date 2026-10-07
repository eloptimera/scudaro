import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductVisual from "@/components/ProductVisual";
import { getProduct, getProducts } from "@/lib/shopify";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return { title: product.title, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <article className="pdp">
      <div className="pdp__media" style={{ "--tile": product.tile } as CSSProperties}>
        <ProductVisual product={product} priority />
      </div>

      <div>
        <Link href="/#shop" className="pdp__crumbs">&larr; All products</Link>
        <h1 className="pdp__title">{product.title}</h1>
        <AddToCart product={product} />
      </div>
    </article>
  );
}
