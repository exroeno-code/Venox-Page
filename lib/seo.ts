/** Share-preview images, sitemap and robots helpers (pure, SSR-safe). */

/** Public pages listed in sitemap.xml. Sign-in, profile and API routes are left out on purpose. */
export const SITEMAP_PATHS = [
  "/",
  "/learning",
  "/trading",
  "/community",
  "/assistant",
  "/roadmap",
  "/goods-trade",
  "/leadership",
  "/contact",
  "/privacy",
] as const;

export type OgImage = "default" | "learning" | "trading" | "community" | "assistant";

/** The live address, e.g. https://vexon.tech (set VITE_SITE_URL in Vercel). No trailing slash. */
export function siteUrl(fallback = ""): string {
  const raw = (import.meta.env.VITE_SITE_URL ?? "").trim() || fallback;
  return raw.replace(/\/+$/, "");
}

/** og:image and twitter:image tags. Crawlers need an absolute address, so VITE_SITE_URL should be set. */
export function ogImageMeta(image: OgImage = "default"): Record<string, string>[] {
  const url = `${siteUrl()}/og/og-${image}.png`;
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:image", content: url },
  ];
}

export function sitemapXml(origin: string, lastmod: string): string {
  const base = origin.replace(/\/+$/, "");
  const urls = SITEMAP_PATHS.map(
    (p) => `  <url><loc>${base}${p === "/" ? "/" : p}</loc><lastmod>${lastmod}</lastmod></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(origin: string): string {
  const base = origin.replace(/\/+$/, "");
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /profile\nDisallow: /auth\n\nSitemap: ${base}/sitemap.xml\n`;
}
