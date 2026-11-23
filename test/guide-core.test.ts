import { describe, expect, it } from "vitest";

import { MAX_CHARS, MAX_MESSAGES, createRateLimiter, localAnswer, sanitizeMessages } from "@/lib/guide-core";

describe("sanitizeMessages", () => {
  it("accepts a normal chat that ends with a user message", () => {
    const m = [
      { role: "user", content: " hi " },
      { role: "assistant", content: "Hello" },
      { role: "user", content: "classes?" },
    ];
    expect(sanitizeMessages(m)).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "Hello" },
      { role: "user", content: "classes?" },
    ]);
  });

  it.each([
    ["not an array", "hello"],
    ["empty", []],
    ["too many", Array.from({ length: MAX_MESSAGES + 1 }, () => ({ role: "user", content: "x" }))],
    ["bad role", [{ role: "system", content: "x" }]],
    ["too long", [{ role: "user", content: "x".repeat(MAX_CHARS + 1) }]],
    ["blank", [{ role: "user", content: "   " }]],
    ["ends with assistant", [{ role: "user", content: "a" }, { role: "assistant", content: "b" }]],
  ])("rejects %s", (_name, input) => {
    expect(sanitizeMessages(input)).toBeNull();
  });
});

describe("createRateLimiter", () => {
  it("blocks after the limit and recovers after the window", () => {
    const allow = createRateLimiter(2, 1000);
    expect(allow("a", 0)).toBe(true);
    expect(allow("a", 10)).toBe(true);
    expect(allow("a", 20)).toBe(false);
    expect(allow("b", 20)).toBe(true);
    expect(allow("a", 1500)).toBe(true);
  });
});

describe("localAnswer", () => {
  it.each([
    ["How do I apply for a diploma?", "/learning"],
    ["where is the whatsapp group", "/community"],
    ["can you teach me forex trading", "/trading"],
    ["what is your email", "/contact"],
    ["tell me about the roadmap", "/roadmap"],
    ["gibberish zzz", "/contact"],
  ])("answers %s with a link to %s", (q, path) => {
    expect(localAnswer(q)).toContain(`(${path})`);
  });
});
