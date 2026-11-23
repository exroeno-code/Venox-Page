import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Roadmap & updates — VEXON TECH";
const DESC = "Where every VEXON TECH idea stands today: Idea, Prototype, Pilot or Live. Labelled by true status, updated as things change.";

export const Route = createFileRoute("/roadmap")({
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
  component: Roadmap,
});

const STAGES = ["Idea", "Prototype", "Pilot", "Live"] as const;
type Stage = (typeof STAGES)[number];

// Edit these lists to update the page. Only label something with a later stage when it is true.
const ITEMS: {
  title: string;
  stage: Stage;
  note: string;
  link?: { to: "/assistant" | "/goods-trade" | "/leadership" | "/contact"; label: string };
}[] = [
  {
    title: "VEXON TECH website",
    stage: "Live",
    note: "The landing page, leadership, contact and roadmap pages, and Vexon accounts you are using now.",
    link: { to: "/leadership", label: "Meet the leadership" },
  },
  {
    title: "AI assistant",
    stage: "Idea",
    note: "A general-purpose assistant that helps people get from a question to a usable next step. Not yet built or validated.",
    link: { to: "/assistant", label: "See the concept and join the waitlist" },
  },
  {
    title: "Goods-based commerce",
    stage: "Idea",
    note: "Exploring responsible ways to source, buy and sell useful goods. Goods, markets and accountable operators are not decided yet.",
    link: { to: "/goods-trade", label: "Goods trade" },
  },
];

// Newest first. Add a line here whenever something real changes.
const UPDATES: { date: string; text: string }[] = [
  { date: "November 2026", text: "Roadmap page added. Every idea is now labelled with its true stage." },
  { date: "November 2026", text: "AI assistant concept page and waitlist opened. The assistant itself is still an idea." },
  { date: "November 2026", text: "Leadership and contact pages added, along with Vexon accounts." },
];

function StageTrack({ stage }: { stage: Stage }) {
  const current = STAGES.indexOf(stage);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label={`Current stage: ${stage}`}>
      {STAGES.map((s, i) => (
        <li
          key={s}
          aria-current={i === current ? "step" : undefined}
          className={`rounded-md border p-3 ${i === current ? "border-glow bg-glow/10" : i < current ? "opacity-70" : "opacity-30"}`}
        >
          <div className="font-mono text-[0.6rem] text-muted-foreground">0{i + 1}</div>
          <div className="mt-4 font-display text-xs font-semibold uppercase sm:text-sm">{s}</div>
        </li>
      ))}
    </ol>
  );
}

function Roadmap() {
  return (
    <PageShell tag="[ ROADMAP ]">
      <section className="pt-24 md:pt-32">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ TRUE STATUS · NO HYPE ]</span>
        <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Roadmap" className="text-chrome" />
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          We label every idea, prototype, pilot and live offering by its true status. This page is updated as things change.
        </p>

        <ul className="mt-16 grid gap-4 lg:grid-cols-2">
          {ITEMS.map((it, i) => (
            <li key={it.title} className="rounded-lg border bg-card/70 p-8 backdrop-blur-md">
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>[ 0{i + 1} ]</span>
                <span className="flex items-center gap-2 uppercase tracking-[0.25em] text-foreground">
                  {it.stage === "Live" && <span className="live-dot size-2 rounded-full bg-glow" />}
                  {it.stage}
                </span>
              </div>
              <h2 className="mt-8 font-display text-3xl font-extrabold uppercase leading-[0.95] md:text-4xl">{it.title}</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">{it.note}</p>
              <div className="mt-8">
                <StageTrack stage={it.stage} />
              </div>
              {it.link && (
                <Link
                  to={it.link.to}
                  className="group mt-8 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {it.link.label}
                  <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 border-t pt-16">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ UPDATES ]</span>
        <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">Latest</h2>
        <ul className="mt-10 max-w-3xl divide-y border-y">
          {UPDATES.map((u) => (
            <li key={u.text} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{u.date}</span>
              <span className="text-sm leading-relaxed">{u.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
