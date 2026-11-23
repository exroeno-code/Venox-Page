import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, GraduationCap } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

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

const TITLE = "Learning — Online computer classes — VEXON TECH";
const DESC = "Choose your level and your computing programme, then apply for VEXON TECH online computer classes.";

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
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL = "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

/** Animated backdrop: drifting colour glows, a moving perspective grid and a live particle field. */
function Scene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora" />
      <ParticleField variant="field" className="absolute inset-0 h-full w-full" density={0.7} />
      <div className="grid-floor" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_85%)]" />
    </div>
  );
}

function whatsappApply(programme: string) {
  const text = `Hello VEXON TECH, I'd like to apply for online classes: ${programme}.`;
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
      requestAnimationFrame(() => applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    // Hidden "website" field: people never fill it in, simple bots do.
    if (String(data.get("website") ?? "") !== "") {
      setSentFor(selected);
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
      setError(err instanceof ApplicationError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell tag="[ LEARNING ]" scene={<Scene />}>
      <section className="pb-6 pt-20 md:pt-28">
        <span className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          <span className="live-dot size-2 rounded-full bg-glow" /> [ ONLINE COMPUTER CLASSES · APPLICATIONS OPEN ]
        </span>
        <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-[8.5rem]">
          <span className="block"><Words text="Learn" className="text-chrome" /></span>
          <span className="block"><Words text="computing" base={200} className="text-chrome" /></span>
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          Pick your level, choose from {total} programmes, and apply in a minute. We will contact you with details.
        </p>
      </section>

      {/* STEP 1: LEVEL */}
      <section className="py-6">
        <h2 className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground">[ STEP 1 · CHOOSE YOUR LEVEL ]</h2>
        <div role="group" aria-label="Choose your level" className="grid gap-3 sm:grid-cols-3">
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
                    active ? "opacity-20" : "opacity-[0.06] group-hover:opacity-15"
                  }`}
                >
                  0{i + 1}
                </span>
                <span className="relative font-mono text-xs text-muted-foreground">[ 0{i + 1} ]</span>
                <span className="relative mt-8 block font-display text-3xl font-extrabold uppercase">{l.label}</span>
                <span className="relative mt-2 block text-sm text-muted-foreground">{l.blurb}</span>
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
                <li key={prog.name} className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${i * 35}ms` }}>
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
                      <span className={`text-sm font-medium leading-snug md:text-base ${active ? "text-foreground" : "text-foreground/85"}`}>
                        {prog.name}
                      </span>
                      <GraduationCap className={`size-4 shrink-0 transition-colors ${active ? "text-glow" : "text-muted-foreground group-hover:text-glow"}`} />
                    </span>
                    {prog.focus && <span className="mt-3 block text-xs leading-relaxed text-muted-foreground">{prog.focus}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* STEP 3: APPLY */}
        <aside ref={applyRef} id="apply" className="h-fit scroll-mt-6 rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8 lg:sticky lg:top-6" aria-live="polite">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ STEP 3 · APPLY ]</span>

          {!chosen ? (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Select a programme on the left. Your application form appears here.
            </p>
          ) : sentFor === chosen.name ? (
            <div role="status" className="mt-6">
              <h2 className="font-display text-3xl font-extrabold uppercase leading-[0.95]">
                <span className="text-chrome">Application sent</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Thank you. We received your application for <strong className="text-foreground">{chosen.name}</strong> and will contact you by email or phone.
              </p>
              <button type="button" onClick={() => { setSelected(null); setSentFor(null); }} className={`${BUTTON} mt-8`}>
                Apply for another programme
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <p className="font-display text-xl font-semibold uppercase leading-snug">{chosen.name}</p>
              <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">Level: {level.label}</p>

              {APPLICATION_FORM_ENABLED ? (
                <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="ap-name" className={LABEL}>Full name</label>
                    <input id="ap-name" name="name" type="text" autoComplete="name" required maxLength={NAME_MAX} className={FIELD} />
                  </div>
                  <div>
                    <label htmlFor="ap-email" className={LABEL}>Email</label>
                    <input id="ap-email" name="email" type="email" autoComplete="email" required className={FIELD} />
                  </div>
                  <div>
                    <label htmlFor="ap-phone" className={LABEL}>Phone / WhatsApp</label>
                    <input id="ap-phone" name="phone" type="tel" autoComplete="tel" required placeholder="+254 …" className={FIELD} />
                  </div>
                  <div>
                    <label htmlFor="ap-note" className={LABEL}>Note (optional)</label>
                    <textarea id="ap-note" name="note" rows={3} maxLength={NOTE_MAX} placeholder="Your goals, schedule, or questions" className={`${FIELD} resize-y`} />
                  </div>
                  {/* Honeypot: hidden from people and screen readers. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor="ap-website">Leave this field empty</label>
                    <input id="ap-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>
                  {error && (
                    <p role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={pending} className={BUTTON}>
                    {pending ? "Sending…" : "Submit application"}
                  </button>
                  <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
                    See our <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">privacy notice</Link>.
                  </p>
                </form>
              ) : (
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  The online form is not available right now. Apply on WhatsApp instead.
                </p>
              )}

              <a
                href={whatsappApply(chosen.name)}
                target="_blank"
                rel="noreferrer noopener"
                className="group mt-6 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <WhatsAppIcon className="size-4" />
                Or apply on WhatsApp
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          )}
        </aside>
      </section>

      <p className="max-w-xl pb-6 pt-4 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
        Concept stage: an application is an expression of interest. Classes, fees, accreditation and start dates are not yet confirmed.
      </p>
    </PageShell>
  );
}
