import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentType, type FormEvent } from "react";
import { track } from "@vercel/analytics/react";
import { Mail, Phone } from "lucide-react";

import { FormShell } from "@/components/vexon/FormShell";
import { PageShell } from "@/components/vexon/PageShell";
import { InstagramIcon, WhatsAppIcon } from "@/components/vexon/SocialIcons";
import { Words } from "@/components/vexon/Words";
import {
  CONTACT_FORM_ENABLED,
  ContactError,
  MESSAGE_MAX,
  NAME_MAX,
  sendContactMessage,
} from "@/lib/contact-core";
import { SITE } from "@/lib/site-config";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Get in touch — VEXVANO LABS";
const DESC =
  "Have a question or an idea? Reach VEXVANO LABS by message, email, WhatsApp or Instagram. Based in Nairobi and Kakamega, Kenya.";

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
  "field-input w-full rounded-md border bg-background/60 px-4 py-3 text-base outline-none placeholder:text-muted-foreground/60 focus:border-glow focus-visible:ring-2 focus-visible:ring-glow/40";
const LABEL =
  "field-label mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground";
const BUTTON =
  "form-btn bracket-btn w-full px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5 disabled:opacity-60";
const WHATSAPP_MESSAGE =
  "Hello VEXVANO LABS, I have a question and would prefer to chat on WhatsApp.";
const WHATSAPP_HREF = `${SITE.whatsappUrl}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

type Channel = {
  label: string;
  value: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
  external?: boolean;
};

const CHANNELS: Channel[] = [
  ...SITE.emails.map((email): Channel => ({
    label: "Email",
    value: email,
    href: `mailto:${email}`,
    Icon: Mail,
  })),
  {
    label: "Phone",
    value: SITE.phone.display,
    href: `tel:${SITE.phone.tel}`,
    Icon: Phone,
  },
  {
    label: "WhatsApp",
    value: SITE.phone.display,
    href: SITE.whatsappUrl,
    Icon: WhatsAppIcon,
    external: true,
  },
  {
    label: "Instagram",
    value: `@${SITE.instagram.handle}`,
    href: SITE.instagram.url,
    Icon: InstagramIcon,
    external: true,
  },
];

export function Contact() {
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
      track("feedback_form_submission");
      form.reset();
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ContactError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell tag="[ CONTACT ]">
      <section className="pt-4 md:pt-8">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
          [ WE’RE LISTENING ]
        </span>
        <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Say hello" className="text-chrome" />
        </h1>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              Got a question, an idea, or something you’d like to work on
              together? Send us a note or reach out through any of the channels
              below.
            </p>

            <ul className="mt-10 space-y-4">
              {CHANNELS.map(({ label, value, href, Icon, external }) => (
                <li key={`${label}-${value}`}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="group flex items-center gap-4 rounded-lg border bg-card/60 p-4 backdrop-blur-md transition-colors hover:border-glow/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border transition-colors group-hover:border-glow">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {label}
                      </span>
                      <span className="block truncate">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t pt-8">
              <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                [ BASED IN KENYA ]
              </span>
              <ul className="mt-4 space-y-3 font-mono text-sm uppercase tracking-[0.2em]">
                {["Nairobi", "Kakamega"].map((c) => (
                  <li key={c} className="flex items-center gap-3">
                    <span className="live-dot size-2 rounded-full bg-glow" />{" "}
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <FormShell
            title="Write to us"
            reason="Just your name, email, and a short message—we’ll take it from there."
            timeHint="About 30 seconds"
          >
            {sent ? (
              <div role="status">
                <h3 className="font-display text-2xl font-semibold uppercase">
                  Thanks for reaching out
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Your message is on its way. Thanks for taking the time to
                  write. If you’d rather chat, you can reach us on WhatsApp.
                </p>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${BUTTON} mt-6 inline-flex items-center justify-center gap-2`}
                >
                  <WhatsAppIcon className="size-4" /> Chat with us on WhatsApp
                </a>
              </div>
            ) : !CONTACT_FORM_ENABLED ? (
              <div role="status">
                <h2 className="font-display text-2xl font-semibold uppercase">
                  The form’s taking a break
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  The form isn’t available right now. You can still reach us by
                  email, WhatsApp, or Instagram.
                </p>
                {import.meta.env.DEV && (
                  <p
                    role="alert"
                    className="mt-6 rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
                  >
                    Set <code>VITE_SUPABASE_URL</code> and{" "}
                    <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in{" "}
                    <code>.env.local</code>.
                  </p>
                )}
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="form-shell form-stagger space-y-4"
              >
                <div>
                  <label htmlFor="name" className={LABEL}>
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={NAME_MAX}
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="email" className={LABEL}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="message" className={LABEL}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    required
                    maxLength={MESSAGE_MAX}
                    className={`${FIELD} resize-y`}
                  />
                </div>
                {/* Honeypot: hidden from people and screen readers. */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                >
                  <label htmlFor="website">Leave this field empty</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <p
                    role="alert"
                    className="form-error error-message rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className={BUTTON}
                  data-loading={pending}
                >
                  {pending ? "Sending…" : "Send message"}
                </button>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${BUTTON} inline-flex items-center justify-center gap-2`}
                >
                  <WhatsAppIcon className="size-4" /> Prefer WhatsApp? Chat with
                  us
                </a>
                <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
                  See our{" "}
                  <Link
                    to="/privacy"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    privacy notice
                  </Link>
                  .
                </p>
              </form>
            )}
          </FormShell>
        </div>
      </section>
    </PageShell>
  );
}
