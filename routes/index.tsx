import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkle } from "lucide-react";
import { ParticleField } from "@/components/vexon/ParticleField";
import { Loader } from "@/components/vexon/Loader";
import { Words } from "@/components/vexon/Words";
import { TopBar } from "@/components/vexon/TopBar";
import { SocialLinks } from "@/components/vexon/SocialIcons";
import { Wordmark } from "@/components/vexon/Wordmark";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "VEXVANO LABS — Useful ideas, made practical";
const DESC =
  "VEXVANO LABS is a Kenya-based, builder-led venture in concept development, exploring useful technology and a foreign exchange trading idea with clear status and risks.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("default"),
    ],
  }),
  component: Index,
});

const PRINCIPLES = [
  [
    "Useful over impressive",
    "Start with a real problem or need. Choose something useful over novelty for its own sake.",
  ],
  [
    "Trust before scale",
    "Be clear about quality, pricing, availability, risks, and responsibilities. Never say something is ready before it is.",
  ],
  [
    "Build and learn",
    "Listen, test, and improve. Let evidence guide what we say and do.",
  ],
  [
    "Think in the long term",
    "Build value for customers, collaborators, and communities—not just short-term attention or revenue.",
  ],
  [
    "Act responsibly",
    "Take law, safety, privacy, product quality, sourcing accountability, and the people affected seriously.",
  ],
] as const;

const FOUNDATION = [
  [
    "Purpose",
    "Turn practical ideas into useful technology and responsible commercial activity that brings real value to people, businesses, and communities.",
  ],
  [
    "Vision",
    "A future where people and businesses can use practical, trustworthy digital services to solve real problems and make steady progress.",
  ],
  [
    "Mission",
    "Explore and improve useful digital technology—software, digital products, and responsible AI-enabled workflows—while considering foreign exchange trading as an early idea.",
  ],
  [
    "Positioning",
    "A builder-led venture working to earn trust through real needs, clear communication, and follow-through—not hype.",
  ],
] as const;

const STAGES = ["Idea", "Prototype", "Pilot", "Live"];

function Index() {
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);
  const heroImg = useRef<HTMLDivElement>(null);

  // Smooth scroll + scroll reveals + parallax.
  useEffect(() => {
    // Smooth scrolling itself (Lenis) is set up for every page in <SmoothScroll /> in the root layout.
    let raf = 0;
    {
      const loop = () => {
        const y = window.scrollY;
        if (heroImg.current)
          heroImg.current.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0003})`;
        document
          .querySelectorAll<HTMLElement>("[data-parallax]")
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            const k = Number(el.dataset["parallax"]);
            const rot = el.dataset["rot"] ?? "0";
            el.style.transform = `translateY(${(r.top + r.height / 2 - window.innerHeight / 2) * k}px) rotate(${rot}deg)`;
          });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach(
          (e) =>
            e.isIntersecting &&
            (e.target.classList.add("in"), io.unobserve(e.target)),
        ),
      { threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const l = (
      window as unknown as { __lenis?: { scrollTo: (t: string) => void } }
    ).__lenis;
    if (l) l.scrollTo(id);
    else document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="w-full overflow-x-clip">
      <Loader onDone={done} />

      {/* HERO */}
      <section
        className={`relative flex min-h-svh flex-col overflow-hidden px-5 pb-10 pt-6 md:px-10 ${ready ? "in" : ""}`}
      >
        <div ref={heroImg} className="pointer-events-none absolute inset-0">
          <ParticleField className="h-full w-full" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_62%,var(--background)_0%,transparent_35%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
        </div>

        <TopBar tag="[ V.00.1 · CONCEPT ]" onAnchor={go} />

        <div className="relative z-10 mt-auto grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-16 lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground">
              <span className="live-dot size-1.5 rounded-full bg-glow" /> [
              PRACTICAL TECHNOLOGY ]
            </div>
            <h1 className="font-display text-[13vw] font-extrabold uppercase leading-[0.9] tracking-tight md:text-[8.5vw] lg:text-[5.2vw]">
              <span className="block">
                <Words text="Useful ideas" className="text-chrome" />
              </span>
              <span className="flex items-center">
                <Sparkle className="twinkle mr-[0.2em] size-[0.6em] shrink-0 fill-foreground" />
                <Words text="carried through" base={250} />
              </span>
              <span className="block">
                <Words
                  text="to real-world progress"
                  base={500}
                  className="text-chrome"
                />
              </span>
            </h1>
          </div>

          <div
            className="reveal lg:pb-4"
            style={{ transitionDelay: "700ms" }}
            data-hero
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl font-semibold">(V)</span>
              <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                [ 001 / 002 ]
              </span>
            </div>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              VEXVANO LABS is a Kenya-based, builder-led venture in concept
              development. We’re exploring practical software, responsible
              AI-enabled workflows, and a foreign exchange trading idea—with
              clear risks and no hype.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                to="/assistant"
                hash="waitlist"
                className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
              >
                Follow our progress
              </Link>
              <a
                href="#principles"
                onClick={go("#principles")}
                className="group flex items-center gap-2 text-sm"
              >
                How we work{" "}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES MARQUEE */}
      <section className="relative overflow-hidden border-y py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[22vw] font-extrabold uppercase leading-none text-foreground/[0.035]"
        >
          Progress
        </div>
        <div className="relative flex w-max marquee gap-12 whitespace-nowrap font-display text-3xl font-semibold uppercase md:text-5xl">
          {[...PRINCIPLES, ...PRINCIPLES].map(([t], i) => (
            <span key={i} className="flex items-center gap-12">
              <span className={i % 2 ? "text-muted-foreground" : ""}>{t}</span>
              <Sparkle className="size-6 fill-glow text-glow" />
            </span>
          ))}
        </div>
      </section>

      {/* FOUNDATION */}
      <section id="foundation" className="px-5 py-28 md:px-10">
        <div
          data-reveal
          className="mb-16 flex flex-wrap items-end justify-between gap-6"
        >
          <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
            <Words text="Our foundation" />
          </h2>
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ PURPOSE · VISION · MISSION ]
          </span>
        </div>
        <ul>
          {FOUNDATION.map(([t, d], i) => (
            <li
              key={t}
              data-reveal
              className="reveal group grid cursor-default gap-4 border-t py-8 transition-colors hover:bg-foreground/[0.03] md:grid-cols-[6rem_1fr_2fr_auto] md:items-center md:px-4"
            >
              <span className="font-mono text-sm text-muted-foreground">
                0{i + 1}
              </span>
              <h3 className="font-display text-3xl font-semibold uppercase transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">
                {t}
              </h3>
              <p className="max-w-xl text-muted-foreground">{d}</p>
              <ArrowUpRight className="hidden size-8 text-muted-foreground transition-all duration-500 group-hover:rotate-45 group-hover:text-glow md:block" />
            </li>
          ))}
        </ul>
      </section>

      {/* WORKSTREAMS */}
      <section id="workstreams" className="px-5 pb-28 md:px-10">
        <div data-reveal className="mb-16 max-w-3xl">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ IDEAS WE’RE EXPLORING ]
          </span>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
            <Words text="What we explore" />
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {[
            {
              k: "A",
              t: "Technology",
              d: "We’re exploring practical software, digital products, and responsible AI-enabled workflows. Each idea should answer a real need, and we’ll be clear about its status.",
              rot: -2,
              v: "halo" as const,
              to: "/assistant" as const,
              more: "See the AI assistant idea",
            },
            {
              k: "B",
              t: "Foreign exchange trading",
              d: "Foreign exchange trading is only an idea we’re considering. It is at the Idea stage—not a broker, platform, or financial service.",
              rot: 2,
              v: "field" as const,
              to: "/forex-trading" as const,
              more: "Read about the foreign exchange trading idea",
            },
          ].map((c) => (
            <article
              key={c.k}
              data-parallax={c.rot < 0 ? "-0.06" : "0.06"}
              data-rot={c.rot}
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_var(--glow)]"
            >
              <div className="relative h-72 overflow-hidden md:h-96">
                <ParticleField
                  variant={c.v}
                  density={0.35}
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <span className="absolute left-6 top-6 font-mono text-xs tracking-[0.3em] text-muted-foreground">
                  [ {c.k} ]
                </span>
                <span className="absolute right-6 top-6 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                  Exploring
                </span>
              </div>
              <div className="p-8">
                <h3 className="font-display text-3xl font-extrabold uppercase md:text-4xl">
                  {c.t}
                </h3>
                <p className="mt-4 max-w-md text-muted-foreground">{c.d}</p>
                <Link
                  to={c.to}
                  className="mt-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.more}
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 font-mono text-xs leading-relaxed text-muted-foreground">
          Foreign exchange trading is an early idea only. VEXVANO LABS does not
          provide a broker, platform, accounts, deposits, trade execution,
          signals, money management, broker endorsements, or personalized
          financial advice. Foreign exchange trading and CFDs carry a high risk
          of loss.
        </p>
      </section>

      {/* FIRST COMMERCIAL OFFER */}
      <section className="px-5 py-28 md:px-10">
        <div className="rounded-lg border bg-card px-6 py-12 md:px-10 md:py-16">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <div data-reveal>
              <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                [ FIRST COMMERCIAL OFFER ]
              </span>
              <h2 className="mt-4 max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
                <Words
                  text="Make repetitive work easier with practical AI"
                  className="text-chrome"
                />
              </h2>
              <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                VEXON helps Kenyan small businesses set up human-reviewed AI
                workflows for customer replies, documents, content, and daily
                operations.
              </p>
              <div className="reveal mt-8 flex flex-wrap items-center gap-6">
                <Link
                  to="/ai-workflow"
                  className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
                >
                  Book an AI workflow audit
                </Link>
                <a
                  href={`${SITE.whatsappUrl}?text=${encodeURIComponent("Hello VEXON TECH, I'd like to learn about the AI Workflow Sprint.")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center gap-2 text-sm"
                >
                  Chat on WhatsApp
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            </div>
            <div data-reveal className="reveal">
              <div className="mb-6 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <span>[ AI WORKFLOW SPRINT ]</span>
                <span>From KES 20,000</span>
              </div>
              <ul className="divide-y border-y">
                {[
                  ["01", "Find the repetitive task costing you time"],
                  ["02", "Set up a useful workflow with your team"],
                  ["03", "Train, test, and improve it together"],
                ].map(([number, text]) => (
                  <li key={number} className="flex items-center gap-5 py-5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {number}
                    </span>
                    <span className="text-sm leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
                Human-led setup. Clear scope. No guaranteed profits, financial
                advice, or autonomous customer decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FIRST CONCEPT / STATUS */}
      <section className="mx-2 rounded-lg border bg-card px-5 py-24 sm:mx-3 md:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              [ AN EARLY TECHNOLOGY IDEA ]
            </span>
            <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
              <Words
                text="An AI assistant to help you take the next step"
                className="text-chrome"
              />
            </h2>
            <p className="reveal mt-8 max-w-lg text-muted-foreground">
              We’re considering a general-purpose assistant to help developers
              and everyday users turn a question or task into a useful draft,
              solution, or next step. It’s still an idea—not built or validated.
            </p>
            <div className="reveal mt-8 flex flex-wrap items-center gap-6">
              <Link
                to="/assistant"
                hash="waitlist"
                className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
              >
                Join the waitlist
              </Link>
              <Link
                to="/roadmap"
                className="group flex items-center gap-2 text-sm"
              >
                See the roadmap{" "}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>
          <div data-reveal className="reveal">
            <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]">
              <span className="live-dot size-2 rounded-full bg-glow" /> Live
              status
            </div>
            <ol className="grid grid-cols-4 gap-2">
              {STAGES.map((s, i) => (
                <li
                  key={s}
                  className={`rounded-md border p-4 ${i === 0 ? "border-glow bg-glow/10" : "opacity-40"}`}
                >
                  <div className="font-mono text-[0.65rem] text-muted-foreground">
                    0{i + 1}
                  </div>
                  <div className="mt-6 font-display text-sm font-semibold uppercase md:text-base">
                    {s}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              We’ll be clear whether something is an idea, prototype, pilot, or
              live offering.
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES GRID */}
      <section id="principles" className="px-5 py-28 md:px-10">
        <div data-reveal className="mb-16">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ HOW WE WORK ]
          </span>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
            <Words text="Five principles" />
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(([t, d], i) => (
            <div
              key={t}
              data-reveal
              className="reveal group rounded-lg border p-8 transition-all duration-500 hover:-translate-y-1 hover:border-glow/60 hover:bg-card"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>[ 0{i + 1} ]</span>
                <Sparkle className="size-4 transition-transform duration-700 group-hover:rotate-180 group-hover:text-glow" />
              </div>
              <h3 className="mt-12 font-display text-2xl font-semibold uppercase">
                {t}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {d}
              </p>
            </div>
          ))}
          <Link
            to="/leadership"
            data-reveal
            className="reveal group flex flex-col justify-end rounded-lg border border-dashed p-8 transition-colors hover:border-glow/60 hover:bg-card"
          >
            <span className="font-mono text-xs text-muted-foreground">
              [ BUILT BY ]
            </span>
            <p className="mt-4 font-display text-3xl font-extrabold uppercase">
              Enosh &amp; Vince
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The people building the VEXVANO LABS concept.
            </p>
            <span className="mt-6 flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
              Meet the leadership
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section
        id="join"
        className="relative mx-2 mb-2 overflow-hidden rounded-lg border sm:mx-3 sm:mb-3"
      >
        <ParticleField
          className="absolute inset-0 h-full w-full opacity-70"
          density={0.6}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="relative px-5 pb-10 pt-32 md:px-10">
          <div data-reveal className="text-center">
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              [ OUR IDEA ]
            </span>
            <h2 className="mx-auto mt-6 max-w-5xl font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
              <Words text="Practical ideas," />{" "}
              <Words
                text="carried through."
                base={200}
                className="text-chrome"
              />
            </h2>
            <p className="reveal mx-auto mt-8 max-w-xl text-muted-foreground">
              We’re still developing the VEXVANO LABS concept. Have a question, an
              idea, or want to work with us? We’d like to hear from you.
            </p>
            <div className="reveal mt-10 flex justify-center">
              <Link
                to="/contact"
                className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
              >
                Contact us
              </Link>
            </div>
          </div>
          <footer className="mt-32 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-display text-5xl font-extrabold md:text-7xl">
                <Wordmark />
              </div>
              <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted-foreground">
                USEFUL IDEAS. REAL-WORLD PROGRESS.
              </p>
            </div>
            <div className="flex flex-col gap-6 md:items-end">
              <SocialLinks />
              <p className="max-w-sm font-mono text-[0.7rem] leading-relaxed text-muted-foreground md:text-right">
                © 2026 VEXVANO LABS — proposed brand. The name, structure, and
                launch timing still need founder confirmation.{" "}
                <Link
                  to="/privacy"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Privacy
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
