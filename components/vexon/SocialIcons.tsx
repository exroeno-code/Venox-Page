import { useId } from "react";
import { Mail } from "lucide-react";

import { SITE } from "@/lib/site-config";

type IconProps = { className?: string };
type WhatsAppIconProps = IconProps & { variant?: "brand" | "inverse" };

export function InstagramIcon({ className }: IconProps) {
  const gradientId = `instagram-gradient-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="28%" stopColor="#fa7e1e" />
          <stop offset="55%" stopColor="#d62976" />
          <stop offset="78%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="6"
        fill={`url(#${gradientId})`}
      />
      <rect
        x="5.2"
        y="5.2"
        width="13.6"
        height="13.6"
        rx="4.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="3.1"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="16.5" cy="7.5" r="1.1" fill="#fff" />
    </svg>
  );
}

export function WhatsAppIcon({
  className,
  variant = "brand",
}: WhatsAppIconProps) {
  const stroke = variant === "inverse" ? "#fff" : "#25d366";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
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
        <a
          href={SITE.instagram.url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`VEXVANO LABS on Instagram (@${SITE.instagram.handle})`}
          className={ITEM}
        >
          <InstagramIcon className="size-5" />
        </a>
      </li>
      <li>
        <a
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Message VEXVANO LABS on WhatsApp"
          className={ITEM}
        >
          <WhatsAppIcon className="size-5" />
        </a>
      </li>
      <li>
        <a
          href={`mailto:${SITE.emails[0]}`}
          aria-label="Email VEXVANO LABS"
          className={ITEM}
        >
          <Mail className="size-5" />
        </a>
      </li>
    </ul>
  );
}
