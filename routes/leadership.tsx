import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ParticleField } from "@/components/vexon/ParticleField";
import { SocialLinks } from "@/components/vexon/SocialIcons";
import { TopBar } from "@/components/vexon/TopBar";
import { Words } from "@/components/vexon/Words";
import { ogImageMeta } from "@/lib/seo";

const TITLE = "Leadership — VEXON TECH";
const DESC = "Meet the people leading VEXON TECH, a builder-led venture based in Kenya (Nairobi and Kakamega).";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...ogImageMeta("default"),
    ],
  }),
  component: Leadership,
});

// To show a real photo, save it as public/leaders/<photo name>.jpg (square, at least 400x400).
// The files in public/leaders/ are generated illustrated avatars; replace them with real photos any time.
const LEADERS = [
  { name: "Enosh Yeswa", role: "Chief Executive Officer (CEO)", monogram: "EY", photo: "/leaders/enosh-yeswa.jpg" },
  { name: "Vince Odhiambo", role: "Executive", monogram: "VO", photo: "/leaders/vince-odhiambo.jpg" },
] as const;

/** Round avatar: the photo when it exists, otherwise a glowing monogram. Never shows a broken image. */
function Avatar({ name, monogram, photo }: { name: string; monogram: string; photo: string }) {
  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasPhoto(true);
    img.onerror = () => setHasPhoto(false);
    img.src = photo;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [photo]);

  return (
    <span className="relative inline-grid size-28 shrink-0 place-items-center md:size-32">
      <span aria-hidden className="absolute -inset-3 rounded-full bg-glow/20 blur-2xl transition-opacity duration-500 group-hover:bg-glow/35" />
      <span className="relative grid size-full place-items-center overflow-hidden rounded-full border-2 border-glow/50 bg-gradient-to-br from-muted to-card transition-colors duration-500 group-hover:border-glow">
        {hasPhoto ? (
          <img src={photo} alt={name} width={256} height={256} className="size-full object-cover" />
        ) : (
          <span role="img" aria-label={`${name} avatar`} className="text-chrome font-display text-4xl font-extrabold md:text-5xl">
            {monogram}
          </span>
        )}
      </span>
    </span>
  );
}

// Stylised outline of Kenya (not a survey map). Marker positions are projected from real coordinates.
const KENYA_OUTLINE = "M24.5 56.4 L64.7 28.1 L109.4 40.2 L154.2 48.3 L207.8 80.6 L270.4 88.7 L328.6 56.4 L377.8 66.5 L337.5 104.8 L337.5 294.7 L292.8 339.2 L257.0 416.0 L189.9 363.4 L185.5 351.3 L24.5 266.5 L28.9 205.9 L46.8 185.7 L64.7 157.4 L51.3 104.8 Z";
const PLACES = [
  { name: "Nairobi", x: 150.6, y: 278.2 },
  { name: "Kakamega", x: 58.0, y: 214.7 },
] as const;

function KenyaMap() {
  return (
    <svg
      viewBox="0 0 440 440"
      role="img"
      aria-label="Stylised map of Kenya with Nairobi and Kakamega marked"
      className="h-auto w-full max-w-md"
    >
      <defs>
        <radialGradient id="marker-glow">
          <stop offset="0%" stopColor="var(--glow)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={KENYA_OUTLINE} fill="var(--card)" stroke="var(--glow)" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      {PLACES.map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r="22" fill="url(#marker-glow)" className="live-dot" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
          <circle cx={p.x} cy={p.y} r="4.5" fill="var(--foreground)" />
          <text x={p.x + 14} y={p.y + 4} fill="var(--foreground)" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="2.5">
            {p.name.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Leadership() {
  return (
    <main className="relative min-h-svh w-full overflow-x-clip px-5 pb-10 pt-6 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <ParticleField className="h-full w-full" density={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_0%,transparent_65%)]" />
      </div>

      <TopBar tag="[ LEADERSHIP ]" />

      <section className="relative z-10 pb-24 pt-24 md:pt-32">
        <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ THE PEOPLE BEHIND THE BUILD ]</span>
        <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
          <Words text="Leadership" className="text-chrome" />
        </h1>

        <ul className="mt-16 grid gap-4 md:grid-cols-2">
          {LEADERS.map((l, i) => (
            <li
              key={l.name}
              className="group rounded-lg border bg-card/80 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-glow/60"
            >
              <div className="flex items-start justify-between gap-4">
                <Avatar name={l.name} monogram={l.monogram} photo={l.photo} />
                <span className="font-mono text-xs text-muted-foreground">[ 00{i + 1} ]</span>
              </div>
              <h2 className="mt-10 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">{l.name}</h2>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">{l.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 border-t py-24 md:grid-cols-2 md:items-center">
        <div>
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">[ LOCATION ]</span>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
            <Words text="Based in Kenya" />
          </h2>
          <ul className="mt-8 space-y-3 font-mono text-sm uppercase tracking-[0.2em]">
            {PLACES.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="live-dot size-2 rounded-full bg-glow" /> {p.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center gap-10 md:items-end">
          <KenyaMap />
          <Link
            to="/contact"
            className="bracket-btn px-7 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
          >
            Contact the team
          </Link>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between">
        <SocialLinks />
        <p className="font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
          © 2026 VEXON TECH — proposed brand. Roles and structure remain subject to founder confirmation.
        </p>
      </footer>
    </main>
  );
}
