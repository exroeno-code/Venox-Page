import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { PageShell } from "@/components/vexon/PageShell";
import { AuthError, initials, signOut, updateDisplayName } from "@/lib/auth-core";
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
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL = "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

function Profile() {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  return (
    <PageShell tag="[ YOUR PROFILE ]">
      <div className="m-auto w-full max-w-md py-12">
        <div className="rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            <span className="text-chrome">Your profile</span>
          </h1>

          {auth.status === "loading" ? (
            <p role="status" className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading…</p>
          ) : auth.status === "signed-out" ? (
            <div className="mt-8">
              <p className="text-sm leading-relaxed text-muted-foreground">Sign in to see and edit your profile.</p>
              <Link to="/auth" className={`${BUTTON} mt-8 block text-center`}>
                Sign in or create account
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 flex items-center gap-4">
                <span className="grid size-16 place-items-center rounded-full border-2 border-glow/60 font-display text-xl font-semibold">
                  {initials(auth.user)}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-xl font-semibold">{auth.user.name}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{auth.user.email}</div>
                </div>
              </div>

              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
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
                  <label htmlFor="email" className={LABEL}>Email</label>
                  <input id="email" type="email" value={auth.user.email} readOnly aria-readonly="true" className={`${FIELD} cursor-not-allowed opacity-60`} />
                </div>
                {error && (
                  <p role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
                )}
                {saved && (
                  <p role="status" className="rounded-md border border-glow/40 bg-glow/10 px-4 py-3 text-sm">Your name has been updated.</p>
                )}
                <button type="submit" disabled={pending} className={BUTTON}>
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </form>

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
