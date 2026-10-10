import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalLink from "@/components/LocalLink";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/i18n/seo";
import { getT } from "@/lib/i18n/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getT(locale);
  return { title: t("cookies.title"), alternates: alternatesFor(locale, "/cookies") };
}

/**
 * Keep this page in step with what the site really does. If analytics or advertising pixels are
 * added later, this page needs updating and a consent banner is required.
 */
export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getT(locale);

  return (
    <article className="policy">
      <LocalLink href="/" className="pdp__crumbs"><span className="dir-arrow" aria-hidden="true">&larr;</span> {t("policy.back")}</LocalLink>
      <h1>{t("cookies.title")}</h1>
      <div className="prose">
        <p>{t("cookies.intro")}</p>

        <h2>{t("cookies.set")}</h2>
        <table>
          <thead>
            <tr><th>{t("cookies.name")}</th><th>{t("cookies.purpose")}</th><th>{t("cookies.lifetime")}</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>scudaro_cart</code></td>
              <td>{t("cookies.cartPurpose")}</td>
              <td>{t("cookies.cartLife")}</td>
            </tr>
            <tr>
              <td><code>NEXT_LOCALE</code></td>
              <td>{t("cookies.langPurpose")}</td>
              <td>{t("cookies.langLife")}</td>
            </tr>
          </tbody>
        </table>

        <h2>{t("cookies.checkout")}</h2>
        <p>{t("cookies.checkoutText")}</p>

        <h2>{t("cookies.control")}</h2>
        <p>{t("cookies.controlText")}</p>
      </div>
    </article>
  );
}
