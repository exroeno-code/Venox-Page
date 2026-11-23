import { useEffect, useRef } from "react";

type Props = { variant?: "halo" | "field"; className?: string; density?: number };

/** Live canvas particle system: a breathing, swirling halo that reacts to the pointer. */
export function ParticleField({ variant = "halo", className, density = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true;
    const mouse = { x: -9999, y: -9999 };
    const count = Math.round((window.innerWidth < 768 ? 2200 : 5200) * density);
    const ps = Array.from({ length: count }, () => {
      const spread = Math.pow(Math.random(), 1.8);
      return {
        a: Math.random() * Math.PI * 2,
        r: variant === "halo" ? 0.7 + (Math.random() - 0.3) * 0.55 * spread + spread * 0.3 : Math.random(),
        y: Math.random(),
        s: 0.0002 + Math.random() * 0.0006,
        z: Math.random(),
        blue: Math.random() < 0.35,
        ox: 0, oy: 0,
      };
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; });
    io.observe(canvas);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      const breathe = 1 + Math.sin(t * 0.0007) * 0.045;
      const cx = w * 0.58, cy = h * 0.6;
      const R = Math.max(w * 0.55, h * 0.7) * 0.75 * breathe;
      for (const p of ps) {
        let x: number, y: number;
        if (variant === "halo") {
          if (!reduce) p.a += p.s;
          const wob = Math.sin(t * 0.0012 + p.a * 4) * 0.025;
          x = cx + Math.cos(p.a) * R * (p.r + wob);
          y = cy + Math.sin(p.a) * R * (p.r + wob) * 0.8;
        } else {
          if (!reduce) p.y -= p.s * 0.5;
          if (p.y < 0) p.y = 1;
          x = p.r * w + Math.sin(t * 0.0005 + p.a) * 24;
          y = p.y * h;
        }
        const dx = x + p.ox - mouse.x, dy = y + p.oy - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 20000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d2 / 20000) * 3;
          p.ox += (dx / d) * f; p.oy += (dy / d) * f;
        }
        p.ox *= 0.95; p.oy *= 0.95;
        const alpha = 0.2 + p.z * 0.8;
        ctx.fillStyle = p.blue ? `rgba(105,145,255,${alpha * 0.85})` : `rgba(235,240,255,${alpha})`;
        const s = 0.6 + p.z * 1.5;
        ctx.fillRect(x + p.ox, y + p.oy, s, s);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [variant, density]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
