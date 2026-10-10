import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareTables, CtaRow, infoMetadata } from "@/components/InfoPage";
import { info } from "@/lib/content/info";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = info(locale).care;
  return infoMetadata(locale, "/care", c.title, c.description);
}

export default async function CarePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = info(locale).care;
  return (
    <article className="policy">
      <h1>{c.title}</h1>
      <div className="prose">
        <p>{c.intro}</p>
        <CareTables tables={c.tables} />
      </div>
      <CtaRow ctas={[c.cta]} />
    </article>
  );
}
