import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bot,
  Building2,
  Check,
  CloudCog,
  GraduationCap,
  Globe2,
  Hotel,
  Landmark,
  MessageCircle,
  School,
  Settings2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { ComponentType } from "react";

import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "What VEXON TECH does — VEXVANO LABS";
const DESC =
  "See what VEXON TECH offers now, what visitors can express interest in, and which practical business systems are still proposed.";

export const Route = createFileRoute("/services")({
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
  component: Services,
});

type Status =
  "Available now" | "Expression of interest" | "Proposed" | "Idea stage";

type Service = {
  title: string;
  status: Status;
  description: string;
  details: string;
  Icon: ComponentType<{ className?: string }>;
  href?:
    | "/learning"
    | "/trading"
    | "/ai-workflow"
    | "/assistant"
    | "/forex-trading"
    | "/contact";
  linkLabel?: string;
};

const STATUS_STYLES: Record<Status, string> = {
  "Available now": "border-glow bg-glow/10 text-foreground",
  "Expression of interest": "border-primary/60 bg-primary/10 text-foreground",
  Proposed: "border-border bg-card text-muted-foreground",
  "Idea stage":
    "border-border border-dashed bg-background text-muted-foreground",
};

const SERVICES: Service[] = [
  {
    title: "AI workflow audit and sprint",
    status: "Available now",
    description:
      "Human-led setup of practical AI workflows for repetitive business work.",
    details:
      "We help teams examine customer replies, documents, content, and daily operations, then set up and improve one useful workflow with the people who will use it.",
    Icon: Bot,
    href: "/ai-workflow",
    linkLabel: "Explore the AI Workflow Sprint",
  },
  {
    title: "Online computer classes and digital skills",
    status: "Expression of interest",
    description:
      "Proposed online learning for people building practical computing skills.",
    details:
      "Applications are expressions of interest only. Class details, fees, accreditation, and start dates are not confirmed.",
    Icon: GraduationCap,
    href: "/learning",
    linkLabel: "Explore learning programmes",
  },
  {
    title: "Trading education",
    status: "Idea stage",
    description:
      "A proposed learning programme about markets, analysis, and risk.",
    details:
      "Visitors can ask about possible classes or join the trading group. Course details and dates are not confirmed, and this is not personalized financial advice.",
    Icon: Landmark,
    href: "/trading",
    linkLabel: "Read the trading education concept",
  },
  {
    title: "Hotel management systems",
    status: "Proposed",
    description:
      "Setup and support for the operating systems hotels depend on.",
    details:
      "Possible scope includes bookings, rooms, housekeeping, point-of-sale, inventory, and reporting. The service is not yet presented as a confirmed product package.",
    Icon: Hotel,
  },
  {
    title: "School management systems",
    status: "Proposed",
    description: "Connected tools for schools and education teams.",
    details:
      "Possible scope includes admissions, student records, attendance, timetables, exams, fees, and parent communications.",
    Icon: School,
  },
  {
    title: "Payment and money-management systems",
    status: "Proposed",
    description:
      "Software setup for clearer payment and financial administration.",
    details:
      "Possible scope includes invoices, payment links, receipts, reconciliation, expenses, and financial reports. This is software setup, not a bank or payment processor.",
    Icon: WalletCards,
  },
  {
    title: "Business websites and online services",
    status: "Proposed",
    description:
      "Websites that help a business receive enquiries and run useful online processes.",
    details:
      "Possible scope includes booking, admissions, enquiry, appointment, and order forms, plus hosting and maintenance.",
    Icon: Globe2,
  },
  {
    title: "Business automation",
    status: "Proposed",
    description:
      "Practical reminders and follow-up flows for work teams repeat every week.",
    details:
      "Possible scope includes reminders, enquiry follow-ups, booking confirmations, fee notifications, task flows, and recurring reports.",
    Icon: Settings2,
  },
  {
    title: "Business software setup and integration",
    status: "Proposed",
    description:
      "Choosing, configuring, and connecting suitable business software.",
    details:
      "Possible scope includes hotel, school, accounting, inventory, or customer-management software, connected where supported by the providers.",
    Icon: Building2,
  },
  {
    title: "IT, cloud, and basic cybersecurity support",
    status: "Proposed",
    description: "Foundational support for safer, more organised digital work.",
    details:
      "Possible scope includes work email, cloud files, access controls, backups, updates, and staff security guidance.",
    Icon: CloudCog,
  },
  {
    title: "AI assistant",
    status: "Idea stage",
    description:
      "A possible assistant to help turn questions and tasks into useful next steps.",
    details:
      "It is not a usable product yet. The waitlist only helps us understand whether people want this and which tasks matter most.",
    Icon: Bot,
    href: "/assistant",
    linkLabel: "Join the assistant waitlist",
  },
  {
    title: "Online forex trading",
    status: "Idea stage",
    description:
      "An early idea being considered, not an available trading service.",
    details:
      "VEXVANO LABS does not provide a broker, platform, accounts, deposits, trade execution, signals, money management, broker endorsements, or personalized financial advice. Forex and CFDs carry a high risk of loss.",
    Icon: ShieldCheck,
    href: "/forex-trading",
    linkLabel: "Read the forex trading boundaries",
  },
];

const GROUPS: { label: string; intro: string; statuses: Status[] }[] = [
  {
    label: "What we can discuss now",
    intro:
      "These are the clearest ways to work with or express interest in VEXON TECH today.",
    statuses: ["Available now", "Expression of interest", "Idea stage"],
  },
  {
    label: "Business systems we’re preparing",
    intro:
      "These proposed services describe possible future setup and support work; scope, delivery, and pricing need confirmation.",
    statuses: ["Proposed"],
  },
];

function Services() {
  return (
    <PageShell tag="[ SERVICES · WHAT WE DO ]">
      <section className="pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ PRACTICAL TECHNOLOGY · KENYA ]
        </span>
        <h1 className="mt-4 max-w-5xl font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="What we do" className="text-chrome" />
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          VEXON TECH is the service direction within VEXVANO LABS: practical
          digital systems, learning, automation, and responsible technology for
          people and businesses. This page separates what is available, what is
          open for interest, and what is still being explored.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/ai-workflow"
            className="bracket-btn inline-flex items-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em]"
          >
            Start with AI workflows <ArrowUpRight className="size-3" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-2 py-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Discuss a project <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </section>

      <section className="my-16 rounded-lg border border-primary/30 bg-primary/5 p-6 md:p-8">
        <div className="flex gap-4">
          <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="font-display text-2xl font-semibold uppercase">
              The clearest current offer
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
              The AI Workflow Audit and Sprint is the first commercial offer: a
              practical, human-reviewed service for making repetitive business
              work easier. Other services on this page are either expressions of
              interest, proposed systems, or ideas that are not live yet.
            </p>
          </div>
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.label} className="py-10">
          <div className="mb-8 max-w-3xl">
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              [ SERVICE INDEX ]
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-6xl">
              {group.label}
            </h2>
            <p className="mt-4 text-muted-foreground">{group.intro}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {SERVICES.filter((service) =>
              group.statuses.includes(service.status),
            ).map((service, index) => {
              const Icon = service.Icon;
              return (
                <article
                  key={service.title}
                  className="group rounded-lg border bg-card/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-glow/60 hover:bg-card md:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-full border text-glow">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] ${STATUS_STYLES[service.status]}`}
                    >
                      {service.status}
                    </span>
                  </div>
                  <div className="mt-8 flex items-start gap-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold uppercase">
                        {service.title}
                      </h3>
                      <p className="mt-3 leading-relaxed">
                        {service.description}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {service.details}
                      </p>
                      {service.href && service.linkLabel && (
                        <Link
                          to={service.href}
                          className="mt-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
                        >
                          {service.linkLabel}{" "}
                          <ArrowUpRight className="size-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mt-16 border-t py-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              [ CONNECTIONS, NOT SERVICES ]
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95]">
              Community and contact help you reach us.
            </h2>
          </div>
          <div>
            <p className="text-muted-foreground">
              The WhatsApp community, trading group, channel, and contact page
              are ways to ask questions, follow progress, or share interest.
              They are not separate VEXON TECH services.
            </p>
            <a
              href={`${SITE.whatsappUrl}?text=${encodeURIComponent("Hello VEXON TECH, I'd like to discuss a service.")}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] hover:text-glow"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp{" "}
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
