/**
 * VEXON accounts — core logic (no React, SSR-safe).
 *
 * Backed by Supabase Auth (email + password, optional Google) and a `profiles` table
 * (see supabase/migrations). The Supabase client is loaded lazily in the browser only, so
 * server rendering never touches it and the home page works even if accounts are not set up.
 */
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export type VexonUser = { id: string; name: string; email: string };

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: VexonUser };

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** False until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set. */
export const ACCOUNTS_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);
/** Shows "Continue with Google" once the Google provider is enabled in Supabase. */
export const GOOGLE_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";
export const MIN_PASSWORD_LENGTH = 8;

/* ---------- state store (works with useSyncExternalStore) ---------- */

let state: AuthState = { status: "loading" };
let started = false;
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  const same =
    state.status === next.status &&
    (state.status !== "signed-in" ||
      (next.status === "signed-in" &&
        state.user.id === next.user.id &&
        state.user.name === next.user.name &&
        state.user.email === next.user.email));
  if (same) return;
  state = next;
  listeners.forEach((l) => l());
}

export function getAuthState(): AuthState {
  return state;
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Restores the saved session and keeps state in sync. Call once on the client (in an effect). */
export function startAuth(): void {
  if (started) return;
  started = true;
  void init();
}

async function init() {
  let supabase: SupabaseClient | null = null;
  try {
    supabase = await getClient();
  } catch (error) {
    console.error("Could not load the account service.", error);
  }
  if (!supabase) {
    if (!ACCOUNTS_CONFIGURED) {
      console.warn("Vexon accounts are off: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
    }
    setState({ status: "signed-out" });
    return;
  }
  // Fires for sign in, sign out, token refresh, and tabs signing in or out.
  // Never await other Supabase calls inside this callback (it can deadlock the client).
  supabase.auth.onAuthStateChange((_event, session) => applySession(session));
  const { data } = await supabase.auth.getSession();
  applySession(data.session);
}

function applySession(session: Session | null) {
  if (!session) {
    setState({ status: "signed-out" });
    return;
  }
  const user = toUser(session.user);
  setState({ status: "signed-in", user });
  setTimeout(() => void refreshProfile(user.id), 0);
}

/** The `profiles` table is the source of truth for the display name. */
async function refreshProfile(userId: string) {
  try {
    const supabase = await getClient();
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
    const name = typeof data?.display_name === "string" ? data.display_name.trim() : "";
    if (name && state.status === "signed-in" && state.user.id === userId) {
      setState({ status: "signed-in", user: { ...state.user, name } });
    }
  } catch {
    /* keep the name from the sign-in metadata */
  }
}

/* ---------- Supabase client ---------- */

let client: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient | null> | null = null;

export async function getClient(): Promise<SupabaseClient | null> {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) => {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return client;
  });
  return clientPromise;
}

async function requireClient(): Promise<SupabaseClient> {
  let supabase: SupabaseClient | null = null;
  try {
    supabase = await getClient();
  } catch {
    /* handled below */
  }
  if (!supabase) throw new AuthError("Accounts are unavailable right now. Try again later.");
  return supabase;
}

/** Test hook: inject a fake client and reset all state. */
export function resetAuthForTesting(fake: SupabaseClient | null) {
  client = fake;
  clientPromise = null;
  started = false;
  state = { status: "loading" };
}

/* ---------- actions ---------- */

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ needsConfirmation: boolean }> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);
  if (name.length < 1) throw new AuthError("Enter your name.");
  if (name.length > 60) throw new AuthError("Name must be 60 characters or fewer.");
  validateEmail(email);
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const supabase = await requireClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { display_name: name }, ...redirectOptions() },
  });
  if (error) throw toAuthError(error);
  // For an email that already has an account, Supabase answers with a user that has no
  // identities (and sends nothing) instead of an error, so people cannot probe for emails.
  if (data.user && data.user.identities?.length === 0) {
    throw new AuthError("An account with this email already exists. Sign in instead.");
  }
  if (data.session) applySession(data.session);
  return { needsConfirmation: !data.session };
}

export async function signIn(input: { email: string; password: string }): Promise<VexonUser> {
  const email = normalizeEmail(input.email);
  validateEmail(email);
  if (!input.password) throw new AuthError("Enter your password.");

  const supabase = await requireClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (error) throw toAuthError(error);
  applySession(data.session);
  return toUser(data.session.user);
}

/** Redirects to Google; the session is picked up when the person returns to the site. */
export async function signInWithGoogle(): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { ...(siteOrigin() ? { redirectTo: siteOrigin() } : {}) },
  });
  if (error) throw toAuthError(error);
}

/** Trims, collapses spaces and checks length. Throws an AuthError with a message safe to show. */
export function cleanDisplayName(input: string): string {
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < 1) throw new AuthError("Enter your name.");
  if (name.length > 60) throw new AuthError("Name must be 60 characters or fewer.");
  return name;
}

/** Changes the signed-in person's display name (stored in their `profiles` row). */
export async function updateDisplayName(input: string): Promise<void> {
  const name = cleanDisplayName(input);
  if (state.status !== "signed-in") throw new AuthError("Sign in to change your name.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", userId)
    .select("display_name")
    .maybeSingle();
  if (error || !data) throw new AuthError("We could not save your name. Try again in a moment.");

  // Keep the sign-in metadata in step (best effort), then update what the site shows right away.
  try {
    await supabase.auth.updateUser({ data: { display_name: name } });
  } catch {
    /* the profile row is the source of truth */
  }
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({ status: "signed-in", user: { ...state.user, name } });
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await getClient();
    await supabase?.auth.signOut();
  } catch {
    /* the local session is cleared either way */
  }
  setState({ status: "signed-out" });
}

/* ---------- helpers ---------- */

export function initials(user: Pick<VexonUser, "name" | "email">): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return (user.email[0] ?? "?").toUpperCase();
  const first = parts[0]![0]!;
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : "";
  return (first + last).toUpperCase();
}

function toUser(user: User): VexonUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? "";
  const fromMeta = [meta["display_name"], meta["full_name"], meta["name"]].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  return { id: user.id, email, name: (fromMeta ?? email.split("@")[0] ?? "").trim() };
}

/** Where Supabase sends people back to after confirming their email. */
function siteOrigin(): string {
  return globalThis.location?.origin ?? "";
}

function redirectOptions(): { emailRedirectTo?: string } {
  const origin = siteOrigin();
  return origin ? { emailRedirectTo: origin } : {};
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new AuthError("Enter a valid email address.");
}

function toAuthError(error: { message: string; code?: string | undefined; status?: number | undefined }): AuthError {
  switch (error.code) {
    case "invalid_credentials":
      return new AuthError("Email or password is incorrect.");
    case "email_not_confirmed":
      return new AuthError("Confirm your email first. Open the link we sent to your inbox, then sign in.");
    case "user_already_exists":
    case "email_exists":
      return new AuthError("An account with this email already exists. Sign in instead.");
    case "weak_password":
      return new AuthError("That password is too easy to guess. Choose a stronger one.");
    case "signup_disabled":
      return new AuthError("New accounts are turned off right now.");
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return new AuthError("Too many attempts. Wait a few minutes and try again.");
  }
  if (error.status === 429) return new AuthError("Too many attempts. Wait a few minutes and try again.");
  if (error.status === 0 || /failed to fetch|network/i.test(error.message)) {
    return new AuthError("Can't reach the account service. Check your connection and try again.");
  }
  return new AuthError("Something went wrong. Try again.");
}
