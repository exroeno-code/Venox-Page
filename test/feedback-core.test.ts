import { describe, expect, it } from "vitest";

import {
  FEEDBACK_MAX,
  FeedbackError,
  validateFeedback,
} from "@/lib/feedback-core";

const valid = {
  problem: "Customers ask the same questions repeatedly.",
  current_approach: "I write each answer from scratch.",
  useful_result: "A clear reply I can review and send.",
};

describe("validateFeedback", () => {
  it("accepts all answers without collecting an email", () => {
    expect(validateFeedback(valid)).toEqual({ ...valid, email: null });
  });

  it("normalises an optional email", () => {
    expect(
      validateFeedback({ ...valid, email: " Owner@Example.COM " }).email,
    ).toBe("owner@example.com");
  });

  it.each([
    [{ ...valid, problem: "   " }, "problem"],
    [{ ...valid, current_approach: "" }, "current approach"],
    [{ ...valid, useful_result: "" }, "useful result"],
    [{ ...valid, email: "not-an-email" }, "valid email"],
    [
      { ...valid, problem: "x".repeat(FEEDBACK_MAX + 1) },
      "characters or fewer",
    ],
  ])("rejects invalid input (%#)", (input, message) => {
    expect(() => validateFeedback(input)).toThrow(FeedbackError);
    expect(() => validateFeedback(input)).toThrow(new RegExp(message, "i"));
  });
});
