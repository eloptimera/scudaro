import type { Metadata } from "next";
import Builder from "@/components/Builder";
import { buildableQuotes } from "@/lib/builder";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Build yours",
  description: "Pick a tee or hoodie, spin through the quotes, choose a colour and add it to your cart.",
};
export const dynamic = "force-dynamic";

export default async function BuildPage() {
  const products = await getProducts().catch(() => []);
  return <Builder quotes={buildableQuotes(products)} />;
}
