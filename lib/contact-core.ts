/**
 * VEXON contact form — core logic (no React, SSR-safe).
 * Messages are stored in the Supabase `contact_messages` table (see supabase/migrations).
 */
import { ACCOUNTS_CONFIGURED, getClient } from "./auth-core";

/** True when the form can save messages. */
export const CONTACT_FORM_ENABLED = ACCOUNTS_CONFIGURED;

export const NAME_MAX = 80;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

export class ContactError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactError";
  }
}

export type ContactInput = { name: string; email: string; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims and checks the form. Returns the cleaned values or throws a ContactError. */
export function validateContact(input: ContactInput): ContactInput {
  const name = input.name.replace(/\s+/g, " ").trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();
  if (!name) throw new ContactError("Please enter your name.");
  if (name.length > NAME_MAX) throw new ContactError(`Name must be ${NAME_MAX} characters or fewer.`);
  if (!EMAIL_RE.test(email) || email.length > 254) throw new ContactError("Please enter a valid email address.");
  if (message.length < MESSAGE_MIN) throw new ContactError(`Please write at least ${MESSAGE_MIN} characters.`);
  if (message.length > MESSAGE_MAX) throw new ContactError(`Message must be ${MESSAGE_MAX} characters or fewer.`);
  return { name, email, message };
}

/** Saves a message. Throws ContactError with a message that is safe to show. */
export async function sendContactMessage(input: ContactInput): Promise<void> {
  const clean = validateContact(input);
  let supabase = null;
  try {
    supabase = await getClient();
  } catch {
    /* handled below */
  }
  if (!supabase) throw new ContactError("The contact form is unavailable right now. Please try again later.");

  // Attach the account id when the sender is signed in (the database checks it is really theirs).
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ ...clean, user_id: data.session?.user.id ?? null });
  if (error) {
    console.error("Contact message failed.", error);
    throw new ContactError("We could not send your message. Please try again in a moment.");
  }
}
