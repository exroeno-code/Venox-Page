// @vitest-environment node
import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";

import {
  AuthError,
  cleanDisplayName,
  getAuthState,
  initials,
  resetAuthForTesting,
  sendWhatsAppOtp,
  signIn,
  signOut,
  signUp,
  startAuth,
  updateDisplayName,
  verifyWhatsAppOtp,
} from "@/lib/auth-core";

// A small in-memory stand-in for Supabase Auth so the tests never touch the network.
function makeFakeSupabase(opts: { confirmEmails: boolean }) {
  type Row = {
    id: string;
    email: string;
    password: string;
    confirmed: boolean;
    name: string;
  };
  const users = new Map<string, Row>();
  const profiles = new Map<string, string>();
  const listeners = new Set<(event: string, session: unknown) => void>();
  let session: { user: Record<string, unknown> } | null = null;
  let lastOtpRequest: { phone: string; channel?: string } | null = null;
  let lastOtpVerificationType: string | null = null;
  const authUser = (u: Row) => ({
    id: u.id,
    email: u.email,
    user_metadata: { display_name: u.name },
  });
  const emit = (event: string) => listeners.forEach((l) => l(event, session));

  const fake = {
    auth: {
      onAuthStateChange(cb: (event: string, session: unknown) => void) {
        listeners.add(cb);
        queueMicrotask(() => cb("INITIAL_SESSION", session));
        return {
          data: { subscription: { unsubscribe: () => listeners.delete(cb) } },
        };
      },
      async getSession() {
        return { data: { session }, error: null };
      },
      async signUp({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options: { data: { display_name: string } };
      }) {
        if (users.has(email))
          return {
            data: { user: { identities: [] }, session: null },
            error: null,
          };
        const row: Row = {
          id: `id-${users.size + 1}`,
          email,
          password,
          confirmed: !opts.confirmEmails,
          name: options.data.display_name,
        };
        users.set(email, row);
        profiles.set(row.id, row.name);
        session = row.confirmed ? { user: authUser(row) } : null;
        return {
          data: { user: { ...authUser(row), identities: [{}] }, session },
          error: null,
        };
      },
      async signInWithPassword({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) {
        const row = users.get(email);
        if (!row || row.password !== password) {
          return {
            data: { session: null },
            error: {
              code: "invalid_credentials",
              message: "Invalid login credentials",
              status: 400,
            },
          };
        }
        if (!row.confirmed) {
          return {
            data: { session: null },
            error: {
              code: "email_not_confirmed",
              message: "Email not confirmed",
              status: 400,
            },
          };
        }
        session = { user: authUser(row) };
        emit("SIGNED_IN");
        return { data: { session }, error: null };
      },
      async signInWithOtp({
        phone,
        options,
      }: {
        phone: string;
        options?: { channel?: string };
      }) {
        lastOtpRequest = options?.channel
          ? { phone, channel: options.channel }
          : { phone };
        return { data: {}, error: null };
      },
      async verifyOtp({
        phone,
        token,
        type,
      }: {
        phone?: string;
        token: string;
        type: string;
      }) {
        lastOtpVerificationType = type;
        if (!phone)
          return {
            data: { user: null, session: null },
            error: {
              code: "otp_expired",
              message: "Invalid code",
              status: 400,
            },
          };
        if (
          !lastOtpRequest ||
          lastOtpRequest.phone !== phone ||
          token !== "123456"
        ) {
          return {
            data: { user: null, session: null },
            error: {
              code: "otp_expired",
              message: "Invalid code",
              status: 400,
            },
          };
        }
        const user = { id: "phone-user", phone, user_metadata: {} };
        session = { user };
        emit("SIGNED_IN");
        return { data: { user, session }, error: null };
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
          maybeSingle: async () => ({
            data: profiles.has(id) ? { display_name: profiles.get(id) } : null,
            error: null,
          }),
        }),
      }),
      update: ({ display_name }: { display_name: string }) => ({
        eq: (_column: string, id: string) => ({
          select: () => ({
            maybeSingle: async () => {
              if (!profiles.has(id)) return { data: null, error: null };
              profiles.set(id, display_name);
              return { data: { display_name }, error: null };
            },
          }),
        }),
      }),
    }),
  };
  return {
    client: fake as unknown as SupabaseClient,
    setProfileName: (email: string, name: string) =>
      void profiles.set(users.get(email)!.id, name),
    get lastOtpRequest() {
      return lastOtpRequest;
    },
    get lastOtpVerificationType() {
      return lastOtpVerificationType;
    },
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("Vexvano Labs accounts (Supabase)", () => {
  let fake: ReturnType<typeof makeFakeSupabase>;
  beforeEach(() => {
    fake = makeFakeSupabase({ confirmEmails: false });
    resetAuthForTesting(fake.client);
  });

  it("creates an account and signs in immediately with email and password", async () => {
    startAuth();
    await flush();
    expect(getAuthState().status).toBe("signed-out");

    const user = await signUp({
      name: "  Enosh   Yeswa ",
      email: "Enosh@Example.com ",
      password: "correct horse",
    });
    expect(user).toMatchObject({
      name: "Enosh Yeswa",
      email: "enosh@example.com",
    });
    expect(getAuthState()).toEqual({ status: "signed-in", user });

    await signOut();
    expect(getAuthState().status).toBe("signed-out");
  });

  it("explains that email confirmation must be disabled for password-only signup", async () => {
    resetAuthForTesting(makeFakeSupabase({ confirmEmails: true }).client);
    await expect(
      signUp({
        name: "Vince",
        email: "vince@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Email confirmation is still enabled");
    expect(getAuthState().status).not.toBe("signed-in");
  });

  it("uses the display name stored in the profiles table", async () => {
    await signUp({
      name: "Vince",
      email: "vince@example.com",
      password: "password123",
    });
    fake.setProfileName("vince@example.com", "Vince Odhiambo");
    await signIn({ email: "vince@example.com", password: "password123" });
    await flush();
    expect(getAuthState()).toMatchObject({
      status: "signed-in",
      user: { name: "Vince Odhiambo" },
    });
  });

  it("saves profile name changes and restores them from the profile record", async () => {
    await signUp({
      name: "Vince",
      email: "vince@example.com",
      password: "password123",
    });
    await signIn({ email: "vince@example.com", password: "password123" });

    await updateDisplayName("Vince Odhiambo");
    expect(getAuthState()).toMatchObject({
      status: "signed-in",
      user: { name: "Vince Odhiambo" },
    });

    resetAuthForTesting(fake.client);
    startAuth();
    await flush();
    expect(getAuthState()).toMatchObject({
      status: "signed-in",
      user: { name: "Vince Odhiambo" },
    });
  });

  it("restores an existing session on start", async () => {
    await signUp({
      name: "Vince",
      email: "vince@example.com",
      password: "password123",
    });
    await signIn({ email: "vince@example.com", password: "password123" });
    resetAuthForTesting(fake.client);
    expect(getAuthState().status).toBe("loading");
    startAuth();
    await flush();
    expect(getAuthState().status).toBe("signed-in");
  });

  it("rejects a wrong password, an unknown email and a duplicate email with friendly messages", async () => {
    await signUp({
      name: "Vince",
      email: "vince@example.com",
      password: "password123",
    });
    await expect(
      signIn({ email: "vince@example.com", password: "wrong-password" }),
    ).rejects.toThrow("Email or password is incorrect.");
    await expect(
      signIn({ email: "nobody@example.com", password: "password123" }),
    ).rejects.toThrow("Email or password is incorrect.");
    await signOut();
    await expect(
      signUp({
        name: "Other",
        email: "vince@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(AuthError);
    expect(getAuthState().status).not.toBe("signed-in");
  });

  it("validates name, email and password length before calling Supabase", async () => {
    await expect(
      signUp({ name: "", email: "a@b.co", password: "password123" }),
    ).rejects.toThrow("Enter your name.");
    await expect(
      signUp({ name: "A", email: "not-an-email", password: "password123" }),
    ).rejects.toThrow("valid email");
    await expect(
      signUp({ name: "A", email: "a@b.co", password: "short" }),
    ).rejects.toThrow("at least 8");
  });

  it("signs in straight away when email confirmation is turned off", async () => {
    resetAuthForTesting(makeFakeSupabase({ confirmEmails: false }).client);
    const result = await signUp({
      name: "Vince",
      email: "vince@example.com",
      password: "password123",
    });
    expect(result).toMatchObject({ email: "vince@example.com", name: "Vince" });
    expect(getAuthState().status).toBe("signed-in");
  });

  it("requests WhatsApp OTP using a normalized international phone number", async () => {
    await sendWhatsAppOtp(" +254 712-345-678 ");
    expect(fake.lastOtpRequest).toEqual({
      phone: "+254712345678",
      channel: "whatsapp",
    });
    await expect(sendWhatsAppOtp("0712345678")).rejects.toThrow("country code");
  });

  it("verifies WhatsApp OTP and signs the phone user in", async () => {
    await sendWhatsAppOtp("+254712345678");
    await expect(verifyWhatsAppOtp("+254712345678", "12")).rejects.toThrow(
      "6-digit code",
    );
    const user = await verifyWhatsAppOtp("+254712345678", "123456");
    expect(fake.lastOtpVerificationType).toBe("sms");
    expect(user).toMatchObject({
      phone: "+254712345678",
      name: "+254712345678",
    });
    expect(getAuthState()).toEqual({ status: "signed-in", user });
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
