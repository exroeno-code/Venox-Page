import { describe, expect, it } from "vitest";

import { ApplicationError, NOTE_MAX, validateApplication } from "@/lib/application-core";
import { LEVELS } from "@/lib/programmes";

const ok = {
  name: "  Jane   Wanjiku ",
  email: " Jane@Example.com ",
  phone: "+254 798 303 978",
  level: "diploma",
  programme: "Diploma in Software Engineering",
  note: "  ",
};

describe("validateApplication", () => {
  it("trims and normalises a good application", () => {
    expect(validateApplication(ok)).toEqual({
      name: "Jane Wanjiku",
      email: "jane@example.com",
      phone: "+254798303978",
      level: "diploma",
      programme: "Diploma in Software Engineering",
      note: null,
    });
  });

  it.each([
    [{ ...ok, programme: "Diploma in Basket Weaving" }, "programme"],
    [{ ...ok, level: "degree" }, "programme"],
    [{ ...ok, name: " " }, "name"],
    [{ ...ok, email: "nope" }, "email"],
    [{ ...ok, phone: "123" }, "phone"],
    [{ ...ok, note: "x".repeat(NOTE_MAX + 1) }, "or fewer"],
  ])("rejects bad input (%#)", (input, text) => {
    expect(() => validateApplication(input)).toThrow(ApplicationError);
    expect(() => validateApplication(input)).toThrow(new RegExp(text, "i"));
  });

  it("accepts every listed programme", () => {
    for (const l of LEVELS) for (const p of l.programmes) expect(() => validateApplication({ ...ok, level: l.id, programme: p.name })).not.toThrow();
  });
});
