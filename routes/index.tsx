import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkle } from "lucide-react";
import { ParticleField } from "@/components/vexon/ParticleField";
import { Loader } from "@/components/vexon/Loader";
import { Words } from "@/components/vexon/Words";
import { TopBar } from "@/components/vexon/TopBar";
import { SocialLinks } from "@/components/vexon/SocialIcons";
import { Wordmark } from "@/components/vexon/Wordmark";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "VEXON TECH — Useful ideas. Real-world progress.";
const DESC =
  "VEXON TECH is a builder-led venture exploring practical digital technology and responsible goods-based commerce to turn useful ideas into real-world progress.";

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
  ["Useful over impressive", "Begin with a real problem, need, or customer value. Prefer clear utility to novelty for its own sake."],
  ["Trust before scale", "Communicate quality, pricing, availability, risks, and responsibilities plainly. Never imply something is ready when it is not."],
  ["Build and learn", "Test with users, listen carefully, improve what is not working, and use evidence before making broad claims."],
  ["Think in the long term", "Create value for customers, collaborators, and communities — not only short-term attention or revenue."],
  ["Act responsibly", "Respect law, safety, privacy, product quality, sourcing accountability, and the people affected by decisions."],
] as const;

const FOUNDATION = [
  ["Purpose", "To carry practical ideas through into useful technology and responsible commercial activity that creates tangible value for people, businesses, and communities."],
  ["Vision", "A future where people and businesses can access practical tools and trustworthy commerce that help them solve real problems, serve others, and make steady progress."],
  ["Mission", "Explore, build, and improve useful digital technology — software, digital products, and responsible AI-enabled workflows — while evaluating responsible goods-based trade."],
  ["Positioning", "A builder-led venture that aims to earn trust through real needs, clear communication, and follow-through — not hype."],
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
        if (heroImg.current) heroImg.current.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0003})`;
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
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
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const l = (window as unknown as { __lenis?: { scrollTo: (t: string) => void } }).__lenis;
    if (l) l.scrollTo(id); else document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="w-full overflow-x-clip">
      <Loader onDone={done} />

      {/* HERO */}
      <section className={`relative flex min-h-svh flex-col overflow-hidden px-5 pb-10 pt-6 md:px-10 ${ready ? "in" : ""}`}>
        <div ref={heroImg} className="pointer-events-none absolute inset-0">
          <ParticleField className="h-full w-full" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_62%,var(--background)_0%,transparent_35%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
        </div>

        <TopBar tag="[ V.00.1 · CONCEPT ]" onAnchor={go} />

        <div className="relative z-10 mt-auto grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-16 lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground">
              <span className="live-dot size-1.5 rounded-full bg-glow" /> [ PRACTICAL TECHNOLOGY ]
            </div>
            <h1 className="font-display text-[13vw] font-extrabold uppercase leading-[0.9] tracking-tight md:text-[8.5vw] lg:text-[5.2vw]">
              <span className="block"><Words text="Useful ideas" className="text-chrome" /></span>
              <span className="flex items-center">
                <Sparkle className="twinkle mr-[0.2em] size-[0.6em] shrink-0 fill-foreground" />
                <Words text="carried through" base={250} />
              </span>
              <span className="block"><Words text="to real-world progress" base={500} className="text-chrome" /></span>
            </h1>
          </div>

          <div className="reveal lg:pb-4" style={{ transitionDelay: "700ms" }} data-hero>
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl font-semibold">(V)</span>
              <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ 001 / 002 ]</span>
            </div>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              VEXON TECH is a builder-led venture exploring practical software, responsible AI-enabled workflows, and
              responsible goods-based commerce — earning trust through real needs and follow-through, not hype.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link to="/assistant" hash="waitlist" className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5">
                Follow the build
              </Link>
              <a href="#principles" onClick={go("#principles")} className="group flex items-center gap-2 text-sm">
                How we work <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES MARQUEE */}
      <section className="relative overflow-hidden border-y py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[22vw] font-extrabold uppercase leading-none text-foreground/[0.035]">
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
        <div data-reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
            <Words text="Our foundation" />
          </h2>
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ PURPOSE · VISION · MISSION ]</span>
        </div>
        <ul>
          {FOUNDATION.map(([t, d], i) => (
            <li key={t} data-reveal className="reveal group grid cursor-default gap-4 border-t py-8 transition-colors hover:bg-foreground/[0.03] md:grid-cols-[6rem_1fr_2fr_auto] md:items-center md:px-4">
              <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
              <h3 className="font-display text-3xl font-semibold uppercase transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">{t}</h3>
              <p className="max-w-xl text-muted-foreground">{d}</p>
              <ArrowUpRight className="hidden size-8 text-muted-foreground transition-all duration-500 group-hover:rotate-45 group-hover:text-glow md:block" />
            </li>
          ))}
        </ul>
      </section>

      {/* WORKSTREAMS */}
      <section id="workstreams" className="px-5 pb-28 md:px-10">
        <div data-reveal className="mb-16 max-w-3xl">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ TWO WORKSTREAMS · ONE STANDARD ]</span>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl"><Words text="What we explore" /></h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {[
            { k: "A", t: "Technology", d: "Practical software, digital products, and responsible AI-enabled workflows. Every initiative starts from a validated user need and states its status plainly.", rot: -2, v: "halo" as const, to: "/assistant" as const, more: "See the AI assistant concept" },
            { k: "B", t: "Goods-based commerce", d: "Exploring responsible ways to source, buy, and sell useful goods. Any real activity will name its goods, markets, terms, and accountable operators first.", rot: 2, v: "field" as const, to: "/goods-trade" as const, more: "Goods trade" },
          ].map((c) => (
            <article key={c.k} data-parallax={c.rot < 0 ? "-0.06" : "0.06"} data-rot={c.rot} className="group relative overflow-hidden rounded-lg border bg-card transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_var(--glow)]">
              <div className="relative h-72 overflow-hidden md:h-96">
                <ParticleField variant={c.v} density={0.35} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <span className="absolute left-6 top-6 font-mono text-xs tracking-[0.3em] text-muted-foreground">[ {c.k} ]</span>
                <span className="absolute right-6 top-6 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">Exploring</span>
              </div>
              <div className="p-8">
                <h3 className="font-display text-3xl font-extrabold uppercase md:text-4xl">{c.t}</h3>
                <p className="mt-4 max-w-md text-muted-foreground">{c.d}</p>
                <Link to={c.to} className="mt-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
                  {c.more}
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 font-mono text-xs leading-relaxed text-muted-foreground">
          “Trade” here means commercial goods only — not forex, crypto, securities, or investment advice.
        </p>
      </section>

      {/* FIRST CONCEPT / STATUS */}
      <section className="mx-2 rounded-lg border bg-card px-5 py-24 sm:mx-3 md:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ FIRST TECHNOLOGY CONCEPT ]</span>
            <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
              <Words text="An AI assistant that gets you to the next step" className="text-chrome" />
            </h2>
            <p className="reveal mt-8 max-w-lg text-muted-foreground">
              A general-purpose assistant that helps developers and everyday users move from a question or task toward a
              usable draft, solution, or next step. It is an idea under discussion — not yet built or validated.
            </p>
            <div className="reveal mt-8 flex flex-wrap items-center gap-6">
              <Link to="/assistant" hash="waitlist" className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5">
                Join the waitlist
              </Link>
              <Link to="/roadmap" className="group flex items-center gap-2 text-sm">
                See the roadmap <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>
          <div data-reveal className="reveal">
            <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]">
              <span className="live-dot size-2 rounded-full bg-glow" /> Live status
            </div>
            <ol className="grid grid-cols-4 gap-2">
              {STAGES.map((s, i) => (
                <li key={s} className={`rounded-md border p-4 ${i === 0 ? "border-glow bg-glow/10" : "opacity-40"}`}>
                  <div className="font-mono text-[0.65rem] text-muted-foreground">0{i + 1}</div>
                  <div className="mt-6 font-display text-sm font-semibold uppercase md:text-base">{s}</div>
                </li>
              ))}
            </ol>
            <p className="mt-6 font-mono text-xs text-muted-foreground">We label every idea, prototype, pilot and live offering by its true status.</p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES GRID */}
      <section id="principles" className="px-5 py-28 md:px-10">
        <div data-reveal className="mb-16">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ HOW WE WORK ]</span>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl"><Words text="Five principles" /></h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(([t, d], i) => (
            <div key={t} data-reveal className="reveal group rounded-lg border p-8 transition-all duration-500 hover:-translate-y-1 hover:border-glow/60 hover:bg-card" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>[ 0{i + 1} ]</span>
                <Sparkle className="size-4 transition-transform duration-700 group-hover:rotate-180 group-hover:text-glow" />
              </div>
              <h3 className="mt-12 font-display text-2xl font-semibold uppercase">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
          <Link
            to="/leadership"
            data-reveal
            className="reveal group flex flex-col justify-end rounded-lg border border-dashed p-8 transition-colors hover:border-glow/60 hover:bg-card"
          >
            <span className="font-mono text-xs text-muted-foreground">[ BUILT BY ]</span>
            <p className="mt-4 font-display text-3xl font-extrabold uppercase">Enosh &amp; Vince</p>
            <p className="mt-2 text-sm text-muted-foreground">The builders developing the VEXON TECH concept.</p>
            <span className="mt-6 flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
              Meet the leadership
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section id="join" className="relative mx-2 mb-2 overflow-hidden rounded-lg border sm:mx-3 sm:mb-3">
        <ParticleField className="absolute inset-0 h-full w-full opacity-70" density={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="relative px-5 pb-10 pt-32 md:px-10">
          <div data-reveal className="text-center">
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ BRAND IDEA ]</span>
            <h2 className="mx-auto mt-6 max-w-5xl font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
              <Words text="Practical ideas," /> <Words text="carried through." base={200} className="text-chrome" />
            </h2>
            <p className="reveal mx-auto mt-8 max-w-xl text-muted-foreground">
              VEXON TECH is in concept development. Questions, ideas or want to work with us? Get in touch.
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
              <div className="font-display text-5xl font-extrabold md:text-7xl"><Wordmark /></div>
              <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted-foreground">USEFUL IDEAS. REAL-WORLD PROGRESS.</p>
            </div>
            <div className="flex flex-col gap-6 md:items-end">
              <SocialLinks />
              <p className="max-w-sm font-mono text-[0.7rem] leading-relaxed text-muted-foreground md:text-right">
                © 2026 VEXON TECH — proposed brand. Name, structure and launch timing remain subject to founder confirmation.{" "}
                <Link to="/privacy" className="underline underline-offset-2 transition-colors hover:text-foreground">Privacy</Link>
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
