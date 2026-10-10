import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/i18n/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/newsletter/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
