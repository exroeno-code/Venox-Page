import { describe, expect, it } from "vitest";

import { SITEMAP_PATHS, ogImageMeta, robotsTxt, sitemapXml } from "@/lib/seo";

describe("sitemap and robots", () => {
  it("lists every public page with absolute URLs and leaves out private ones", () => {
    const xml = sitemapXml("https://example.com/", "2026-11-23");
    for (const p of SITEMAP_PATHS) expect(xml).toContain(`<loc>https://example.com${p}</loc>`);
    expect(xml).not.toContain("/auth");
    expect(xml).not.toContain("/profile");
    expect(xml).not.toContain("/api/");
  });

  it("points robots.txt at the sitemap and hides private routes", () => {
    const txt = robotsTxt("https://example.com");
    expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
    expect(txt).toContain("Disallow: /api/");
  });
});

describe("ogImageMeta", () => {
  it("returns og and twitter image tags for the chosen image", () => {
    const tags = ogImageMeta("learning");
    expect(tags.find((t) => t["property"] === "og:image")?.["content"]).toMatch(/\/og\/og-learning\.png$/);
    expect(tags.find((t) => t["name"] === "twitter:image")).toBeTruthy();
  });
});
