import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/800-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "../globals.css";
import CartDrawer from "@/components/CartDrawer";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import I18nProvider from "@/components/I18nProvider";
import { dirOf, isLocale } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/i18n/seo";
import { getMessages } from "@/lib/i18n/server";
import { isShopifyEnabled, storeDomain } from "@/lib/shopify";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = await getMessages(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: m["meta.title"], template: "%s — SCUDARO" },
    description: m["meta.description"],
  };
}

export const viewport: Viewport = { themeColor: "#0b0b0c" };

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);
  const accountUrl = isShopifyEnabled ? `https://${storeDomain}/account` : null;

  return (
    <html lang={locale} dir={dirOf(locale)}>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <CartProvider>
            <Header accountUrl={accountUrl} />
            <main>{children}</main>
            <Footer locale={locale} />
            <CartDrawer />
          </CartProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
