"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    id: "wash",
    src: "/videos/wash.mp4",
    poster: "/posters/wash.jpg",
    kicker: "01 — Decontaminate",
    title: "Every panel, stripped clean.",
    copy: "Foam pre-soak, pH-neutral hand wash, and a full chemical decontamination lift years of grime without touching the paint.",
  },
  {
    id: "polish",
    src: "/videos/polish.mp4",
    poster: "/posters/polish.jpg",
    kicker: "02 — Correct",
    title: "Swirls, polished out of existence.",
    copy: "Measured machine polishing removes oxidation, haze, and light defects — restoring the deep gloss your paint left the factory with.",
  },
  {
    id: "interior",
    src: "/videos/interior.mp4",
    poster: "/posters/interior.jpg",
    kicker: "03 — Revive",
    title: "The cabin, detailed to the stitch.",
    copy: "Steam, soft brushes, and leather care reach every vent, seam, and switch until the interior feels factory-new again.",
  },
  {
    id: "finish",
    src: "/videos/finish.mp4",
    poster: "/posters/finish.jpg",
    kicker: "04 — Protect",
    title: "Sealed under ceramic. Ready.",
    copy: "A 3–7 year ceramic coating cures over every corrected surface, locking in the finish against Texas sun, rain, and road film.",
  },
] as const;

function SceneVideo({ active, src, poster }: { active: boolean; src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.play().catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [active]);

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
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function ProcessFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scene, setScene] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.min(scenes.length - 1, Math.floor(latest * scenes.length));
    setScene((current) => (current === next ? current : next));
  });

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const active = scenes[scene];

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-label="The Northline detailing process, scene by scene"
      className="relative h-[400vh] bg-[#050708]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Scene films, crossfading with scroll */}
        {scenes.map((s, index) => (
          <div
            key={s.id}
            aria-hidden={index !== scene}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === scene ? "opacity-100" : "opacity-0"
            }`}
          >
            <SceneVideo active={index === scene} src={s.src} poster={s.poster} />
          </div>
        ))}

        {/* Legibility grade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050708] via-[#050708]/30 to-[#050708]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050708]/60 via-transparent to-transparent" />
        <div className="film-grain pointer-events-none absolute inset-0" />

        {/* Section label */}
        <div className="absolute left-5 top-24 sm:left-8 lg:left-10">
          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            The Northline process
          </span>
        </div>

        {/* Scene copy */}
        <div className="absolute inset-x-5 bottom-24 sm:inset-x-8 sm:bottom-28 lg:inset-x-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent sm:text-xs">
                {active.kicker}
              </p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                {active.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
                {active.copy}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scene rail + progress */}
        <div className="absolute inset-x-5 bottom-8 sm:inset-x-8 lg:inset-x-10">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span>
              Scene {String(scene + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}
            </span>
            <span className="hidden sm:block">Keep scrolling</span>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              style={{ scaleX: progressScale, transformOrigin: "left" }}
              className="h-full w-full rounded-full bg-accent"
            />
          </div>
        </div>

        <p className="absolute bottom-2 right-3 text-[9px] text-zinc-600">
          Footage: Pexels
        </p>
      </div>
    </section>
  );
}
