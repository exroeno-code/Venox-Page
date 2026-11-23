import { AuthError, getAuthState, getClient } from "@/lib/auth-core";

export const BUSINESS_TYPES = [
  "retail",
  "food_hospitality",
  "professional_services",
  "education_training",
  "technology",
  "agriculture",
  "manufacturing",
  "other",
] as const;

export const BUSINESS_TYPE_LABELS: Record<
  (typeof BUSINESS_TYPES)[number],
  string
> = {
  retail: "Retail or e-commerce",
  food_hospitality: "Food or hospitality",
  professional_services: "Professional services",
  education_training: "Education or training",
  technology: "Technology",
  agriculture: "Agriculture",
  manufacturing: "Manufacturing",
  other: "Other",
};

export const HELP_TOPICS = [
  "digital_tools",
  "online_presence",
  "business_training",
  "computing_classes",
  "responsible_goods_trade",
  "other",
] as const;

export const HELP_TOPIC_LABELS: Record<(typeof HELP_TOPICS)[number], string> = {
  digital_tools: "Digital tools",
  online_presence: "Online presence",
  business_training: "Business training",
  computing_classes: "Computing classes",
  responsible_goods_trade: "Responsible goods trade",
  other: "Other",
};

export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type HelpTopic = (typeof HELP_TOPICS)[number];
export type OnboardingStatus = "pending" | "skipped" | "completed";
export type BusinessOwnership = "yes" | "no" | "prefer_not_to_say";

export type OnboardingAnswers = {
  businessOwnership: BusinessOwnership | "";
  businessType: BusinessType | "";
  businessTypeOther: string;
  helpTopics: HelpTopic[];
  helpOther: string;
  description: string;
};

export type OnboardingRecord = OnboardingAnswers & {
  status: OnboardingStatus;
};

export const EMPTY_ONBOARDING_ANSWERS: OnboardingAnswers = {
  businessOwnership: "",
  businessType: "",
  businessTypeOther: "",
  helpTopics: [],
  helpOther: "",
  description: "",
};

const MAX_DESCRIPTION_CHARS = 500;
const MAX_OTHER_CHARS = 100;
const BUSINESS_OWNERSHIP = ["yes", "no", "prefer_not_to_say"] as const;

export class OnboardingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OnboardingError";
  }
}

/** Returns true only for new accounts that have not completed or skipped onboarding. */
export function shouldPromptForOnboarding(status: OnboardingStatus): boolean {
  return status === "pending";
}

/** Validate and normalize form data before sending it to Supabase. */
export function validateOnboardingAnswers(input: unknown): OnboardingAnswers {
  if (!input || typeof input !== "object")
    throw new OnboardingError("Check the onboarding form and try again.");
  const raw = input as Record<string, unknown>;
  const ownership = raw["businessOwnership"];
  if (!BUSINESS_OWNERSHIP.includes(ownership as BusinessOwnership)) {
    throw new OnboardingError(
      "Choose an answer about whether you run a business, or select prefer not to say.",
    );
  }

  const businessType =
    raw["businessType"] === "" || raw["businessType"] == null
      ? ""
      : raw["businessType"];
  if (
    businessType !== "" &&
    !BUSINESS_TYPES.includes(businessType as BusinessType)
  ) {
    throw new OnboardingError("Choose a business type from the list.");
  }

  const topics = raw["helpTopics"] ?? [];
  if (
    !Array.isArray(topics) ||
    topics.some((topic) => !HELP_TOPICS.includes(topic as HelpTopic))
  ) {
    throw new OnboardingError("Choose help topics from the available options.");
  }

  const businessTypeOther = cleanOptionalText(
    raw["businessTypeOther"],
    "Business type",
    MAX_OTHER_CHARS,
  );
  const helpOther = cleanOptionalText(
    raw["helpOther"],
    "Other support",
    MAX_OTHER_CHARS,
  );
  const description = cleanOptionalText(
    raw["description"],
    "Description",
    MAX_DESCRIPTION_CHARS,
  );
  const ownsBusiness = ownership === "yes";

  return {
    businessOwnership: ownership as BusinessOwnership,
    businessType: ownsBusiness ? (businessType as BusinessType | "") : "",
    businessTypeOther:
      ownsBusiness && businessType === "other" ? businessTypeOther : "",
    helpTopics: [...new Set(topics as HelpTopic[])],
    helpOther: (topics as HelpTopic[]).includes("other") ? helpOther : "",
    description,
  };
}

/** Read only the signed-in person's row; database RLS independently enforces this boundary. */
export async function getMyOnboarding(): Promise<OnboardingRecord> {
  const userId = requireUserId();
  const client = await requireSupabase();
  const { data, error } = await client
    .from("user_preferences")
    .select(
      "owns_business,business_type,business_type_other,help_topics,help_other,description,onboarding_status",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error)
    throw new OnboardingError(
      "We could not load your preferences. Please try again.",
    );
  if (!data) return { ...EMPTY_ONBOARDING_ANSWERS, status: "pending" };

  return {
    businessOwnership: (data.owns_business ?? "") as BusinessOwnership | "",
    businessType: (data.business_type ?? "") as BusinessType | "",
    businessTypeOther: data.business_type_other ?? "",
    helpTopics: Array.isArray(data.help_topics)
      ? (data.help_topics as HelpTopic[])
      : [],
    helpOther: data.help_other ?? "",
    description: data.description ?? "",
    status: (data.onboarding_status ?? "pending") as OnboardingStatus,
  };
}

/** Save answers and mark the separate onboarding status as completed. */
export async function saveMyOnboarding(
  input: unknown,
): Promise<OnboardingRecord> {
  const answers = validateOnboardingAnswers(input);
  const userId = requireUserId();
  const client = await requireSupabase();
  const row = {
    id: userId,
    owns_business: answers.businessOwnership,
    business_type: answers.businessType || null,
    business_type_other: answers.businessTypeOther || null,
    help_topics: answers.helpTopics,
    help_other: answers.helpOther || null,
    description: answers.description || null,
    onboarding_status: "completed",
  };
  const { error } = await client
    .from("user_preferences")
    .upsert(row, { onConflict: "id" });
  if (error)
    throw new OnboardingError(
      "We could not save your preferences. Please try again.",
    );
  return { ...answers, status: "completed" };
}

/** Mark onboarding as skipped without replacing any saved answers. */
export async function skipMyOnboarding(): Promise<void> {
  const userId = requireUserId();
  const client = await requireSupabase();
  const { error } = await client
    .from("user_preferences")
    .upsert({ id: userId, onboarding_status: "skipped" }, { onConflict: "id" });
  if (error)
    throw new OnboardingError(
      "We could not save that choice. Please try again.",
    );
}

function requireUserId(): string {
  const auth = getAuthState();
  if (auth.status !== "signed-in")
    throw new AuthError("Sign in to manage your preferences.");
  return auth.user.id;
}

async function requireSupabase() {
  const client = await getClient();
  if (!client)
    throw new OnboardingError(
      "Account preferences are unavailable right now. Try again later.",
    );
  return client;
}

function cleanOptionalText(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (value == null || value === "") return "";
  if (typeof value !== "string")
    throw new OnboardingError(`${label} must be text.`);
  const text = value.trim();
  if (text.length > maxLength)
    throw new OnboardingError(
      `${label} must be ${maxLength} characters or fewer.`,
    );
  return text;
}
