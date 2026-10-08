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
import { CurrencyProvider } from "@/components/CurrencyProvider";
import Price from "@/components/Price";
import { getEurPerSek } from "@/lib/currency";
import { isShopifyEnabled, storeDomain } from "@/lib/shopify";

export const metadata: Metadata = {
  title: { default: "SCUDARO — Streetwear built for the track", template: "%s — SCUDARO" },
  description: "SCUDARO. Oversized streetwear with racing in its blood. Collection 01 is out now.",
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const eurPerSek = await getEurPerSek();
  const accountUrl = isShopifyEnabled ? `https://${storeDomain}/account` : null;

  return (
    <html lang="en">
      <body>
        <CurrencyProvider eurPerSek={eurPerSek}>
          <CartProvider>
            <div className="announce">
              Free shipping over <Price money={{ amount: 799, currencyCode: "SEK" }} /> &nbsp;•&nbsp; Collection 01 is out now
            </div>
            <Header accountUrl={accountUrl} />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
