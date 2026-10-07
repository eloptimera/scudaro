import Image from "next/image";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <Image src="/logo-white.png" alt="SCUDARO" className="footer-logo" width={647} height={213} />
      <Newsletter />
      <p className="legal">© 2026 SCUDARO. All rights reserved.</p>
    </footer>
  );
}
