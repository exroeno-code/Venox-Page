import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Check } from "lucide-react";

import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_ROLE_DESCRIPTIONS,
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPES,
  HELP_TOPIC_LABELS,
  helpTopicOptionsFor,
  getMyOnboarding,
  saveMyRole,
  saveMyBusiness,
  saveMyInterests,
  completeMyOnboarding,
  skipMyOnboarding,
  type UserRole,
  type BusinessType,
  type HelpTopic,
  type BusinessOwnership,
  type OnboardingAnswers,
  type OnboardingRecord,
  type OnboardingStep,
  ONBOARDING_STEPS,
  STEP_LABELS,
  EMPTY_ONBOARDING_ANSWERS,
} from "@/lib/onboarding-core";
import { OnboardingError } from "@/lib/onboarding-core";

const LABEL =
  "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const FIELD =
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const BUTTON =
  "bracket-btn inline-flex min-h-11 items-center justify-center px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:bg-foreground/5 disabled:opacity-60";
const STEP_BUTTON =
  "bracket-btn min-h-11 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

const OWNERSHIP_OPTIONS: { value: BusinessOwnership; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function OnboardingWizard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [record, setRecord] = useState<OnboardingRecord | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );
  const [step, setStep] = useState<OnboardingStep>("role");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void getMyOnboarding()
      .then((result) => {
        if (!active) return;
        setRecord(result);
        setAnswers(toAnswers(result));
        // Determine starting step based on existing data
        if (result.status === "pending" || result.status === "skipped") {
          if (!result.role) setStep("role");
          else if (!result.businessOwnership) setStep("business");
          else setStep("interests");
        } else {
          setStep("complete");
        }
      })
      .catch(() => {
        if (active)
          setError(
            "We could not load your preferences. You can retry, or continue using the site.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt, userId]);

  function change<K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function toggleTopic(topic: HelpTopic) {
    const next = answers.helpTopics.includes(topic)
      ? answers.helpTopics.filter((item) => item !== topic)
      : [...answers.helpTopics, topic];
    change("helpTopics", next);
  }

  async function handleRoleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!answers.role) return;
    setPending(true);
    setError(null);
    try {
      await saveMyRole(answers.role);
      setStep("business");
    } catch (err) {
      setError(
        err instanceof OnboardingError
          ? err.message
          : "Could not save role. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleBusinessSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!answers.businessOwnership) return;
    setPending(true);
    setError(null);
    try {
      await saveMyBusiness({
        businessOwnership: answers.businessOwnership,
        businessType: answers.businessType,
        businessTypeOther: answers.businessTypeOther,
      });
      setStep("interests");
    } catch (err) {
      setError(
        err instanceof OnboardingError
          ? err.message
          : "Could not save business info. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleInterestsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await saveMyInterests({
        helpTopics: answers.helpTopics,
        helpOther: answers.helpOther,
        description: answers.description,
      });
      await completeMyOnboarding();
      setStep("complete");
      setRecord((r) => (r ? { ...r, status: "completed" } : null));
    } catch (err) {
      setError(
        err instanceof OnboardingError
          ? err.message
          : "Could not save interests. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function skipAll() {
    setPending(true);
    setError(null);
    try {
      await skipMyOnboarding();
      await navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof OnboardingError
          ? err.message
          : "Could not skip. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  const currentStepIndex = ONBOARDING_STEPS.indexOf(step);
  const isLastStep = step === "complete";

  if (loading) {
    return (
      <section
        className="mt-8 border-t pt-8"
        aria-labelledby="onboarding-title"
      >
        <p
          role="status"
          className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground"
        >
          Loading…
        </p>
      </section>
    );
  }

  if (error && !record) {
    return (
      <section
        className="mt-8 border-t pt-8"
        aria-labelledby="onboarding-title"
      >
        <p
          role="alert"
          className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
        <button
          type="button"
          onClick={() => setLoadAttempt((a) => a + 1)}
          className={`${BUTTON} mt-4`}
        >
          Retry
        </button>
      </section>
    );
  }

  if (isLastStep) {
    return (
      <section
        className="mt-8 border-t pt-8"
        aria-labelledby="onboarding-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              [ COMPLETE ]
            </span>
            <h2
              id="onboarding-title"
              className="mt-2 font-display text-2xl font-semibold uppercase"
            >
              Onboarding complete
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnswers(toAnswers(record!));
              setStep("role");
              setError(null);
            }}
            className="min-h-11 px-2 text-sm text-glow underline-offset-4 hover:underline"
          >
            Re-do onboarding
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thank you! Your preferences help us shape future content and services.
          You can update them any time from this page.
        </p>
        <PreferenceSummary record={record!} />
      </section>
    );
  }

  return (
    <section className="mt-8 border-t pt-8" aria-labelledby="onboarding-title">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {ONBOARDING_STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-medium transition-all ${
                  i < currentStepIndex
                    ? "bg-glow text-background"
                    : i === currentStepIndex
                      ? "border-2 border-glow bg-background text-glow"
                      : "border border-muted-foreground/40 text-muted-foreground/40"
                }`}
              >
                {i < currentStepIndex ? (
                  <Check className="size-4" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              {i < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px max-w-xs transition-all ${i < currentStepIndex ? "bg-glow" : "bg-muted-foreground/40"}`}
                />
              )}
            </span>
          ))}
        </div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length - 1}:{" "}
          {STEP_LABELS[step]}
        </p>
      </div>

      <div>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          [ OPTIONAL ]
        </span>
        <h2
          id="onboarding-title"
          className="mt-2 font-display text-2xl font-semibold uppercase"
        >
          Personalize your experience
        </h2>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        These optional answers help us understand what people need and shape
        future website content and service planning. They do not sign you up for
        a service or mean that a planned service is already available. Please do
        not include private or sensitive details.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {/* Step 1: Role */}
      {step === "role" && (
        <form onSubmit={handleRoleSubmit} className="mt-6 space-y-6" noValidate>
          <fieldset>
            <legend className={LABEL}>What best describes you?</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {USER_ROLES.map((role) => (
                <label
                  key={role}
                  className={`group relative overflow-hidden rounded-lg border p-5 text-left backdrop-blur-md transition-all duration-300 cursor-pointer ${
                    answers.role === role
                      ? "border-glow bg-glow/10 shadow-[0_0_30px_-12px_var(--glow)]"
                      : "bg-card/50 hover:-translate-y-0.5 hover:border-glow/60 hover:bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={answers.role === role}
                    onChange={() => change("role", role)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <span className="size-10 shrink-0 rounded-full border border-glow/40 bg-glow/10 flex items-center justify-center">
                      <ChevronRight className="size-5 text-glow" />
                    </span>
                    <div>
                      <span className="block font-display text-lg font-semibold uppercase">
                        {USER_ROLE_LABELS[role]}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {USER_ROLE_DESCRIPTIONS[role]}
                      </span>
                    </div>
                  </div>
                  {answers.role === role && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-glow flex items-center justify-center">
                      <Check className="size-3 text-background" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="submit"
              disabled={pending || !answers.role}
              className={BUTTON}
            >
              {pending ? "Saving…" : "Continue"}
              <ChevronRight className="size-3 ml-2" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={skipAll}
              className="min-h-11 px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Skip for now
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Business */}
      {step === "business" && (
        <form
          onSubmit={handleBusinessSubmit}
          className="mt-6 space-y-6"
          noValidate
        >
          <fieldset>
            <legend className={LABEL}>
              Do you own or run a shop or business?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {OWNERSHIP_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all ${
                    answers.businessOwnership === option.value
                      ? "border-glow bg-glow/10"
                      : "bg-background/40 hover:border-glow/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="business-ownership"
                    value={option.value}
                    required
                    checked={answers.businessOwnership === option.value}
                    onChange={() => change("businessOwnership", option.value)}
                    className="size-4 accent-[var(--glow)]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {answers.businessOwnership === "yes" && (
            <div
              className="space-y-3"
              style={{ animation: "fadeIn 0.3s ease-out" }}
            >
              <div>
                <label htmlFor="business-type" className={LABEL}>
                  Business type or sector{" "}
                  <span className="normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <select
                  id="business-type"
                  value={answers.businessType}
                  onChange={(e) =>
                    change("businessType", e.target.value as BusinessType | "")
                  }
                  className={FIELD}
                >
                  <option value="">Choose a type (optional)</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {BUSINESS_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
              {answers.businessType === "other" && (
                <input
                  type="text"
                  value={answers.businessTypeOther}
                  onChange={(e) => change("businessTypeOther", e.target.value)}
                  maxLength={100}
                  aria-label="Other business type"
                  placeholder="Optional: tell us the sector"
                  className={FIELD}
                />
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={() => setStep("role")}
              className={STEP_BUTTON}
            >
              <ChevronRight className="size-3 mr-2 rotate-180" /> Back
            </button>
            <button
              type="submit"
              disabled={pending || !answers.businessOwnership}
              className={BUTTON}
            >
              {pending ? "Saving…" : "Continue"}
              <ChevronRight className="size-3 ml-2" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={skipAll}
              className="min-h-11 px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Skip for now
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Interests */}
      {step === "interests" && (
        <form
          onSubmit={handleInterestsSubmit}
          className="mt-6 space-y-6"
          noValidate
        >
          <fieldset>
            <legend className={LABEL}>
              How would you like VEXVANO LABS to help?{" "}
              <span className="normal-case tracking-normal">
                (optional, choose any)
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {helpTopicOptionsFor(answers.helpTopics).map((topic) => (
                <label
                  key={topic}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all ${
                    answers.helpTopics.includes(topic)
                      ? "border-glow bg-glow/10"
                      : "bg-background/40 hover:border-glow/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={topic}
                    checked={answers.helpTopics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                    className="size-4 rounded accent-[var(--glow)]"
                  />
                  {HELP_TOPIC_LABELS[topic]}
                </label>
              ))}
            </div>
            {answers.helpTopics.includes("other") && (
              <input
                type="text"
                value={answers.helpOther}
                onChange={(e) => change("helpOther", e.target.value)}
                maxLength={100}
                aria-label="Other way VEXVANO LABS could help"
                placeholder="Optional: what else would help?"
                className={FIELD}
              />
            )}
          </fieldset>

          <div>
            <label htmlFor="onboarding-description" className={LABEL}>
              Anything else you would like us to know?{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="onboarding-description"
              value={answers.description}
              onChange={(e) => change("description", e.target.value)}
              maxLength={500}
              rows={4}
              aria-describedby="onboarding-description-hint"
              placeholder="A short note is enough. Avoid private or sensitive information."
              className={`${FIELD} resize-y`}
            />
            <p
              id="onboarding-description-hint"
              className="mt-2 text-xs text-muted-foreground"
            >
              Up to 500 characters.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={() => setStep("business")}
              className={STEP_BUTTON}
            >
              <ChevronRight className="size-3 mr-2 rotate-180" /> Back
            </button>
            <button type="submit" disabled={pending} className={BUTTON}>
              {pending ? "Completing…" : "Complete onboarding"}
              <ChevronRight className="size-3 ml-2" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={skipAll}
              className="min-h-11 px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Skip for now
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function PreferenceSummary({ record }: { record: OnboardingRecord }) {
  const ownership =
    record.businessOwnership === "yes"
      ? "Yes"
      : record.businessOwnership === "no"
        ? "No"
        : record.businessOwnership === "prefer_not_to_say"
          ? "Prefer not to say"
          : "Not answered";
  const roleLabel = record.role
    ? USER_ROLE_LABELS[record.role as keyof typeof USER_ROLE_LABELS]
    : "Not specified";
  const topics = record.helpTopics.map((topic) =>
    topic === "other" && record.helpOther
      ? `Other: ${record.helpOther}`
      : HELP_TOPIC_LABELS[topic as keyof typeof HELP_TOPIC_LABELS],
  );
  const businessType = record.businessType
    ? BUSINESS_TYPE_LABELS[
        record.businessType as keyof typeof BUSINESS_TYPE_LABELS
      ]
    : "Not specified";

  return (
    <dl className="mt-6 space-y-4 text-sm">
      <div>
        <dt className={LABEL}>Your role</dt>
        <dd>{roleLabel}</dd>
      </div>
      <div>
        <dt className={LABEL}>Runs a shop or business</dt>
        <dd>{ownership}</dd>
      </div>
      {record.businessOwnership === "yes" && (
        <div>
          <dt className={LABEL}>Business type</dt>
          <dd>
            {record.businessType === "other" && record.businessTypeOther
              ? record.businessTypeOther
              : businessType}
          </dd>
        </div>
      )}
      <div>
        <dt className={LABEL}>Ways VEXVANO LABS could help</dt>
        <dd>{topics.length ? topics.join(", ") : "Not specified"}</dd>
      </div>
      {record.description && (
        <div>
          <dt className={LABEL}>Additional note</dt>
          <dd className="whitespace-pre-wrap break-words">
            {record.description}
          </dd>
        </div>
      )}
    </dl>
  );
}

function toAnswers(record: OnboardingRecord): OnboardingAnswers {
  return {
    role: record.role,
    businessOwnership: record.businessOwnership,
    businessType: record.businessType,
    businessTypeOther: record.businessTypeOther,
    helpTopics: [...record.helpTopics],
    helpOther: record.helpOther,
    description: record.description,
  };
}
