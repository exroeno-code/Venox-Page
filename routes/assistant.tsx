import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { ACCOUNTS_CONFIGURED } from "@/lib/auth-core";
import { submitFeedback, FeedbackError } from "@/lib/feedback-core";
import { joinWaitlist, WaitlistError } from "@/lib/waitlist-core";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "AI Assistant concept — VEXON TECH";
const DESC =
  "VEXON TECH is exploring an AI assistant concept for Kenyan small-business operators who handle customer enquiries. It remains an idea, not a live product.";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("assistant"),
    ],
  }),
  component: Assistant,
});

const FIELD =
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";
const STAGES = ["Idea", "Prototype", "Pilot", "Live"];

const QUESTIONS = [
  [
    "Who might it be for?",
    "Hypothesis: Kenyan small-business operators who handle customer enquiries themselves.",
  ],
  [
    "What problem might it address?",
    "Repeated customer questions can take time to answer consistently. This is a problem hypothesis, not a validated finding.",
  ],
  [
    "What is the proposed difference?",
    "We do not yet have a proven reason to choose this over ChatGPT or Claude. One hypothesis is a guided workflow that uses a business's own context to prepare replies and follow-ups. We need to test whether that is useful.",
  ],
] as const;

function Assistant() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [feedbackPending, setFeedbackPending] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("website") ?? "") !== "") {
      setJoined(true);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await joinWaitlist({
        email: String(data.get("email") ?? ""),
        name: String(data.get("name") ?? ""),
      });
      form.reset();
      setJoined(true);
    } catch (err) {
      setError(
        err instanceof WaitlistError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onFeedbackSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company") ?? "") !== "") {
      setFeedbackSent(true);
      return;
    }
    setFeedbackPending(true);
    setFeedbackError(null);
    try {
      await submitFeedback({
        problem: String(data.get("problem") ?? ""),
        current_approach: String(data.get("current_approach") ?? ""),
        useful_result: String(data.get("useful_result") ?? ""),
        email: String(data.get("feedback_email") ?? ""),
      });
      form.reset();
      setFeedbackSent(true);
    } catch (err) {
      setFeedbackError(
        err instanceof FeedbackError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setFeedbackPending(false);
    }
  }

  return (
    <PageShell tag="[ AI ASSISTANT · CONCEPT ]">
      <section className="pt-8 md:pt-12">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ FIRST TECHNOLOGY CONCEPT ]
        </span>
        <h1 className="in mt-4 max-w-5xl font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
          <Words
            text="An AI assistant for customer replies"
            className="text-chrome"
          />
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          We are exploring a concept for Kenyan small-business operators who
          handle customer enquiries themselves. It remains an idea — not yet
          built or validated.
        </p>

        <div className="mt-12 max-w-xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]">
            <span className="live-dot size-2 rounded-full bg-glow" /> Current
            status: Idea
          </div>
          <ol className="grid grid-cols-4 gap-2">
            {STAGES.map((s, i) => (
              <li
                key={s}
                className={`min-w-0 rounded-md border p-1 sm:p-4 ${i === 0 ? "border-glow bg-glow/10" : "opacity-40"}`}
              >
                <div className="font-mono text-[0.65rem] text-muted-foreground">
                  0{i + 1}
                </div>
                <div className="mt-4 break-words font-display text-[0.5rem] font-semibold uppercase leading-tight sm:mt-6 sm:text-sm md:text-base">
                  {s}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-4 py-20 md:grid-cols-3">
        {QUESTIONS.map(([t, d], i) => (
          <div
            key={t}
            className="rounded-lg border bg-card/60 p-8 backdrop-blur-md"
          >
            <span className="font-mono text-xs text-muted-foreground">
              [ 0{i + 1} ]
            </span>
            <h2 className="mt-10 font-display text-2xl font-semibold uppercase">
              {t}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {d}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-16 rounded-lg border bg-card/60 p-6 sm:p-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ VALIDATION STATUS ]
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase">
          What we can report today
        </h2>
        <ul className="mt-6 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="border-t pt-4">
            <strong className="block text-foreground">Interviews</strong>Count
            not reported.
          </li>
          <li className="border-t pt-4">
            <strong className="block text-foreground">Waitlist</strong>Count not
            published.
          </li>
          <li className="border-t pt-4">
            <strong className="block text-foreground">Pilot</strong>None
            running. The concept remains at Idea.
          </li>
        </ul>
      </section>

      <section id="feedback" className="scroll-mt-8 pb-16">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ SHARE A PROBLEM ]
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            <span className="text-chrome">Help us test the problem</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Tell us about a real customer-enquiry task. This is feedback on an
            idea, not access to a product or pilot. Please do not include
            sensitive information.
          </p>
          {feedbackSent ? (
            <p
              role="status"
              className="mt-8 text-sm leading-relaxed text-muted-foreground"
            >
              Thank you. Your feedback was submitted.
            </p>
          ) : !ACCOUNTS_CONFIGURED ? (
            <p
              role="status"
              className="mt-8 text-sm leading-relaxed text-muted-foreground"
            >
              The feedback form is unavailable right now. Please try again later
              or use the{" "}
              <Link
                to="/contact"
                className="text-foreground underline underline-offset-4"
              >
                contact page
              </Link>
              .
            </p>
          ) : (
            <form
              onSubmit={onFeedbackSubmit}
              noValidate
              className="mt-8 space-y-5"
            >
              <div>
                <label htmlFor="fb-problem" className={LABEL}>
                  1. What customer-enquiry task or problem takes your time?
                </label>
                <textarea
                  id="fb-problem"
                  name="problem"
                  required
                  maxLength={1000}
                  rows={3}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="fb-approach" className={LABEL}>
                  2. How do you handle it now?
                </label>
                <textarea
                  id="fb-approach"
                  name="current_approach"
                  required
                  maxLength={1000}
                  rows={3}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="fb-result" className={LABEL}>
                  3. What would a useful result look like?
                </label>
                <textarea
                  id="fb-result"
                  name="useful_result"
                  required
                  maxLength={1000}
                  rows={3}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="fb-email" className={LABEL}>
                  Email (optional)
                </label>
                <input
                  id="fb-email"
                  name="feedback_email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  className={FIELD}
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                If you provide an email, we may use it to follow up about this
                feedback. See our{" "}
                <Link to="/privacy" className="underline underline-offset-4">
                  privacy notice
                </Link>
                .
              </p>
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              >
                <label htmlFor="fb-company">Leave this field empty</label>
                <input
                  id="fb-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              {feedbackError && (
                <p
                  role="alert"
                  className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {feedbackError}
                </p>
              )}
              <button
                type="submit"
                disabled={feedbackPending}
                className={BUTTON}
              >
                {feedbackPending ? "Sending…" : "Send feedback"}
              </button>
            </form>
          )}
        </div>
      </section>

      <section id="waitlist" className="scroll-mt-8 pb-8">
        <div className="mx-auto max-w-xl rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ WAITLIST ]
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            <span className="text-chrome">Follow the build</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Join the waitlist for updates about the AI assistant concept. You
            can ask to be removed at any time. Joining the list does not provide
            access to a product or confirm a launch date.
          </p>

          {joined ? (
            <div role="status" className="mt-8">
              <h3 className="font-display text-2xl font-semibold uppercase">
                You are on the list
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Thank you. We will email you when there is something real to
                share. See where things stand on the{" "}
                <Link
                  to="/roadmap"
                  className="text-foreground underline underline-offset-4"
                >
                  roadmap
                </Link>
                .
              </p>
            </div>
          ) : !ACCOUNTS_CONFIGURED ? (
            <div role="status" className="mt-8">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The waitlist is not available right now. You can still reach us
                on the{" "}
                <Link
                  to="/contact"
                  className="text-foreground underline underline-offset-4"
                >
                  contact page
                </Link>
                .
              </p>
              {import.meta.env.DEV && (
                <p
                  role="alert"
                  className="mt-6 rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
                >
                  Set <code>VITE_SUPABASE_URL</code> and{" "}
                  <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in{" "}
                  <code>.env.local</code>.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label htmlFor="wl-name" className={LABEL}>
                  Name (optional)
                </label>
                <input
                  id="wl-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="wl-email" className={LABEL}>
                  Email
                </label>
                <input
                  id="wl-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={FIELD}
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              >
                <label htmlFor="wl-website">Leave this field empty</label>
                <input
                  id="wl-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </p>
              )}
              <button type="submit" disabled={pending} className={BUTTON}>
                {pending ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
