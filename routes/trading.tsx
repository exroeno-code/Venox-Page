import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ShieldAlert } from "lucide-react";

import { ParticleField } from "@/components/vexon/ParticleField";
import { PageShell } from "@/components/vexon/PageShell";
import { WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

const TITLE = "Trading education — VEXVANO LABS";
const DESC =
  "VEXVANO LABS is exploring trading education in Kenya. Learn about markets and risk; this is a proposed learning program, not personalized financial advice.";

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
    title: "How markets work",
    points: [
      "Currency pairs and pips",
      "Leverage and margin",
      "Platform execution (MT4 / MT5)",
    ],
  },
  {
    tag: "[ MODULE 02 ]",
    title: "Reading markets",
    points: [
      "Chart patterns and price action",
      "Economic calendars",
      "Central bank policies",
    ],
  },
] as const;

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

const interestLink = `${SITE.whatsappUrl}?text=${encodeURIComponent("Hello VEXVANO LABS, I'm interested in your trading education classes. Please share more details.")}`;

function Trading() {
  return (
    <PageShell tag="[ TRADING ]" scene={<Scene />}>
      <section className="pb-6 pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ TRADING EDUCATION · IDEA STAGE ]
        </span>
        <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-[8.5rem]">
          <span className="block">
            <Words text="Understand" className="text-chrome" />
          </span>
          <span className="block">
            <Words text="the markets" base={200} className="text-chrome" />
          </span>
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          We’re exploring a learning program about currency and financial
          markets, analysis and risk. It’s an idea in development, not a live
          service. If it goes ahead, it will focus on how markets work—not what
          you should trade.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={SITE.community.tradingGroup}
            target="_blank"
            rel="noreferrer noopener"
            className="bracket-btn group inline-flex items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
          >
            <WhatsAppIcon className="size-4" />
            Join our trading group
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href={interestLink}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-2 px-2 py-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Ask about the proposed classes
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      <section
        role="note"
        className="my-10 flex gap-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-6 backdrop-blur-md"
      >
        <ShieldAlert
          className="mt-0.5 size-5 shrink-0 text-amber-300"
          aria-hidden
        />
        <div className="space-y-2 text-sm leading-relaxed text-amber-100/90">
          <p className="font-semibold uppercase tracking-wide text-amber-200">
            Learning only—not personalized financial advice.
          </p>
          <p>
            Foreign exchange trading is at the Idea stage. VEXVANO LABS does not
            provide a broker, platform or accounts, and does not take deposits,
            execute trades, sell signals, manage money, recommend or endorse
            brokers, or provide personalized financial advice. Proposed trading
            education is for learning only. Foreign exchange trading and CFDs
            carry a high risk of loss. Only use money you can afford to lose. If
            you use a broker, check the{" "}
            <a
              href="https://licensees.cma.or.ke/licenses/5/"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              official Kenya CMA licensee register
            </a>
            .
          </p>
        </div>
      </section>

      <section className="py-6">
        <h2 className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ TOPICS WE’RE CONSIDERING ]
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.title}
              className="rounded-lg border bg-card/50 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-glow/60 hover:bg-card"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {m.tag}
              </span>
              <h3 className="mt-10 font-display text-2xl font-semibold uppercase">
                {m.title}
              </h3>
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
            <span className="font-mono text-xs text-muted-foreground">
              [ MORE ]
            </span>
            <p className="mt-4 font-display text-2xl font-semibold uppercase">
              Still taking shape
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This program is still in development. The full syllabus, fees,
              accreditation and dates are not confirmed.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
