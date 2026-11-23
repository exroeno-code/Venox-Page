/**
 * VEXON waitlist (AI assistant concept) — core logic (no React, SSR-safe).
 * Sign-ups are stored in the Supabase `waitlist` table (see supabase/migrations).
 */
import { getClient } from "./auth-core";

export const WAITLIST_TOPIC = "ai-assistant";

export class WaitlistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WaitlistError";
  }
}

export type WaitlistInput = { email: string; name?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims and checks the form. Returns cleaned values or throws a WaitlistError. */
export function validateWaitlist(input: WaitlistInput): { email: string; name: string | null } {
  const email = input.email.trim().toLowerCase();
  const name = (input.name ?? "").replace(/\s+/g, " ").trim();
  if (!EMAIL_RE.test(email) || email.length > 254) throw new WaitlistError("Please enter a valid email address.");
  if (name.length > 80) throw new WaitlistError("Name must be 80 characters or fewer.");
  return { email, name: name || null };
}

/** Adds an email to the waitlist. Someone already on the list is treated as success. */
export async function joinWaitlist(input: WaitlistInput): Promise<void> {
  const clean = validateWaitlist(input);
  let supabase = null;
  try {
    supabase = await getClient();
  } catch {
    /* handled below */
  }
  if (!supabase) throw new WaitlistError("The waitlist is unavailable right now. Please try again later.");

  const { data } = await supabase.auth.getSession();
  const { error } = await supabase
    .from("waitlist")
    .insert({ ...clean, topic: WAITLIST_TOPIC, user_id: data.session?.user.id ?? null });
  // 23505 = unique violation: this email is already on the list, which is what they wanted.
  if (error && error.code !== "23505") {
    console.error("Waitlist sign-up failed.", error);
    throw new WaitlistError("We could not add you right now. Please try again in a moment.");
  }
}
