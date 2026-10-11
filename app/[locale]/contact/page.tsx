import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import { infoMetadata } from "@/components/InfoPage";
import { info } from "@/lib/content/info";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = info(locale).contact;
  return infoMetadata(locale, "/contact", c.title, c.description);
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = info(locale).contact;
  return (
    <article className="contactpage">
      <div className="contactpage__intro">
        <p className="trackpage__eyebrow">{c.eyebrow}</p>
        <h1 className="trackpage__title">{c.title}</h1>
        <p className="trackpage__intro">{c.intro}</p>
        <p className="trackpage__help">{c.direct}</p>
      </div>
      <ContactForm text={c} />
    </article>
  );
}
