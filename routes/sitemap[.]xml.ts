import { createFileRoute } from "@tanstack/react-router";

import { siteUrl, sitemapXml } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) =>
        new Response(sitemapXml(siteUrl(new URL(request.url).origin), new Date().toISOString().slice(0, 10)), {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        }),
    },
  },
});
