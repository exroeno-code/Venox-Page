import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

type LenisLike = {
  raf: (t: number) => void;
  destroy: () => void;
  scrollTo: (target: number | string, options?: { immediate?: boolean }) => void;
};

/**
 * Smooth scrolling for every page (Lenis, https://lenis.dev). Mounted once in the root layout.
 * Skipped for people who prefer reduced motion. Exposes the instance as window.__lenis so pages
 * can scroll to anchors; elements with `data-lenis-prevent` keep native scrolling (e.g. the menu).
 */
export function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: LenisLike | null = null;
    let raf = 0;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({ smoothWheel: true }) as unknown as LenisLike;
      lenis = instance;
      (window as unknown as { __lenis?: LenisLike }).__lenis = instance;
      const loop = (t: number) => {
        instance.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      // A new page starts at the top (unless the link points at a #section).
      unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
        if (!toLocation.hash) instance.scrollTo(0, { immediate: true });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      unsubscribe?.();
      lenis?.destroy();
      delete (window as unknown as { __lenis?: LenisLike }).__lenis;
    };
  }, [router]);

  return null;
}
