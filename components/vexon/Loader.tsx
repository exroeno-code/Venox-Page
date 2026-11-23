import { useEffect, useState } from "react";

import { Wordmark } from "@/components/vexon/Wordmark";

export function Loader({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const v = Math.min(1, (t - start) / 1700);
      setP(Math.round((1 - Math.pow(1 - v, 3)) * 100));
      if (v < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { setGone(true); onDone(); }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return (
    <div
      aria-hidden={gone}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background transition-transform duration-1000 ease-[cubic-bezier(.7,0,.2,1)] ${gone ? "-translate-y-full" : ""}`}
    >
      <div className="font-display text-5xl font-extrabold tracking-tight md:text-7xl"><Wordmark /></div>
      <div className="h-px w-56 bg-border">
        <div className="h-px bg-foreground" style={{ width: `${p}%` }} />
      </div>
      <div className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ {String(p).padStart(3, "0")} / 100 ]</div>
    </div>
  );
}
