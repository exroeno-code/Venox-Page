import { useState, type FormEvent } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Check,
  FileText,
  GraduationCap,
  Lock,
  Megaphone,
  MessageCircle,
  NotebookPen,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE } from "@/lib/site-config";
import {
  PACKAGES,
  leadMessage,
  leadSchema,
  saveLead,
} from "@/lib/workflow-leads";
import { AI_WORKFLOW } from "@/lib/workflow-config";

const WA_HELLO =
  "Hello VEXVANO LABS, I'd like to learn about the AI Workflow Sprint.";

function BookButton({
  label = "Book an AI Workflow Audit",
  where,
}: {
  label?: string;
  where: string;
}) {
  return (
    <a
      href={AI_WORKFLOW.bookingUrl}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() => track("book_click", { where })}
      className="vexon-gold-button inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
    >
      {label} <ArrowRight className="size-4" />
    </a>
  );
}

function WhatsAppButton({ where }: { where: string }) {
  return (
    <a
      href={`${SITE.whatsappUrl}?text=${encodeURIComponent(WA_HELLO)}`}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() => track("whatsapp_click", { where })}
      className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold transition-colors hover:bg-foreground/5"
    >
      <MessageCircle className="size-4" /> Chat on WhatsApp
    </a>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-glow">
      {children}
    </p>
  );
}

const steps = [
  {
    icon: Search,
    title: "Find the repetitive task",
    description:
      "We map where your time goes and pick the one task costing you the most.",
  },
  {
    icon: Settings2,
    title: "Set it up with your team",
    description:
      "We build a practical AI-assisted workflow around the tools you already use.",
  },
  {
    icon: GraduationCap,
    title: "Train, test and improve",
    description:
      "Your team learns it, we measure the result and refine it together.",
  },
] as const;

const useCases = [
  {
    icon: MessageCircle,
    title: "WhatsApp customer replies",
    description:
      "Faster, consistent answers to the questions you get every day.",
  },
  {
    icon: FileText,
    title: "Quotes and proposals",
    description: "Draft professional documents in minutes, reviewed by you.",
  },
  {
    icon: Megaphone,
    title: "Social media content",
    description: "A steady posting plan and drafts in your brand voice.",
  },
  {
    icon: NotebookPen,
    title: "Meeting notes and weekly reports",
    description: "Clean summaries and action lists without the typing.",
  },
] as const;

const plans = [
  {
    name: "AI Workflow Audit",
    price: "3,000",
    description:
      "A focused session to find your biggest time-wasters and a clear recommendation.",
    features: [
      "1 discovery session",
      "Workflow map",
      "Written recommendations",
    ],
  },
  {
    name: "AI Workflow Sprint",
    price: "20,000",
    description:
      "We set up one working AI workflow and train your team to use it.",
    features: [
      "Everything in the Audit",
      "One workflow set up",
      "Team training",
      "Before-and-after measurement",
    ],
    featured: true,
  },
  {
    name: "Team Package",
    price: "50,000",
    description: "Several workflows across your team, with follow-up support.",
    features: [
      "Up to 3 workflows",
      "Templates and guides",
      "Staff training",
      "30 days follow-up",
    ],
  },
] as const;

const faqs = [
  [
    "Do I need technical skills?",
    "No. We set everything up and train your team in plain language using tools you already know.",
  ],
  [
    "Will AI replace my staff?",
    "No. The goal is to remove repetitive work so your team can focus on customers. A person always reviews the output.",
  ],
  [
    "What happens to my business data?",
    "We use a privacy-conscious setup, share only what a task needs, and agree on what should never go into AI tools.",
  ],
  [
    "How long does a Sprint take?",
    "Most Sprints run about two weeks, depending on your team's availability.",
  ],
  [
    "Do you guarantee more sales or profit?",
    "No. We promise a practical workflow and honest measurement of time saved, not guaranteed profits.",
  ],
  [
    "How do I pay?",
    "We agree the scope first, then you pay a deposit to start. M-Pesa and bank options are available.",
  ],
] as const;

function LeadForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = leadSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const saved = await saveLead(parsed.data);
    track("lead_submit", { package: parsed.data.package, saved });
    const link = `${SITE.whatsappUrl}?text=${encodeURIComponent(leadMessage(parsed.data))}`;
    setBusy(false);
    setDone(true);
    form.reset();
    window.location.assign(link);
  }

  const field =
    "w-full rounded-lg border bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f0cc70]/60";
  const ErrorText = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-1 text-sm text-red-300">{errors[name]}</p>
    ) : null;
  if (done) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <Check className="mx-auto size-10 text-glow" />
        <h3 className="mt-4 font-display text-2xl">
          Thanks, we&apos;ve got your request
        </h3>
        <p className="mt-2 text-muted-foreground">
          Continue the conversation in WhatsApp and we&apos;ll reply there.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 text-sm text-glow underline"
        >
          Send another request
        </button>
      </div>
    );
  }
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-4 rounded-lg border bg-card p-6 sm:grid-cols-2 sm:p-8"
    >
      <div>
        <input
          name="name"
          placeholder="Your name"
          className={field}
          maxLength={100}
        />
        <ErrorText name="name" />
      </div>
      <div>
        <input
          name="business"
          placeholder="Business name"
          className={field}
          maxLength={120}
        />
        <ErrorText name="business" />
      </div>
      <div>
        <input
          name="phone"
          placeholder="Phone (+254...)"
          className={field}
          maxLength={16}
        />
        <ErrorText name="phone" />
      </div>
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          className={field}
          maxLength={255}
        />
        <ErrorText name="email" />
      </div>
      <div className="sm:col-span-2">
        <select
          name="package"
          defaultValue="AI Workflow Audit"
          className={field}
        >
          {PACKAGES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <textarea
          name="task"
          rows={4}
          placeholder="Which repetitive task would you like to make easier?"
          className={field}
          maxLength={1000}
        />
        <ErrorText name="task" />
      </div>
      <button
        disabled={busy}
        className="vexon-gold-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold disabled:opacity-60 sm:col-span-2"
      >
        {busy ? "Sending..." : "Send and continue on WhatsApp"}{" "}
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

export function WorkflowPage() {
  return (
    <main className="workflow-page min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
          <Link
            to="/"
            className="font-display text-xl font-extrabold tracking-tight"
          >
            VEXVANO LABS
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <Link to="/">Main site</Link>
          </nav>
          <a
            href="#contact"
            className="rounded-full border border-glow px-4 py-2 text-sm font-semibold text-glow"
          >
            Get started
          </a>
        </div>
      </header>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="workflow-hero-glow pointer-events-none absolute inset-0" />
        <div className="workflow-circuit-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.3fr_1fr] md:px-10 md:py-32">
          <div>
            <Eyebrow>VEXVANO AI Workflow Sprint · Kenya</Eyebrow>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
              Make repetitive business work{" "}
              <span className="text-glow">easier</span> with practical AI
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              VEXVANO LABS helps Kenyan small businesses improve customer
              replies, documents, content and daily operations with human-led AI
              workflows your team can actually use.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton where="hero" />
              <WhatsAppButton where="hero" />
            </div>
          </div>
          <div className="workflow-logo-mark" aria-hidden="true">
            <span>V</span>
          </div>
        </div>
      </section>
      <section id="how" className="mx-auto max-w-6xl px-5 py-24 md:px-10">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold uppercase md:text-6xl">
          Three steps, one useful workflow
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="rounded-lg border bg-card p-7">
              <div className="flex items-center justify-between">
                <Icon className="size-7 text-glow" />
                <span className="font-mono text-sm text-muted-foreground">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold uppercase">
                {title}
              </h3>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-10">
          <Eyebrow>Where it helps</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold uppercase md:text-6xl">
            Work your team repeats every week
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {useCases.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-5 rounded-lg border bg-card p-6"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-glow/10">
                  <Icon className="size-6 text-glow" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-24 md:px-10">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold uppercase md:text-6xl">
          Clear scope. Clear price.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-lg border bg-card p-7 ${plan.featured ? "border-glow shadow-[0_30px_80px_-30px_var(--glow)]" : ""}`}
            >
              {plan.featured && (
                <span className="mb-4 w-fit rounded-full bg-glow/10 px-3 py-1 text-xs font-semibold text-glow">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold uppercase">
                {plan.name}
              </h3>
              <p className="mt-4">
                <span className="text-sm text-muted-foreground">from KES </span>
                <span className="font-display text-4xl">{plan.price}</span>
              </p>
              <p className="mt-3 text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="size-4 shrink-0 text-glow" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <BookButton
                  label={`Book ${plan.name.replace("AI Workflow ", "")}`}
                  where={`pricing_${plan.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-10">
          <Eyebrow>Our promise</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold uppercase md:text-6xl">
            Honest, human-led AI
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [
                ShieldCheck,
                "Human review",
                "A person checks AI output before it reaches your customers.",
              ],
              [
                Lock,
                "Privacy-conscious setup",
                "We agree what data is used and keep sensitive information out.",
              ],
              [
                Scale,
                "No guaranteed profits",
                "We promise useful workflows and honest measurement, never hype.",
              ],
            ].map(([Icon, title, description]) => {
              const Component = Icon as typeof ShieldCheck;
              return (
                <div
                  key={String(title)}
                  className="rounded-lg border bg-card p-7"
                >
                  <Component className="size-7 text-glow" />
                  <h3 className="mt-5 font-display text-xl font-semibold uppercase">
                    {String(title)}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {String(description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section id="faq" className="mx-auto max-w-3xl px-5 py-24 md:px-10">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">
          Questions, answered
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map(([question, answer]) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="text-left text-lg">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section id="contact" className="relative overflow-hidden">
        <div className="workflow-hero-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.3fr] md:px-10">
          <div>
            <Eyebrow>Start here</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase md:text-6xl">
              Tell us the task that eats your time
            </h2>
            <p className="mt-5 text-muted-foreground">
              Send the form and we&apos;ll continue the conversation on
              WhatsApp, or book your audit straight away.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton where="final" />
              <WhatsAppButton where="final" />
            </div>
          </div>
          <LeadForm />
        </div>
      </section>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 VEXVANO LABS · Kenya</p>
          <div className="flex gap-6">
            <Link to="/">Main site</Link>
            <a
              href={`${SITE.whatsappUrl}?text=${encodeURIComponent(WA_HELLO)}`}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
