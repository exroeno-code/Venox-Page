import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Github,
  Globe2,
  Link2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Trash2,
  Twitter,
  UserRound,
} from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { OnboardingWizard } from "@/components/vexon/OnboardingWizard";
import { AvatarUploader } from "@/components/vexon/AvatarUploader";
import { InstagramIcon, WhatsAppIcon } from "@/components/vexon/SocialIcons";
import {
  AuthError,
  signOut,
  updateDisplayName,
  updateBio,
  updateSocialLinks,
  deleteAccount,
} from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";

const TITLE = "Member dashboard — VEXON TECH";
const DESC = "Manage your VEXON TECH account, profile, links, and preferences.";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: TITLE },
    ],
  }),
  component: Profile,
});

const FIELD =
  "field-input w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-glow/50 bg-glow/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-glow/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 disabled:cursor-not-allowed disabled:opacity-60";
const CARD =
  "rounded-2xl border border-white/10 bg-card/70 p-5 backdrop-blur-md sm:p-7";
const SECTION_LINK =
  "inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-xs text-muted-foreground transition-colors hover:border-glow/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60";

type SocialKey =
  "instagram" | "whatsapp" | "github" | "linkedin" | "twitter" | "website";
const SOCIAL_FIELDS: {
  key: SocialKey;
  label: string;
  placeholder: string;
  Icon: typeof Link2;
  hint?: string;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourname",
    Icon: AtSign,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/2547XXXXXXXX",
    Icon: MessageCircle,
    hint: "Use a wa.me link with your country code.",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
    Icon: Github,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    Icon: Link2,
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    placeholder: "https://x.com/username",
    Icon: Twitter,
  },
  {
    key: "website",
    label: "Website",
    placeholder: "https://your-site.com",
    Icon: Globe2,
  },
];

function safeHttpUrl(value?: string): string | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function Profile() {
  const auth = useAuth();
  const user = auth.status === "signed-in" ? auth.user : null;
  const [pending, setPending] = useState(false);
  const [bioPending, setBioPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setSocialLinks(user.social_links ?? {});
  }, [user]);

  function clearFeedback() {
    setError(null);
    setSaved(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    clearFeedback();
    try {
      await updateDisplayName(String(data.get("name") ?? ""));
      setSaved("Your account details have been updated.");
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleBioSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBioPending(true);
    clearFeedback();
    try {
      await updateBio(bio);
      setSaved("Your bio has been saved.");
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Could not save your bio. Please try again.",
      );
    } finally {
      setBioPending(false);
    }
  }

  async function handleSocialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const links: Record<string, string> = {};
    for (const field of SOCIAL_FIELDS) {
      const value = (socialLinks[field.key] ?? "").trim();
      if (!value) continue;
      if (!safeHttpUrl(value)) {
        setError(
          `Enter a complete http:// or https:// link for ${field.label}.`,
        );
        setSaved(null);
        return;
      }
      links[field.key] = value;
    }
    setSocialPending(true);
    clearFeedback();
    try {
      await updateSocialLinks(links);
      setSocialLinks(links);
      setSaved("Your social links have been saved.");
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Could not save your links. Please try again.",
      );
    } finally {
      setSocialPending(false);
    }
  }

  async function handleDeleteAccount() {
    setPending(true);
    setError(null);
    try {
      await deleteAccount();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Could not delete your account. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell tag="[ MEMBER DASHBOARD ]">
      <div className="mx-auto mt-4 mb-10 w-full max-w-6xl py-3 md:mt-8">
        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-glow">
              [ YOUR VEXON SPACE ]
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              <span className="text-chrome">Dashboard</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Manage your account, shape your profile, and keep your preferences
              up to date.
            </p>
          </div>
          {user && (
            <a href="#account-settings" className={SECTION_LINK}>
              Edit profile{" "}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </header>

        {auth.status === "loading" ? (
          <div
            role="status"
            className={`${CARD} font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground`}
          >
            Loading your dashboard…
          </div>
        ) : auth.status === "signed-out" ? (
          <section className={`${CARD} max-w-xl`}>
            <div className="grid size-12 place-items-center rounded-xl border border-glow/30 bg-glow/10 text-glow">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold uppercase">
              Sign in to your space
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sign in or create an account to edit your profile and preferences.
            </p>
            <Link to="/auth" className={`${BUTTON} mt-6`}>
              Sign in or create account{" "}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <>
            <section
              className={`${CARD} overflow-hidden`}
              aria-labelledby="profile-overview-title"
            >
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                    [ PROFILE OVERVIEW ]
                  </span>
                  <h2 id="profile-overview-title" className="sr-only">
                    Profile overview
                  </h2>
                  <AvatarUploader user={auth.user} />
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href="#account-settings" className={SECTION_LINK}>
                      <UserRound className="size-3.5" /> Account
                    </a>
                    <a href="#social-links" className={SECTION_LINK}>
                      <Link2 className="size-3.5" /> Social links
                    </a>
                    <a href="#preferences" className={SECTION_LINK}>
                      <ShieldCheck className="size-3.5" /> Preferences
                    </a>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    [ CONNECT WITH ME ]
                  </div>
                  <div className="mt-4 grid gap-3">
                    {safeHttpUrl(socialLinks.instagram) ? (
                      <a
                        href={safeHttpUrl(socialLinks.instagram)!}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`${SECTION_LINK} justify-between rounded-lg py-3`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <InstagramIcon className="size-4" /> Instagram
                        </span>
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    ) : (
                      <span
                        className={`${SECTION_LINK} justify-between rounded-lg py-3 opacity-50`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <InstagramIcon className="size-4" /> Instagram
                        </span>
                        <span className="text-[0.65rem] uppercase">
                          Add link
                        </span>
                      </span>
                    )}
                    {safeHttpUrl(socialLinks.whatsapp) ? (
                      <a
                        href={safeHttpUrl(socialLinks.whatsapp)!}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`${SECTION_LINK} justify-between rounded-lg py-3`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <WhatsAppIcon className="size-4" /> WhatsApp
                        </span>
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    ) : (
                      <span
                        className={`${SECTION_LINK} justify-between rounded-lg py-3 opacity-50`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <WhatsAppIcon className="size-4" /> WhatsApp
                        </span>
                        <span className="text-[0.65rem] uppercase">
                          Add link
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    These buttons preview your profile links. Add the links
                    below to activate them.
                  </p>
                </div>
              </div>
            </section>

            {(error || saved) && (
              <div className="mt-5" aria-live="polite">
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}
                {saved && (
                  <p
                    role="status"
                    className="rounded-lg border border-glow/40 bg-glow/10 px-4 py-3 text-sm"
                  >
                    {saved}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
              <div className="space-y-6">
                <section
                  id="account-settings"
                  className={CARD}
                  aria-labelledby="account-title"
                >
                  <div className="mb-6 flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-glow/30 bg-glow/10 text-glow">
                      <UserRound className="size-4" />
                    </span>
                    <div>
                      <h2
                        id="account-title"
                        className="font-display text-xl font-semibold uppercase"
                      >
                        Account details
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Update the name shown across your VEXON account.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={onSubmit} noValidate className="space-y-5">
                    <div>
                      <label htmlFor="account-name" className={LABEL}>
                        Display name
                      </label>
                      <input
                        id="account-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={60}
                        defaultValue={auth.user.name}
                        key={auth.user.id}
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-id" className={LABEL}>
                        {auth.user.email ? "Email address" : "Verified phone"}
                      </label>
                      <input
                        id="account-id"
                        type={auth.user.email ? "email" : "tel"}
                        value={auth.user.email || auth.user.phone || ""}
                        readOnly
                        aria-readonly="true"
                        className={`${FIELD} cursor-not-allowed opacity-60`}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Your sign-in identifier is read-only.
                      </p>
                    </div>
                    <button type="submit" disabled={pending} className={BUTTON}>
                      {pending ? "Saving…" : "Save account details"}
                    </button>
                  </form>
                </section>

                <section className={CARD} aria-labelledby="bio-title">
                  <div className="mb-6 flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-glow/30 bg-glow/10 text-glow">
                      <Mail className="size-4" />
                    </span>
                    <div>
                      <h2
                        id="bio-title"
                        className="font-display text-xl font-semibold uppercase"
                      >
                        About you
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Write a short introduction for your profile.
                      </p>
                    </div>
                  </div>
                  <form
                    onSubmit={(event) => void handleBioSubmit(event)}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="bio" className={LABEL}>
                        Bio{" "}
                        <span className="normal-case tracking-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(event) => {
                          setBio(event.target.value);
                          setSaved(null);
                        }}
                        maxLength={500}
                        rows={5}
                        placeholder="A little about your interests, work, or what you're learning…"
                        className={`${FIELD} resize-y`}
                      />
                      <p className="mt-2 text-right text-xs text-muted-foreground">
                        {bio.length}/500
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={bioPending || bio.length > 500}
                      className={BUTTON}
                    >
                      {bioPending ? "Saving…" : "Save bio"}
                    </button>
                  </form>
                </section>

                <section
                  id="social-links"
                  className={CARD}
                  aria-labelledby="social-title"
                >
                  <div className="mb-6 flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-glow/30 bg-glow/10 text-glow">
                      <Link2 className="size-4" />
                    </span>
                    <div>
                      <h2
                        id="social-title"
                        className="font-display text-xl font-semibold uppercase"
                      >
                        Social & contact links
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add only the links you want to share. Instagram and
                        WhatsApp are displayed first.
                      </p>
                    </div>
                  </div>
                  <form
                    onSubmit={(event) => void handleSocialSubmit(event)}
                    className="space-y-5"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      {SOCIAL_FIELDS.map(
                        ({ key, label, placeholder, Icon, hint }) => (
                          <div key={key}>
                            <label htmlFor={`social-${key}`} className={LABEL}>
                              {label}
                            </label>
                            <div className="relative">
                              <Icon
                                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <input
                                id={`social-${key}`}
                                name={key}
                                type="url"
                                inputMode="url"
                                autoComplete="url"
                                placeholder={placeholder}
                                value={socialLinks[key] ?? ""}
                                onChange={(event) => {
                                  setSocialLinks({
                                    ...socialLinks,
                                    [key]: event.target.value,
                                  });
                                  setSaved(null);
                                }}
                                className={`${FIELD} pl-10`}
                              />
                            </div>
                            {hint && (
                              <p className="mt-1.5 text-xs text-muted-foreground">
                                {hint}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={socialPending}
                      className={BUTTON}
                    >
                      {socialPending ? "Saving…" : "Save social links"}
                    </button>
                  </form>
                </section>
              </div>

              <aside className="space-y-6">
                <section
                  id="preferences"
                  className={CARD}
                  aria-labelledby="preferences-title"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-glow/30 bg-glow/10 text-glow">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <h2
                        id="preferences-title"
                        className="font-display text-xl font-semibold uppercase"
                      >
                        Your preferences
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Manage how VEXON understands what you’re interested in.
                      </p>
                    </div>
                  </div>
                  <OnboardingWizard userId={auth.user.id} />
                </section>

                <section
                  className={`${CARD} border-red-400/20`}
                  aria-labelledby="security-title"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-400/20 bg-red-500/5 text-red-300">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <h2
                        id="security-title"
                        className="font-display text-xl font-semibold uppercase"
                      >
                        Account controls
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sign out or permanently remove your account.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className={`${SECTION_LINK} mt-5 w-full justify-center rounded-lg py-3 text-foreground`}
                  >
                    Sign out <ArrowUpRight className="size-3.5" />
                  </button>
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        setShowDeleteConfirm((current) => !current)
                      }
                      disabled={pending}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                    >
                      <Trash2 className="size-4" /> Delete account
                    </button>
                    {showDeleteConfirm && (
                      <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/5 p-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          This permanently deletes your account and cannot be
                          undone. Are you sure?
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => void handleDeleteAccount()}
                            disabled={pending}
                            className="min-h-10 rounded-lg border border-red-400/40 px-4 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            {pending ? "Deleting…" : "Yes, delete account"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="min-h-10 px-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
