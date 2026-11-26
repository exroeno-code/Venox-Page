// @vitest-environment node
import { readFileSync } from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";

import { resetAuthForTesting, signUp } from "@/lib/auth-core";
import {
  getMyOnboarding,
  helpTopicOptionsFor,
  saveMyOnboarding,
  shouldPromptForOnboarding,
  skipMyOnboarding,
  validateOnboardingAnswers,
} from "@/lib/onboarding-core";

function makeFakeSupabase(initialStatus: "pending" | "completed" = "pending") {
  const userId = "user-123";
  const row: Record<string, unknown> = {
    id: userId,
    owns_business: null,
    business_type: null,
    business_type_other: null,
    help_topics: [],
    help_other: null,
    description: null,
    onboarding_status: initialStatus,
  };
  let lastReadId = "";
  let lastWriteId = "";
  const fake = {
    auth: {
      async signUp() {
        const user = {
          id: userId,
          email: "new@example.com",
          user_metadata: { display_name: "New User" },
          identities: [{}],
        };
        return { data: { user, session: { user } }, error: null };
      },
    },
    from(table: string) {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        };
      }
      if (table !== "user_preferences")
        throw new Error(`Unexpected table: ${table}`);
      return {
        select: () => ({
          eq: (_column: string, id: string) => {
            lastReadId = id;
            return {
              maybeSingle: async () => ({ data: { ...row }, error: null }),
            };
          },
        }),
        upsert: async (changes: Record<string, unknown>) => {
          lastWriteId = String(changes["id"] ?? "");
          Object.assign(row, changes);
          return { error: null };
        },
      };
    },
  };
  return {
    client: fake as unknown as SupabaseClient,
    row,
    get lastReadId() {
      return lastReadId;
    },
    get lastWriteId() {
      return lastWriteId;
    },
  };
}

const validAnswers = {
  role: "business_owner",
  businessOwnership: "yes",
  businessType: "other",
  businessTypeOther: "  Repair services  ",
  helpTopics: ["digital_tools", "other"],
  helpOther: "  Local support  ",
  description: "  I run a small shop.  ",
};

beforeEach(() => {
  resetAuthForTesting(null);
});

describe("optional account onboarding", () => {
  it("shows onboarding for a newly created account while its trigger-created record is pending", async () => {
    const fake = makeFakeSupabase("pending");
    resetAuthForTesting(fake.client);
    await signUp({
      name: "New User",
      email: "new@example.com",
      password: "valid-pass-123",
    });

    const record = await getMyOnboarding();
    expect(record.status).toBe("pending");
    expect(shouldPromptForOnboarding(record.status)).toBe(true);
  });

  it("records Skip for now separately and does not erase any saved answers", async () => {
    const fake = makeFakeSupabase("pending");
    resetAuthForTesting(fake.client);
    await signUp({
      name: "New User",
      email: "new@example.com",
      password: "valid-pass-123",
    });
    fake.row["description"] = "Previously saved note";

    await skipMyOnboarding();
    const record = await getMyOnboarding();
    expect(record.status).toBe("skipped");
    expect(record.description).toBe("Previously saved note");
    expect(shouldPromptForOnboarding(record.status)).toBe(false);
  });

  it("lets returning accounts go straight through without another onboarding prompt", async () => {
    const fake = makeFakeSupabase("completed");
    resetAuthForTesting(fake.client);
    await signUp({
      name: "Returning User",
      email: "returning@example.com",
      password: "valid-pass-123",
    });

    const record = await getMyOnboarding();
    expect(record.status).toBe("completed");
    expect(shouldPromptForOnboarding(record.status)).toBe(false);
  });

  it("saves and edits the signed-in user's preferences", async () => {
    const fake = makeFakeSupabase("pending");
    resetAuthForTesting(fake.client);
    await signUp({
      name: "New User",
      email: "new@example.com",
      password: "valid-pass-123",
    });

    const saved = await saveMyOnboarding(validAnswers);
    expect(saved).toMatchObject({
      status: "completed",
      businessTypeOther: "Repair services",
      helpOther: "Local support",
      description: "I run a small shop.",
    });
    expect(fake.row["onboarding_status"]).toBe("completed");

    const edited = await saveMyOnboarding({
      role: "business_owner",
      businessOwnership: "no",
      businessType: "technology",
      businessTypeOther: "ignore this because answer is no",
      helpTopics: ["computing_classes"],
      helpOther: "ignore this without Other",
      description: "Updated note",
    });
    expect(edited).toMatchObject({
      businessOwnership: "no",
      businessType: "",
      businessTypeOther: "",
      helpTopics: ["computing_classes"],
      helpOther: "",
      description: "Updated note",
    });
    expect(fake.row["business_type"]).toBeNull();
    expect(fake.row["help_other"]).toBeNull();
  });

  it("validates required ownership, choice lists, and the free-text limit", () => {
    expect(() =>
      validateOnboardingAnswers({
        ...validAnswers,
        businessOwnership: "maybe",
      }),
    ).toThrow(/Choose an answer/);
    expect(() =>
      validateOnboardingAnswers({
        ...validAnswers,
        businessType: "banking_passwords",
      }),
    ).toThrow(/business type/);
    expect(() =>
      validateOnboardingAnswers({
        ...validAnswers,
        helpTopics: ["unlisted_service"],
      }),
    ).toThrow(/help topics/);
    expect(() =>
      validateOnboardingAnswers({
        ...validAnswers,
        description: "x".repeat(501),
      }),
    ).toThrow(/500 characters/);
    expect(
      validateOnboardingAnswers({
        ...validAnswers,
        helpTopics: ["other", "other"],
      }).helpTopics,
    ).toEqual(["other"]);
    expect(
      validateOnboardingAnswers({
        ...validAnswers,
        helpTopics: ["online_forex_trading"],
      }).helpTopics,
    ).toEqual(["online_forex_trading"]);
    expect(
      validateOnboardingAnswers({
        ...validAnswers,
        helpTopics: ["responsible_goods_trade"],
      }).helpTopics,
    ).toEqual(["responsible_goods_trade"]);
  });

  it("offers forex to everyone and only shows goods trade as a selected legacy preference", () => {
    expect(helpTopicOptionsFor([])).toContain("online_forex_trading");
    expect(helpTopicOptionsFor([])).not.toContain("responsible_goods_trade");
    expect(helpTopicOptionsFor(["responsible_goods_trade"])).toContain(
      "responsible_goods_trade",
    );
  });

  it("scopes reads and writes to the authenticated user's ID", async () => {
    const fake = makeFakeSupabase("pending");
    resetAuthForTesting(fake.client);
    await signUp({
      name: "New User",
      email: "new@example.com",
      password: "valid-pass-123",
    });

    await getMyOnboarding();
    await skipMyOnboarding();
    expect(fake.lastReadId).toBe("user-123");
    expect(fake.lastWriteId).toBe("user-123");
  });

  it("defines row-level policies that bind select, insert, and update to auth.uid()", () => {
    const migration = readFileSync(
      new URL(
        "../supabase/migrations/20261123040000_user_preferences_onboarding.sql",
        import.meta.url,
      ),
      "utf8",
    );
    expect(migration).toMatch(/enable row level security/i);
    expect(migration).toMatch(
      /for select to authenticated\s+using \(\(select auth\.uid\(\)\) = id\)/i,
    );
    expect(migration).toMatch(
      /for insert to authenticated\s+with check \(\(select auth\.uid\(\)\) = id\)/i,
    );
    expect(migration).toMatch(
      /for update to authenticated\s+using \(\(select auth\.uid\(\)\) = id\)\s+with check \(\(select auth\.uid\(\)\) = id\)/i,
    );
    expect(migration).toMatch(/on delete cascade/i);
    expect(migration).toMatch(/values \(new\.id, 'pending'\)/i);
    expect(migration).toMatch(
      /create trigger on_auth_user_created_preferences\s+after insert on auth\.users\s+for each row execute function public\.handle_new_user_preferences\(\)/i,
    );
  });
});
