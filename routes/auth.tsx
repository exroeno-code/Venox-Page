import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/vexon/SocialIcons";
import {
  ACCOUNTS_CONFIGURED,
  AuthError,
  GOOGLE_ENABLED,
  MIN_PASSWORD_LENGTH,
  WHATSAPP_ENABLED,
  initials,
  sendWhatsAppOtp,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  verifyWhatsAppOtp,
} from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";

const TITLE = "Your Vexon account — VEXON TECH";
const DESC =
  "Create an account or sign in to follow what we’re building at VEXON TECH.";
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
type Stage = "methods" | "email" | "phone" | "code" | "success";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("create");
  const [stage, setStage] = useState<Stage>("methods");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentStep =
    stage === "methods"
      ? 1
      : stage === "success"
        ? 4
        : stage === "code"
          ? 3
          : 2;
  function resetFlow(nextMode: Mode) {
    setMode(nextMode);
    setStage(nextMode === "create" ? "methods" : "email");
    setError(null);
    setCode("");
  }
  function back() {
    setError(null);
    setCode("");
    if (stage === "code") setStage("phone");
    else if (stage === "email" || stage === "phone")
      setStage(mode === "create" ? "methods" : "email");
  }
  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    setStatusMessage(null);
    try {
      await action();
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "That didn’t work. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const inputEmail = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    void run(async () => {
      if (mode === "create") {
        await signUp({
          name: String(data.get("name") ?? ""),
          email: inputEmail,
          password,
        });
      } else {
        await signIn({ email: inputEmail, password });
      }
      setStage("success");
    });
  }
  function onPhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      await sendWhatsAppOtp(phone);
      setCode("");
      setStage("code");
    });
  }
  function onCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      await verifyWhatsAppOtp(phone, code);
      setStage("success");
    });
  }
  function onResendCode() {
    void run(async () => {
      await sendWhatsAppOtp(phone);
      setStatusMessage("New code sent.");
    });
  }

  return (
    <main className="signup-flow">
      <section className="signup-flow__card" aria-labelledby="auth-title">
        <header className="signup-flow__top">
          <Link to="/" aria-label="Vexon home" className="signup-flow__brand">
            <span className="signup-flow__mark">V</span>
            <span>VEXON TECH</span>
          </Link>
          {stage !== "methods" && stage !== "success" ? (
            <button
              type="button"
              className="signup-flow__back"
              onClick={back}
              aria-label="Go back"
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </button>
          ) : (
            <Link to="/" className="signup-flow__home">
              Back to VEXON TECH <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
        </header>

        <div
          className="signup-flow__progress"
          aria-label={`Step ${currentStep} of 4`}
        >
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className={step <= currentStep ? "is-on" : ""} />
          ))}
        </div>

        {auth.status === "signed-in" ? (
          <div className="signup-flow__content">
            <div className="signup-flow__success-icon">
              <Check aria-hidden="true" />
            </div>
            <h1 id="auth-title">You’re in</h1>
            <p className="signup-flow__sub">
              Your account is ready. Good to have you here.
            </p>
            <div className="signup-flow__user">
              <span className="signup-flow__avatar">{initials(auth.user)}</span>
              <span>
                <strong>{auth.user.name}</strong>
                <small>
                  {auth.user.email || auth.user.phone || "Vexon account"}
                </small>
              </span>
            </div>
            <button
              type="button"
              className="signup-flow__primary"
              onClick={() => void navigate({ to: "/" })}
            >
              Continue to VEXON TECH
            </button>
            <button
              type="button"
              className="signup-flow__text-button"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          </div>
        ) : stage === "success" ? (
          <div className="signup-flow__content">
            <div className="signup-flow__success-icon">
              <Check aria-hidden="true" />
            </div>
            <h1 id="auth-title">You’re in</h1>
            <p className="signup-flow__sub">
              Your account is ready. Good to have you here.
            </p>
            <button
              type="button"
              className="signup-flow__primary"
              onClick={() => void navigate({ to: "/" })}
            >
              Continue to VEXON TECH
            </button>
          </div>
        ) : stage === "methods" ? (
          <div className="signup-flow__content">
            <h1 id="auth-title">Join us</h1>
            <p className="signup-flow__sub">
              Create an account to follow what we’re building.
            </p>
            {!ACCOUNTS_CONFIGURED && (
              <p
                role="alert"
                className="signup-flow__notice signup-flow__notice--error"
              >
                Accounts aren’t ready yet. Set <code>VITE_SUPABASE_URL</code>{" "}
                and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in the site
                environment before enabling accounts.
              </p>
            )}
            {GOOGLE_ENABLED && (
              <button
                type="button"
                className="signup-flow__social signup-flow__social--google"
                disabled={pending}
                onClick={() => void run(signInWithGoogle)}
              >
                <GoogleMark /> Continue with Google
              </button>
            )}
            {WHATSAPP_ENABLED ? (
              <button
                type="button"
                className="signup-flow__social signup-flow__social--whatsapp"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  setStage("phone");
                }}
              >
                <WhatsAppIcon className="size-[18px]" /> Continue with WhatsApp
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="signup-flow__social signup-flow__social--whatsapp"
                  disabled
                  aria-describedby="whatsapp-auth-note"
                  title="WhatsApp sign-in requires phone authentication to be enabled in Supabase."
                >
                  <WhatsAppIcon className="size-[18px]" />
                  Continue with WhatsApp
                </button>
                <p id="whatsapp-auth-note" className="signup-flow__note">
                  WhatsApp sign-in isn’t ready yet. Phone authentication and
                  WhatsApp one-time-code delivery need to be enabled in Supabase
                  first.
                </p>
              </>
            )}
            <div className="signup-flow__or">or</div>
            <button
              type="button"
              className="signup-flow__social"
              onClick={() => {
                setError(null);
                setStage("email");
              }}
            >
              Continue with email and password
            </button>
            <button
              type="button"
              className="signup-flow__instagram"
              disabled
              aria-describedby="instagram-auth-note"
              title="Instagram sign-in is not supported by Supabase Auth."
            >
              <InstagramIcon className="size-[18px]" /> Instagram sign-in
              unavailable
            </button>
            <p id="instagram-auth-note" className="signup-flow__note">
              Instagram isn’t a supported sign-in option for Supabase Auth. For
              now, use email; other providers will appear only after they’re set
              up in Supabase.
            </p>
            <p className="signup-flow__small">
              Already have an account?{" "}
              <button
                type="button"
                className="signup-flow__link"
                onClick={() => resetFlow("signin")}
              >
                Sign in
              </button>
            </p>
          </div>
        ) : stage === "email" ? (
          <div className="signup-flow__content">
            <h1 id="auth-title">
              {mode === "create" ? "Your details" : "Sign in"}
            </h1>
            <p className="signup-flow__sub">
              {mode === "create"
                ? "Use your email and a password to create your account."
                : "Welcome back. Sign in to your Vexon account."}
            </p>
            {!ACCOUNTS_CONFIGURED && (
              <p
                role="alert"
                className="signup-flow__notice signup-flow__notice--error"
              >
                Accounts aren’t ready yet. Add the project URL and publishable
                key to the deployment environment to enable sign-in.
              </p>
            )}
            <form
              className="signup-flow__form"
              onSubmit={onEmailSubmit}
              noValidate
            >
              {mode === "create" && (
                <div className="signup-flow__field">
                  <label htmlFor="signup-name">Full name</label>
                  <input
                    id="signup-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Enosh Yeswa"
                    required
                    maxLength={60}
                  />
                </div>
              )}
              <div className="signup-flow__field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="signup-flow__field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "create" ? "new-password" : "current-password"
                  }
                  placeholder={
                    mode === "create"
                      ? "At least 8 characters"
                      : "Your password"
                  }
                  required
                  minLength={mode === "create" ? MIN_PASSWORD_LENGTH : 1}
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="signup-flow__notice signup-flow__notice--error"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="signup-flow__primary"
                disabled={pending || !ACCOUNTS_CONFIGURED}
              >
                {pending
                  ? "Please wait…"
                  : mode === "create"
                    ? "Continue"
                    : "Sign in"}
              </button>
            </form>
            {mode === "signin" && (
              <p className="signup-flow__small">
                <Link to="/auth/reset-request" className="signup-flow__link">
                  Forgot password?
                </Link>
              </p>
            )}
            <p className="signup-flow__small">
              {mode === "create"
                ? "Already have an account? "
                : "New to Vexon? "}
              <button
                type="button"
                className="signup-flow__link"
                onClick={() =>
                  resetFlow(mode === "create" ? "signin" : "create")
                }
              >
                {mode === "create" ? "Sign in" : "Create account"}
              </button>
            </p>
          </div>
        ) : stage === "phone" ? (
          <div className="signup-flow__content">
            <h1 id="auth-title">Your WhatsApp number</h1>
            <p className="signup-flow__sub">
              We’ll send you a 6-digit code on WhatsApp.
            </p>
            <form
              className="signup-flow__form"
              onSubmit={onPhoneSubmit}
              noValidate
            >
              <div className="signup-flow__field">
                <label htmlFor="whatsapp-phone">Phone number</label>
                <input
                  id="whatsapp-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+254 712 345 678"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="signup-flow__notice signup-flow__notice--error"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="signup-flow__primary"
                disabled={pending || !phone.trim()}
              >
                {pending ? "Sending code…" : "Send code"}
              </button>
            </form>
          </div>
        ) : (
          <div className="signup-flow__content">
            <h1 id="auth-title">Enter your WhatsApp code</h1>
            <p className="signup-flow__sub">
              If your number is valid, we’ve sent a code to{" "}
              <strong>{phone}</strong>.
            </p>
            {statusMessage && (
              <p
                role="status"
                className="signup-flow__notice signup-flow__notice--success"
              >
                {statusMessage}
              </p>
            )}
            <form
              className="signup-flow__form"
              onSubmit={onCodeSubmit}
              noValidate
            >
              <div className="signup-flow__field">
                <label htmlFor="signup-code">6-digit WhatsApp code</label>
                <input
                  id="signup-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  required
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="signup-flow__notice signup-flow__notice--error"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="signup-flow__primary"
                disabled={pending || code.length !== 6}
              >
                {pending ? "Verifying…" : "Verify"}
              </button>
            </form>
            <div className="signup-flow__actions">
              <button
                type="button"
                className="signup-flow__text-button"
                onClick={back}
              >
                Back
              </button>
              <button
                type="button"
                className="signup-flow__text-button"
                disabled={pending}
                onClick={onResendCode}
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        {error &&
          stage !== "email" &&
          stage !== "phone" &&
          stage !== "code" && (
            <p
              role="alert"
              className="signup-flow__notice signup-flow__notice--error"
            >
              {error}
            </p>
          )}
        <p className="signup-flow__legal">
          <LockKeyhole size={12} aria-hidden="true" /> By continuing you agree
          to our <Link to="/privacy">Privacy policy</Link>.
        </p>
      </section>
    </main>
  );
}
