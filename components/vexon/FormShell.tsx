import { useId, type ReactNode } from "react";
import { Wordmark } from "@/components/vexon/Wordmark";

type FormShellProps = {
  title: string;
  reason: string;
  timeHint?: string;
  children: ReactNode;
  className?: string;
};

/** Consistent, accessible presentation for public VEXVANO LABS forms. */
export function FormShell({
  title,
  reason,
  timeHint = "Takes about 30 seconds",
  children,
  className = "",
}: FormShellProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`w-full rounded-lg border bg-card/80 p-6 backdrop-blur-md sm:p-8 ${className}`}
    >
      <div className="mb-7 flex items-center gap-3">
        <span className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
          <Wordmark />
        </span>
      </div>
      <header className="mb-7">
        <h2
          id={headingId}
          className="font-display text-3xl font-extrabold uppercase leading-[0.95] sm:text-4xl"
        >
          <span className="text-chrome">{title}</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {reason}
        </p>
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/80">
          {timeHint}
        </p>
      </header>
      {children}
    </section>
  );
}
