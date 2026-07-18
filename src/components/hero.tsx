"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useSiteActions } from "@/lib/actions/registry";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";

export function Hero() {
  const { runAction } = useSiteActions();
  const { scrollYProgress } = useScroll();
  const carX = useTransform(scrollYProgress, [0, 0.16], ["0%", "13%"]);
  const carScale = useTransform(scrollYProgress, [0, 0.16], [1.06, 1.16]);
  const carOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0.35]);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24"
    >
      <div className="absolute inset-0 road-grid opacity-70" />
      <div className="absolute -right-48 top-16 h-[620px] w-[620px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="absolute left-[10%] top-[20%] h-44 w-44 rounded-full bg-sky-400/10 blur-[100px]" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-2 px-6 pb-16 lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            Austin&apos;s studio detailers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="max-w-2xl text-balance text-6xl font-semibold leading-[0.93] tracking-[-0.065em] sm:text-7xl lg:text-[6.2rem]"
          >
            Your car,
            <span className="block text-accent">fully reset.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg"
          >
            Paint correction, ceramic protection, and obsessive interior care
            for drivers who notice every detail.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={() => runAction("openAppointmentBooking")}
              className="glow group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-[#0b0e0f] transition-transform hover:scale-[1.03]"
            >
              Book your detail
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <a
              href="tel:+15125550187"
              className="rounded-full border border-white/15 px-6 py-3.5 text-center text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              (512) 555-0187
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-zinc-500"
          >
            <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="h-4 w-px bg-white/15" />
            <span>
              <strong className="font-semibold text-white">4.9</strong> from 180+ local drivers
            </span>
            <span className="h-4 w-px bg-white/15" />
            <span>Fully insured</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-0 h-[340px] w-full sm:h-[500px] lg:h-[680px]"
        >
          <motion.div
            style={{ x: carX, scale: carScale, opacity: carOpacity }}
            className="absolute inset-0"
          >
            <Image
              src="/car-studio.jpg"
              alt="A real Ferrari photographed in a dark detailing studio"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)]"
            />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.15, 0.5, 0.15], x: ["-10%", "12%", "-10%"] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-[20%] top-[31%] h-[2px] w-[58%] bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px]"
          />
          <div className="absolute inset-x-[14%] bottom-[15%] h-20 rounded-full bg-accent/8 blur-[70px]" />
          <div className="absolute right-2 top-[18%] hidden rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl sm:block">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Signature finish
            </div>
            <div className="mt-1 text-sm font-medium text-white">Ceramic protected</div>
            <div className="mt-3 h-1 w-28 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[92%] rounded-full bg-accent" />
            </div>
          </div>
          <p className="absolute bottom-2 right-2 text-[9px] text-zinc-700">
            Photo: Quentin Martinez / Pexels
          </p>
        </motion.div>
      </div>

      <motion.a
        href="#services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600 lg:flex"
      >
        Explore
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </motion.a>
    </section>
  );
}
