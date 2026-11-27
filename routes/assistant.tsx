import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { FormShell } from "@/components/vexon/FormShell";
import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { ACCOUNTS_CONFIGURED } from "@/lib/auth-core";
import { joinWaitlist, WaitlistError } from "@/lib/waitlist-core";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "A practical AI assistant idea — VEXVANO LABS";
const DESC =
  "We're exploring an AI assistant to help turn questions and tasks into useful next steps. It's an idea, not built or validated yet. Follow along with VEXVANO LABS.";

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
  "field-input w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "field-label mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "form-btn bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

const STAGES = ["Idea", "Prototype", "Pilot", "Live"];

const QUESTIONS = [
  [
    "Who might it help?",
    "Developers and everyday users looking for a useful draft, solution or next step from a question or task.",
  ],
  [
    "What do we need to learn?",
    "Whether people want this, which tasks matter most, and what would help them trust it.",
  ],
  [
    "What it isn't (yet)",
    "It hasn't been built, launched or validated. There's nothing here to use today.",
  ],
] as const;

function Assistant() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Hidden "website" field: people never fill it in, simple bots do.
    if (String(data.get("website") ?? "") !== "") {
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

  return (
    <PageShell tag="[ AI ASSISTANT · CONCEPT ]">
      <section className="pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ OUR FIRST TECHNOLOGY IDEA ]
        </span>
        <h1 className="mt-4 max-w-5xl font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
          <Words
            text="An AI assistant to help you find a useful next step"
            className="text-chrome"
          />
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          We’re exploring a general-purpose assistant that could help developers
          and everyday users turn a question or task into a useful draft,
          solution or next step. It’s still an idea — not built or validated
          yet.
        </p>

        <div className="mt-12 max-w-xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]">
            <span className="live-dot size-2 rounded-full bg-glow" /> Where it
            stands: Idea
          </div>
          <ol className="grid grid-cols-4 gap-2">
            {STAGES.map((s, i) => (
              <li
                key={s}
                className={`rounded-md border p-4 ${i === 0 ? "border-glow bg-glow/10" : "opacity-40"}`}
              >
                <div className="font-mono text-[0.65rem] text-muted-foreground">
                  0{i + 1}
                </div>
                <div className="mt-6 font-display text-sm font-semibold uppercase md:text-base">
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

      <section id="waitlist" className="scroll-mt-8 pb-8">
        <FormShell
          title="Follow along"
          reason="We’ll send occasional email updates about this AI assistant idea. You can unsubscribe or ask us to remove you at any time."
        >
          {joined ? (
            <div role="status">
              <h3 className="font-display text-2xl font-semibold uppercase">
                You’re on the list
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Thanks for signing up. We’ll email when there’s something real
                to share. In the meantime, see where things stand on the{" "}
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
            <div role="status">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The waitlist isn’t available right now. You can still reach us
                through the{" "}
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
            <form
              onSubmit={onSubmit}
              noValidate
              className="form-shell form-stagger space-y-5"
            >
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
              {/* Honeypot: hidden from people and screen readers. */}
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
                  className="form-error error-message rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={BUTTON}
                data-loading={pending}
              >
                {pending ? "Joining…" : "Sign me up"}
              </button>
            </form>
          )}
        </FormShell>
      </section>
    </PageShell>
  );
}
