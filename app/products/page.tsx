import type { Metadata } from "next";
import Link from "next/link";
import Shop from "@/components/Shop";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = { title: "All products" };

// Rendered per request (product data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export default async function AllProducts() {
  const products = await getProducts();

  return (
    <>
      <div className="shop" style={{ paddingBottom: 0 }}>
        <Link href="/" className="pdp__crumbs">&larr; Home</Link>
      </div>
      <Shop products={products} title="All products" />
    </>
  );
}
