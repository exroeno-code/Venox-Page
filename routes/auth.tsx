import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { AUTH_PORTRAIT } from "@/components/vexon/authPortrait";

const TITLE = "Hi! · Sign in";
const EXISTING_EMAIL = "alex.doe@gmail.com";
type Screen = "email" | "signup" | "login";
type Social = "Instagram" | "Google" | "WhatsApp";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Sign in or create your VEXON account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function InstagramIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <radialGradient id="auth-ig" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset=".05" stopColor="#fdf497" />
          <stop offset=".45" stopColor="#fd5949" />
          <stop offset=".6" stopColor="#d6249f" />
          <stop offset=".9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#auth-ig)" />
      <rect x="11.5" y="11.5" width="25" height="25" rx="7.5" fill="none" stroke="#fff" strokeWidth="2.6" />
      <circle cx="24" cy="24" r="6.2" fill="none" stroke="#fff" strokeWidth="2.6" />
      <circle cx="31.4" cy="16.6" r="1.7" fill="#fff" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#25D366" />
      <g transform="translate(3.6 3.6) scale(.7)" fill="#fff">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </g>
    </svg>
  );
}

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>;
}

function Field({ children, password = false }: { children: ReactNode; password?: boolean }) {
  return <div className={`auth-reference__field${password ? " auth-reference__field--password" : ""}`}>{children}</div>;
}

function AuthPage() {
  const [screen, setScreen] = useState<Screen>("email");
  const [history, setHistory] = useState<Screen[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupMessage, setSignupMessage] = useState("Let’s create your account.");
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [toast, setToast] = useState("");
  const [openSocial, setOpenSocial] = useState<Social | null>(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const socialRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (socialRef.current && !socialRef.current.contains(event.target as Node)) setOpenSocial(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSocial(null);
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const navigateTo = (next: Screen, addHistory = true) => {
    if (addHistory) setHistory((current) => [...current, screen]);
    setScreen(next);
    setOpenSocial(null);
    window.scrollTo(0, 0);
  };

  const openSignup = (value = "") => {
    setSignupMessage(value ? <>Looks like you don’t have an account. Let’s create a new account for <b>{value}</b></> : "Let’s create your account.");
    setSignupError("");
    navigateTo("signup");
  };

  const niceName = (value: string) => value.split("@")[0].split(/[._-]+/).filter(Boolean).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const submitEmail = () => {
    const value = email.trim();
    if (!validEmail(value)) {
      setEmailError("Enter a valid email address, like name@example.com.");
      return;
    }
    setEmailError("");
    if (value.toLowerCase() === EXISTING_EMAIL) {
      setLoginName(niceName(value));
      setLoginEmail(value);
      navigateTo("login");
    } else openSignup(value);
  };

  const submitSignup = (event: FormEvent) => {
    event.preventDefault();
    if (!signupName.trim()) { setSignupError("Enter your name."); return; }
    if (signupPassword.length < 8) { setSignupError("Use a password with at least 8 characters."); return; }
    setSignupError("");
    showToast(`Account created. Welcome, ${signupName.trim().split(" ")[0]}!`);
  };

  const submitLogin = (event: FormEvent) => {
    event.preventDefault();
    if (!loginPassword) { setLoginError("Enter your password."); return; }
    setLoginError("");
    showToast(`Welcome back, ${loginName.split(" ")[0]}!`);
  };

  const back = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    navigateTo(previous, false);
  };

  const socialButton = (name: Social, icon: ReactNode) => {
    const expanded = openSocial === name;
    return (
      <button
        type="button"
        className={`auth-reference__social${expanded ? " is-open" : ""}`}
        aria-label={`Continue with ${name}`}
        aria-expanded={expanded}
        onClick={() => expanded ? showToast(`Continuing with ${name}…`) : setOpenSocial(name)}
      >
        {icon}<span className="auth-reference__social-label">Continue with {name}</span>
      </button>
    );
  };

  return (
    <main className="auth-reference">
      <div className="auth-reference__hero"><img className="auth-reference__photo" src={AUTH_PORTRAIT} alt="Young man with glasses leaning against a wall at night" /></div>
      <button className="auth-reference__back" aria-label="Back" hidden={screen === "email"} onClick={back}><BackIcon /></button>

      <section className={`auth-reference__screen${screen === "email" ? " is-active" : ""}`} aria-hidden={screen !== "email"}>
        <h1>Hi!</h1>
        <div className="auth-reference__card">
          <form onSubmit={(event) => { event.preventDefault(); submitEmail(); }} noValidate>
            <Field><input id="email" type="email" inputMode="email" autoComplete="email" placeholder=" " value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} /><label htmlFor="email">Email</label></Field>
            <p className="auth-reference__error" role="alert">{emailError}</p>
            <button className="auth-reference__button" type="submit">Continue</button>
          </form>
          <div className="auth-reference__or">or</div>
          <div className="auth-reference__socials" ref={socialRef}>
            {socialButton("Instagram", <InstagramIcon />)}
            {socialButton("Google", <GoogleIcon />)}
            {socialButton("WhatsApp", <WhatsAppIcon />)}
          </div>
          <p className="auth-reference__small">Don’t have an account? <button className="auth-reference__link" type="button" onClick={() => openSignup(email.trim() && validEmail(email.trim()) ? email.trim() : "")}>Sign up</button></p>
          <button className="auth-reference__link" type="button" onClick={() => showToast("Password reset would start here")}>Forgot your password?</button>
        </div>
      </section>

      <section className={`auth-reference__screen${screen === "signup" ? " is-active" : ""}`} aria-hidden={screen !== "signup"}>
        <h1>Sign up</h1>
        <form className="auth-reference__card" onSubmit={submitSignup} noValidate>
          <p className="auth-reference__small">{signupMessage}</p>
          <Field><input id="su-name" type="text" autoComplete="name" placeholder=" " value={signupName} onChange={(event) => setSignupName(event.target.value)} /><label htmlFor="su-name">Name</label></Field>
          <Field password><input id="su-pass" type={showSignupPassword ? "text" : "password"} autoComplete="new-password" placeholder=" " value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} /><label htmlFor="su-pass">Password</label><button className="auth-reference__view" type="button" onClick={() => setShowSignupPassword((value) => !value)}>{showSignupPassword ? "Hide" : "View"}</button></Field>
          <p className="auth-reference__error" role="alert">{signupError}</p>
          <p className="auth-reference__small">By selecting Agree and continue below, I agree to <button className="auth-reference__link" type="button" onClick={() => showToast("Terms of Service would open here")}>Terms of Service</button> and <button className="auth-reference__link" type="button" onClick={() => showToast("Privacy Policy would open here")}>Privacy Policy</button></p>
          <button className="auth-reference__button" type="submit">Agree and continue</button>
        </form>
      </section>

      <section className={`auth-reference__screen${screen === "login" ? " is-active" : ""}`} aria-hidden={screen !== "login"}>
        <h1>Log in</h1>
        <form className="auth-reference__card" onSubmit={submitLogin} noValidate>
          <div className="auth-reference__user"><div className="auth-reference__avatar"><img src={AUTH_PORTRAIT} alt="" /></div><div><b>{loginName}</b><span>{loginEmail}</span></div></div>
          <Field password><input id="lg-pass" type={showLoginPassword ? "text" : "password"} autoComplete="current-password" placeholder=" " value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} /><label htmlFor="lg-pass">Password</label><button className="auth-reference__view" type="button" onClick={() => setShowLoginPassword((value) => !value)}>{showLoginPassword ? "Hide" : "View"}</button></Field>
          <p className="auth-reference__error" role="alert">{loginError}</p>
          <button className="auth-reference__button" type="submit">Continue</button>
          <button className="auth-reference__link" type="button" onClick={() => showToast("Password reset would start here")}>Forgot your password?</button>
        </form>
      </section>
      <div className={`auth-reference__toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}
