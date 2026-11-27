import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "AI Workflow Audit and Sprint for Kenyan Businesses | VEXON TECH";
const DESC =
  "Make repetitive business work easier with practical, human-led AI workflows for customer replies, documents, content, and daily operations.";

export const Route = createFileRoute("/ai-workflow")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: "VEXON AI Workflow Audit and Sprint" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("default"),
    ],
  }),
  component: AIWorkflow,
});

const WHATSAPP_HREF = `${SITE.whatsappUrl}?text=${encodeURIComponent("Hello VEXON TECH, I'd like to learn about the AI Workflow Audit and Sprint.")}`;

const STEPS = [
  [
    "01",
    "Find the repetitive task",
    "We identify the work costing your team time: replies, documents, reports, follow-ups, or content.",
  ],
  [
    "02",
    "Set up a useful workflow",
    "We configure a practical AI-assisted workflow around the tools your team already understands.",
  ],
  [
    "03",
    "Train, test, and improve",
    "Your team uses it, checks the output, and improves the process together. A person remains responsible for the final decision.",
  ],
] as const;

const USE_CASES = [
  "WhatsApp replies and enquiry follow-ups",
  "Quotes, proposals, and document drafts",
  "Social media and marketing content",
  "Meeting notes and weekly reports",
  "Booking, reminder, and notification flows",
  "Internal knowledge and recurring task checklists",
];

const FAQS = [
  [
    "Will AI replace our staff?",
    "No. The goal is to remove repetitive work so your team can focus on customers and decisions. A person reviews important output.",
  ],
  [
    "What happens to our business data?",
    "We use a privacy-conscious setup, share only what a task needs, and agree on what should never be put into AI tools.",
  ],
  [
    "How long does a Sprint take?",
    "The timing depends on the workflow and your team's availability. We confirm the scope and schedule before work begins.",
  ],
  [
    "Do you guarantee more sales or profit?",
    "No. We promise a practical workflow and honest measurement of the work it improves, never guaranteed profits.",
  ],
  [
    "Do we need to replace our existing software?",
    "Usually not. We start with the tools your team already uses and connect or configure them where supported.",
  ],
  [
    "Is this an autonomous AI service?",
    "No. This is human-led setup and support. The team remains responsible for approvals, customer decisions, and sensitive work.",
  ],
] as const;

function AIWorkflow() {
  return (
    <PageShell tag="[ VEXON TECH · ACTIVE SERVICE ]">
      <section className="pt-4 md:pt-8">
        <span className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          <span className="live-dot size-2 rounded-full bg-glow" /> [ AI
          WORKFLOW AUDIT · KENYA ]
        </span>
        <h1 className="mt-6 max-w-5xl font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-[8.5rem]">
          <Words text="Make repetitive" className="text-chrome" />
          <span className="block">
            <Words text="work easier" base={180} />
          </span>
          <span className="block">
            <Words
              text="with practical AI"
              base={360}
              className="text-chrome"
            />
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          VEXON TECH helps Kenyan small businesses make customer replies,
          documents, content, and daily operations easier with human-led AI
          workflows your team can actually use.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            to="/contact"
            className="bracket-btn inline-flex items-center gap-2 px-7 py-4 font-mono text-sm uppercase tracking-[0.18em]"
          >
            Book an AI workflow audit <ArrowUpRight className="size-4" />
          </Link>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="size-4" /> Chat on WhatsApp{" "}
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </section>

      <section className="my-20 rounded-lg border border-primary/30 bg-primary/5 p-6 md:p-8">
        <div className="flex gap-4">
          <Sparkles className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              [ FIRST COMMERCIAL OFFER ]
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase">
              Clear scope. Human review. Useful progress.
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              We do not promise autonomous businesses or guaranteed profits. We
              help you choose one meaningful workflow, set it up with your team,
              and learn whether it is actually useful.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mb-10 max-w-2xl">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ HOW IT WORKS ]
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-6xl">
            Three steps, one useful workflow.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(([number, title, body]) => (
            <article
              key={number}
              className="rounded-lg border bg-card/60 p-7 backdrop-blur-md"
            >
              <span className="font-mono text-xs text-muted-foreground">
                [ {number} ]
              </span>
              <h3 className="mt-10 font-display text-2xl font-semibold uppercase">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              [ USE CASES ]
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-6xl">
              Work your team repeats every week.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              Start with a narrow, visible problem. The best first workflow is
              specific enough to measure and useful enough for a real team to
              keep using.
            </p>
          </div>
          <ul className="divide-y border-y">
            {USE_CASES.map((useCase) => (
              <li key={useCase} className="flex items-center gap-4 py-5">
                <Check className="size-4 shrink-0 text-glow" aria-hidden />
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border bg-card/60 p-6 backdrop-blur-md md:p-10">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            [
              "AI Workflow Audit",
              "From KES 3,000",
              "A focused discovery session, workflow map, and written recommendation.",
            ],
            [
              "AI Workflow Sprint",
              "From KES 20,000",
              "Set up one practical workflow, train the team, and improve it together.",
            ],
            [
              "Team Package",
              "From KES 50,000",
              "Explore several workflows, templates, training, and follow-up support.",
            ],
          ].map(([name, price, description], index) => (
            <article
              key={name}
              className={`rounded-md border p-6 ${index === 1 ? "border-glow bg-glow/10" : "bg-background/40"}`}
            >
              {index === 1 && (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-glow">
                  [ RECOMMENDED START ]
                </span>
              )}
              <h3 className="mt-2 font-display text-2xl font-semibold uppercase">
                {name}
              </h3>
              <p className="mt-4 font-mono text-sm text-glow">{price}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
              >
                Discuss this option <ArrowUpRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 font-mono text-xs leading-relaxed text-muted-foreground">
          Starting prices are a guide for discussion. We confirm the actual
          scope, tools, timeline, and price before work begins.
        </p>
      </section>

      <section className="grid gap-4 py-20 md:grid-cols-3">
        {[
          [
            ShieldCheck,
            "Human review",
            "A person checks important AI output before it reaches customers or becomes a business decision.",
          ],
          [
            Workflow,
            "Privacy-conscious setup",
            "We share only what a task needs and agree on sensitive information that should stay out of AI tools.",
          ],
          [
            Check,
            "No guaranteed profits",
            "We measure practical improvement and time saved, not hype or guaranteed financial results.",
          ],
        ].map(([Icon, title, body]) => {
          const FeatureIcon = Icon as typeof ShieldCheck;
          return (
            <article key={title as string} className="rounded-lg border p-7">
              <FeatureIcon className="size-5 text-glow" aria-hidden />
              <h3 className="mt-8 font-display text-2xl font-semibold uppercase">
                {title as string}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {body as string}
              </p>
            </article>
          );
        })}
      </section>

      <section className="py-8">
        <div className="mb-10 max-w-2xl">
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            [ QUESTIONS, ANSWERED ]
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-6xl">
            Start with the task that eats your time.
          </h2>
        </div>
        <div className="divide-y border-y">
          {FAQS.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="cursor-pointer list-none pr-8 font-display text-xl font-semibold uppercase marker:hidden">
                {question}
                <span className="float-right text-glow transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-3xl pt-4 text-sm leading-relaxed text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="my-20 rounded-lg border px-6 py-14 text-center md:px-10">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ NEXT STEP ]
        </span>
        <h2 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
          Tell us the task that eats your time.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Send a short note about the work you repeat. We’ll discuss whether an
          audit or Sprint makes sense—no pressure and no guaranteed claims.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="bracket-btn inline-flex items-center gap-2 px-7 py-4 font-mono text-sm uppercase tracking-[0.18em]"
          >
            Contact VEXON TECH <ArrowUpRight className="size-4" />
          </Link>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-4 py-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </div>
      </section>
    </PageShell>
  );
}
