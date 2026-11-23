import { describe, expect, it } from "vitest";

import { validateWaitlist, WaitlistError } from "@/lib/waitlist-core";

describe("validateWaitlist", () => {
  it("lowercases the email and treats an empty name as none", () => {
    expect(validateWaitlist({ email: " Jane@Example.COM ", name: "   " })).toEqual({ email: "jane@example.com", name: null });
  });

  it("tidies the name", () => {
    expect(validateWaitlist({ email: "a@b.co", name: "  Jane   Wanjiku " }).name).toBe("Jane Wanjiku");
  });

  it.each([["nope"], ["a@b"], [""]])("rejects the email %j", (email) => {
    expect(() => validateWaitlist({ email })).toThrow(WaitlistError);
  });

  it("rejects an over-long name", () => {
    expect(() => validateWaitlist({ email: "a@b.co", name: "x".repeat(81) })).toThrow(/80 characters/);
  });
});
