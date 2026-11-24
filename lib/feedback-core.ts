/**
 * AI-concept problem feedback — public form logic (SSR-safe).
 * Submissions are stored in `assistant_feedback`; only inserts are allowed from the public app.
 */
import { getClient } from "./auth-core";

export const FEEDBACK_MAX = 1000;

export class FeedbackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackError";
  }
}

export type FeedbackInput = {
  problem: string;
  current_approach: string;
  useful_result: string;
  email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFeedback(
  input: FeedbackInput,
): FeedbackInput & { email: string | null } {
  const problem = input.problem.trim();
  const current_approach = input.current_approach.trim();
  const useful_result = input.useful_result.trim();
  const emailValue = (input.email ?? "").trim().toLowerCase();

  for (const [label, value] of [
    ["problem", problem],
    ["current approach", current_approach],
    ["useful result", useful_result],
  ] as const) {
    if (!value) throw new FeedbackError(`Please describe the ${label}.`);
    if (value.length > FEEDBACK_MAX)
      throw new FeedbackError(
        `Each answer must be ${FEEDBACK_MAX} characters or fewer.`,
      );
  }
  if (emailValue && (!EMAIL_RE.test(emailValue) || emailValue.length > 254)) {
    throw new FeedbackError(
      "Please enter a valid email address or leave it blank.",
    );
  }

  return {
    problem,
    current_approach,
    useful_result,
    email: emailValue || null,
  };
}

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const clean = validateFeedback(input);
  let supabase = null;
  try {
    supabase = await getClient();
  } catch {
    /* handled below */
  }
  if (!supabase)
    throw new FeedbackError(
      "The feedback form is unavailable right now. Please try again later.",
    );

  const { error } = await supabase.from("assistant_feedback").insert(clean);
  if (error) {
    console.error("Assistant feedback submission failed.", error);
    throw new FeedbackError(
      "We could not save your feedback. Please try again in a moment.",
    );
  }
}
