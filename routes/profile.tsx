import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { ArrowUpRight, Trash2, Link2, Github, Twitter, Mail, User } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { OnboardingWizard } from "@/components/vexon/OnboardingWizard";
import { AvatarUploader } from "@/components/vexon/AvatarUploader";
import {
  AuthError,
  signOut,
  updateDisplayName,
  updateAvatar,
  updateBio,
  updateSocialLinks,
  deleteAccount,
} from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";

const TITLE = "Your profile — VEXON TECH";
const DESC = "Manage your Vexon account.";

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
  "field-input w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "field-label mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "form-btn bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";
const ICON_BUTTON =
  "inline-flex items-center justify-center size-10 rounded-full border border-muted-foreground/40 text-muted-foreground transition-colors hover:border-glow hover:text-glow hover:bg-glow/10";

const SOCIAL_FIELDS = [
  { key: "github", label: "GitHub", placeholder: "github.com/username", Icon: Github },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username", Icon: Link2 },
  { key: "twitter", label: "X (Twitter)", placeholder: "x.com/username", Icon: Twitter },
  { key: "website", label: "Website", placeholder: "your-site.com", Icon: Mail },
] as const;

function Profile() {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [bioPending, setBioPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);

  // Initialize bio and social links from auth state
  const user = auth.status === "signed-in" ? auth.user : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      await updateDisplayName(String(data.get("name") ?? ""));
      setSaved(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2MB or smaller.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function saveAvatar() {
    if (!avatarFile || !user) return;
    setPending(true);
    setError(null);
    try {
      const supabase = await (await import("@/lib/auth-core")).getClient();
      if (!supabase) throw new AuthError("Storage unavailable.");
      const fileName = `${user.id}/${Date.now()}-${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      await updateAvatar(data.publicUrl);
      setSaved(true);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Could not upload avatar. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function removeAvatar() {
    if (!user) return;
    setPending(true);
    setError(null);
    try {
      const supabase = await (await import("@/lib/auth-core")).getClient();
      if (!supabase) throw new AuthError("Storage unavailable.");
      // Find and delete user's avatar files
      const { data: files } = await supabase.storage.from("avatars").list(user.id);
      if (files?.length) {
        const fileNames = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(fileNames);
      }
      await updateAvatar("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Could not remove avatar. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleBioSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBioPending(true);
    setError(null);
    try {
      await updateBio(bio);
      setSaved(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Could not save bio. Try again.");
    } finally {
      setBioPending(false);
    }
  }

  async function handleSocialSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const links: Record<string, string> = {};
    SOCIAL_FIELDS.forEach(({ key }) => {
      const val = String(data.get(key) ?? "").trim();
      if (val) links[key] = val;
    });
    setSocialPending(true);
    setError(null);
    try {
      await updateSocialLinks(links);
      setSocialLinks(links);
      setSaved(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Could not save links. Try again.");
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
      setError(err instanceof AuthError ? err.message : "Could not delete account. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell tag="[ YOUR PROFILE ]">
      <div className="mt-4 mb-6 w-full max-w-2xl py-3 md:mt-8">
        <div className="rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            <span className="text-chrome">Your profile</span>
          </h1>

          {auth.status === "loading" ? (
            <p role="status" className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Loading…
            </p>
          ) : auth.status === "signed-out" ? (
            <div className="mt-8">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sign in to see and edit your profile.
              </p>
              <Link to="/auth" className={`${BUTTON} mt-8 block text-center`}>
                Sign in or create account
              </Link>
            </div>
          ) : (
            <>
              {/* Avatar Uploader */}
              <AvatarUploader user={auth.user} />

              {/* Name form */}
              <form onSubmit={onSubmit} noValidate className="form-shell form-stagger mt-8 space-y-5">
                <div>
                  <label htmlFor="name" className={LABEL}>Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={60}
                    defaultValue={auth.user.name}
                    key={auth.user.id}
                    onChange={() => setSaved(false)}
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="account-id" className={LABEL}>
                    {auth.user.email ? "Email" : "Verified phone"}
                  </label>
                  <input
                    id="account-id"
                    type={auth.user.email ? "email" : "tel"}
                    value={auth.user.email || auth.user.phone || ""}
                    readOnly
                    aria-readonly="true"
                    className={`${FIELD} cursor-not-allowed opacity-60`}
                  />
                </div>
                {error && (
                  <p role="alert" className="form-error error-message rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}
                {saved && (
                  <p role="status" className="rounded-md border border-glow/40 bg-glow/10 px-4 py-3 text-sm">
                    Your name has been updated.
                  </p>
                )}
                <button type="submit" disabled={pending} className={BUTTON} data-loading={pending}>
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </form>

              {/* Bio */}
              <form onSubmit={handleBioSubmit} className="form-shell form-stagger mt-8 border-t pt-8 space-y-4">
                <h3 className="font-display text-xl font-semibold uppercase">Bio</h3>
                <p className="text-sm text-muted-foreground">A short description shown on your profile (max 500 chars).</p>
                <div>
                  <label htmlFor="bio" className={LABEL}>Bio</label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Tell us about yourself…"
                    className={`${FIELD} resize-y`}
                    defaultValue={user?.bio ?? ""}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                <button type="submit" disabled={bioPending || bio.length > 500} className={BUTTON} data-loading={bioPending}>
                  {bioPending ? "Saving…" : "Save bio"}
                </button>
              </form>

              {/* Social Links */}
              <form onSubmit={handleSocialSubmit} className="form-shell form-stagger mt-8 border-t pt-8 space-y-4">
                <h3 className="font-display text-xl font-semibold uppercase">Social links</h3>
                <p className="text-sm text-muted-foreground">Add links to your profiles (shown on your profile page).</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SOCIAL_FIELDS.map(({ key, label, placeholder, Icon }) => (
                    <div key={key} className="relative">
                      <label htmlFor={key} className={LABEL}>{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                        <input
                          id={key}
                          name={key}
                          type="url"
                          placeholder={placeholder}
                          value={socialLinks[key] ?? ""}
                          onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                          className={`${FIELD} pl-10`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={socialPending} className={BUTTON} data-loading={socialPending}>
                  {socialPending ? "Saving…" : "Save links"}
                </button>
              </form>

              {/* Onboarding Wizard */}
              <OnboardingWizard userId={auth.user.id} />

              {/* Danger Zone */}
              <div className="mt-8 border-t pt-8">
                <h3 className="font-display text-xl font-semibold uppercase text-red-400">Danger zone</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Irreversible actions. Please be careful.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={pending}
                    className="bracket-btn px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete account
                  </button>
                  {showDeleteConfirm && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Are you sure? This cannot be undone.</span>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={pending}
                        className="bracket-btn px-3 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-red-400 border-red-500/40 hover:bg-red-500/10"
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-6 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
