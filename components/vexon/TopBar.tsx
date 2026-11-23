import { Link } from "@tanstack/react-router";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { AccountButton } from "@/components/vexon/AccountButton";
import { SocialLinks } from "@/components/vexon/SocialIcons";
import { Wordmark } from "@/components/vexon/Wordmark";

const PAGES = [
  { to: "/assistant", label: "AI Assistant" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/goods-trade", label: "Goods Trade" },
  { to: "/learning", label: "Learning" },
  { to: "/trading", label: "Trading" },
  { to: "/community", label: "Community" },
  { to: "/leadership", label: "Leadership" },
  { to: "/contact", label: "Contact" },
] as const;

const SECTIONS = [
  ["Foundation", "foundation"],
  ["Workstreams", "workstreams"],
  ["Principles", "principles"],
] as const;

type Props = {
  /** Small mono label under the logo, e.g. "[ V.00.1 · CONCEPT ]". */
  tag?: string;
  /** Home page only: smooth-scrolls to a section on the same page. Other pages link back to /#section. */
  onAnchor?: (selector: string) => (e: MouseEvent) => void;
};

/** Shared top bar: logo, full-screen menu and the round account button. Used on every page. */
export function TopBar({ tag, onAnchor }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    closeButton.current?.focus();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="relative z-10 flex items-start justify-between">
      <div>
        <Link to="/" className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          <Wordmark />
        </Link>
        {tag && <div className="mt-6 font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground">{tag}</div>}
      </div>

      <div className="flex items-center gap-5 md:gap-8">
        <button
          ref={menuButton}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="group flex items-center gap-3 rounded-full py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-glow/60"
        >
          Menu
          <span aria-hidden className="flex w-6 flex-col items-end gap-1.5">
            <span className="h-px w-6 bg-current transition-all group-hover:w-4" />
            <span className="h-px w-4 bg-current transition-all group-hover:w-6" />
          </span>
        </button>
        <AccountButton />
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            className="fixed inset-0 z-[60] overflow-y-auto bg-background/95 px-5 pb-10 pt-6 backdrop-blur-xl md:px-10"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,var(--glow)_0%,transparent_45%)] opacity-20" />
            <div className="relative mx-auto flex min-h-full max-w-6xl flex-col">
              <div className="flex items-start justify-between">
                <Link to="/" onClick={close} className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                  <Wordmark />
                </Link>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={() => {
                    close();
                    menuButton.current?.focus();
                  }}
                  className="group flex items-center gap-3 rounded-full py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-glow/60"
                >
                  Close <X className="size-5" />
                </button>
              </div>

              <nav aria-label="Main" className="my-auto grid gap-12 py-16 md:grid-cols-[2fr_1fr]">
                <ul className="space-y-2">
                  {PAGES.map((p, i) => (
                    <li key={p.to}>
                      <Link
                        to={p.to}
                        onClick={close}
                        className="group flex items-baseline gap-4 font-display text-5xl font-extrabold uppercase leading-[1.05] text-muted-foreground transition-colors hover:text-foreground md:text-7xl"
                        activeProps={{ className: "group flex items-baseline gap-4 font-display text-5xl font-extrabold uppercase leading-[1.05] text-foreground md:text-7xl" }}
                      >
                        <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">0{i + 1}</span>
                        <span className="transition-transform duration-500 group-hover:translate-x-2">{p.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div>
                  <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ ON THE HOME PAGE ]</span>
                  <ul className="mt-6 space-y-3 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {SECTIONS.map(([label, id]) => (
                      <li key={id}>
                        {onAnchor ? (
                          <a
                            href={`#${id}`}
                            onClick={(e) => {
                              close();
                              onAnchor(`#${id}`)(e);
                            }}
                            className="group flex items-center gap-1 transition-colors hover:text-foreground"
                          >
                            {label}
                            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ) : (
                          <Link to="/" hash={id} onClick={close} className="group flex items-center gap-1 transition-colors hover:text-foreground">
                            {label}
                            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              <SocialLinks />
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
