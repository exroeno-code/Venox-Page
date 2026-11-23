// @vitest-environment node
import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";

import {
  AuthError,
  cleanDisplayName,
  getAuthState,
  initials,
  resetAuthForTesting,
  signIn,
  signOut,
  signUp,
  startAuth,
} from "@/lib/auth-core";

// A small in-memory stand-in for Supabase Auth so the tests never touch the network.
function makeFakeSupabase(opts: { confirmEmails: boolean }) {
  type Row = { id: string; email: string; password: string; confirmed: boolean; name: string };
  const users = new Map<string, Row>();
  const profiles = new Map<string, string>();
  const listeners = new Set<(event: string, session: unknown) => void>();
  let session: { user: Record<string, unknown> } | null = null;
  const authUser = (u: Row) => ({ id: u.id, email: u.email, user_metadata: { display_name: u.name } });
  const emit = (event: string) => listeners.forEach((l) => l(event, session));

  const fake = {
    auth: {
      onAuthStateChange(cb: (event: string, session: unknown) => void) {
        listeners.add(cb);
        queueMicrotask(() => cb("INITIAL_SESSION", session));
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
      },
      async getSession() {
        return { data: { session }, error: null };
      },
      async signUp({ email, password, options }: { email: string; password: string; options: { data: { display_name: string } } }) {
        if (users.has(email)) return { data: { user: { identities: [] }, session: null }, error: null };
        const row: Row = { id: `id-${users.size + 1}`, email, password, confirmed: !opts.confirmEmails, name: options.data.display_name };
        users.set(email, row);
        profiles.set(row.id, row.name);
        session = row.confirmed ? { user: authUser(row) } : null;
        return { data: { user: { ...authUser(row), identities: [{}] }, session }, error: null };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const row = users.get(email);
        if (!row || row.password !== password) {
          return { data: { session: null }, error: { code: "invalid_credentials", message: "Invalid login credentials", status: 400 } };
        }
        if (!row.confirmed) {
          return { data: { session: null }, error: { code: "email_not_confirmed", message: "Email not confirmed", status: 400 } };
        }
        session = { user: authUser(row) };
        emit("SIGNED_IN");
        return { data: { session }, error: null };
      },
      async signOut() {
        session = null;
        emit("SIGNED_OUT");
        return { error: null };
      },
    },
    from: () => ({
      select: () => ({
        eq: (_column: string, id: string) => ({
          maybeSingle: async () => ({ data: profiles.has(id) ? { display_name: profiles.get(id) } : null, error: null }),
        }),
      }),
    }),
  };
  return {
    client: fake as unknown as SupabaseClient,
    confirm: (email: string) => void (users.get(email)!.confirmed = true),
    setProfileName: (email: string, name: string) => void profiles.set(users.get(email)!.id, name),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("Vexon accounts (Supabase)", () => {
  let fake: ReturnType<typeof makeFakeSupabase>;
  beforeEach(() => {
    fake = makeFakeSupabase({ confirmEmails: true });
    resetAuthForTesting(fake.client);
  });

  it("creates an account that must be confirmed by email before sign-in", async () => {
    startAuth();
    await flush();
    expect(getAuthState().status).toBe("signed-out");

    const result = await signUp({ name: "  Enosh   Yeswa ", email: "Enosh@Example.com ", password: "correct horse" });
    expect(result).toEqual({ needsConfirmation: true });
    expect(getAuthState().status).toBe("signed-out");

    await expect(signIn({ email: "enosh@example.com", password: "correct horse" })).rejects.toThrow("Confirm your email");

    fake.confirm("enosh@example.com");
    const user = await signIn({ email: "ENOSH@example.com", password: "correct horse" });
    expect(user).toMatchObject({ name: "Enosh Yeswa", email: "enosh@example.com" });
    expect(getAuthState()).toEqual({ status: "signed-in", user });

    await signOut();
    expect(getAuthState().status).toBe("signed-out");
  });

  it("uses the display name stored in the profiles table", async () => {
    await signUp({ name: "Vince", email: "vince@example.com", password: "password123" });
    fake.confirm("vince@example.com");
    fake.setProfileName("vince@example.com", "Vince Odhiambo");
    await signIn({ email: "vince@example.com", password: "password123" });
    await flush();
    expect(getAuthState()).toMatchObject({ status: "signed-in", user: { name: "Vince Odhiambo" } });
  });

  it("restores an existing session on start", async () => {
    await signUp({ name: "Vince", email: "vince@example.com", password: "password123" });
    fake.confirm("vince@example.com");
    await signIn({ email: "vince@example.com", password: "password123" });
    resetAuthForTesting(fake.client);
    expect(getAuthState().status).toBe("loading");
    startAuth();
    await flush();
    expect(getAuthState().status).toBe("signed-in");
  });

  it("rejects a wrong password, an unknown email and a duplicate email with friendly messages", async () => {
    await signUp({ name: "Vince", email: "vince@example.com", password: "password123" });
    fake.confirm("vince@example.com");
    await expect(signIn({ email: "vince@example.com", password: "wrong-password" })).rejects.toThrow("Email or password is incorrect.");
    await expect(signIn({ email: "nobody@example.com", password: "password123" })).rejects.toThrow("Email or password is incorrect.");
    await expect(signUp({ name: "Other", email: "vince@example.com", password: "password123" })).rejects.toBeInstanceOf(AuthError);
    expect(getAuthState().status).not.toBe("signed-in");
  });

  it("validates name, email and password length before calling Supabase", async () => {
    await expect(signUp({ name: "", email: "a@b.co", password: "password123" })).rejects.toThrow("Enter your name.");
    await expect(signUp({ name: "A", email: "not-an-email", password: "password123" })).rejects.toThrow("valid email");
    await expect(signUp({ name: "A", email: "a@b.co", password: "short" })).rejects.toThrow("at least 8");
  });

  it("signs in straight away when email confirmation is turned off", async () => {
    resetAuthForTesting(makeFakeSupabase({ confirmEmails: false }).client);
    const result = await signUp({ name: "Vince", email: "vince@example.com", password: "password123" });
    expect(result).toEqual({ needsConfirmation: false });
    expect(getAuthState().status).toBe("signed-in");
  });

  it("builds initials from the name, falling back to the email", () => {
    expect(initials({ name: "Enosh Yeswa", email: "e@x.co" })).toBe("EY");
    expect(initials({ name: "Vince", email: "v@x.co" })).toBe("V");
    expect(initials({ name: " ", email: "zed@x.co" })).toBe("Z");
  });
});

describe("cleanDisplayName", () => {
  it("trims and collapses spaces", () => {
    expect(cleanDisplayName("  Enosh   Yeswa ")).toBe("Enosh Yeswa");
  });

  it("rejects empty and over-long names", () => {
    expect(() => cleanDisplayName("   ")).toThrow(AuthError);
    expect(() => cleanDisplayName("x".repeat(61))).toThrow(/60 characters/);
  });
});
