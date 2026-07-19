"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

const beforeWords = "SWIRLS · HAZE · GRIME · WEAR · ";
const afterWords = "GLOSS · DEPTH · PROTECTION · ";

function Tooltip({
  progress,
  at,
  icon: Icon,
  title,
  body,
  className,
  align = "left",
}: {
  progress: MotionValue<number>;
  at: number;
  icon: typeof Sparkles;
  title: string;
  body: string;
  className: string;
  align?: "left" | "right";
}) {
  const opacity = useTransform(progress, [at, at + 0.06], [0, 1]);
  const y = useTransform(progress, [at, at + 0.08], ["40%", "0%"]);
  const lineScale = useTransform(progress, [at - 0.03, at + 0.04], [0, 1]);

  return (
    <motion.div
      style={{ opacity, y }}
      className={`pointer-events-none absolute z-20 w-64 max-w-[42vw] ${className}`}
    >
      <div className={`flex flex-col gap-3 ${align === "right" ? "items-end text-right" : ""}`}>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-accent/40 bg-black/40 text-accent backdrop-blur">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <motion.span
          style={{ scaleX: lineScale, transformOrigin: align === "right" ? "right" : "left" }}
          className="h-px w-full bg-gradient-to-r from-accent/70 to-transparent"
        />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-zinc-400">{body}</p>
      </div>
    </motion.div>
  );
}

export function CarShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Car stays pinned as the background while everything moves around it.
  const carScale = useTransform(scrollYProgress, [0, 1], [1.16, 0.98]);
  const carY = useTransform(scrollYProgress, [0, 1], ["2.5%", "-2%"]);

  // Scene 1: "before" marquee slides through behind the car.
  const beforeX = useTransform(scrollYProgress, [0.02, 0.38], ["2%", "-55%"]);
  const beforeTagOpacity = useTransform(scrollYProgress, [0.02, 0.08, 0.2, 0.3], [0, 1, 1, 0]);

  // Circular mask wipes in the "after" scene. Interpolate the radius as a
  // plain number so the interpolator can never fall back to a mismatched
  // clip-path shape.
  const maskRadius = useTransform(scrollYProgress, [0.3, 0.52], [0, 130]);
  const clipPath = useMotionTemplate`circle(${maskRadius}% at 50% 55%)`;

  // Scene 2: "after" marquee runs the opposite direction.
  const afterX = useTransform(scrollYProgress, [0.42, 0.85], ["-55%", "2%"]);
  const afterTagOpacity = useTransform(scrollYProgress, [0.52, 0.6], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0.5, 0.62], [0, 1]);

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="showcase"
      ref={sectionRef}
      aria-label="The car transforms from tired to showroom finish as you scroll"
      className="relative h-[420vh] border-b border-white/8 bg-[#050708]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Scene 1 — as it arrives */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 road-grid opacity-40" />
          <motion.p
            aria-hidden
            style={{ x: beforeX }}
            className="absolute top-[16%] w-max whitespace-nowrap text-[13vw] font-bold leading-none tracking-tight text-white/[0.05]"
          >
            {beforeWords.repeat(4)}
          </motion.p>
          <motion.div
            style={{ scale: carScale, y: carY }}
            role="img"
            aria-label="The car as it arrives, dull and swirled"
            className="absolute inset-x-[6%] inset-y-[16%] bg-contain bg-center bg-no-repeat [filter:saturate(0.4)_brightness(0.72)_contrast(0.95)]"
          >
            <div
              className="photo-blend absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url("/car-studio.jpg")' }}
            />
          </motion.div>
          <motion.div
            style={{ opacity: beforeTagOpacity }}
            className="absolute left-6 top-24 sm:left-10 lg:left-16"
          >
            <span className="font-mono text-xs text-zinc-500">01</span>
            <p className="mt-2 text-2xl font-semibold text-zinc-300 sm:text-3xl">As it arrives.</p>
            <p className="mt-1 text-sm text-zinc-500">Faded. Swirled. Driven hard.</p>
          </motion.div>
        </div>

        {/* Scene 2 — the Northline finish, revealed by the circular mask */}
        <motion.div style={{ clipPath }} className="absolute inset-0 bg-[#0a1012]">
          <div className="absolute inset-0 road-grid opacity-30" />
          <div className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[110px]" />
          <motion.p
            aria-hidden
            style={{ x: afterX }}
            className="absolute top-[16%] w-max whitespace-nowrap text-[13vw] font-bold leading-none tracking-tight text-accent/[0.08]"
          >
            {afterWords.repeat(4)}
          </motion.p>
          <motion.div
            style={{ scale: carScale, y: carY }}
            role="img"
            aria-label="The same car after detailing, glossy under studio light"
            className="absolute inset-x-[6%] inset-y-[16%]"
          >
            <div
              className="photo-blend absolute inset-0 bg-cover bg-center bg-no-repeat [filter:saturate(1.15)_brightness(1.1)_contrast(1.06)]"
              style={{ backgroundImage: 'url("/car-studio.jpg")' }}
            />
          </motion.div>
          <motion.div
            style={{ opacity: glowOpacity }}
            className="absolute inset-x-[28%] bottom-[16%] h-16 rounded-full bg-accent/15 blur-[60px]"
          />
          <motion.div
            style={{ opacity: afterTagOpacity }}
            className="absolute left-6 top-24 sm:left-10 lg:left-16"
          >
            <span className="font-mono text-xs text-accent">02</span>
            <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">The Northline finish.</p>
            <p className="mt-1 text-sm text-zinc-400">Corrected. Coated. Ready.</p>
          </motion.div>
        </motion.div>

        {/* Tooltip callouts, timed to scroll milestones */}
        <Tooltip
          progress={scrollYProgress}
          at={0.62}
          icon={Sparkles}
          title="Paint corrected"
          body="Swirls and haze are machine-polished out of the clear coat, panel by panel."
          className="left-6 top-[30%] sm:left-10 lg:left-16 lg:top-[34%]"
        />
        <Tooltip
          progress={scrollYProgress}
          at={0.8}
          icon={ShieldCheck}
          title="Ceramic locked"
          body="A 3–7 year coating cures over every corrected surface for lasting gloss."
          className="bottom-[16%] right-6 sm:right-10 lg:right-16"
          align="right"
        />

        {/* Scroll progress */}
        <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            Scroll to transform
          </span>
          <div className="h-[3px] w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              style={{ scaleX: progressScale, transformOrigin: "left" }}
              className="h-full w-full bg-accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
