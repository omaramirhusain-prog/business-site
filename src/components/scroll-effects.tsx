"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

export function ScrollEffects() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const firstOrbY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? ["0vh", "0vh"] : ["0vh", "125vh"]
  );
  const secondOrbY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? ["0vh", "0vh"] : ["20vh", "-105vh"]
  );
  const gridY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? ["0px", "0px"] : ["0px", "180px"]
  );

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[70] h-px w-full origin-left bg-gradient-to-r from-accent via-accent-2 to-white"
        style={{ scaleX: smoothProgress }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <motion.div
          className="absolute inset-[-20%] opacity-[0.16]"
          style={{ y: gridY }}
        >
          <div className="perspective-grid h-full w-full" />
        </motion.div>
        <motion.div
          className="absolute -left-48 -top-72 h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-[130px]"
          style={{ y: firstOrbY }}
        />
        <motion.div
          className="absolute -right-56 top-[70vh] h-[38rem] w-[38rem] rounded-full bg-accent-2/10 blur-[150px]"
          style={{ y: secondOrbY }}
        />
      </div>
    </>
  );
}
