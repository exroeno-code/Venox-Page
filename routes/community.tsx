import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Community — VEXON TECH";
const DESC = "Join the VEXON TECH community on WhatsApp: our trading group, our channel and our community group.";

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
    desc: "Talk with the VEXON TECH community, share ideas and ask questions.",
    cta: "Join the group",
    href: SITE.community.group,
  },
  {
    tag: "[ 02 ]",
    title: "Channel",
    desc: "Follow our official channel for updates and announcements.",
    cta: "Follow the channel",
    href: SITE.community.channel,
  },
  {
    tag: "[ 03 ]",
    title: "Trading group",
    desc: "Join the trading group to follow and discuss trading with others.",
    cta: "Join the trading group",
    href: SITE.community.tradingGroup,
  },
] as const;

function Community() {
  return (
    <PageShell tag="[ COMMUNITY ]">
      <section className="pb-8 pt-20 md:pt-28">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ JOIN US ON WHATSAPP ]</span>
        <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Our" /> <Words text="community" base={150} className="text-chrome" />
        </h1>
        <p className="mt-8 max-w-xl text-muted-foreground">
          Three places to connect with VEXON TECH. Pick the one that fits you; you can join all of them.
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
              <h2 className="mt-12 font-display text-3xl font-semibold uppercase">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="mt-8 flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
                {s.cta}
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>
        ))}
      </section>

      <p className="max-w-xl pb-6 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
        Trading carries risk. Nothing shared in our groups is financial advice. Do your own research.
      </p>
    </PageShell>
  );
}
