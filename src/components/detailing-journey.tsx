"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Droplets, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";

const stages = [
  {
    number: "01",
    icon: ScanSearch,
    kicker: "Inspect",
    title: "We read the paint.",
    body: "Under color-matched lighting, we map swirls, scratches, stains, and every surface that needs attention.",
    range: [0, 0.03, 0.2, 0.3],
  },
  {
    number: "02",
    icon: Droplets,
    kicker: "Decontaminate",
    title: "Clean past the surface.",
    body: "A foam pre-wash, two-bucket hand wash, iron removal, and clay treatment lift away bonded contamination safely.",
    range: [0.2, 0.3, 0.45, 0.55],
  },
  {
    number: "03",
    icon: Sparkles,
    kicker: "Correct",
    title: "Bring back the depth.",
    body: "Measured machine polishing removes haze and defects while preserving the integrity of your clear coat.",
    range: [0.45, 0.55, 0.7, 0.8],
  },
  {
    number: "04",
    icon: ShieldCheck,
    kicker: "Protect",
    title: "Lock in the finish.",
    body: "We seal every corrected surface with professional-grade protection for easier washes and lasting gloss.",
    range: [0.7, 0.8, 0.97, 1],
  },
] as const;

const visualStages = [
  {
    src: "/car-studio.jpg",
    alt: "A real sports car under studio inspection lighting",
    objectPosition: "center",
  },
  {
    src: "/car-wash.jpg",
    alt: "A professional detailer pressure washing a real luxury car",
    objectPosition: "center",
  },
  {
    src: "/car-polish.jpg",
    alt: "A professional detailer machine polishing real automotive paint",
    objectPosition: "center",
  },
  {
    src: "/car-studio.jpg",
    alt: "The finished real sports car with a deep corrected gloss",
    objectPosition: "center",
  },
] as const;

function JourneyStep({
  stage,
}: {
  stage: (typeof stages)[number];
}) {
  const Icon = stage.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -22 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="journey-copy"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-xs text-accent">{stage.number}</span>
        <span className="h-px w-9 bg-accent/50" />
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {stage.kicker}
        </span>
      </div>
      <h3 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        {stage.title}
      </h3>
      <p className="mt-5 max-w-md text-base leading-7 text-zinc-400 sm:text-lg">
        {stage.body}
      </p>
    </motion.article>
  );
}

export function DetailingJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextStage = Math.min(stages.length - 1, Math.floor(latest * stages.length));
    setActiveStage((current) => (current === nextStage ? current : nextStage));
  });

  useEffect(() => {
    visualStages.forEach(({ src }) => {
      const image = new window.Image();
      image.src = src;
    });
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative h-[420vh] border-y border-white/8 bg-[#080c0d]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 road-grid opacity-45" />
        <div className="absolute left-0 top-0 h-full w-px bg-white/10">
          <motion.div
            style={{ scaleY: progressScale, transformOrigin: "top" }}
            className="h-full w-px bg-accent"
          />
        </div>

        <div className="mx-auto grid h-full max-w-7xl items-center px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <div className="relative z-10 h-[44vh] lg:h-[52vh]">
            <AnimatePresence mode="wait">
              <JourneyStep
                key={stages[activeStage].number}
                stage={stages[activeStage]}
              />
            </AnimatePresence>
          </div>

          <div className="relative h-[48vh] lg:h-[78vh]">
            <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#050708] shadow-2xl">
              <div
                role="img"
                aria-label={visualStages[activeStage].alt}
                data-stage={activeStage + 1}
                className="absolute -inset-3 bg-cover bg-center transition-transform duration-[2400ms] ease-out"
                style={{
                  backgroundImage: `url("${visualStages[activeStage].src}")`,
                  backgroundPosition: visualStages[activeStage].objectPosition,
                  transform:
                    activeStage % 2 === 0
                      ? "scale(1.04) translateX(0.5%)"
                      : "scale(1.08) translateX(-0.5%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/65 via-transparent to-black/15" />
              <motion.div
                animate={{ x: ["-140%", "180%"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-0 z-[3] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl"
              />
              <div className="pointer-events-none absolute inset-0 z-[4] ring-1 ring-inset ring-white/10" />
              <span className="absolute bottom-5 right-5 z-[5] text-[9px] text-white/35">
                Real detailing photography · Pexels
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 backdrop-blur">
                Scroll through the studio
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
