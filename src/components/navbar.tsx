"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteActions } from "@/lib/actions/registry";

const links = [
  { label: "Work", section: "work" },
  { label: "Services", section: "services" },
  { label: "Process", section: "process" },
  { label: "Pricing", section: "pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-300 sm:px-6",
          scrolled ? "glass mx-4 sm:mx-auto" : "bg-transparent"
        )}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            runAction("navigateTo", { section: "home" });
          }}
          className="group flex items-center gap-2 font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-black">
            O
          </span>
          <span className="tracking-tight">Omar Husain</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {links.map((l) => (
            <a
              key={l.section}
              href={`#${l.section}`}
              onClick={(e) => {
                e.preventDefault();
                runAction("navigateTo", { section: l.section });
              }}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white sm:px-3"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
          <button
            onClick={() => runAction("openAppointmentBooking")}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            Book a call
          </button>
        </div>
      </div>
    </header>
  );
}
