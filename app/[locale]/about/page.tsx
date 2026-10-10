import type { Metadata } from "next";
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
  return (
    <article className="policy">
      <h1>{c.title}</h1>
      <div className="prose">
        {c.paragraphs.map((p) => <p key={p}>{p}</p>)}
        <p className="note">{c.disclaimer}</p>
      </div>
      <CtaRow ctas={c.ctas} />
    </article>
  );
}
