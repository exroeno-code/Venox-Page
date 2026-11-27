import { Link } from "@tanstack/react-router";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { AccountButton } from "@/components/vexon/AccountButton";
import { SocialLinks } from "@/components/vexon/SocialIcons";
import { Wordmark } from "@/components/vexon/Wordmark";

const PAGES = [
  {
    to: "/services",
    label: "Services",
    category: "What we do",
    description: "Practical digital services for growing ideas.",
    tone: "from-amber-600/60 via-stone-950 to-[#09090d]",
  },
  {
    to: "/ai-workflow",
    label: "AI Workflow Sprint",
    category: "AI systems",
    description: "Design a workflow around real work.",
    tone: "from-blue-600/70 via-indigo-950 to-[#09090d]",
  },
  {
    to: "/assistant",
    label: "AI Assistant",
    category: "Intelligence",
    description: "Turn questions into clear next steps.",
    tone: "from-violet-600/60 via-slate-950 to-[#09090d]",
  },
  {
    to: "/roadmap",
    label: "Roadmap",
    category: "Our direction",
    description: "Explore the milestones shaping Vexon.",
    tone: "from-rose-600/50 via-stone-950 to-[#09090d]",
  },
  {
    to: "/forex-trading",
    label: "Foreign exchange trading",
    category: "Markets",
    description: "Learn the essentials of online forex.",
    tone: "from-emerald-600/60 via-slate-950 to-[#09090d]",
  },
  {
    to: "/learning",
    label: "Learning",
    category: "Education",
    description: "Build practical computer skills.",
    tone: "from-cyan-500/50 via-blue-950 to-[#09090d]",
  },
  {
    to: "/trading",
    label: "Trading",
    category: "Education",
    description: "Understand markets, strategy, and risk.",
    tone: "from-fuchsia-600/50 via-indigo-950 to-[#09090d]",
  },
  {
    to: "/community",
    label: "Community",
    category: "Connect",
    description: "Join conversations and shared learning.",
    tone: "from-teal-500/50 via-slate-950 to-[#09090d]",
  },
  {
    to: "/leadership",
    label: "Leadership",
    category: "People",
    description: "Meet the people behind Vexon.",
    tone: "from-orange-600/50 via-stone-950 to-[#09090d]",
  },
  {
    to: "/hotel",
    label: "Hotel",
    category: "Stay & explore",
    description: "Discover considered, memorable stays.",
    tone: "from-teal-500/50 via-slate-950 to-[#09090d]",
  },
  {
    to: "/contact",
    label: "Contact",
    category: "Start a conversation",
    description: "Tell us what you are looking to build.",
    tone: "from-slate-500/50 via-slate-950 to-[#09090d]",
  },
] as const;

const SECTIONS = [
  ["Foundation", "foundation"],
  ["Workstreams", "workstreams"],
  ["Principles", "principles"],
] as const;

function showTouchWave(link: HTMLAnchorElement) {
  link.dataset["touching"] = "true";
  window.setTimeout(() => {
    delete link.dataset["touching"];
  }, 420);
}

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
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl"
        >
          <Wordmark />
        </Link>
        {tag && (
          <div className="mt-3 font-mono text-[0.7rem] tracking-[0.3em] text-muted-foreground">
            {tag}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 md:gap-8">
        <button
          ref={menuButton}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="group flex items-center gap-3 rounded-full py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#e6b94a] outline-none transition-colors hover:text-[#ffe9a2] focus-visible:ring-2 focus-visible:ring-[#f0cc70]/60"
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
            className="fixed inset-0 z-[60] overflow-y-auto bg-background/95 px-4 pb-6 pt-4 backdrop-blur-xl sm:px-5 sm:pb-8 sm:pt-5 md:px-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,var(--glow)_0%,transparent_45%)] opacity-20"
            />
            <div className="relative mx-auto flex min-h-full max-w-6xl flex-col">
              <div className="flex items-start justify-between">
                <Link
                  to="/"
                  onClick={close}
                  className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl"
                >
                  <Wordmark />
                </Link>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={() => {
                    close();
                    menuButton.current?.focus();
                  }}
                  className="group flex items-center gap-3 rounded-full py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#e6b94a] outline-none transition-colors hover:text-[#ffe9a2] focus-visible:ring-2 focus-visible:ring-[#f0cc70]/60"
                >
                  Close <X className="size-5" />
                </button>
              </div>

              <nav aria-label="Main" className="mt-8 mb-8 grid gap-8 py-0">
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {PAGES.map((p, i) => (
                    <li key={p.to}>
                      <Link
                        to={p.to}
                        onClick={close}
                        onPointerDown={(event) => {
                          if (event.pointerType !== "mouse") {
                            showTouchWave(event.currentTarget);
                          }
                        }}
                        className={`vexon-menu-link group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${p.tone} p-5 text-white shadow-xl transition duration-500 hover:-translate-y-1 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cc70]/70 sm:p-6`}
                        activeProps={{
                          className: `vexon-menu-link group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl border border-[#e6b94a]/70 bg-gradient-to-br ${p.tone} p-5 text-white shadow-xl ring-1 ring-[#e6b94a]/30 sm:p-6`,
                        }}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl transition duration-700 group-hover:scale-150"
                        />
                        <span className="relative flex items-center justify-between">
                          <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/80">
                            {p.category}
                          </span>
                          <span className="grid size-9 place-items-center rounded-full border border-white/20 bg-black/20 transition group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                            <ArrowUpRight className="size-4" />
                          </span>
                        </span>
                        <span className="relative mt-8">
                          <span className="block font-display text-2xl font-bold tracking-tight sm:text-3xl">
                            {p.label}
                          </span>
                          <span className="mt-2 block max-w-xs text-sm leading-relaxed text-white/70">
                            {p.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div>
                  <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                    [ ON THE HOME PAGE ]
                  </span>
                  <ul className="mt-6 space-y-3 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {SECTIONS.map(([label, id]) => (
                      <li key={id}>
                        {onAnchor ? (
                          <a
                            href={`#${id}`}
                            onPointerDown={(event) => {
                              if (event.pointerType !== "mouse") {
                                showTouchWave(event.currentTarget);
                              }
                            }}
                            onClick={(e) => {
                              close();
                              onAnchor(`#${id}`)(e);
                            }}
                            className="vexon-menu-link group flex items-center gap-1 transition-colors hover:text-[#f0cc70] active:text-[#ffe9a2]"
                          >
                            {label}
                            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ) : (
                          <Link
                            to="/"
                            hash={id}
                            onClick={close}
                            onPointerDown={(event) => {
                              if (event.pointerType !== "mouse") {
                                showTouchWave(event.currentTarget);
                              }
                            }}
                            className="vexon-menu-link group flex items-center gap-1 transition-colors hover:text-[#f0cc70] active:text-[#ffe9a2]"
                          >
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
