"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteActions } from "@/lib/actions/registry";

const links = [
  { label: "Services", section: "services" },
  { label: "Process", section: "process" },
  { label: "Results", section: "results" },
  { label: "Packages", section: "packages" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { runAction } = useSiteActions();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2.5" : "py-4"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 sm:px-5",
          scrolled || menuOpen ? "glass mx-3 lg:mx-auto" : "bg-transparent"
        )}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            runAction("navigateTo", { section: "home" });
          }}
          className="group flex items-center gap-3"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-accent/50 text-xs font-bold text-accent transition-colors group-hover:bg-accent group-hover:text-black">
            N
          </span>
          <span>
            <span className="block text-xs font-semibold tracking-[0.16em] text-white">
              NORTHLINE
            </span>
            <span className="block text-[8px] uppercase tracking-[0.27em] text-zinc-500">
              Detail Co.
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-xs text-zinc-400 lg:flex">
          {links.map((l) => (
            <a
              key={l.section}
              href={`#${l.section}`}
              onClick={(e) => {
                e.preventDefault();
                runAction("navigateTo", { section: l.section });
              }}
              className="transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => runAction("openAppointmentBooking")}
          className="hidden rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-black transition-transform hover:scale-[1.03] sm:block"
        >
          Book your detail
        </button>

        <button
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white lg:hidden"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {menuOpen ? (
          <div className="glass absolute inset-x-0 top-[calc(100%+0.55rem)] mx-0 overflow-hidden rounded-3xl p-3 lg:hidden">
            <nav className="flex flex-col">
              {links.map((link) => (
                <a
                  key={link.section}
                  href={`#${link.section}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setMenuOpen(false);
                    runAction("navigateTo", { section: link.section });
                  }}
                  className="rounded-2xl px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  runAction("openAppointmentBooking");
                }}
                className="mt-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-black"
              >
                Book your detail
              </button>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
