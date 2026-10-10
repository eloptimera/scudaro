import Image from "next/image";
import { COMPANY } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";
import { getPolicies } from "@/lib/shopify";
import LanguageSwitcher from "./LanguageSwitcher";
import LocalLink from "./LocalLink";
import Newsletter from "./Newsletter";

export default async function Footer({ locale }: { locale: Locale }) {
  const [policies, t] = await Promise.all([getPolicies(locale), getT(locale)]);
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
        {policies.map((p) => (
          <LocalLink key={p.handle} href={`/policies/${p.handle}`}>{p.title}</LocalLink>
        ))}
        <LocalLink href="/cookies">{t("footer.cookies")}</LocalLink>
      </nav>

      <LanguageSwitcher className="lang--footer" />

      {(company.length > 0 || COMPANY.email) && (
        <address className="footer-company">
          {company.length > 0 && <span>{company.join(" · ")}</span>}
          {COMPANY.email && <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>}
        </address>
      )}

      <p className="legal">{t("footer.rights")}</p>
    </footer>
  );
}
