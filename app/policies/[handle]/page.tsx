import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolicies } from "@/lib/shopify";

type Props = { params: Promise<{ handle: string }> };

// Rendered per request (policy data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const policy = (await getPolicies()).find((p) => p.handle === handle);
  return policy ? { title: policy.title } : {};
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const policy = (await getPolicies()).find((p) => p.handle === handle);
  if (!policy) notFound();

  return (
    <article className="policy">
      <Link href="/" className="pdp__crumbs">&larr; Back to the shop</Link>
      <h1>{policy.title}</h1>
      {/* The HTML is written by the shop owner in Shopify admin (Settings → Policies), not by visitors. */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: policy.body }} />
    </article>
  );
}
