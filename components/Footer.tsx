import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/config";
import { getPolicies } from "@/lib/shopify";
import Newsletter from "./Newsletter";

export default async function Footer() {
  const policies = await getPolicies();
  const company = [
    COMPANY.name,
    COMPANY.orgNumber && `Org. no. ${COMPANY.orgNumber}`,
    COMPANY.address,
  ].filter(Boolean);

  return (
    <footer className="site-footer" id="contact">
      <Image src="/logo-white.png" alt="SCUDARO" className="footer-logo" width={647} height={213} />
      <Newsletter />

      <nav className="footer-links" aria-label="Legal">
        {policies.map((p) => (
          <Link key={p.handle} href={`/policies/${p.handle}`}>{p.title}</Link>
        ))}
        <Link href="/cookies">Cookies</Link>
      </nav>

      {(company.length > 0 || COMPANY.email) && (
        <address className="footer-company">
          {company.length > 0 && <span>{company.join(" · ")}</span>}
          {COMPANY.email && <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>}
        </address>
      )}

      <p className="legal">© 2026 SCUDARO. All rights reserved.</p>
    </footer>
  );
}
