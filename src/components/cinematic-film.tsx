"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSiteActions } from "@/lib/actions/registry";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";

/**
 * One continuous scroll-scrubbed film: the same black Bentley moves through
 * arrival → foam wash → paint correction → interior → ceramic finish, with a
 * distinct cinematic transition between each scene (mist bloom, squeegee wipe,
 * door iris, windshield fly-out). Every transition is driven directly by
 * scroll position, so scrubbing backwards plays the film in reverse.
 */

const ease = [0.22, 1, 0.36, 1] as const;

function SceneVideo({
  playing,
  src,
  poster,
  className,
}: {
  playing: boolean;
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.play().catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [playing]);

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

function SceneCopy({
  progress,
  range,
  kicker,
  title,
  copy,
  hold = false,
  children,
}: {
  progress: MotionValue<number>;
  /** [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] */
  range: [number, number, number, number];
  kicker: string;
  title: string;
  copy: string;
  hold?: boolean;
  children?: React.ReactNode;
}) {
  const opacity = useTransform(
    progress,
    hold ? [range[0], range[1]] : [...range],
    hold ? [0, 1] : [0, 1, 1, 0]
  );
  const y = useTransform(progress, [range[0], range[1]], [40, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-5 bottom-24 z-30 sm:inset-x-8 sm:bottom-28 lg:inset-x-10"
    >
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent sm:text-xs">
          {kicker}
        </p>
        <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
          {copy}
        </p>
        {children}
      </div>
    </motion.div>
  );
}

/** Scroll windows in which each scene's video should be decoding. */
const hotWindows: Array<[number, number]> = [
  [0, 0.24],
  [0.1, 0.46],
  [0.34, 0.7],
  [0.55, 0.88],
  [0.76, 1],
];

export function CinematicFilm() {
  const { runAction } = useSiteActions();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Function transforms can't be compiled to WAAPI keyframes, which keeps every
  // downstream value JS-driven. Motion's ScrollTimeline acceleration otherwise
  // bakes stale scroll ranges for this pinned section and desyncs the film.
  const p = useTransform(() => scrollYProgress.get());

  const [hot, setHot] = useState<boolean[]>([true, false, false, false, false]);
  useMotionValueEvent(p, "change", (v) => {
    const next = hotWindows.map(([a, b]) => v >= a && v <= b);
    setHot((prev) =>
      prev.length === next.length && prev.every((x, i) => x === next[i]) ? prev : next
    );
  });

  /* Scene 0 — arrival. Camera pushes into the car as the mist rolls in. */
  const heroScale = useTransform(p, [0.08, 0.22], [1, 1.45]);
  const heroOpacity = useTransform(p, [0.15, 0.22], [1, 0]);
  const heroCopyOpacity = useTransform(p, [0, 0.05, 0.12], [1, 1, 0]);
  const heroCopyY = useTransform(p, [0.05, 0.12], [0, -50]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);

  /* Transition A — pressure-mist bloom into the wash bay */
  const mistOpacity = useTransform(p, [0.1, 0.17, 0.26], [0, 0.75, 0]);

  /* Scene 1 — foam wash */
  const washOpacity = useTransform(p, [0.13, 0.2], [0, 1]);
  const washScale = useTransform(p, [0.13, 0.3], [1.22, 1]);

  /* Transition B — squeegee wipe reveals the corrected paint */
  const wipe = useTransform(p, [0.36, 0.44], [100, 0]);
  const polishClip = useMotionTemplate`inset(0 ${wipe}% 0 0)`;
  const wipeEdgeLeft = useTransform(wipe, (v) => `${100 - v}%`);
  const wipeEdgeOpacity = useTransform(p, [0.355, 0.37, 0.43, 0.445], [0, 1, 1, 0]);

  /* Scene 2 — paint correction */
  const polishScale = useTransform(p, [0.36, 0.5], [1.12, 1]);

  /* Transition C — the door iris: into the cabin through the door */
  const iris = useTransform(p, [0.58, 0.68], [0, 150]);
  const irisClip = useMotionTemplate`circle(${iris}% at 63% 56%)`;
  const irisRim = useTransform(iris, (v) => Math.min(v + 0.8, 150));
  const irisRimClip = useMotionTemplate`circle(${irisRim}% at 63% 56%)`;
  const irisRimOpacity = useTransform(p, [0.58, 0.6, 0.655, 0.68], [0, 1, 1, 0]);

  /* Scene 3 — interior; flies forward through the windshield on exit */
  const interiorScale = useTransform(p, [0.58, 0.7, 0.76, 0.86], [1.45, 1, 1, 1.8]);
  const interiorBlur = useTransform(p, [0.76, 0.85], [0, 16]);
  const interiorFilter = useMotionTemplate`blur(${interiorBlur}px)`;
  const interiorOpacity = useTransform(p, [0.79, 0.86], [1, 0]);

  /* Transition D — light streak while passing through the glass */
  const flashOpacity = useTransform(p, [0.79, 0.825, 0.86], [0, 0.55, 0]);

  /* Scene 4 — the finish, headlights on */
  const finishOpacity = useTransform(p, [0.78, 0.85], [0, 1]);
  const finishScale = useTransform(p, [0.78, 0.93], [1.35, 1]);
  const finishCtaOpacity = useTransform(p, [0.9, 0.95], [0, 1]);

  /* Progress rail */
  const railOpacity = useTransform(p, [0.08, 0.13], [0, 1]);
  const railScale = useTransform(p, [0.1, 0.97], [0, 1], { clamp: true });

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="One continuous film: the same Bentley is washed, corrected, detailed inside, and sealed under ceramic as you scroll"
      className="relative h-[620vh] bg-[#050708]"
    >
      {/* Anchor for the Process nav link */}
      <div id="process" className="absolute top-[14%]" />

      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Scene 0 — arrival */}
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
          <div className="hidden sm:block">
            <SceneVideo
              playing={hot[0]}
              src="/videos/hero-desktop.mp4"
              poster="/posters/hero-desktop.jpg"
            />
          </div>
          <div className="sm:hidden">
            <SceneVideo
              playing={hot[0]}
              src="/videos/hero-mobile.mp4"
              poster="/posters/hero-mobile.jpg"
            />
          </div>
        </motion.div>

        {/* Transition A — mist bloom */}
        <motion.div
          style={{ opacity: mistOpacity }}
          className="pointer-events-none absolute inset-0 z-[11] bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,rgba(214,228,231,0.9),rgba(151,170,175,0.5)_55%,transparent_85%)]"
        />

        {/* Scene 1 — foam wash */}
        <motion.div
          style={{ opacity: washOpacity, scale: washScale }}
          className="absolute inset-0 z-[12]"
        >
          <SceneVideo playing={hot[1]} src="/videos/wash.mp4" poster="/posters/wash.jpg" />
        </motion.div>

        {/* Scene 2 — paint correction, revealed by the squeegee wipe */}
        <motion.div style={{ clipPath: polishClip }} className="absolute inset-0 z-[13]">
          <motion.div style={{ scale: polishScale }} className="absolute inset-0">
            <SceneVideo
              playing={hot[2]}
              src="/videos/polish.mp4"
              poster="/posters/polish.jpg"
              className="object-[55%_78%] sm:object-center"
            />
          </motion.div>
        </motion.div>
        <motion.div
          style={{ left: wipeEdgeLeft, opacity: wipeEdgeOpacity }}
          className="pointer-events-none absolute inset-y-0 z-[14] w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-white/90 to-transparent shadow-[0_0_28px_6px_rgba(255,255,255,0.45)]"
        />

        {/* Door-iris rim tracing the way into the cabin */}
        <motion.div
          style={{ clipPath: irisRimClip, opacity: irisRimOpacity }}
          className="pointer-events-none absolute inset-0 z-[15] bg-accent/70"
        />

        {/* Scene 3 — interior, entered through the iris */}
        <motion.div style={{ clipPath: irisClip }} className="absolute inset-0 z-[16]">
          <motion.div
            style={{
              scale: interiorScale,
              opacity: interiorOpacity,
              filter: interiorFilter,
            }}
            className="absolute inset-0"
          >
            <SceneVideo
              playing={hot[3]}
              src="/videos/interior.mp4"
              poster="/posters/interior.jpg"
              className="object-[30%_50%] sm:object-center"
            />
          </motion.div>
        </motion.div>

        {/* Scene 4 — the finish */}
        <motion.div
          style={{ opacity: finishOpacity, scale: finishScale }}
          className="absolute inset-0 z-[17]"
        >
          <SceneVideo playing={hot[4]} src="/videos/finish.mp4" poster="/posters/finish.jpg" />
        </motion.div>

        {/* Transition D — windshield light streak */}
        <motion.div
          style={{ opacity: flashOpacity }}
          className="pointer-events-none absolute inset-0 z-[18] bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.9)_50%,transparent_70%)]"
        />

        {/* Legibility grade above all scenes, below copy */}
        <div className="pointer-events-none absolute inset-0 z-[19] bg-gradient-to-t from-[#050708] via-[#050708]/25 to-[#050708]/55" />
        <div className="pointer-events-none absolute inset-0 z-[19] bg-gradient-to-r from-[#050708]/50 via-transparent to-transparent" />
        <div className="film-grain pointer-events-none absolute inset-0 z-[19]" />

        {/* Fade-from-black opening frame */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-[40] bg-[#020304]"
        />

        {/* Scene 0 copy — the hero */}
        <motion.div
          style={{ opacity: heroCopyOpacity, y: heroCopyY }}
          className="absolute inset-x-0 bottom-0 z-30"
        >
          <div className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
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
              Paint correction, ceramic protection, and obsessive interior care
              for drivers who notice every detail.
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
        </motion.div>

        {/* Scene copy, scrubbed by scroll */}
        <SceneCopy
          progress={p}
          range={[0.23, 0.27, 0.33, 0.37]}
          kicker="01 — Decontaminate"
          title="Every panel, stripped clean."
          copy="Foam pre-soak, pH-neutral hand wash, and a full chemical decontamination lift years of grime without touching the paint."
        />
        <SceneCopy
          progress={p}
          range={[0.46, 0.5, 0.55, 0.59]}
          kicker="02 — Correct"
          title="Swirls, polished out of existence."
          copy="Measured machine polishing removes oxidation, haze, and light defects — restoring the deep gloss your paint left the factory with."
        />
        <SceneCopy
          progress={p}
          range={[0.69, 0.72, 0.755, 0.785]}
          kicker="03 — Revive"
          title="The cabin, detailed to the stitch."
          copy="Steam, soft brushes, and leather care reach every vent, seam, and switch until the interior feels factory-new again."
        />
        <SceneCopy
          progress={p}
          range={[0.88, 0.93, 1, 1]}
          hold
          kicker="04 — Protect"
          title="Sealed under ceramic. Ready."
          copy="A 3–7 year ceramic coating cures over every corrected surface, locking in the finish against Texas sun, rain, and road film."
        >
          <motion.div style={{ opacity: finishCtaOpacity }} className="mt-7">
            <button
              onClick={() => runAction("openAppointmentBooking")}
              className="glow pointer-events-auto inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-[#0b0e0f] transition-transform hover:scale-[1.03]"
            >
              Book this transformation
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.div>
        </SceneCopy>

        {/* Progress rail */}
        <motion.div
          style={{ opacity: railOpacity }}
          className="absolute inset-x-5 bottom-8 z-30 sm:inset-x-8 lg:inset-x-10"
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span>The Northline process</span>
            <span className="hidden sm:block">Keep scrolling</span>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              style={{ scaleX: railScale, transformOrigin: "left" }}
              className="h-full w-full rounded-full bg-accent"
            />
          </div>
        </motion.div>

        {/* Scroll hint on arrival */}
        <motion.div style={{ opacity: hintOpacity }} className="absolute inset-x-0 bottom-7 z-30">
          <motion.a
            href="#process"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mx-auto hidden w-max items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 lg:flex"
          >
            Watch the process
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </motion.a>
        </motion.div>

        <p className="absolute bottom-2 right-3 z-30 text-[9px] text-zinc-600">
          Footage: Tima Miroshnichenko / Pexels
        </p>
      </div>
    </section>
  );
}
