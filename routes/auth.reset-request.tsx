import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

import { Wordmark } from "@/components/vexon/Wordmark";
import {
  ACCOUNTS_CONFIGURED,
  AuthError,
  sendPasswordReset,
} from "@/lib/auth-core";
import { ParticleField } from "@/components/vexon/ParticleField";

const TITLE = "Reset your password — VEXVANO LABS";
const DESC = "Get a password reset link for your VEXVANO LABS account.";

export const Route = createFileRoute("/auth/reset-request")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetRequestPage,
});

const FIELD =
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

function ResetRequestPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    setPending(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden px-5 pb-10 pt-6 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <ParticleField className="h-full w-full" density={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_0%,transparent_60%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-3xl font-extrabold tracking-tight md:text-4xl"
        >
          <Wordmark />
        </Link>
        <Link
          to="/auth"
          className="group flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to sign in
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      <div className="relative z-10 m-auto w-full max-w-md py-12">
        <div className="rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            <span className="text-chrome">Reset password</span>
          </h1>

          {import.meta.env.DEV && !ACCOUNTS_CONFIGURED && (
            <p
              role="alert"
              className="mt-6 rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
            >
              Accounts aren’t connected yet. Copy <code>.env.example</code> to{" "}
              <code>.env.local</code> and add your Supabase URL and key.
            </p>
          )}

          {sent ? (
            <div role="status" className="mt-8">
              <h2 className="font-display text-2xl font-semibold uppercase">
                Check your email
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                If there’s an account for that email, we’ve sent a password
                reset link. Open it to choose a new password.
              </p>
              <Link to="/auth" className={`${BUTTON} mt-8`}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Enter the email address on your account and we’ll send you a
                link to reset your password.
              </p>
              <div>
                <label htmlFor="email" className={LABEL}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={FIELD}
                />
              </div>
              <button type="submit" disabled={pending} className={BUTTON}>
                {pending ? "Sending…" : "Email me a reset link"}
              </button>
              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
