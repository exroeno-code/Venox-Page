import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "What we’re working on — VEXVANO LABS";
const DESC =
  "A clear look at where VEXVANO LABS ideas stand today: Idea, Prototype, Pilot or Live. We’ll update this page as things change.";

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
  link?: {
    to: "/assistant" | "/forex-trading" | "/leadership" | "/contact";
    label: string;
  };
}[] = [
  {
    title: "VEXVANO LABS website",
    stage: "Live",
    note: "You’re here now: the website, leadership, contact and roadmap pages, and Vexvano Labs accounts are live.",
    link: { to: "/leadership", label: "Meet our leadership" },
  },
  {
    title: "AI assistant",
    stage: "Idea",
    note: "We’re exploring an assistant to help people turn questions into useful next steps. It hasn’t been built or validated yet.",
    link: { to: "/assistant", label: "See the idea and join the waitlist" },
  },
  {
    title: "Foreign exchange trading concept",
    stage: "Idea",
    note: "This is an early idea to explore foreign exchange trading and make the risks clear. There is no live platform or brokerage. Product scope, markets, regulatory status, operators and timing are not confirmed.",
    link: {
      to: "/forex-trading",
      label: "Read about the foreign exchange trading idea",
    },
  },
];

// Newest first. Add a line here whenever something real changes.
const UPDATES: { date: string; text: string }[] = [
  {
    date: "November 2026",
    text: "We replaced the goods-commerce idea with a foreign exchange trading concept. It’s still at Idea stage; no brokerage or trading service is live.",
  },
  {
    date: "November 2026",
    text: "We added this roadmap so you can see the actual stage of each idea.",
  },
  {
    date: "November 2026",
    text: "We opened a page and waitlist for the AI assistant idea. The assistant itself is still only an idea.",
  },
  {
    date: "November 2026",
    text: "We added leadership and contact pages, along with Vexvano Labs accounts.",
  },
];

function StageTrack({ stage }: { stage: Stage }) {
  const current = STAGES.indexOf(stage);
  return (
    <ol
      className="grid grid-cols-4 gap-2"
      aria-label={`Current stage: ${stage}`}
    >
      {STAGES.map((s, i) => (
        <li
          key={s}
          aria-current={i === current ? "step" : undefined}
          className={`rounded-md border p-3 ${i === current ? "border-glow bg-glow/10" : i < current ? "opacity-70" : "opacity-30"}`}
        >
          <div className="font-mono text-[0.6rem] text-muted-foreground">
            0{i + 1}
          </div>
          <div className="mt-4 font-display text-xs font-semibold uppercase sm:text-sm">
            {s}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Roadmap() {
  return (
    <PageShell tag="[ ROADMAP ]">
      <section className="pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ WHERE THINGS STAND ]
        </span>
        <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Roadmap" className="text-chrome" />
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Here’s where each idea stands: Idea, Prototype, Pilot or Live. We’ll
          keep this page up to date as real progress happens.
        </p>

        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {ITEMS.map((it, i) => (
            <li
              key={it.title}
              className="rounded-lg border bg-card/70 p-8 backdrop-blur-md"
            >
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>[ 0{i + 1} ]</span>
                <span className="flex items-center gap-2 uppercase tracking-[0.25em] text-foreground">
                  {it.stage === "Live" && (
                    <span className="live-dot size-2 rounded-full bg-glow" />
                  )}
                  {it.stage}
                </span>
              </div>
              <h2 className="mt-8 font-display text-3xl font-extrabold uppercase leading-[0.95] md:text-4xl">
                {it.title}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {it.note}
              </p>
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
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ UPDATES ]
        </span>
        <h2 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">
          What’s new
        </h2>
        <ul className="mt-10 max-w-3xl divide-y border-y">
          {UPDATES.map((u) => (
            <li
              key={u.text}
              className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {u.date}
              </span>
              <span className="text-sm leading-relaxed">{u.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
