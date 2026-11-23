import { describe, expect, it } from "vitest";

import { SITE } from "@/lib/site-config";

describe("site config", () => {
  it("has two valid contact emails", () => {
    expect(SITE.emails).toHaveLength(2);
    for (const e of SITE.emails) expect(e).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("uses the same Kenyan number everywhere, without a leading 0 after +254", () => {
    expect(SITE.phone.tel).toBe("+254798303978");
    expect(SITE.whatsappUrl).toBe("https://wa.me/254798303978");
    expect(SITE.phone.display.replace(/\D/g, "")).toBe("254798303978");
  });

  it("has WhatsApp community links", () => {
    expect(SITE.community.tradingGroup).toMatch(/^https:\/\/chat\.whatsapp\.com\/\w+$/);
    expect(SITE.community.group).toMatch(/^https:\/\/chat\.whatsapp\.com\/\w+$/);
    expect(SITE.community.channel).toMatch(/^https:\/\/whatsapp\.com\/channel\/\w+$/);
  });

  it("links to the Instagram account", () => {
    expect(SITE.instagram.url).toContain(`/${SITE.instagram.handle}`);
  });
});
