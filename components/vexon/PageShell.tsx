import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ParticleField } from "@/components/vexon/ParticleField";
import { SocialLinks } from "@/components/vexon/SocialIcons";
import { TopBar } from "@/components/vexon/TopBar";

/** Shared page layout: live background, top bar, content, footer with social links. */
export function PageShell({
  tag,
  scene,
  children,
}: {
  tag: string;
  /** Replaces the default particle background. */
  scene?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh w-full flex-col overflow-x-clip px-5 pb-10 pt-6 md:px-10">
      {scene ?? (
        <div className="pointer-events-none absolute inset-0">
          <ParticleField className="h-full w-full" density={0.6} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_0%,transparent_65%)]" />
        </div>
      )}
      <TopBar tag={tag} />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <footer className="relative z-10 mt-16 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between">
        <SocialLinks />
        <p className="font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
          © 2026 VEXON TECH — proposed brand. Name, structure and launch timing remain subject to founder confirmation.{" "}
          <Link to="/privacy" className="underline underline-offset-2 transition-colors hover:text-foreground">Privacy</Link>
        </p>
      </footer>
    </main>
  );
}
