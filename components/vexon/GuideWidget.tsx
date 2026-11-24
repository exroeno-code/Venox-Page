import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUp, Layers3, X } from "lucide-react";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  MAX_CHARS,
  SUGGESTIONS,
  localAnswer,
  type GuideMessage,
} from "@/lib/guide-core";

const GREETING =
  "Hi, I'm the VEXON Guide. I can explain what VEXON TECH does, what is still a concept, and help you find information or contact the team.";
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Renders [label](/path) as a site link and [label](https://…whatsapp…) as an external link. Everything else is plain text. */
function renderReply(text: string, onNavigate: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const [whole, label = "", href = ""] = m;
    out.push(text.slice(last, m.index));
    const cls = "text-glow underline underline-offset-2 hover:text-foreground";
    if (href.startsWith("/") && !href.startsWith("//")) {
      out.push(
        <Link key={i++} to={href as "/"} onClick={onNavigate} className={cls}>
          {label}
        </Link>,
      );
    } else if (
      /^https:\/\/(chat\.whatsapp\.com|whatsapp\.com|wa\.me)\//.test(href)
    ) {
      out.push(
        <a
          key={i++}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={cls}
        >
          {label}
        </a>,
      );
    } else {
      out.push(label);
    }
    last = (m.index ?? 0) + whole.length;
  }
  out.push(text.slice(last));
  return out.map((n, k) => <Fragment key={k}>{n}</Fragment>);
}

/** Floating "Ask AI for guides" button and chat panel, shown on every page. */
export function GuideWidget() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const [open, setOpen] = useState(pathname === "/");
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const shouldFocusInput = useRef(false);

  useEffect(() => {
    setOpen(pathname === "/");
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    if (shouldFocusInput.current) {
      inputRef.current?.focus();
      shouldFocusInput.current = false;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        openButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, open]);

  async function ask(question: string) {
    const text = question.trim().slice(0, MAX_CHARS);
    if (!text || pending) return;
    const next: GuideMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    let reply: string;
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-8) }),
      });
      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        error?: string;
      } | null;
      reply = data?.reply ?? data?.error ?? localAnswer(text);
    } catch {
      // Offline or the server is unreachable: the built-in answers still work.
      reply = localAnswer(text);
    }
    setMessages([...next, { role: "assistant", content: reply }]);
    setPending(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <div className="guide-widget-dock fixed inset-x-0 z-50 flex flex-col items-end px-3 pointer-events-none sm:px-5">
      {open && (
        <section
          role="dialog"
          aria-label="VEXON Guide"
          className="pointer-events-auto mb-3 flex max-h-[min(34rem,calc(100dvh-5.5rem))] w-full max-w-[24rem] flex-col overflow-hidden rounded-[1.6rem] border border-white/20 bg-[#111111]/85 text-foreground shadow-[0_24px_90px_-24px_rgba(0,0,0,.8)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-foreground shadow-inner"
              >
                <Layers3 className="size-4" />
              </span>
              <div>
                <h2 className="font-display text-sm font-semibold">
                  VEXON AI Guide
                </h2>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/70">
                  Here to help you explore
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close guide"
              onClick={() => {
                setOpen(false);
                openButton.current?.focus();
              }}
              className="grid size-11 place-items-center rounded-full text-foreground/85 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            ref={listRef}
            data-lenis-prevent
            aria-live="polite"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-white/90"
          >
            <p className="rounded-xl border border-white/[0.08] bg-white/[0.055] px-3 py-2.5 text-white/80">
              {GREETING}
            </p>
            {messages.length === 0 && (
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s, index) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="group flex min-h-11 w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
                  >
                    <span className="mt-0.5 font-mono text-[0.6rem] text-white/35">
                      0{index + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto w-fit max-w-[88%] rounded-xl border border-glow/60 bg-glow/20 px-3 py-2.5 text-white shadow-sm shadow-glow/10"
                >
                  {m.content}
                </p>
              ) : (
                <p
                  key={i}
                  className="max-w-[92%] rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-2.5 text-white/90 shadow-sm"
                >
                  {renderReply(m.content, () => setOpen(false))}
                </p>
              ),
            )}
            {pending && (
              <p
                className="w-fit rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-white/80"
                role="status"
              >
                Thinking…
              </p>
            )}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-white/[0.025] p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_CHARS}
              placeholder="Ask about VEXON TECH or this website…"
              aria-label="Ask the VEXON Guide"
              className="min-h-11 min-w-0 flex-1 rounded-full border border-white/[0.14] bg-white/[0.045] px-4 py-2.5 text-base text-white outline-none transition-colors placeholder:text-white/45 focus:border-glow/70 focus-visible:ring-2 focus-visible:ring-glow/40"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send question"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white transition-colors hover:border-glow hover:bg-glow/15 hover:text-glow disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>
        </section>
      )}

      {!open && (
        <button
          ref={openButton}
          type="button"
          onClick={() => {
            shouldFocusInput.current = true;
            setOpen(true);
          }}
          aria-haspopup="dialog"
          className="bracket-btn pointer-events-auto flex min-h-12 items-center gap-3 rounded-full bg-background/55 px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-foreground shadow-xl shadow-black/30 backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:bg-background/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 sm:px-6"
        >
          <span
            aria-hidden="true"
            className="font-display text-base font-extrabold leading-none text-chrome"
          >
            V
          </span>
          Ask AI for guides
        </button>
      )}
    </div>
  );
}
