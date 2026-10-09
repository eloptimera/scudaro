import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, getProducts } from "@/lib/shopify";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ handle: p.handle }));
  } catch (err) {
    // Never let a Shopify problem block a deploy: pages are rendered on first visit instead.
    console.error("generateStaticParams: could not load products", err);
    return [];
  }
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

  return <ProductDetail product={product} />;
}
