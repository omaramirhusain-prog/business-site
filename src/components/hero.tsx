"use client";

import dynamic from "next/dynamic";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { useSiteActions } from "@/lib/actions/registry";

const Scene3D = dynamic(() => import("@/components/scene-3d"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-full bg-accent/10 blur-2xl" />
  ),
});

export function Hero() {
  const { runAction } = useSiteActions();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 130]
  );
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const sceneY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 220]
  );
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.72]);
  const sceneRotate = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 18]
  );

  return (
    <motion.section
      ref={sectionRef}
      id="top"
      className="relative z-10 flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="hero-vignette absolute inset-0" />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 pt-28 md:grid-cols-2 md:pt-0">
        <motion.div
          className="relative z-10"
          style={{ y: copyY, opacity: copyOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-green-400"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { scale: [1, 2.2], opacity: [0.8, 0] }
                }
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>
            Available for new projects
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Websites that{" "}
            <span className="gradient-text">move</span> and{" "}
            <span className="gradient-text">think</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400"
          >
            I build best-in-class websites with full 3D animation and AI agents
            built right in. One developer, obsessive about quality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={() => runAction("openAppointmentBooking")}
              className="glow rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black transition-transform hover:scale-105"
            >
              Book a call
            </button>
            <button
              onClick={() => runAction("navigateTo", { section: "work" })}
              className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              See the work
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex gap-8 text-sm text-zinc-500"
          >
            <div>
              <div className="text-2xl font-semibold text-white">3D</div>
              animation as standard
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">AI</div>
              built into every build
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">100%</div>
              custom, no templates
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-0 h-[320px] w-full sm:h-[460px] md:h-[560px]"
          style={{ y: sceneY, scale: sceneScale, rotate: sceneRotate }}
        >
          <div className="absolute inset-[12%] rounded-full border border-white/[0.06] shadow-[0_0_100px_rgba(124,92,255,0.15)]" />
          <Scene3D />
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Scroll to explore
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-accent-2 to-transparent"
            animate={prefersReducedMotion ? undefined : { y: ["-100%", "220%"] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </motion.section>
  );
}
