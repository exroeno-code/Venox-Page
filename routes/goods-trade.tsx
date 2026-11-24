import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { ParticleField } from "@/components/vexon/ParticleField";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Goods Trade — Under evaluation — VEXON TECH";
const DESC =
  "VEXON TECH goods-based commerce is a later workstream under evaluation, not an active service.";

export const Route = createFileRoute("/goods-trade")({
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
  component: GoodsTrade,
});

/** Animated backdrop: drifting colour glows, a moving perspective grid and a live particle field. */
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
        density={0.8}
      />
      <div className="grid-floor" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_85%)]" />
    </div>
  );
}

function GoodsTrade() {
  return (
    <PageShell tag="[ GOODS TRADE ]" scene={<Scene />}>
      <section className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ LATER · UNDER EVALUATION ]
        </span>
        <h1 className="in mt-8 font-display text-[16vw] font-extrabold uppercase leading-[0.88] tracking-tight md:text-[11vw]">
          <span className="block">
            <Words text="Under" className="text-chrome" />
          </span>
          <span className="block">
            <Words text="evaluation" base={250} className="text-chrome" />
          </span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
          Goods-based commerce is a later workstream, not an active service. The
          goods, markets, terms, accountable operators, and timing have not been
          decided.
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Current roadmap status: Idea
        </p>
        <Link
          to="/"
          className="group mt-14 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to home
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </section>
    </PageShell>
  );
}
