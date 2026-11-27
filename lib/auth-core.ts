/*
 * VEXVANO LABS accounts — core logic (no React, SSR-safe).
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
  avatar_url?: string | undefined;
  bio?: string | undefined;
  social_links?: Record<string, string> | undefined;
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
/** Only show optional providers after they are enabled in Supabase and in the site environment. */
export const GOOGLE_ENABLED =
  ACCOUNTS_CONFIGURED && import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";
export const WHATSAPP_ENABLED =
  ACCOUNTS_CONFIGURED &&
  import.meta.env["VITE_ENABLE_WHATSAPP_AUTH"] === "true";
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
        state.user.email === next.user.email &&
        state.user.avatar_url === next.user.avatar_url));
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
      console.warn(
        "Vexvano Labs accounts are off: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      );
    }
    setState({ status: "signed-out" });
    return;
  }
  // Fires for sign in, sign out, token refresh, and tabs signing in or out.
  // Never await other Supabase calls inside this callback (it can deadlock the client).
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryMode = true;
      recoveryListeners.forEach((l) => l());
    }
    applySession(session);
  });
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
/** The `profiles` table is the source of truth for the display name and picture. */
async function refreshProfile(userId: string) {
  try {
    const supabase = await getClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, bio, social_links")
      .eq("id", userId)
      .maybeSingle();
    if (!data || state.status !== "signed-in" || state.user.id !== userId)
      return;
    const name =
      typeof data.display_name === "string" ? data.display_name.trim() : "";
    const avatarUrl =
      typeof data.avatar_url === "string" && data.avatar_url
        ? data.avatar_url
        : state.user.avatar_url;
    const bio = typeof data.bio === "string" ? data.bio : state.user.bio;
    const socialLinks = data.social_links as Record<string, string> | undefined;
    setState({
      status: "signed-in",
      user: {
        ...state.user,
        name: name || state.user.name,
        avatar_url: avatarUrl,
        bio,
        social_links: socialLinks,
      },
    });
  } catch {
    /* keep the name and picture from the sign-in metadata */
  }
}
/* ---------- password recovery (person arrived from a reset email) ---------- */
let recoveryMode = false;
const recoveryListeners = new Set<() => void>();
export function getRecoveryMode(): boolean {
  return recoveryMode;
}
export function subscribeRecovery(listener: () => void): () => void {
  recoveryListeners.add(listener);
  return () => {
    recoveryListeners.delete(listener);
  };
}
/* ---------- Supabase client ---------- */
let client: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient | null> | null = null;
export async function getClient(): Promise<SupabaseClient | null> {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) => {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
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
  if (!supabase)
    throw new AuthError("Accounts are unavailable right now. Try again later.");
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
}): Promise<VexonUser> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);
  if (name.length < 1) throw new AuthError("Enter your name.");
  if (name.length > 60)
    throw new AuthError("Name must be 60 characters or fewer.");
  validateEmail(email);
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  const supabase = await requireClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { display_name: name } },
  });
  if (error) throw toAuthError(error);
  // For an email that already has an account, Supabase answers with a user that has no
  // identities (and sends nothing) instead of an error, so people cannot probe for emails.
  if (data.user && data.user.identities?.length === 0) {
    throw new AuthError(
      "An account with this email already exists. Sign in instead.",
    );
  }
  if (!data.session || !data.user)
    throw new AuthError(
      "Email confirmation is still enabled. Disable Confirm email in Supabase Auth settings to sign up and sign in without email codes.",
    );
  applySession(data.session);
  return toUser(data.user);
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<VexonUser> {
  const email = normalizeEmail(input.email);
  validateEmail(email);
  if (!input.password) throw new AuthError("Enter your password.");
  const supabase = await requireClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (error) throw toAuthError(error);
  applySession(data.session);
  return toUser(data.session.user);
}
/**
 * Redirects to Google, which lets the person pick one of the Google accounts on their device.
 * On return, their Google name, email and picture become the Vexvano Labs account identity.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = await requireClient();
  const origin = siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      ...(origin ? { redirectTo: `${origin}/` } : {}),
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) {
    if (/provider is not enabled|unsupported provider/i.test(error.message)) {
      throw new AuthError(
        "Google sign-in is not switched on yet. Use your email for now.",
      );
    }
    throw toAuthError(error);
  }
  if (data?.url) globalThis.location.assign(data.url);
}
/** Emails a link that brings the person back here to choose a new password. */
export async function sendPasswordReset(input: string): Promise<void> {
  const email = normalizeEmail(input);
  validateEmail(email);
  const supabase = await requireClient();
  const origin = siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(
    email,
    origin ? { redirectTo: `${origin}/auth/reset` } : {},
  );
  if (error) throw toAuthError(error);
}
/** Sets a new password for the signed-in person (used after a reset link). */
export async function updatePassword(password: string): Promise<void> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  const supabase = await requireClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAuthError(error);
  recoveryMode = false;
  recoveryListeners.forEach((l) => l());
}

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Uploads a profile picture to the member's own folder and saves its address on the profile. */
export async function uploadAvatar(file: File): Promise<string> {
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to change your picture.");
  if (!AVATAR_TYPES.includes(file.type))
    throw new AuthError("Choose a JPG, PNG, WebP or GIF image.");
  if (file.size > AVATAR_MAX_BYTES)
    throw new AuthError("Choose an image smaller than 2 MB.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const ext =
    file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
  if (uploadError)
    throw new AuthError(
      "We could not upload that picture. Try again in a moment.",
    );

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = urlData.publicUrl;
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);
  if (error)
    throw new AuthError(
      "Your picture uploaded but we could not save it. Try again.",
    );

  if (state.status === "signed-in" && state.user.id === userId) {
    setState({
      status: "signed-in",
      user: { ...state.user, avatar_url: avatarUrl },
    });
  }
  return avatarUrl;
}

/** Removes the profile picture (initials are shown instead). */
export async function removeAvatar(): Promise<void> {
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to change your picture.");
  const userId = state.user.id;
  const supabase = await requireClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);
  if (error)
    throw new AuthError("We could not remove your picture. Try again.");
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({
      status: "signed-in",
      user: { ...state.user, avatar_url: undefined },
    });
  }
}

/** Sends a phone sign-in code through the WhatsApp channel configured in Supabase Auth. */
export async function sendWhatsAppOtp(input: string): Promise<void> {
  const phone = normalizePhone(input);
  const supabase = await requireClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "whatsapp" },
  });
  if (error) throw toAuthError(error);
}

/** Verifies a WhatsApp-delivered phone OTP and starts the Supabase session. */
export async function verifyWhatsAppOtp(
  input: string,
  token: string,
): Promise<VexonUser> {
  const phone = normalizePhone(input);
  const code = token.trim();
  if (!/^\d{6}$/.test(code))
    throw new AuthError("Enter the 6-digit code we sent on WhatsApp.");
  const supabase = await requireClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: "sms",
  });
  if (error) throw toAuthError(error);
  if (!data.session || !data.user)
    throw new AuthError(
      "We could not verify that code. Request a new one and try again.",
    );
  applySession(data.session);
  return toUser(data.user);
}

/** Trims, collapses spaces and checks length. Throws an AuthError with a message safe to show. */
export function cleanDisplayName(input: string): string {
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < 1) throw new AuthError("Enter your name.");
  if (name.length > 60)
    throw new AuthError("Name must be 60 characters or fewer.");
  return name;
}

/** Changes the signed-in person's display name (stored in their `profiles` row). */
export async function updateDisplayName(input: string): Promise<void> {
  const name = cleanDisplayName(input);
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to change your name.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", userId)
    .select("display_name")
    .maybeSingle();
  if (error || !data)
    throw new AuthError("We could not save your name. Try again in a moment.");

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
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to update your avatar.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", userId);
  if (error)
    throw new AuthError(
      "We could not save your avatar. Try again in a moment.",
    );

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
  if (cleanBio.length > 500)
    throw new AuthError("Bio must be 500 characters or fewer.");
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to update your bio.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { error } = await supabase
    .from("profiles")
    .update({ bio: cleanBio || null })
    .eq("id", userId);
  if (error)
    throw new AuthError("We could not save your bio. Try again in a moment.");

  try {
    await supabase.auth.updateUser({ data: { bio: cleanBio || null } });
  } catch {
    /* the profile row is the source of truth */
  }
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({
      status: "signed-in",
      user: { ...state.user, bio: cleanBio || undefined },
    });
  }
}

export async function updateSocialLinks(
  links: Record<string, string>,
): Promise<void> {
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to update your links.");
  const userId = state.user.id;
  const supabase = await requireClient();

  const { error } = await supabase
    .from("profiles")
    .update({ social_links: links })
    .eq("id", userId);
  if (error)
    throw new AuthError("We could not save your links. Try again in a moment.");

  try {
    await supabase.auth.updateUser({ data: { social_links: links } });
  } catch {
    /* the profile row is the source of truth */
  }
  if (state.status === "signed-in" && state.user.id === userId) {
    setState({
      status: "signed-in",
      user: { ...state.user, social_links: links },
    });
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

/** Deletes the currently signed-in user's account. */
export async function deleteAccount(): Promise<void> {
  if (state.status !== "signed-in")
    throw new AuthError("Sign in to delete your account.");
  const supabase = await requireClient();
  const { error } = await supabase.auth.admin.deleteUser(state.user.id);
  if (error) throw toAuthError(error);
  setState({ status: "signed-out" });
}

/* ---------- helpers ---------- */

export function initials(
  user: Pick<VexonUser, "name" | "email" | "phone">,
): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0)
    return (user.email[0] ?? user.phone?.[0] ?? "?").toUpperCase();
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
  const avatarUrl = [meta["avatar_url"], meta["picture"]].find(
    (v): v is string => typeof v === "string" && /^https:\/\//.test(v),
  );
  return {
    id: user.id,
    email,
    phone,
    name: (fromMeta ?? fallbackName).trim(),
    avatar_url: avatarUrl,
    bio: meta["bio"] as string | undefined,
    social_links: meta["social_links"] as Record<string, string> | undefined,
  };
}

function siteOrigin(): string {
  return globalThis.location?.origin ?? "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    throw new AuthError("Enter a valid email address.");
}

function normalizePhone(input: string): string {
  const phone = input.trim().replace(/[\s().-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new AuthError(
      "Enter a valid WhatsApp number with its country code, such as +254712345678.",
    );
  }
  return phone;
}

function toAuthError(error: {
  message: string;
  code?: string | undefined;
  status?: number | undefined;
}): AuthError {
  switch (error.code) {
    case "invalid_credentials":
      return new AuthError("Email or password is incorrect.");
    case "email_not_confirmed":
      return new AuthError(
        "Email confirmation is still enabled. Disable Confirm email in Supabase Auth settings to use password-only sign-in.",
      );
    case "user_already_exists":
    case "email_exists":
      return new AuthError(
        "An account with this email already exists. Sign in instead.",
      );
    case "weak_password":
      return new AuthError(
        "That password is too easy to guess. Choose a stronger one.",
      );
    case "signup_disabled":
      return new AuthError("New accounts are turned off right now.");
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return new AuthError(
        "Too many attempts. Wait a few minutes and try again.",
      );
    case "otp_expired":
    case "invalid_token":
      return new AuthError(
        "That code is invalid or expired. Request a new code and try again.",
      );
  }
  if (error.status === 429)
    return new AuthError(
      "Too many attempts. Wait a few minutes and try again.",
    );
  if (error.status === 0 || /failed to fetch|network/i.test(error.message)) {
    return new AuthError(
      "Can't reach the account service. Check your connection and try again.",
    );
  }
  return new AuthError("Something went wrong. Try again.");
}
