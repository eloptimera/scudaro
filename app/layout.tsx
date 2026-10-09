import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/800-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatMoney } from "@/lib/format";
import { isShopifyEnabled, storeDomain } from "@/lib/shopify";

export const metadata: Metadata = {
  title: { default: "SCUDARO — Streetwear built for the track", template: "%s — SCUDARO" },
  description: "SCUDARO. Oversized streetwear with racing in its blood. Collection 01 is out now.",
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const accountUrl = isShopifyEnabled ? `https://${storeDomain}/account` : null;

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="announce">
            Free shipping over {formatMoney(FREE_SHIPPING_THRESHOLD)} &nbsp;•&nbsp; Collection 01 is out now
          </div>
          <Header accountUrl={accountUrl} />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
