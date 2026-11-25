import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";

import { CompactFormAction } from "@/components/vexon/CompactFormAction";

import {
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPES,
  EMPTY_ONBOARDING_ANSWERS,
  HELP_TOPIC_LABELS,
  HELP_TOPICS,
  getMyOnboarding,
  saveMyOnboarding,
  skipMyOnboarding,
  type BusinessOwnership,
  type BusinessType,
  type HelpTopic,
  type OnboardingAnswers,
  type OnboardingRecord,
} from "@/lib/onboarding-core";
import { OnboardingError } from "@/lib/onboarding-core";

const LABEL =
  "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const FIELD =
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const BUTTON =
  "bracket-btn inline-flex min-h-11 items-center justify-center px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:bg-foreground/5 disabled:opacity-60";
const OWNERSHIP_OPTIONS: { value: BusinessOwnership; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function OnboardingSection({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [record, setRecord] = useState<OnboardingRecord | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    EMPTY_ONBOARDING_ANSWERS,
  );
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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
        setEditing(result.status === "pending");
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
    setSaved(false);
  }

  function toggleTopic(topic: HelpTopic) {
    const next = answers.helpTopics.includes(topic)
      ? answers.helpTopics.filter((item) => item !== topic)
      : [...answers.helpTopics, topic];
    change("helpTopics", next);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveMyOnboarding(answers);
      setRecord(result);
      setAnswers(toAnswers(result));
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof OnboardingError
          ? err.message
          : "We could not save your preferences. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function skip() {
    setPending(true);
    setError(null);
    try {
      await skipMyOnboarding();
      setRecord((current) => ({
        ...(current ?? { ...EMPTY_ONBOARDING_ANSWERS }),
        status: "skipped",
      }));
      setEditing(false);
      await navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof OnboardingError
          ? err.message
          : "We could not save that choice. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="mt-8 border-t pt-8"
      aria-labelledby="personalization-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            [ OPTIONAL ]
          </span>
          <h2
            id="personalization-title"
            className="mt-2 font-display text-2xl font-semibold uppercase"
          >
            Personalize your experience
          </h2>
        </div>
        {!loading && record && !editing && (
          <button
            type="button"
            onClick={() => {
              setAnswers(toAnswers(record));
              setEditing(true);
              setError(null);
            }}
            className="min-h-11 px-2 text-sm text-glow underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
          >
            {record.status === "skipped"
              ? "Complete onboarding"
              : "Edit answers"}
          </button>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        These optional answers help us understand what people need and shape
        future website content and service planning. They do not sign you up for
        a service or mean that a planned service is already available. Please do
        not include private or sensitive details.
      </p>

      {loading ? (
        <p
          role="status"
          className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground"
        >
          Loading preferences…
        </p>
      ) : error && !record ? (
        <div className="mt-5">
          <p
            role="alert"
            className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
          <CompactFormAction
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className={`${BUTTON} mt-4`}
            icon={RotateCcw}
          >
            Retry
          </CompactFormAction>
        </div>
      ) : editing ? (
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="mt-6 space-y-6"
        >
          <fieldset>
            <legend className={LABEL}>
              Do you own or run a shop or business?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {OWNERSHIP_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border bg-background/40 px-3 py-2 text-sm focus-within:border-glow"
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
            <div>
              <label htmlFor="business-type" className={LABEL}>
                Business type or sector{" "}
                <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <select
                id="business-type"
                value={answers.businessType}
                onChange={(event) =>
                  change(
                    "businessType",
                    event.target.value as BusinessType | "",
                  )
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
              {answers.businessType === "other" && (
                <input
                  type="text"
                  value={answers.businessTypeOther}
                  onChange={(event) =>
                    change("businessTypeOther", event.target.value)
                  }
                  maxLength={100}
                  aria-label="Other business type"
                  placeholder="Optional: tell us the sector"
                  className={`${FIELD} mt-3`}
                />
              )}
            </div>
          )}

          <fieldset>
            <legend className={LABEL}>
              How would you like VEXON TECH to help?{" "}
              <span className="normal-case tracking-normal">
                (optional, choose any)
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {HELP_TOPICS.map((topic) => (
                <label
                  key={topic}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border bg-background/40 px-3 py-2 text-sm focus-within:border-glow"
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
                onChange={(event) => change("helpOther", event.target.value)}
                maxLength={100}
                aria-label="Other way VEXON TECH could help"
                placeholder="Optional: what else would help?"
                className={`${FIELD} mt-3`}
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
              onChange={(event) => change("description", event.target.value)}
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

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          {saved && (
            <p
              role="status"
              className="rounded-md border border-glow/40 bg-glow/10 px-4 py-3 text-sm"
            >
              Your preferences have been saved.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <CompactFormAction type="submit" disabled={pending} className={BUTTON} icon={Save}>
              {pending ? "Saving…" : "Save and continue"}
            </CompactFormAction>
            {record?.status === "completed" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setEditing(false);
                  setAnswers(toAnswers(record));
                  setError(null);
                }}
                className="min-h-11 px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => void skip()}
                className="min-h-11 px-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {pending ? "Saving…" : "Skip for now"}
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="mt-5">
          {record?.status === "skipped" ? (
            <p className="text-sm text-muted-foreground">
              You skipped these optional questions. You can complete them any
              time from this profile page.
            </p>
          ) : (
            <PreferenceSummary
              record={
                record ?? { ...EMPTY_ONBOARDING_ANSWERS, status: "completed" }
              }
            />
          )}
          {saved && (
            <p
              role="status"
              className="mt-4 rounded-md border border-glow/40 bg-glow/10 px-4 py-3 text-sm"
            >
              Your preferences have been saved.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
        </div>
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
  const topics = record.helpTopics.map((topic) =>
    topic === "other" && record.helpOther
      ? `Other: ${record.helpOther}`
      : HELP_TOPIC_LABELS[topic],
  );
  const businessType = record.businessType
    ? BUSINESS_TYPE_LABELS[record.businessType]
    : "Not specified";
  return (
    <dl className="space-y-4 text-sm">
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
        <dt className={LABEL}>Ways VEXON could help</dt>
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
    businessOwnership: record.businessOwnership,
    businessType: record.businessType,
    businessTypeOther: record.businessTypeOther,
    helpTopics: [...record.helpTopics],
    helpOther: record.helpOther,
    description: record.description,
  };
}
