/**
 * VEXON learning applications — core logic (no React, SSR-safe).
 * Applications are stored in the Supabase `course_applications` table (see supabase/migrations).
 */
import { ACCOUNTS_CONFIGURED, getClient } from "./auth-core";
import { findProgramme } from "./programmes";

/** True when the form can save applications. */
export const APPLICATION_FORM_ENABLED = ACCOUNTS_CONFIGURED;

export const NAME_MAX = 80;
export const NOTE_MAX = 1000;

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  level: string;
  programme: string;
  note?: string;
};

export type CleanApplication = {
  name: string;
  email: string;
  phone: string;
  level: string;
  programme: string;
  note: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims and checks the form. Returns cleaned values or throws an ApplicationError. */
export function validateApplication(input: ApplicationInput): CleanApplication {
  const name = input.name.replace(/\s+/g, " ").trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.replace(/[^\d+]/g, "");
  const note = (input.note ?? "").trim();
  if (!findProgramme(input.level, input.programme)) throw new ApplicationError("Choose a level and a programme first.");
  if (!name) throw new ApplicationError("Please enter your name.");
  if (name.length > NAME_MAX) throw new ApplicationError(`Name must be ${NAME_MAX} characters or fewer.`);
  if (!EMAIL_RE.test(email) || email.length > 254) throw new ApplicationError("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 9 || phone.length > 16) throw new ApplicationError("Please enter a valid phone number.");
  if (note.length > NOTE_MAX) throw new ApplicationError(`Note must be ${NOTE_MAX} characters or fewer.`);
  return { name, email, phone, level: input.level, programme: input.programme, note: note || null };
}

/** Saves an application. Throws ApplicationError with a message that is safe to show. */
export async function submitApplication(input: ApplicationInput): Promise<void> {
  const clean = validateApplication(input);
  let supabase = null;
  try {
    supabase = await getClient();
  } catch {
    /* handled below */
  }
  if (!supabase) throw new ApplicationError("Applications are unavailable right now. Please try again later.");

  const { data } = await supabase.auth.getSession();
  const { error } = await supabase
    .from("course_applications")
    .insert({ ...clean, user_id: data.session?.user.id ?? null });
  if (error) {
    console.error("Application failed.", error);
    throw new ApplicationError("We could not send your application. Please try again in a moment.");
  }
}
