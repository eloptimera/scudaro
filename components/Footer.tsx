import Image from "next/image";
import { COMPANY, SOCIAL } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import { info } from "@/lib/content/info";
import { getT } from "@/lib/i18n/server";
import { getPolicies } from "@/lib/shopify";
import LanguageSwitcher from "./LanguageSwitcher";
import LocalLink from "./LocalLink";
import Newsletter from "./Newsletter";
import SocialIcon from "./SocialIcon";

export default async function Footer({ locale }: { locale: Locale }) {
  const [policies, t] = await Promise.all([getPolicies(locale), getT(locale)]);
  const nav = info(locale).nav;
  const company = [
    COMPANY.name,
    COMPANY.orgNumber && t("footer.org", { no: COMPANY.orgNumber }),
    COMPANY.address,
  ].filter(Boolean);

  return (
    <footer className="site-footer" id="contact">
      <Image src="/logo-white.png" alt="SCUDARO" className="footer-logo" width={647} height={213} />
      <Newsletter />

      <nav className="footer-links" aria-label={t("footer.legal")}>
        <LocalLink href="/contact">{t("nav.contact")}</LocalLink>
        <LocalLink href="/track-order">{nav.track}</LocalLink>
        <LocalLink href="/size-guide">{nav.size}</LocalLink>
        <LocalLink href="/care">{nav.care}</LocalLink>
        <LocalLink href="/about">{nav.about}</LocalLink>
        {policies.map((p) => (
          <LocalLink key={p.handle} href={`/policies/${p.handle}`}>{p.title}</LocalLink>
        ))}
        <LocalLink href="/cookies">{t("footer.cookies")}</LocalLink>
      </nav>

      <nav className="footer-links footer-social" aria-label="Social media">
        {SOCIAL.map((s) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Scudaro on ${s.name}`}>
            <SocialIcon name={s.name} />
          </a>
        ))}
      </nav>

      {(company.length > 0 || COMPANY.email) && (
        <address className="footer-company">
          {company.length > 0 && <span>{company.join(" · ")}</span>}
          {COMPANY.email && <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>}
        </address>
      )}

      <LanguageSwitcher className="lang--footer" />

      <p className="legal">{t("footer.rights")}</p>

      <a
        className="built-by"
        href="https://www.treatlymarketing.se"
        target="_blank"
        rel="noopener"
        aria-label={`${t("footer.builtBy")} Tab Marketing`}
      >
        <span className="built-by__text">{t("footer.builtBy")}</span>
        <span className="built-by__brand" aria-hidden="true">
          <Image src="/tab-marketing.png" alt="" className="built-by__badge" width={108} height={72} />
          <span className="built-by__name">Marketing</span>
        </span>
      </a>
    </footer>
  );
}
