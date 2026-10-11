import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { infoMetadata } from "@/components/InfoPage";
import TrackOrder from "@/components/TrackOrder";
import { info } from "@/lib/content/info";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = info(locale).track;
  return { ...infoMetadata(locale, "/track-order", c.title, c.description), robots: { index: false, follow: true } };
}

export default async function TrackOrderPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = info(locale).track;
  return (
    <article className="policy">
      <h1>{c.title}</h1>
      <div className="prose">
        <p>{c.intro}</p>
        <TrackOrder text={c} />
        <p className="note">{c.help}</p>
      </div>
    </article>
  );
}
