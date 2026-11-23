import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentType, type FormEvent } from "react";
import { Mail, Phone } from "lucide-react";

import { PageShell } from "@/components/vexon/PageShell";
import { InstagramIcon, WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import { CONTACT_FORM_ENABLED, ContactError, MESSAGE_MAX, NAME_MAX, sendContactMessage } from "@/lib/contact-core";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Contact — VEXON TECH";
const DESC = "Get in touch with VEXON TECH. Send a message, email, WhatsApp or Instagram. Based in Nairobi and Kakamega, Kenya.";

export const Route = createFileRoute("/contact")({
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
  component: Contact,
});

const FIELD =
  "w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL = "mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";

type Channel = { label: string; value: string; href: string; Icon: ComponentType<{ className?: string }>; external?: boolean };

const CHANNELS: Channel[] = [
  ...SITE.emails.map((email): Channel => ({ label: "Email", value: email, href: `mailto:${email}`, Icon: Mail })),
  { label: "Phone", value: SITE.phone.display, href: `tel:${SITE.phone.tel}`, Icon: Phone },
  { label: "WhatsApp", value: SITE.phone.display, href: SITE.whatsappUrl, Icon: WhatsAppIcon, external: true },
  { label: "Instagram", value: `@${SITE.instagram.handle}`, href: SITE.instagram.url, Icon: InstagramIcon, external: true },
];

function Contact() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Hidden "website" field: people never fill it in, simple bots do.
    if (String(data.get("website") ?? "") !== "") {
      setSent(true);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await sendContactMessage({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      form.reset();
      setSent(true);
    } catch (err) {
      setError(err instanceof ContactError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell tag="[ CONTACT ]">
      <section className="pt-24 md:pt-32">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ GET IN TOUCH ]</span>
        <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Contact us" className="text-chrome" />
        </h1>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              Questions, ideas or want to work with us? Send a message or reach us directly. The VEXON TECH team will get back to you.
            </p>

            <ul className="mt-10 space-y-4">
              {CHANNELS.map(({ label, value, href, Icon, external }) => (
                <li key={`${label}-${value}`}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    className="group flex items-center gap-4 rounded-lg border bg-card/60 p-4 backdrop-blur-md transition-colors hover:border-glow/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border transition-colors group-hover:border-glow">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
                      <span className="block truncate">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t pt-8">
              <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ BASED IN KENYA ]</span>
              <ul className="mt-4 space-y-3 font-mono text-sm uppercase tracking-[0.2em]">
                {["Nairobi", "Kakamega"].map((c) => (
                  <li key={c} className="flex items-center gap-3">
                    <span className="live-dot size-2 rounded-full bg-glow" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8">
            {sent ? (
              <div role="status">
                <h2 className="font-display text-3xl font-extrabold uppercase leading-[0.95]">
                  <span className="text-chrome">Message sent</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Thank you. We have received your message and will reply by email.
                </p>
                <button type="button" onClick={() => setSent(false)} className={`${BUTTON} mt-8`}>
                  Send another message
                </button>
              </div>
            ) : !CONTACT_FORM_ENABLED ? (
              <div role="status">
                <h2 className="font-display text-2xl font-semibold uppercase">Form unavailable</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  The contact form is not available right now. Please email, WhatsApp or message us on Instagram instead.
                </p>
                {import.meta.env.DEV && (
                  <p role="alert" className="mt-6 rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="name" className={LABEL}>Name</label>
                  <input id="name" name="name" type="text" autoComplete="name" required maxLength={NAME_MAX} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="email" className={LABEL}>Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required className={FIELD} />
                </div>
                <div>
                  <label htmlFor="message" className={LABEL}>Message</label>
                  <textarea id="message" name="message" rows={6} required maxLength={MESSAGE_MAX} className={`${FIELD} resize-y`} />
                </div>
                {/* Honeypot: hidden from people and screen readers. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="website">Leave this field empty</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                {error && (
                  <p role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={pending} className={BUTTON}>
                  {pending ? "Sending…" : "Send message"}
                </button>
                <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
                  See our <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">privacy notice</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
