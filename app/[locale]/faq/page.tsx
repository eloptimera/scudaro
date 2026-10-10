import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaRow, infoMetadata } from "@/components/InfoPage";
import LocalLink from "@/components/LocalLink";
import { info } from "@/lib/content/info";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = info(locale).faq;
  return infoMetadata(locale, "/faq", c.title, c.description);
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = info(locale).faq;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <article className="policy">
      <h1>{c.title}</h1>
      <div className="prose">
        {c.items.map((i) => (
          <section key={i.q}>
            <h2>{i.q}</h2>
            <p>{i.a}</p>
            {i.cta && <LocalLink href={i.cta.href} className="faq__cta">{i.cta.label} →</LocalLink>}
          </section>
        ))}
      </div>
      <CtaRow ctas={[{ href: "/products", label: info(locale).about.ctas[0].label }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}
