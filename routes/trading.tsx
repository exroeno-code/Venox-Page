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

const MARKET_GROUPS = [
  {
    title: "Forex pairs & metals",
    markets: [
      { symbol: "OANDA:EURUSD", label: "EUR / USD", interval: "60" },
      { symbol: "OANDA:GBPUSD", label: "GBP / USD", interval: "60" },
      { symbol: "OANDA:USDJPY", label: "USD / JPY", interval: "60" },
      { symbol: "OANDA:AUDUSD", label: "AUD / USD", interval: "60" },
      { symbol: "OANDA:USDCAD", label: "USD / CAD", interval: "60" },
      { symbol: "OANDA:USDCHF", label: "USD / CHF", interval: "60" },
      { symbol: "OANDA:NZDUSD", label: "NZD / USD", interval: "60" },
      { symbol: "OANDA:EURGBP", label: "EUR / GBP", interval: "60" },
      { symbol: "OANDA:AUDJPY", label: "AUD / JPY", interval: "60" },
      { symbol: "OANDA:XAUUSD", label: "Gold / USD", interval: "60" },
    ],
  },
  {
    title: "Crypto markets",
    markets: [
      { symbol: "COINBASE:BTCUSD", label: "Bitcoin / USD", interval: "60" },
      { symbol: "COINBASE:ETHUSD", label: "Ethereum / USD", interval: "60" },
      { symbol: "COINBASE:SOLUSD", label: "Solana / USD", interval: "60" },
    ],
  },
] as const;

type Market = (typeof MARKET_GROUPS)[number]["markets"][number];

function TradingViewChart({ symbol, label, interval }: Market) {
  const query = new URLSearchParams({
    symbol,
    interval,
    hidesidetoolbar: "1",
    hidetoptoolbar: "1",
    hidelegend: "0",
    saveimage: "0",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    hideideas: "1",
    withdateranges: "1",
  });

  return (
    <article className="overflow-hidden rounded-lg border bg-card/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em]">
          {label}
        </h3>
        <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
          <span className="live-dot size-1.5 rounded-full bg-glow" /> Live feed
        </span>
      </div>
      <iframe
        title={`${label} live market chart`}
        src={`https://www.tradingview.com/widgetembed/?${query.toString()}`}
        className="block h-[360px] w-full border-0 md:h-[420px]"
        loading="lazy"
        referrerPolicy="origin"
        allowFullScreen
      />
    </article>
  );
}

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

      <section className="py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              [ LIVE MARKET VIEW · UTC ]
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-6xl">
              Watch how markets move.
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Educational display only
          </span>
        </div>
        <div className="space-y-10">
          {MARKET_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                [ {group.title} ]
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {group.markets.map((market) => (
                  <TradingViewChart key={market.symbol} {...market} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl font-mono text-[0.68rem] leading-relaxed text-muted-foreground">
          Charts are embedded from TradingView and show provider market data.
          Real-time availability and timing can vary by symbol, feed, market
          hours, and provider. Crypto assets can be especially volatile and
          carry a high risk of loss. VEXVANO LABS does not provide signals,
          forecasts, trade execution, or investment advice. Never treat this
          display as a recommendation to buy or sell.
        </p>
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
