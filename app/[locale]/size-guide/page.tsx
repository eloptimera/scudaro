import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaRow, SizeTables, infoMetadata } from "@/components/InfoPage";
import { info } from "@/lib/content/info";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = info(locale).size;
  return infoMetadata(locale, "/size-guide", c.title, c.description);
}

export default async function SizeGuidePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = info(locale).size;
  return (
    <article className="policy">
      <h1>{c.title}</h1>
      <div className="prose">
        <p>{c.intro}</p>
        <SizeTables tables={c.tables} />
        <p className="note">{c.note}</p>
      </div>
      <CtaRow ctas={[c.cta]} />
    </article>
  );
}
