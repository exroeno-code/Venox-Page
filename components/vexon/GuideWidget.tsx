import { Link } from "@tanstack/react-router";
import { ArrowUp, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { MAX_CHARS, SUGGESTIONS, localAnswer, type GuideMessage } from "@/lib/guide-core";

const GREETING = "Hi, I'm the VEXON Guide. I can explain what VEXON TECH does, what is still a concept, and help you find information or contact the team.";
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
    } else if (/^https:\/\/(chat\.whatsapp\.com|whatsapp\.com|wa\.me)\//.test(href)) {
      out.push(
        <a key={i++} href={href} target="_blank" rel="noreferrer noopener" className={cls}>
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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
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
      const data = (await res.json().catch(() => null)) as { reply?: string; error?: string } | null;
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
    <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center px-4 pointer-events-none">
      {open && (
        <section
          role="dialog"
          aria-label="VEXON Guide"
          className="pointer-events-auto mb-3 flex max-h-[min(34rem,calc(100svh-6rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-foreground/20 bg-card/35 text-foreground shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4"
        >
          <header className="flex items-center justify-between border-b border-foreground/15 bg-background/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-md border border-foreground/15 bg-background/60 font-display text-lg font-extrabold leading-none text-chrome">
                V
              </span>
              <div>
                <h2 className="font-display text-sm font-semibold">VEXON Guide</h2>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/70">NVIDIA AI · answers may be imperfect</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close guide"
              onClick={() => {
                setOpen(false);
                openButton.current?.focus();
              }}
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={listRef} data-lenis-prevent aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-foreground">
            <p className="rounded-xl border border-foreground/15 bg-background/45 px-3 py-2 text-foreground">{GREETING}</p>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void ask(s)}
                    className="rounded-full border border-foreground/20 bg-background/20 px-3 py-1.5 text-left text-xs text-foreground/85 transition-colors hover:border-glow/60 hover:bg-background/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p key={i} className="ml-auto w-fit max-w-[85%] rounded-xl border border-glow/40 bg-glow/15 px-3 py-2 text-foreground shadow-sm">
                  {m.content}
                </p>
              ) : (
                <p key={i} className="max-w-[90%] rounded-xl border border-foreground/15 bg-background/45 px-3 py-2 text-foreground shadow-sm">
                  {renderReply(m.content, () => setOpen(false))}
                </p>
              ),
            )}
            {pending && (
              <p className="w-fit rounded-xl border border-foreground/15 bg-background/40 px-3 py-2 text-foreground/75" role="status">
                Thinking…
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-foreground/15 bg-background/10 p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_CHARS}
              placeholder="Ask about VEXON TECH…"
              aria-label="Ask the VEXON Guide"
              className="min-w-0 flex-1 rounded-md border border-foreground/20 bg-background/35 px-4 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-foreground/55 focus:border-glow/60 focus-visible:ring-2 focus-visible:ring-glow/30"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send question"
              className="grid size-10 shrink-0 place-items-center rounded-full border transition-colors hover:border-glow hover:text-glow disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
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
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="bracket-btn pointer-events-auto flex items-center gap-3 bg-card/45 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] shadow-xl backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:bg-card/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <span aria-hidden="true" className="font-display text-base font-extrabold leading-none text-chrome">V</span>
          Ask AI for guides
        </button>
      )}
    </div>
  );
}
