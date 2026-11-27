import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, GraduationCap } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { FormShell } from "@/components/vexon/FormShell";
import { ParticleField } from "@/components/vexon/ParticleField";
import { PageShell } from "@/components/vexon/PageShell";
import { WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import {
  APPLICATION_FORM_ENABLED,
  ApplicationError,
  NAME_MAX,
  NOTE_MAX,
  submitApplication,
} from "@/lib/application-core";
import { LEVELS, type LevelId } from "@/lib/programmes";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Learning — Computing programmes — VEXVANO LABS";
const DESC =
  "Explore proposed online computing programmes from VEXVANO LABS and share your interest. Classes, fees, accreditation and start dates are not yet confirmed.";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("learning"),
    ],
  }),
  component: Learning,
});

const FIELD =
  "field-input w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "field-label mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "form-btn bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

/** Animated backdrop: drifting colour glows, a moving perspective grid and a live particle field. */
function Scene() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="aurora" />
      <ParticleField
        variant="field"
        className="absolute inset-0 h-full w-full"
        density={0.7}
      />
      <div className="grid-floor" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_85%)]" />
    </div>
  );
}

function whatsappApply(programme: string) {
  const text = `Hello VEXVANO LABS, I'd like to apply for online classes: ${programme}.`;
  return `${SITE.whatsappUrl}?text=${encodeURIComponent(text)}`;
}

function Learning() {
  const [levelId, setLevelId] = useState<LevelId>("degree");
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentFor, setSentFor] = useState<string | null>(null);
  const applyRef = useRef<HTMLElement>(null);

  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]!;
  const chosen = level.programmes.find((p) => p.name === selected);
  const total = LEVELS.reduce((n, l) => n + l.programmes.length, 0);

  function choose(name: string) {
    setSelected(name);
    setError(null);
    setSentFor(null);
    // On small screens the form sits below the list: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        applyRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    // Hidden "website" field: people never fill it in, simple bots do.
    if (String(data.get("website") ?? "") !== "") {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await submitApplication({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        note: String(data.get("note") ?? ""),
        level: levelId,
        programme: selected,
      });
      form.reset();
      setSentFor(selected);
    } catch (err) {
      setError(
        err instanceof ApplicationError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell tag="[ LEARNING ]" scene={<Scene />}>
      <section className="pb-6 pt-4 md:pt-8">
        <span className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          <span className="live-dot size-2 rounded-full bg-glow" /> [ PROPOSED
          ONLINE COMPUTER CLASSES · SHARE YOUR INTEREST ]
        </span>
        <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-[8.5rem]">
          <span className="block">
            <Words text="Learn" className="text-chrome" />
          </span>
          <span className="block">
            <Words text="computing" base={200} className="text-chrome" />
          </span>
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          Explore {total} proposed programmes and choose the level that feels
          right. Share your interest and we’ll follow up; the classes are still
          in development, so details are not confirmed yet.
        </p>
      </section>

      {/* STEP 1: LEVEL */}
      <section className="py-6">
        <h2 className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ STEP 1 · PICK YOUR LEVEL ]
        </h2>
        <div
          role="group"
          aria-label="Choose your level"
          className="grid gap-3 sm:grid-cols-3"
        >
          {LEVELS.map((l, i) => {
            const active = l.id === levelId;
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setLevelId(l.id);
                  setSelected(null);
                  setSentFor(null);
                  setError(null);
                }}
                className={`group relative overflow-hidden rounded-lg border p-6 text-left backdrop-blur-md transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 ${
                  active
                    ? "border-glow bg-glow/10 shadow-[0_0_40px_-12px_var(--glow)]"
                    : "bg-card/50 hover:-translate-y-1 hover:border-glow/60 hover:bg-card"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute -right-2 -top-6 font-display text-[7rem] font-extrabold leading-none transition-opacity duration-500 ${
                    active
                      ? "opacity-20"
                      : "opacity-[0.06] group-hover:opacity-15"
                  }`}
                >
                  0{i + 1}
                </span>
                <span className="relative font-mono text-xs text-muted-foreground">
                  [ 0{i + 1} ]
                </span>
                <span className="relative mt-8 block font-display text-3xl font-extrabold uppercase">
                  {l.label}
                </span>
                <span className="relative mt-2 block text-sm text-muted-foreground">
                  {l.blurb}
                </span>
                <span className="relative mt-5 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {l.programmes.length} programmes
                  {active && <Check className="size-3 text-glow" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 py-6 lg:grid-cols-[1.6fr_1fr]">
        {/* STEP 2: PROGRAMME */}
        <div>
          <h2 className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ STEP 2 · CHOOSE A {level.label.toUpperCase()} PROGRAMME ]
          </h2>
          <ul key={levelId} className="grid gap-2 sm:grid-cols-2">
            {level.programmes.map((prog, i) => {
              const active = prog.name === selected;
              return (
                <li
                  key={prog.name}
                  className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => choose(prog.name)}
                    className={`group flex h-full w-full flex-col justify-between rounded-md border p-5 text-left backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 ${
                      active
                        ? "border-glow bg-glow/10 shadow-[0_0_30px_-12px_var(--glow)]"
                        : "bg-card/50 hover:-translate-y-0.5 hover:border-glow/60 hover:bg-card"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={`text-sm font-medium leading-snug md:text-base ${active ? "text-foreground" : "text-foreground/85"}`}
                      >
                        {prog.name}
                      </span>
                      <GraduationCap
                        className={`size-4 shrink-0 transition-colors ${active ? "text-glow" : "text-muted-foreground group-hover:text-glow"}`}
                      />
                    </span>
                    {prog.focus && (
                      <span className="mt-3 block text-xs leading-relaxed text-muted-foreground">
                        {prog.focus}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* STEP 3: APPLY */}
        <aside
          ref={applyRef}
          id="apply"
          className="h-fit scroll-mt-6 lg:sticky lg:top-6"
          aria-live="polite"
        >
          <FormShell
            title={
              !chosen
                ? "Choose a programme"
                : sentFor === chosen.name
                  ? "Thanks for your interest"
                  : "Share your interest"
            }
            reason={
              !chosen
                ? "Choose a programme to see the short interest form."
                : sentFor === chosen.name
                  ? `We received your expression of interest in ${chosen.name}.`
                  : `Tell us how to reach you and we’ll follow up about ${chosen.name}.`
            }
            timeHint={
              chosen
                ? "About one minute"
                : "Choose a level and programme to begin"
            }
          >
            {!chosen ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Choose a programme on the left and the short form will appear
                here.
              </p>
            ) : sentFor === chosen.name ? (
              <div role="status">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We’ll contact you using the phone number you provided. For a
                  quicker follow-up, send us a message on WhatsApp.
                </p>
                <a
                  href={whatsappApply(chosen.name)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${BUTTON} mt-6 inline-flex items-center justify-center gap-2`}
                >
                  <WhatsAppIcon className="size-4" /> Message us on WhatsApp
                  <ArrowUpRight className="size-3" />
                </a>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Level: {level.label}
                </p>

                {APPLICATION_FORM_ENABLED ? (
                  <form
                    onSubmit={onSubmit}
                    noValidate
                    className="form-shell form-stagger mt-6 space-y-5"
                  >
                    <div>
                      <label htmlFor="ap-phone" className={LABEL}>
                        Phone / WhatsApp
                      </label>
                      <input
                        id="ap-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        placeholder="+254 …"
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label htmlFor="ap-name" className={LABEL}>
                        Full name
                      </label>
                      <input
                        id="ap-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={NAME_MAX}
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label htmlFor="ap-email" className={LABEL}>
                        Email
                      </label>
                      <input
                        id="ap-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={FIELD}
                      />
                    </div>
                    <div>
                      <label htmlFor="ap-note" className={LABEL}>
                        Note (optional)
                      </label>
                      <textarea
                        id="ap-note"
                        name="note"
                        rows={3}
                        maxLength={NOTE_MAX}
                        placeholder="Your goals, schedule, or questions"
                        className={`${FIELD} resize-y`}
                      />
                    </div>
                    {/* Honeypot: hidden from people and screen readers. */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                    >
                      <label htmlFor="ap-website">Leave this field empty</label>
                      <input
                        id="ap-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>
                    {error && (
                      <p
                        role="alert"
                        className="form-error error-message rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={pending}
                      className={BUTTON}
                      data-loading={pending}
                    >
                      {pending ? "Sending…" : "Send expression of interest"}
                    </button>
                    <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
                      See our{" "}
                      <Link
                        to="/privacy"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        privacy notice
                      </Link>
                      .
                    </p>
                  </form>
                ) : (
                  <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    The online form isn’t available right now. You can share
                    your interest on WhatsApp instead.
                  </p>
                )}

                {!APPLICATION_FORM_ENABLED && (
                  <a
                    href={whatsappApply(chosen.name)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group mt-6 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <WhatsAppIcon className="size-4" /> Share interest on
                    WhatsApp
                    <ArrowUpRight className="size-3" />
                  </a>
                )}
              </div>
            )}
          </FormShell>
        </aside>
      </section>

      <p className="max-w-xl pb-6 pt-4 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
        VEXVANO LABS is still developing this idea. Sending your details only
        shares your interest; it does not confirm a place. Classes, fees,
        accreditation and start dates are not yet confirmed.
      </p>
    </PageShell>
  );
}
