import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldAlert } from "lucide-react";

import { ParticleField } from "@/components/vexon/ParticleField";
import { PageShell } from "@/components/vexon/PageShell";
import { WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

const TITLE = "Trading education — VEXON TECH";
const DESC = "Learn how financial markets work with VEXON TECH: market mechanics, technical and fundamental analysis. Education only, not investment advice.";

export const Route = createFileRoute("/trading")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("trading"),
    ],
  }),
  component: Trading,
});

const MODULES = [
  {
    tag: "[ MODULE 01 ]",
    title: "Market mechanics",
    points: ["Currency pairs and pips", "Leverage and margin", "Platform execution (MT4 / MT5)"],
  },
  {
    tag: "[ MODULE 02 ]",
    title: "Technical & fundamental analysis",
    points: ["Chart patterns and price action", "Economic calendars", "Central bank policies"],
  },
] as const;

/** Degrees that build the analytical foundation behind trading and financial markets. */
const PATHWAYS = [
  ["Financial Engineering", "Mathematical modelling, derivatives pricing, quantitative risk and algorithmic trading systems."],
  ["Financial Economics", "Economics, financial markets, econometrics and investment analysis."],
  ["Commerce (Finance option)", "Corporate finance, portfolio management, securities and capital markets."],
  ["Actuarial Science", "Probability, statistics, financial mathematics and risk assessment."],
  ["Economics and Statistics", "The macroeconomic indicators, such as interest rates and inflation, that move currencies."],
  ["Data Science and Analytics", "Analysing market data, backtesting strategies and building automated tools."],
] as const;

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

const interestLink = `${SITE.whatsappUrl}?text=${encodeURIComponent("Hello VEXON TECH, I'm interested in your trading education classes. Please share more details.")}`;

function Trading() {
  return (
    <PageShell tag="[ TRADING ]" scene={<Scene />}>
      <section className="pb-6 pt-20 md:pt-28">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ TRADING EDUCATION · CONCEPT STAGE ]</span>
        <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-[8.5rem]">
          <span className="block"><Words text="Learn the" className="text-chrome" /></span>
          <span className="block"><Words text="markets" base={200} className="text-chrome" /></span>
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          Understand how currency and financial markets work, how analysis is done and how risk is managed. We teach
          how markets work. We do not tell you what to trade.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={SITE.community.tradingGroup}
            target="_blank"
            rel="noreferrer noopener"
            className="bracket-btn group inline-flex items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
          >
            <WhatsAppIcon className="size-4" />
            Join the trading group
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href={interestLink}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-2 px-2 py-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Ask about classes
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      <section role="note" className="my-10 flex gap-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-6 backdrop-blur-md">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
        <div className="space-y-2 text-sm leading-relaxed text-amber-100/90">
          <p className="font-semibold uppercase tracking-wide text-amber-200">Education only. Not investment advice.</p>
          <p>
            VEXON TECH does not give investment advice, sell trade signals, manage anyone's money or take deposits. We do not
            recommend or endorse any broker. Trading forex and CFDs carries a high risk of losing money. Only use money you
            can afford to lose. If you use a broker, check that it is licensed by the Capital Markets Authority (CMA) of Kenya.
          </p>
        </div>
      </section>

      <section className="py-6">
        <h2 className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground">[ WHAT WE PLAN TO TEACH ]</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m.title} className="rounded-lg border bg-card/50 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-glow/60 hover:bg-card">
              <span className="font-mono text-xs text-muted-foreground">{m.tag}</span>
              <h3 className="mt-10 font-display text-2xl font-semibold uppercase">{m.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {m.points.map((p) => (
                  <li key={p} className="flex items-center gap-3">
                    <span className="size-1.5 rounded-full bg-glow" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-end rounded-lg border border-dashed p-8">
            <span className="font-mono text-xs text-muted-foreground">[ MORE ]</span>
            <p className="mt-4 font-display text-2xl font-semibold uppercase">More modules to come</p>
            <p className="mt-2 text-sm text-muted-foreground">The full syllabus, fees and start dates are not yet confirmed.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ DEGREE PATHWAYS BEHIND TRADING ]</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Retail trading has no standalone university degree. People aiming at institutional trading or quantitative
          strategy usually study one of these. VEXON TECH does not award degrees; see our{" "}
          <Link to="/learning" className="text-glow underline underline-offset-2">Learning</Link> page for computing programmes.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PATHWAYS.map(([title, desc]) => (
            <li key={title} className="rounded-md border bg-card/50 p-5 backdrop-blur-md">
              <p className="font-medium">{title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
