"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useSiteActions } from "@/lib/actions/registry";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";

function CinematicVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
    />
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { runAction } = useSiteActions();

  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Full-bleed cinematic background film */}
      <div className="absolute inset-0">
        <div className="hidden sm:block">
          <CinematicVideo src="/videos/hero-desktop.mp4" poster="/posters/hero-desktop.jpg" />
        </div>
        <div className="sm:hidden">
          <CinematicVideo src="/videos/hero-mobile.mp4" poster="/posters/hero-mobile.jpg" />
        </div>
        {/* Legibility grade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050708] via-[#050708]/35 to-[#050708]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050708]/55 via-transparent to-transparent" />
      </div>

      <div className="film-grain pointer-events-none absolute inset-0" />

      {/* Fade-from-black opening frame */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-20 bg-[#020304]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pb-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-black/30 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-sm sm:text-[11px]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Austin&apos;s studio detailers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease }}
          className="max-w-3xl text-balance text-[17vw] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-8xl"
        >
          Your car,
          <span className="block text-accent">fully reset.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease }}
          className="mt-5 max-w-md text-[15px] leading-7 text-zinc-300 sm:mt-6 sm:max-w-lg sm:text-lg"
        >
          Paint correction, ceramic protection, and obsessive interior care for
          drivers who notice every detail.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <button
            onClick={() => runAction("openAppointmentBooking")}
            className="glow group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-[#0b0e0f] transition-transform hover:scale-[1.03] sm:py-3.5"
          >
            Book your detail
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
          <a
            href="tel:+15125550187"
            className="rounded-full border border-white/20 bg-black/25 px-6 py-4 text-center text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/10 sm:py-3.5"
          >
            (512) 555-0187
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.2 }}
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-zinc-400 sm:text-sm"
        >
          <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
            {[0, 1, 2, 3, 4].map((star) => (
              <Star key={star} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <span>
            <strong className="font-semibold text-white">4.9</strong> from 180+ local drivers
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span>Fully insured</span>
        </motion.div>
      </div>

      <p className="absolute bottom-2 right-3 z-10 text-[9px] text-zinc-600">
        Footage: Pexels
      </p>

      <motion.a
        href="#process"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 lg:flex"
      >
        Watch the process
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </motion.a>
    </section>
  );
}
