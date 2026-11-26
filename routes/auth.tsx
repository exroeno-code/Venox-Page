import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";

import { AUTH_PORTRAIT } from "@/components/vexon/authPortrait";
import { Wordmark } from "@/components/vexon/Wordmark";
import {
  ACCOUNTS_CONFIGURED,
  AuthError,
  MIN_PASSWORD_LENGTH,
  getRecoveryMode,
  sendPasswordReset,
  signIn,
  signInWithGoogle,
  signUp,
  subscribeRecovery,
  updatePassword,
} from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";

type Screen = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · VEXON TECH" },
      { name: "description", content: "Sign in or create your VEXON account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.450-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.130 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function VexonMark() {
  const gradientId = `auth-v-mark-${useId().replace(/:/g, "")}`;
  return (
    <svg className="auth-reference__brand-mark" viewBox="0 0 1024 1024" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6a1f" />
          <stop offset=".45" stopColor="#f3d27a" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>
      <path d="M190 230h190l132 380 132-380h190L600 800H424z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

function Spinner() {
  return <span className="auth-reference__spinner" aria-hidden="true" />;
}

function TextField(props: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  inputMode?: "email" | "text";
  invalid?: boolean;
}) {
  return (
    <div className="auth-reference__field">
      <input
        id={props.id}
        type={props.type ?? "text"}
        inputMode={props.inputMode}
        autoComplete={props.autoComplete}
        placeholder=" "
        value={props.value}
        aria-invalid={props.invalid || undefined}
        onChange={(event) => props.onChange(event.target.value)}
      />
      <label htmlFor={props.id}>{props.label}</label>
    </div>
  );
}

function PasswordField(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  hint?: string;
  invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const hintId = `${props.id}-hint`;
  return (
    <div>
      <div className="auth-reference__field auth-reference__field--password">
        <input
          id={props.id}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete}
          placeholder=" "
          value={props.value}
          aria-invalid={props.invalid || undefined}
          aria-describedby={props.hint ? hintId : undefined}
          onChange={(event) => props.onChange(event.target.value)}
        />
        <label htmlFor={props.id}>{props.label}</label>
        <button
          className="auth-reference__view"
          type="button"
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {props.hint ? <p id={hintId} className="auth-reference__hint">{props.hint}</p> : null}
    </div>
  );
}

function Notice({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p className={`auth-reference__notice auth-reference__notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

function messageOf(err: unknown): string {
  if (err instanceof AuthError) return err.message;
  return "Something went wrong. Check your connection and try again.";
}

function useRecoveryMode() {
  return useSyncExternalStore(subscribeRecovery, getRecoveryMode, () => false);
}

function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const recovery = useRecoveryMode();

  const [screen, setScreen] = useState<Screen>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState<null | "form" | "google">(null);

  useEffect(() => {
    if (auth.status === "signed-in" && !recovery) void navigate({ to: "/profile" });
  }, [auth.status, recovery, navigate]);

  const go = (next: Screen) => {
    setScreen(next);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const run = async (kind: "form" | "google", action: () => Promise<void>) => {
    if (busy) return;
    setBusy(kind);
    setError("");
    setSuccess("");
    try {
      await action();
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(null);
    }
  };

  const onSignIn = (event: FormEvent) => {
    event.preventDefault();
    void run("form", async () => {
      await signIn({ email, password });
    });
  };

  const onSignUp = (event: FormEvent) => {
    event.preventDefault();
    void run("form", async () => {
      const { needsConfirmation } = await signUp({ name, email, password });
      if (needsConfirmation) {
        setSuccess(`Almost there. We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.`);
        setPassword("");
      }
    });
  };

  const onForgot = (event: FormEvent) => {
    event.preventDefault();
    void run("form", async () => {
      await sendPasswordReset(email);
      setSuccess(`If ${email.trim()} has an account, a reset link is on its way. Check your inbox.`);
    });
  };

  const onReset = (event: FormEvent) => {
    event.preventDefault();
    void run("form", async () => {
      await updatePassword(password);
      setPassword("");
      void navigate({ to: "/profile" });
    });
  };

  const onGoogle = () => void run("google", signInWithGoogle);

  const titles: Record<Screen, { h1: string; sub: string }> = {
    signin: { h1: "Welcome back", sub: "Sign in to your Vexon account." },
    signup: { h1: "Create your account", sub: "It only takes a minute." },
    forgot: { h1: "Reset your password", sub: "We will email you a link to choose a new one." },
  };
  const heading = recovery ? { h1: "Choose a new password", sub: "Pick something you have not used before." } : titles[screen];

  return (
    <main className="auth-reference">
      <div className="auth-reference__hero">
        <img className="auth-reference__photo" src={AUTH_PORTRAIT} alt="" />
      </div>
      <div className="auth-reference__welcome">
        <p className="auth-reference__welcome-label">WELCOME TO VEXON TECH</p>
        <h2>Good to have you here.</h2>
        <p className="auth-reference__welcome-tagline">Useful ideas. Real-world progress.</p>
      </div>

      <section className="auth-reference__screen is-active" aria-labelledby="auth-title">
        <div className="auth-reference__brand">
          <VexonMark />
          <div>
            <p className="auth-reference__brand-name"><Wordmark /></p>
            <p className="auth-reference__brand-caption">Your Vexon account</p>
          </div>
        </div>

        {!recovery && screen !== "forgot" ? (
          <div className="auth-reference__tabs" role="tablist" aria-label="Account">
            <button type="button" role="tab" aria-selected={screen === "signin"} onClick={() => go("signin")}>Sign in</button>
            <button type="button" role="tab" aria-selected={screen === "signup"} onClick={() => go("signup")}>Create account</button>
          </div>
        ) : null}

        <h1 id="auth-title">{heading.h1}</h1>
        <p className="auth-reference__lede">{heading.sub}</p>

        <div className="auth-reference__card">
          {!ACCOUNTS_CONFIGURED ? (
            <Notice tone="error">Accounts are not available right now. Please try again later.</Notice>
          ) : null}

          {!recovery && screen !== "forgot" ? (
            <>
              <button className="auth-reference__google" type="button" onClick={onGoogle} disabled={busy !== null}>
                {busy === "google" ? <Spinner /> : <GoogleIcon />}
                <span>{busy === "google" ? "Opening Google…" : "Continue with Google"}</span>
              </button>
              <div className="auth-reference__or">or use your email</div>
            </>
          ) : null}

          {recovery ? (
            <form onSubmit={onReset} noValidate>
              <PasswordField id="reset-pass" label="New password" value={password} onChange={setPassword} autoComplete="new-password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} invalid={Boolean(error)} />
              {error ? <Notice tone="error">{error}</Notice> : null}
              <button className="auth-reference__button" type="submit" disabled={busy !== null}>
                {busy === "form" ? <Spinner /> : null} Save new password
              </button>
            </form>
          ) : screen === "signin" ? (
            <form onSubmit={onSignIn} noValidate>
              <TextField id="si-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} invalid={Boolean(error)} />
              <PasswordField id="si-pass" label="Password" value={password} onChange={setPassword} autoComplete="current-password" invalid={Boolean(error)} />
              <div className="auth-reference__row">
                <button className="auth-reference__link" type="button" onClick={() => go("forgot")}>Forgot password?</button>
              </div>
              {error ? <Notice tone="error">{error}</Notice> : null}
              <button className="auth-reference__button" type="submit" disabled={busy !== null}>
                {busy === "form" ? <Spinner /> : null} Sign in
              </button>
            </form>
          ) : screen === "signup" ? (
            <form onSubmit={onSignUp} noValidate>
              <TextField id="su-name" label="Full name" autoComplete="name" value={name} onChange={setName} />
              <TextField id="su-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} />
              <PasswordField id="su-pass" label="Password" value={password} onChange={setPassword} autoComplete="new-password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} />
              {error ? <Notice tone="error">{error}</Notice> : null}
              {success ? <Notice tone="success">{success}</Notice> : null}
              <button className="auth-reference__button" type="submit" disabled={busy !== null}>
                {busy === "form" ? <Spinner /> : null} Create account
              </button>
              <p className="auth-reference__small">By creating an account you agree to how Vexon handles your details to run your account.</p>
            </form>
          ) : (
            <form onSubmit={onForgot} noValidate>
              <TextField id="fp-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} invalid={Boolean(error)} />
              {error ? <Notice tone="error">{error}</Notice> : null}
              {success ? <Notice tone="success">{success}</Notice> : null}
              <button className="auth-reference__button" type="submit" disabled={busy !== null}>
                {busy === "form" ? <Spinner /> : null} Send reset link
              </button>
              <button className="auth-reference__link" type="button" onClick={() => go("signin")}>Back to sign in</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
