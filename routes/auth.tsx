import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

import { ParticleField } from "@/components/vexon/ParticleField";
import { Wordmark } from "@/components/vexon/Wordmark";
import {
  ACCOUNTS_CONFIGURED,
  AuthError,
  GOOGLE_ENABLED,
  MIN_PASSWORD_LENGTH,
  initials,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
} from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";

const TITLE = "Vexon account — VEXON TECH";
const DESC = "Create a Vexon account or sign in to follow the VEXON TECH build.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: AuthPage,
});

type Mode = "create" | "signin";

const FIELD =
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL = "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("create");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set after sign-up when Supabase wants the email confirmed first.
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    void run(async () => {
      if (mode === "create") {
        const { needsConfirmation } = await signUp({ name: String(data.get("name") ?? ""), email, password });
        if (needsConfirmation) {
          setConfirmEmail(email.trim());
          return;
        }
      } else {
        await signIn({ email, password });
      }
      await navigate({ to: "/" });
    });
  }

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden px-5 pb-10 pt-6 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <ParticleField className="h-full w-full" density={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_0%,transparent_60%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between">
        <Link to="/" className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          <Wordmark />
        </Link>
        <Link
          to="/"
          className="group flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to site
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      <div className="relative z-10 m-auto w-full max-w-md py-12">
        <div className="rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            <span className="text-chrome">Vexon account</span>
          </h1>

          {auth.status === "signed-in" ? (
            <div className="mt-8">
              <div className="flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-full border border-glow/60 font-display text-lg font-semibold">
                  {initials(auth.user)}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-xl font-semibold">{auth.user.name}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{auth.user.email}</div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link
                  to="/"
                  className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
                >
                  Go to site
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : confirmEmail ? (
            <div className="mt-8" role="status">
              <h2 className="font-display text-2xl font-semibold uppercase">Check your email</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                We sent a confirmation link to <span className="break-all text-foreground">{confirmEmail}</span>. Open it to
                finish creating your account, then sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirmEmail(null);
                  switchMode("signin");
                }}
                className={`${BUTTON} mt-8`}
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <>
              <div role="tablist" aria-label="Account" className="mt-8 grid grid-cols-2 gap-1 rounded-md border p-1">
                {(
                  [
                    ["create", "Create account"],
                    ["signin", "Sign in"],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    id={`tab-${m}`}
                    aria-selected={mode === m}
                    aria-controls="auth-panel"
                    onClick={() => switchMode(m)}
                    className={`rounded-[0.3rem] px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-glow/60 ${
                      mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {mode === "create"
                  ? "Create a Vexon account to follow the build as it develops."
                  : "Sign in to your Vexon account."}
              </p>

              {import.meta.env.DEV && !ACCOUNTS_CONFIGURED && (
                <p role="alert" className="mt-6 rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  Accounts are not connected. Copy <code>.env.example</code> to <code>.env.local</code> and add your
                  Supabase URL and key.
                </p>
              )}

              <form
                id="auth-panel"
                role="tabpanel"
                aria-labelledby={`tab-${mode}`}
                key={mode}
                onSubmit={onSubmit}
                noValidate
                className="mt-6 space-y-5"
              >
                {mode === "create" && (
                  <div>
                    <label htmlFor="name" className={LABEL}>
                      Name
                    </label>
                    <input id="name" name="name" type="text" autoComplete="name" required maxLength={60} className={FIELD} />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className={LABEL}>
                    Email
                  </label>
                  <input id="email" name="email" type="email" autoComplete="email" required className={FIELD} />
                </div>
                <div>
                  <label htmlFor="password" className={LABEL}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "create" ? "new-password" : "current-password"}
                    required
                    aria-describedby={mode === "create" ? "password-hint" : undefined}
                    className={FIELD}
                  />
                  {mode === "create" && (
                    <p id="password-hint" className="mt-2 text-xs text-muted-foreground">
                      At least {MIN_PASSWORD_LENGTH} characters.
                    </p>
                  )}
                </div>

                {error && (
                  <p role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={pending} className={BUTTON}>
                  {pending ? (mode === "create" ? "Creating account…" : "Signing in…") : mode === "create" ? "Create account" : "Sign in"}
                </button>
              </form>

              {GOOGLE_ENABLED && (
                <>
                  <div className="my-6 flex items-center gap-4 font-mono text-[0.7rem] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void run(signInWithGoogle)}
                    className="w-full rounded-md border px-7 py-3.5 text-sm font-medium outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-glow/60 disabled:opacity-60"
                  >
                    Continue with Google
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
