import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldAlert } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { ParticleField } from "@/components/vexon/ParticleField";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Online forex trading: an early idea — VEXON TECH";
const DESC =
  "VEXON TECH is exploring online forex trading as an early idea. There is no live platform, broker service, account, deposit facility, or trade execution.";

export const Route = createFileRoute("/forex-trading")({
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
  component: ForexTrading,
});

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

const CONSIDERATIONS = [
  {
    title: "Still an idea",
    text: "We’re exploring this, not announcing a product. There’s nothing to register for or use at this stage.",
  },
  {
    title: "No trading service",
    text: "VEXON TECH does not provide a broker or trading accounts, accept deposits, execute trades, manage money, sell signals, or endorse brokers.",
  },
  {
    title: "Important details are undecided",
    text: "The scope, markets, technology, partners, regulatory status, fees, and any launch timing are still unconfirmed.",
  },
] as const;

function ForexTrading() {
  return (
    <PageShell tag="[ ONLINE FOREX TRADING ]" scene={<Scene />}>
      <section className="pb-8 pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ IDEA STAGE · NOT A LIVE SERVICE ]
        </span>
        <h1 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.9] md:text-[7rem]">
          <span className="block">
            <Words text="Online forex" className="text-chrome" />
          </span>
          <span className="block">
            <Words text="trading" base={220} className="text-chrome" />
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          We’re exploring online forex trading as a possible future project.
          It’s only an idea for now: VEXON TECH does not offer a trading
          platform, broker service, or financial service.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/trading"
            className="bracket-btn group inline-flex items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
          >
            Explore proposed trading education
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 px-2 py-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Get in touch
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <section
        role="note"
        className="my-8 flex gap-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-6 backdrop-blur-md"
      >
        <ShieldAlert
          className="mt-0.5 size-5 shrink-0 text-amber-300"
          aria-hidden
        />
        <div className="space-y-2 text-sm leading-relaxed text-amber-100/90">
          <p className="font-semibold uppercase tracking-wide text-amber-200">
            Forex risk notice · not financial advice
          </p>
          <p>
            Forex and CFDs carry a high risk of loss, and losses can happen
            quickly. This page is about an idea that has not launched; it is not
            a recommendation, an invitation to trade, or financial advice.
            Please consider whether you understand the risks and seek
            independent professional advice where appropriate.
          </p>
        </div>
      </section>

      <section className="py-8">
        <h2 className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ WHAT'S CONFIRMED — AND WHAT ISN'T ]
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CONSIDERATIONS.map((item, index) => (
            <article
              key={item.title}
              className="rounded-lg border bg-card/50 p-7 backdrop-blur-md"
            >
              <span className="font-mono text-xs text-muted-foreground">
                [ 0{index + 1} ]
              </span>
              <h3 className="mt-8 font-display text-2xl font-semibold uppercase">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
