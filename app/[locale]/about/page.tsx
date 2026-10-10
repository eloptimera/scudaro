import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CtaRow, infoMetadata } from "@/components/InfoPage";
import { info } from "@/lib/content/info";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = info(locale).about;
  return infoMetadata(locale, "/about", c.title, c.description);
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = info(locale).about;
  const [lead, ...rest] = c.paragraphs;

  return (
    <article className="story">
      <div className="story__text">
        <p className="story__eyebrow">{c.eyebrow}</p>
        <h1 className="story__title">{c.title}</h1>
        <p className="story__lead">{lead}</p>
        <div className="story__body">
          {rest.map((p) => <p key={p}>{p}</p>)}
        </div>
        <p className="story__fact">{c.delivery}</p>
        <CtaRow ctas={c.ctas} />
        <p className="story__note">{c.disclaimer}</p>
      </div>

      <figure className="story__photo">
        <Image
          src="/about/hoodie-night.jpg"
          alt={c.imageAlt}
          width={1200}
          height={1600}
          sizes="(min-width: 900px) 480px, 100vw"
          priority
        />
      </figure>
    </article>
  );
}
