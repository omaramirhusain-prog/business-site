"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { useSiteActions } from "@/lib/actions/registry";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";

/**
 * Starts the cinematic intro only after the hero photo is decoded AND the
 * browser has presented a frame, so the sequence is never skipped by a slow
 * first paint.
 */
function useIntroReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.src = "/car-studio.jpg";

    const start = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      });
    };

    if (image.complete) start();
    else {
      image.onload = start;
      image.onerror = start;
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function Hero() {
  const { runAction } = useSiteActions();
  const introReady = useIntroReady();
  const { scrollYProgress } = useScroll();
  const carX = useTransform(scrollYProgress, [0, 0.16], ["0%", "13%"]);
  const carScale = useTransform(scrollYProgress, [0, 0.16], [1.06, 1.16]);
  const carOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0.35]);
  const reflectionOpacity = useTransform(scrollYProgress, [0, 0.12], [0.22, 0]);
  const effectsOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative z-0 h-[340px] w-full sm:h-[500px] lg:h-[680px]"
        >
          {/* Overhead studio light beam */}
          <div className="pointer-events-none absolute -top-12 right-[10%] h-[80%] w-[45%] rotate-[16deg] bg-gradient-to-b from-white/[0.09] via-white/[0.025] to-transparent blur-2xl" />

          {/* Car + floor reflection, revealed by a traveling light wipe */}
          <div className={`cinematic-wipe absolute inset-0 ${introReady ? "run" : ""}`}>
            <div className={`cinematic-push absolute inset-0 ${introReady ? "run" : ""}`}>
              <motion.div
                style={{
                  x: carX,
                  scale: carScale,
                  opacity: carOpacity,
                  backgroundImage: 'url("/car-studio.jpg")',
                }}
                role="img"
                aria-label="A real Ferrari photographed in a dark detailing studio"
                className="absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)]"
                data-hero-car="real-photograph"
              />
              <motion.div
                aria-hidden
                style={{
                  x: carX,
                  opacity: reflectionOpacity,
                  backgroundImage: 'url("/car-studio.jpg")',
                }}
                className="car-reflection absolute inset-0 translate-y-[56%] scale-y-[-1] bg-contain bg-center bg-no-repeat blur-[3px]"
              />
            </div>
          </div>

          {/* Scroll-fading cinematic effect layer */}
          <motion.div style={{ opacity: effectsOpacity }} className="pointer-events-none absolute inset-0">
            {/* Broad paint gleam that periodically crosses the body */}
            <motion.div
              initial={{ x: "-70%", opacity: 0 }}
              animate={introReady ? { x: ["-70%", "170%"], opacity: [0, 0.85, 0] } : undefined}
              transition={{
                duration: 2.2,
                delay: 4.2,
                repeat: Infinity,
                repeatDelay: 3.6,
                ease: "easeInOut",
              }}
              className="absolute inset-y-[10%] w-[26%] rotate-[14deg] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-lg"
            />

            {/* Headlight flare on the nose of the car */}
            <motion.div
              initial={{ opacity: 0, scale: 0.15 }}
              animate={
                introReady
                  ? { opacity: [0, 1, 0.75, 1, 0.8], scale: [0.15, 1.6, 1.1, 1.35, 1.15] }
                  : undefined
              }
              transition={{ duration: 1.6, delay: 3.1, ease: "easeOut" }}
              className="absolute right-[13%] top-[49%] h-16 w-16"
            >
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.25, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-white blur-lg"
              />
              <div className="absolute left-1/2 top-1/2 h-[3px] w-32 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]" />
              <div className="absolute left-1/2 top-1/2 h-28 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-white/80 to-transparent blur-[1px]" />
              <div className="absolute left-1/2 top-1/2 h-[2px] w-20 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-[1px]" />
            </motion.div>

            {/* Dust drifting through the light */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                aria-hidden
                className="dust"
                style={{
                  left: `${20 + i * 11}%`,
                  top: `${24 + (i % 3) * 17}%`,
                  width: i % 2 === 0 ? 2 : 3,
                  height: i % 2 === 0 ? 2 : 3,
                  animationDelay: `${i * 1.5}s`,
                }}
              />
            ))}
          </motion.div>

          {/* Saber-style light line drawing in under the car */}
          <motion.div
            initial={{ width: "0%", opacity: 0 }}
            animate={introReady ? { width: "72%", opacity: 1 } : undefined}
            transition={{ duration: 1.2, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute bottom-[13%] left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-accent shadow-[0_0_18px_2px_var(--accent)]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={introReady ? { opacity: [0.35, 0.8, 0.35] } : undefined}
            transition={{ duration: 3.4, delay: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-x-[16%] bottom-[9%] h-20 rounded-full bg-accent/10 blur-[70px]"
          />

          {/* Exposure flicker as the reveal lands */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={introReady ? { opacity: [0, 0.12, 0, 0.07, 0] } : undefined}
            transition={{ duration: 0.6, delay: 2.9 }}
            className="pointer-events-none absolute inset-0 bg-white"
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={introReady ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 3.5 }}
            className="absolute right-2 top-[18%] hidden rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl sm:block"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Signature finish
            </div>
            <div className="mt-1 text-sm font-medium text-white">Ceramic protected</div>
            <div className="mt-3 h-1 w-28 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[92%] rounded-full bg-accent" />
            </div>
          </motion.div>
          <p className="absolute bottom-2 right-2 text-[9px] text-zinc-700">
            Photo: Quentin Martinez / Pexels
          </p>
        </motion.div>
      </div>

      {/* Film grain for a cinematic finish */}
      <div className="film-grain pointer-events-none absolute inset-0" />

      {/* Opening saber sweep across the whole hero */}
      <motion.div
        initial={{ x: "-12vw", opacity: 0 }}
        animate={introReady ? { x: "112vw", opacity: [0, 0.9, 0.9, 0] } : undefined}
        transition={{ duration: 1.25, delay: 0.25, ease: [0.55, 0, 0.45, 1] }}
        className="pointer-events-none absolute inset-y-0 z-20 w-16 skew-x-[-14deg]"
      >
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-accent shadow-[0_0_30px_6px_var(--accent)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/25 to-transparent blur-lg" />
      </motion.div>

      {/* Fade-from-black opening frame */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={introReady ? { opacity: 0 } : undefined}
        transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-30 bg-[#020304]"
      />

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
