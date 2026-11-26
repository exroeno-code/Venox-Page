/**
 * VEXON accounts — core logic (no React, SSR-safe).
 *
 * Backed by Supabase Auth (email + password, optional Google) and a `profiles` table
 * (see supabase/migrations). The Supabase client is loaded lazily in the browser only, so
 * server rendering never touches it and the home page works even if accounts are not set up.
 */
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export type VexonUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  social_links?: Record<string, string>;
};

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
/** Google is available unless explicitly disabled, once the Supabase client is configured. */
export const GOOGLE_ENABLED = ACCOUNTS_CONFIGURED && import.meta.env.VITE_ENABLE_GOOGLE_AUTH !== "false";
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

/** Sends a phone sign-in code through the WhatsApp channel configured in Supabase Auth. */
export async function sendWhatsAppOtp(input: string): Promise<void> {
  const phone = normalizePhone(input);
  const supabase = await requireClient();
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: "whatsapp" } });
  if (error) throw toAuthError(error);
}

/** Verifies a WhatsApp-delivered phone OTP and starts the Supabase session. */
export async function verifyWhatsAppOtp(input: string, token: string): Promise<VexonUser> {
  const phone = normalizePhone(input);
  const code = token.trim();
  if (!/^\d{6}$/.test(code)) throw new AuthError("Enter the 6-digit code we sent on WhatsApp.");
  const supabase = await requireClient();
  const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
  if (error) throw toAuthError(error);
  if (!data.session || !data.user) throw new AuthError("We could not verify that code. Request a new one and try again.");
  applySession(data.session);
  return toUser(data.user);
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

export async function updateAvatar(url: string): Promise<void> {
  if (state.status !== "signed-in") throw new AuthError("Sign in to update your avatar.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", userId);
  if (error) throw new AuthError("We could not save your avatar. Try again in a moment.");

  try {
    await supabase.auth.updateUser({ data: { avatar_url: url } });
  } catch {
    /* the profile row is the source of truth */
  }
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({ status: "signed-in", user: { ...state.user, avatar_url: url } });
  }
}

export async function updateBio(bio: string): Promise<void> {
  const cleanBio = bio.trim();
  if (cleanBio.length > 500) throw new AuthError("Bio must be 500 characters or fewer.");
  if (state.status !== "signed-in") throw new AuthError("Sign in to update your bio.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { error } = await supabase
    .from("profiles")
    .update({ bio: cleanBio || null })
    .eq("id", userId);
  if (error) throw new AuthError("We could not save your bio. Try again in a moment.");

  try {
    await supabase.auth.updateUser({ data: { bio: cleanBio || null } });
  } catch {
    /* the profile row is the source of truth */
  }
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({ status: "signed-in", user: { ...state.user, bio: cleanBio || undefined } });
  }
}

export async function updateSocialLinks(links: Record<string, string>): Promise<void> {
  if (state.status !== "signed-in") throw new AuthError("Sign in to update your links.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { error } = await supabase
    .from("profiles")
    .update({ social_links: links })
    .eq("id", userId);
  if (error) throw new AuthError("We could not save your links. Try again in a moment.");

  try {
    await supabase.auth.updateUser({ data: { social_links: links } });
  } catch {
    /* the profile row is the source of truth */
  }
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({ status: "signed-in", user: { ...state.user, social_links: links } });
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

/** Sends a password reset email to the given address. */
export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = normalizeEmail(email);
  validateEmail(cleanEmail);
  const supabase = await requireClient();
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: siteOrigin() + "/auth/reset",
  });
  if (error) throw toAuthError(error);
}

/** Updates the password for the currently signed-in user (after OTP verification). */
export async function updatePassword(newPassword: string): Promise<void> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const supabase = await requireClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw toAuthError(error);
}

/** Deletes the currently signed-in user's account. */
export async function deleteAccount(): Promise<void> {
  if (state.status !== "signed-in") throw new AuthError("Sign in to delete your account.");
  const supabase = await requireClient();
  const { error } = await supabase.auth.admin.deleteUser(state.user.id);
  if (error) throw toAuthError(error);
  setState({ status: "signed-out" });
}

/* ---------- helpers ---------- */

export function initials(user: Pick<VexonUser, "name" | "email" | "phone">): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return (user.email[0] ?? user.phone?.[0] ?? "?").toUpperCase();
  const first = parts[0]![0]!;
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : "";
  return (first + last).toUpperCase();
}

function toUser(user: User): VexonUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? "";
  const phone = user.phone ?? "";
  const fromMeta = [meta["display_name"], meta["full_name"], meta["name"]].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  const fallbackName = email ? email.split("@")[0]! : phone;
  return {
    id: user.id,
    email,
    phone,
    name: (fromMeta ?? fallbackName).trim(),
    avatar_url: meta["avatar_url"] as string | undefined,
    bio: meta["bio"] as string | undefined,
    social_links: meta["social_links"] as Record<string, string> | undefined,
  };
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

function normalizePhone(input: string): string {
  const phone = input.trim().replace(/[\s().-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new AuthError("Enter a valid WhatsApp number with its country code, such as +254712345678.");
  }
  return phone;
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
