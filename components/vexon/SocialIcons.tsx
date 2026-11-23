import { Mail } from "lucide-react";

import { SITE } from "@/lib/site-config";

type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 11.5a8 8 0 0 1-11.9 7L3 20l1.6-4.9A8 8 0 1 1 20 11.5z" />
      <path d="M9.2 8.6c-.2 2.9 2.3 5.4 5.3 5.5l1-1.4-1.9-1-.8.8c-.9-.4-1.6-1.1-2-2l.8-.8-1-1.9z" />
    </svg>
  );
}

const ITEM =
  "grid size-11 place-items-center rounded-full border bg-card/40 backdrop-blur transition-colors hover:border-glow hover:text-glow focus-visible:border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60";

/** Round icon links: Instagram, WhatsApp and email. */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      <li>
        <a href={SITE.instagram.url} target="_blank" rel="noreferrer noopener" aria-label={`VEXON TECH on Instagram (@${SITE.instagram.handle})`} className={ITEM}>
          <InstagramIcon className="size-5" />
        </a>
      </li>
      <li>
        <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer noopener" aria-label="Message VEXON TECH on WhatsApp" className={ITEM}>
          <WhatsAppIcon className="size-5" />
        </a>
      </li>
      <li>
        <a href={`mailto:${SITE.emails[0]}`} aria-label="Email VEXON TECH" className={ITEM}>
          <Mail className="size-5" />
        </a>
      </li>
    </ul>
  );
}
