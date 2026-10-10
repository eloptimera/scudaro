import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalLink from "@/components/LocalLink";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getT } from "@/lib/i18n/server";
import { getPolicies } from "@/lib/shopify";

type Props = { params: Promise<{ locale: string; handle: string }> };

// Rendered per request (policy data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  if (!isLocale(locale)) return {};
  const policy = (await getPolicies(locale)).find((p) => p.handle === handle);
  return policy ? { title: policy.title, alternates: alternatesFor(locale, `/policies/${handle}`) } : {};
}

export default async function PolicyPage({ params }: Props) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();
  const [policies, t] = await Promise.all([getPolicies(locale), getT(locale)]);
  const policy = policies.find((p) => p.handle === handle);
  if (!policy) notFound();

  return (
    <article className="policy">
      <LocalLink href="/" className="pdp__crumbs"><span className="dir-arrow" aria-hidden="true">&larr;</span> {t("policy.back")}</LocalLink>
      <h1>{policy.title}</h1>
      {/* The HTML is written by the shop owner in Shopify admin (Settings → Policies), not by visitors. */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: policy.body }} />
    </article>
  );
}
