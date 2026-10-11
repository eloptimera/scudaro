import type { Metadata } from "next";
import Image from "next/image";
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
    <article className="trackpage">
      <figure className="trackpage__photo">
        <Image
          src="/track/loading-dock.jpg"
          alt=""
          width={1600}
          height={1067}
          sizes="(min-width: 900px) 520px, 100vw"
          priority
        />
      </figure>
      <div className="trackpage__main">
        <p className="trackpage__eyebrow">{c.eyebrow}</p>
        <h1 className="trackpage__title">{c.title}</h1>
        <p className="trackpage__intro">{c.intro}</p>
        <TrackOrder text={c} />
        <p className="trackpage__help">{c.help}</p>
      </div>
    </article>
  );
}
