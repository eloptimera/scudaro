import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarZoom from "@/components/CarZoom";
import LocalLink from "@/components/LocalLink";
import RaceStrip from "@/components/RaceStrip";
import Stage from "@/components/Stage";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { getF1 } from "@/lib/f1";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getT } from "@/lib/i18n/server";
import { getCollections } from "@/lib/shopify";

type Props = { params: Promise<{ locale: string }> };

// Rendered per request (Shopify data itself is cached 5 min) so a Shopify hiccup can never fail a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { alternates: alternatesFor(locale, "/") };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [collections, f1, t] = await Promise.all([getCollections(locale), getF1(), getT(locale)]);

  return (
    <>
      <h1 className="sr-only">{t("home.h1")}</h1>

      <Stage collections={collections} />

      <div className="announce">{t("home.announce", { amount: formatMoney(FREE_SHIPPING_THRESHOLD, locale) })}</div>
      <CarZoom next={f1.next} last={f1.last} />
      <RaceStrip next={f1.next} last={f1.last} />
      <section className="cta" aria-labelledby="cta-title">
        <p className="cta__eyebrow">{t("home.cta.eyebrow")}</p>
        <h2 id="cta-title">{t("home.cta.title")}</h2>
        <p>{t("home.cta.text")}</p>
        <LocalLink href="/products" className="btn btn--light">{t("home.cta.button")}</LocalLink>
      </section>

      <section className="about" id="about">
        <h2>{t("home.about.title")}</h2>
        <p>{t("home.about.text")}</p>
      </section>

      <section className="usp" aria-label={t("usp.aria")}>
        <div><strong>{t("usp.limited.title")}</strong><span>{t("usp.limited.text")}</span></div>
        <div><strong>{t("usp.fit.title")}</strong><span>{t("usp.fit.text")}</span></div>
        <div><strong>{t("usp.returns.title")}</strong><span>{t("usp.returns.text")}</span></div>
      </section>
    </>
  );
}
