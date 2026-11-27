import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Our community — VEXON TECH";
const DESC =
  "Find your place in the VEXON TECH WhatsApp community: share ideas, follow updates or talk about trading with others.";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("community"),
    ],
  }),
  component: Community,
});

const SPACES = [
  {
    tag: "[ 01 ]",
    title: "Community group",
    desc: "Meet people in the VEXON TECH community, swap ideas and ask questions.",
    cta: "Come join us",
    href: SITE.community.group,
  },
  {
    tag: "[ 02 ]",
    title: "Channel",
    desc: "Get updates and announcements from our official channel.",
    cta: "Follow along",
    href: SITE.community.channel,
  },
  {
    tag: "[ 03 ]",
    title: "Trading group",
    desc: "Talk about trading and learn alongside other community members.",
    cta: "Join the conversation",
    href: SITE.community.tradingGroup,
  },
] as const;

function Community() {
  return (
    <PageShell tag="[ COMMUNITY ]">
      <section className="pb-6 pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ JOIN US ON WHATSAPP ]
        </span>
        <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Our" />{" "}
          <Words text="community" base={150} className="text-chrome" />
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          There are three ways to connect with us. Choose what suits you, or
          join all three.
        </p>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-3">
        {SPACES.map((s) => (
          <a
            key={s.title}
            href={s.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex min-h-72 flex-col justify-between rounded-lg border p-8 transition-all duration-500 hover:-translate-y-1 hover:border-glow/60 hover:bg-card focus-visible:border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
          >
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>{s.tag}</span>
              <WhatsAppIcon className="size-5 transition-colors group-hover:text-glow" />
            </div>
            <div>
              <h2 className="mt-12 font-display text-3xl font-semibold uppercase">
                {s.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
              <span className="mt-8 flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
                {s.cta}
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>
        ))}
      </section>

      <p className="max-w-xl pb-6 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
        Foreign exchange trading and CFDs carry a high risk of loss. Foreign
        exchange trading is only at the idea stage: VEXON TECH does not provide
        a broker, platform, accounts, deposits, trade execution, signals, money
        management, broker endorsements or personalized financial advice.
        Trading education is proposed, not personalized advice. Nothing shared
        in our groups is financial advice. Do your own research.
      </p>
    </PageShell>
  );
}
