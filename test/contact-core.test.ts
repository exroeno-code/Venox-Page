import { describe, expect, it } from "vitest";

import { ContactError, MESSAGE_MAX, validateContact } from "@/lib/contact-core";

const ok = { name: "  Jane   Wanjiku ", email: " Jane@Example.com ", message: "  Hello, I would like to talk.  " };

describe("validateContact", () => {
  it("trims and normalises a good message", () => {
    expect(validateContact(ok)).toEqual({
      name: "Jane Wanjiku",
      email: "jane@example.com",
      message: "Hello, I would like to talk.",
    });
  });

  it.each([
    [{ ...ok, name: "   " }, "name"],
    [{ ...ok, email: "not-an-email" }, "email"],
    [{ ...ok, message: "short" }, "at least"],
    [{ ...ok, message: "x".repeat(MESSAGE_MAX + 1) }, "or fewer"],
  ])("rejects bad input (%#)", (input, text) => {
    expect(() => validateContact(input)).toThrow(ContactError);
    expect(() => validateContact(input)).toThrow(new RegExp(text, "i"));
  });
});
