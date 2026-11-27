import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { TopBar } from "@/components/vexon/TopBar";
import { SocialLinks } from "@/components/vexon/SocialIcons";

export const Route = createFileRoute("/hotel")({ component: Hotel });

const stays = [
  {
    name: "The Horizon Villa",
    detail: "A private retreat above the water",
    image: "/hotel/horizon-villa.jpg",
    no: "01",
  },
  {
    name: "The Garden House",
    detail: "Slow mornings, wrapped in green",
    image: "/hotel/garden-house.jpg",
    no: "02",
  },
  {
    name: "The Cliff Suite",
    detail: "Open skies. A quieter kind of luxury.",
    image: "/hotel/cliff-suite.jpg",
    no: "03",
  },
];

function Hotel() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-svh bg-[#0e1213] text-[#f8f9f7] selection:bg-[#af643a] selection:text-white">
      <section className="relative min-h-[92svh] overflow-hidden px-5 pb-10 pt-5 md:px-10 md:pt-8">
        <div className="absolute inset-0 bg-[url('/hotel/horizon-villa.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1213]/90 via-[#0e1213]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1213] via-transparent to-black/30" />
        <header className="relative z-10 flex items-center justify-between border-b border-white/20 pb-5">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-[0.16em]"
          >
            VEXON <span className="font-light text-[#d59851]">STAYS</span>
          </Link>
          <nav className="hidden items-center gap-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/80 md:flex">
            <a href="#story" className="hover:text-white">
              The story
            </a>
            <a href="#stays" className="hover:text-white">
              The stays
            </a>
            <a href="#experience" className="hover:text-white">
              Experience
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#stays"
              className="hidden rounded-full border border-white/40 px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#0e1213] sm:inline-flex"
            >
              Enquire about a stay <ArrowUpRight className="ml-2 size-3" />
            </a>
            <button
              className="grid size-10 place-items-center rounded-full border border-white/25 md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="size-4" />
            </button>
          </div>
        </header>
        {menuOpen && (
          <nav className="relative z-20 mt-3 flex flex-col gap-3 rounded-xl border border-white/15 bg-black/50 p-5 font-mono text-xs uppercase tracking-widest md:hidden">
            <a href="#story" onClick={() => setMenuOpen(false)}>
              The story
            </a>
            <a href="#stays" onClick={() => setMenuOpen(false)}>
              The stays
            </a>
            <a href="#experience" onClick={() => setMenuOpen(false)}>
              Experience
            </a>
          </nav>
        )}
        <div className="relative z-10 mx-auto flex min-h-[75svh] max-w-7xl flex-col justify-center py-24">
          <div className="mb-7 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/70">
            <span className="h-px w-10 bg-[#d59851]" /> A considered escape, by
            Vexon
          </div>
          <h1 className="max-w-4xl font-display text-6xl font-medium leading-[0.92] tracking-[-0.055em] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            Stay a little
            <br />
            <em className="font-serif font-normal text-[#d59851]">
              closer to calm.
            </em>
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
            A collection of places shaped by landscape, thoughtful details, and
            the art of taking your time.
          </p>
          <a
            href="#stays"
            className="mt-9 inline-flex w-fit items-center gap-3 rounded-full bg-[#af643a] px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition hover:bg-[#d59851]"
          >
            Explore the stays <ArrowDownRight className="size-4" />
          </a>
        </div>
        <div className="absolute bottom-7 right-8 hidden font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/65 md:block">
          01 / A different pace
        </div>
      </section>
      <section
        id="story"
        className="mx-auto grid max-w-7xl gap-8 px-5 py-24 md:grid-cols-[0.8fr_1.2fr] md:px-10 md:py-36"
      >
        <div>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.23em] text-[#d59851]">
            [ A place to arrive ]
          </span>
          <h2 className="mt-7 max-w-md font-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            Not just somewhere to stay.
          </h2>
        </div>
        <div className="md:pt-10">
          <p className="max-w-xl text-lg leading-relaxed text-white/65">
            A good stay gives you room to notice more: the changing light, a
            long breakfast, a conversation that has nowhere else to be. We bring
            together design-led spaces for exactly that.
          </p>
          <div className="mt-9 flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#d59851]">
            <Sparkles className="size-4" /> Intentional by design
          </div>
        </div>
      </section>
      <section
        id="stays"
        className="bg-[#f0eee9] px-5 py-20 text-[#1e1612] md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.23em] text-[#af643a]">
                [ Places with a point of view ]
              </span>
              <h2 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-6xl">
                Find your somewhere.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#1e1612]/65">
              Our collection is growing. Enquire with us to plan a stay that
              feels like yours.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {stays.map((stay) => (
              <article key={stay.no} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#453e36]">
                  <img
                    src={stay.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                  <span className="absolute left-5 top-5 font-mono text-xs text-white/80">
                    {stay.no}
                  </span>
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <h3 className="font-display text-2xl">{stay.name}</h3>
                    <p className="mt-2 text-sm text-white/75">{stay.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        id="experience"
        className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36"
      >
        <div className="grid gap-8 border-y border-white/15 py-10 md:grid-cols-[1fr_1.2fr] md:py-16">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.23em] text-[#d59851]">
            [ The feeling is the point ]
          </span>
          <div>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-6xl">
              A stay that stays with you.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-white/65">
              Thoughtful hospitality, a strong sense of place, and the freedom
              to do as much or as little as you like. That is the Vexon Stays
              promise.
            </p>
            <a
              href="mailto:hello@vexontech.com"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#af643a] px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] hover:bg-[#d59851]"
            >
              Plan your stay <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
      <footer className="flex flex-col gap-6 border-t border-white/10 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <Link to="/" className="font-display text-sm tracking-[0.16em]">
          VEXON STAYS
        </Link>
        <SocialLinks />
        <p className="font-mono text-[0.62rem] text-white/45">
          A hospitality concept by Vexon Tech
        </p>
      </footer>
    </main>
  );
}
