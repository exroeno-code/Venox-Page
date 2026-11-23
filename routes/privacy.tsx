import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PageShell } from "@/components/vexon/PageShell";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

const TITLE = "Privacy notice — VEXON TECH";
const DESC = "What personal information VEXON TECH collects through this website, why, and how to ask us to delete it.";
const UPDATED = "23 November 2026";

export const Route = createFileRoute("/privacy")({
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
  component: Privacy,
});

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="border-t py-8">
      <h2 className="font-display text-xl font-semibold uppercase">
        <span className="mr-3 font-mono text-xs tracking-[0.2em] text-muted-foreground">[ 0{n} ]</span>
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Privacy() {
  return (
    <PageShell tag="[ PRIVACY ]">
      <article className="max-w-3xl pb-8 pt-20 md:pt-28">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ LAST UPDATED {UPDATED.toUpperCase()} ]</span>
        <h1 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
          <Words text="Privacy notice" className="text-chrome" />
        </h1>
        <p className="mt-8 leading-relaxed text-muted-foreground">
          VEXON TECH is a proposed brand in concept development, based in Kenya. This notice explains what personal
          information this website collects and what we do with it. We collect only what is needed for each feature.
        </p>

        <div className="mt-12">
          <Section n={1} title="What we collect">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Account:</strong> your name and email, and a password (stored securely by our sign-in provider, never visible to us). If you use Google sign-in, we receive your name and email from Google.</li>
              <li><strong className="text-foreground">Contact form:</strong> your name, email and message.</li>
              <li><strong className="text-foreground">AI assistant waitlist:</strong> your email and optional name.</li>
              <li><strong className="text-foreground">Learning applications:</strong> your name, email, phone number, the programme you chose and an optional note.</li>
              <li><strong className="text-foreground">VEXON Guide chat:</strong> the questions you type into the guide. Please do not put personal or sensitive details in them.</li>
            </ul>
          </Section>

          <Section n={2} title="Why we use it">
            <p>To reply to your message, contact you about your application, update you about the AI assistant, run your account and answer your questions in the guide. We do not sell your information and we do not send marketing you did not ask for.</p>
          </Section>

          <Section n={3} title="Where it is stored and who processes it">
            <p>Form submissions and accounts are stored with Supabase (database and sign-in). The website is hosted on Vercel. When the VEXON Guide uses AI, your question and the recent chat messages are sent to our AI provider (NVIDIA) to produce an answer. These providers may process data outside Kenya. Messages, waitlist entries and applications cannot be read by other visitors; only the VEXON TECH team can see them.</p>
          </Section>

          <Section n={4} title="Cookies and local storage">
            <p>We do not use advertising cookies. Your browser keeps your sign-in session in local storage so you stay signed in until you sign out.</p>
          </Section>

          <Section n={5} title="How long we keep it">
            <p>We keep messages, applications and waitlist entries only as long as needed for the purpose above, then delete them. We keep your account until you ask us to delete it.</p>
          </Section>

          <Section n={6} title="Your choices">
            <p>You can ask us to show you, correct or delete the information we hold about you, or to remove you from the waitlist, at any time. Email <a href={`mailto:${SITE.emails[0]}`} className="text-glow underline underline-offset-2">{SITE.emails[0]}</a> from the address you used. You may also have the right to complain to the Office of the Data Protection Commissioner in Kenya.</p>
          </Section>

          <Section n={7} title="Changes">
            <p>If we change this notice we will update the date above. Questions? See the <Link to="/contact" className="text-glow underline underline-offset-2">Contact</Link> page.</p>
          </Section>
        </div>
      </article>
    </PageShell>
  );
}
