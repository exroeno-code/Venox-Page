import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Layers3, Sparkles, X } from "lucide-react";
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
  "Hi, I'm the VEXON TECH site guide. I can explain what's on this site, what's only a concept, and where to find the right information or contact the team.";
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const WELCOME_STEPS = [
  {
    title: "Welcome to VEXON TECH",
    text: "Useful ideas. Real-world progress. Explore practical technology and our early online forex trading concept—shared with clear status, not hype.",
  },
  {
    title: "Forex is a concept, not a live service",
    text: "The online forex idea is at the Idea stage. VEXON TECH is not a broker; there are no trading accounts, deposits, or trades here.",
  },
  {
    title: "Find a clear next step",
    text: "Ask about VEXON TECH, the forex concept, learning, or the roadmap. Tap or click the golden V to open the guide; hovering only plays a soft sound. Skip or close this tour whenever you like.",
  },
];

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

/** Centered VEXON Guide launcher and chat panel, shown on every page. */
export function GuideWidget() {
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const shouldFocusInput = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      setShowWelcome(
        window.localStorage.getItem("vexon-guide-welcomed") !== "yes",
      );
    } catch {
      setShowWelcome(true);
    }
  }, []);

  function dismissWelcome() {
    setShowWelcome(false);
    try {
      window.localStorage.setItem("vexon-guide-welcomed", "yes");
    } catch {
      // The welcome cue can still be dismissed for this visit when storage is unavailable.
    }
  }

  function playSound(kind: "hover" | "click") {
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      void context.resume().then(() => {
        if (context.state !== "running") return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        const startFrequency = kind === "hover" ? 740 : 520;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(startFrequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(
          kind === "hover" ? 920 : 780,
          now + (kind === "hover" ? 0.075 : 0.12),
        );
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(
          kind === "hover" ? 0.012 : 0.026,
          now + 0.012,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.16);
      });
    } catch {
      // Sound is decorative; unsupported or blocked audio never affects the guide.
    }
  }

  function openGuide() {
    playSound("click");
    dismissWelcome();
    setOpen(true);
  }

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
    <div className="guide-widget-dock fixed inset-x-0 z-50 flex flex-col items-center px-3 pointer-events-none">
      {open && (
        <section
          role="dialog"
          aria-label="VEXON Guide"
          className="pointer-events-auto mb-5 flex max-h-[min(34rem,calc(100dvh-8rem))] w-full max-w-[24rem] flex-col overflow-hidden rounded-[1.6rem] border border-[#e6b94a]/35 bg-[#111111]/90 text-foreground shadow-[0_24px_90px_-24px_rgba(0,0,0,.8),0_0_50px_-24px_rgba(230,185,74,.65)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4"
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
                  VEXON TECH Guide
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
              placeholder="Ask about VEXON TECH, forex, or this website…"
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

      {!open && showWelcome && (
        <div className="guide-welcome pointer-events-auto absolute bottom-[calc(100%+1.25rem)] left-1/2 w-[min(21rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-[#e6b94a]/35 bg-[#111111]/95 px-4 py-3.5 text-center shadow-[0_16px_50px_-20px_rgba(230,185,74,.5)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            aria-label="Dismiss welcome message"
            onClick={dismissWelcome}
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6b94a]/70"
          >
            <X className="size-3.5" />
          </button>
          <p className="flex items-center justify-center gap-2 pr-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#f0cc70]">
            <Sparkles className="size-3.5" /> A quick VEXON tour
          </p>
          <div
            aria-live="polite"
            aria-atomic="true"
            key={welcomeStep}
            className="guide-welcome-step mt-3"
          >
            <h2 className="font-display text-base font-semibold text-white">
              {WELCOME_STEPS[welcomeStep]?.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/75">
              {WELCOME_STEPS[welcomeStep]?.text}
            </p>
          </div>
          <div
            className="mt-4 flex items-center justify-center gap-1.5"
            aria-label={`Step ${welcomeStep + 1} of ${WELCOME_STEPS.length}`}
          >
            {WELCOME_STEPS.map((step, index) => (
              <span
                key={step.title}
                aria-hidden="true"
                className={`h-1 rounded-full transition-all duration-300 ${index === welcomeStep ? "w-7 bg-[#f0cc70]" : "w-2 bg-white/25"}`}
              />
            ))}
            <span className="ml-1 font-mono text-[0.6rem] text-white/45">
              {String(welcomeStep + 1).padStart(2, "0")} /{" "}
              {String(WELCOME_STEPS.length).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-3 flex min-h-10 items-center justify-between gap-2">
            <button
              type="button"
              onClick={dismissWelcome}
              className="min-h-10 rounded-full px-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6b94a]/70"
            >
              Skip tour
            </button>
            {welcomeStep > 0 && (
              <button
                type="button"
                onClick={() => setWelcomeStep((step) => Math.max(0, step - 1))}
                className="min-h-10 rounded-full px-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6b94a]/70"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (welcomeStep === WELCOME_STEPS.length - 1) dismissWelcome();
                else setWelcomeStep((step) => step + 1);
              }}
              className="min-h-10 rounded-full border border-[#e6b94a]/45 bg-[#e6b94a]/10 px-4 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#f0cc70] transition-colors hover:bg-[#e6b94a]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6b94a]/70"
            >
              {welcomeStep === WELCOME_STEPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>
          <ArrowDown
            aria-hidden="true"
            className="guide-welcome-arrow absolute -bottom-6 left-1/2 size-5 -translate-x-1/2 text-[#f0cc70] drop-shadow-[0_0_8px_rgba(230,185,74,.9)]"
          />
        </div>
      )}

      {!open && (
        <button
          ref={openButton}
          type="button"
          onMouseEnter={() => {
            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches)
              playSound("hover");
          }}
          onClick={() => {
            shouldFocusInput.current = true;
            openGuide();
          }}
          aria-haspopup="dialog"
          aria-label="Open the VEXON AI Guide"
          className="guide-v-launcher pointer-events-auto relative grid size-16 place-items-center rounded-full border border-[#f0cc70]/70 bg-[#100d08]/95 text-[#ffe7a2] shadow-[0_0_22px_2px_rgba(230,185,74,.32),inset_0_0_20px_rgba(230,185,74,.12)] transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe7a2] focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:size-[4.25rem]"
        >
          <span
            aria-hidden="true"
            className="guide-v-halo absolute -inset-2 rounded-full border border-[#e6b94a]/30"
          />
          <span
            aria-hidden="true"
            className="guide-v-letter relative -mt-1 font-display text-[2.55rem] font-extrabold italic leading-none tracking-[-0.14em]"
          >
            V
          </span>
        </button>
      )}
    </div>
  );
}
