import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

import { ParticleField } from "@/components/vexon/ParticleField";
import { Wordmark } from "@/components/vexon/Wordmark";
import { InstagramIcon, WhatsAppIcon } from "@/components/vexon/SocialIcons";
import {
  ACCOUNTS_CONFIGURED,
  AuthError,
  GOOGLE_ENABLED,
  MIN_PASSWORD_LENGTH,
  initials,
  sendWhatsAppOtp,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  verifyWhatsAppOtp,
} from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";
import { SITE } from "@/lib/site-config";

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
  "field-input w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL = "field-label mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "form-btn bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("create");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsAppPhone, setWhatsAppPhone] = useState("");
  const [otpTarget, setOtpTarget] = useState<string | null>(null);
  const [whatsAppCode, setWhatsAppCode] = useState("");
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

  function onRequestWhatsAppOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void run(async () => {
      await sendWhatsAppOtp(whatsAppPhone);
      setOtpTarget(whatsAppPhone);
      setWhatsAppCode("");
    });
  }

  function onVerifyWhatsAppOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otpTarget) return;
    void run(async () => {
      await verifyWhatsAppOtp(otpTarget, whatsAppCode);
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
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {auth.user.email || auth.user.phone || "Vexon account"}
                  </div>
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
                className="form-shell form-stagger mt-6 space-y-5"
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

                <button type="submit" disabled={pending} className={BUTTON} data-loading={pending}>
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

              {/* Social login buttons - WhatsApp & Instagram */}
              <div className="my-6 flex items-center gap-4 font-mono text-[0.7rem] text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="whatsapp-login-btn flex items-center justify-center gap-3 rounded-md border px-7 py-3.5 text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-green-500/60"
                  style={{
                    borderColor: "oklch(0.45 0.15 145 / 0.4)",
                    background: "oklch(0.45 0.15 145 / 0.1)",
                    color: "oklch(0.45 0.15 145)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.45 0.15 145)";
                    e.currentTarget.style.background = "oklch(0.45 0.15 145)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.45 0.15 145 / 0.4)";
                    e.currentTarget.style.background = "oklch(0.45 0.15 145 / 0.1)";
                    e.currentTarget.style.color = "oklch(0.45 0.15 145)";
                  }}
                >
                  <WhatsAppIcon className="size-5" /> WhatsApp
                </a>
                <a
                  href={SITE.instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="instagram-login-btn flex items-center justify-center gap-3 rounded-md border px-7 py-3.5 text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-pink-500/60"
                  style={{
                    borderColor: "oklch(0.55 0.25 340 / 0.4)",
                    background: "oklch(0.55 0.25 340 / 0.1)",
                    color: "oklch(0.55 0.25 340)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.55 0.25 340)";
                    e.currentTarget.style.background = "linear-gradient(45deg, oklch(0.55 0.25 340), oklch(0.65 0.22 20), oklch(0.55 0.25 340))";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "oklch(0.55 0.25 340 / 0.4)";
                    e.currentTarget.style.background = "oklch(0.55 0.25 340 / 0.1)";
                    e.currentTarget.style.color = "oklch(0.55 0.25 340)";
                  }}
                >
                  <InstagramIcon className="size-5" /> Instagram
                </a>
              </div>

              {ACCOUNTS_CONFIGURED && (
                <section className="mt-6 border-t pt-6" aria-label="WhatsApp sign-in">
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    Or continue with a one-time code on WhatsApp. We'll create an account if this number is new.
                  </p>
                  {otpTarget ? (
                    <form onSubmit={onVerifyWhatsAppOtp} className="form-stagger space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to <span className="text-foreground">{otpTarget}</span>.
                      </p>
                      <div>
                        <label htmlFor="whatsapp-code" className={LABEL}>
                          WhatsApp verification code
                        </label>
                        <input
                          id="whatsapp-code"
                          name="whatsapp-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                          value={whatsAppCode}
                          onChange={(event) => setWhatsAppCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                          className={FIELD}
                        />
                      </div>
                      <button type="submit" disabled={pending || whatsAppCode.length !== 6} className={BUTTON} data-loading={pending}>
                        {pending ? "Verifying code…" : "Verify code"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTarget(null);
                          setWhatsAppCode("");
                          setError(null);
                        }}
                        className="w-full py-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Use a different number
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={onRequestWhatsAppOtp} className="space-y-4">
                      <div>
                        <label htmlFor="whatsapp-phone" className={LABEL}>
                          WhatsApp number with country code
                        </label>
                        <input
                          id="whatsapp-phone"
                          name="whatsapp-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="+254 712 345 678"
                          required
                          value={whatsAppPhone}
                          onChange={(event) => setWhatsAppPhone(event.target.value)}
                          className={FIELD}
                        />
                      </div>
                      <button type="submit" disabled={pending || !whatsAppPhone.trim()} className={BUTTON} data-loading={pending}>
                        {pending ? "Sending code…" : "Continue with WhatsApp"}
                      </button>
                    </form>
                  )}
                </section>
              )}

              {error && (
                <p role="alert" className="form-error error-message mt-5 rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center gap-4 font-mono text-[0.7rem] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <Link to="/auth/reset-request" className="underline-offset-2 hover:text-foreground hover:underline">
                  Forgot password?
                </Link>
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}