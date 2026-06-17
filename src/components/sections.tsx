"use client";

import { Reveal } from "@/components/reveal";
import { Boxes, Bot, Gauge, Sparkles, Search, Rocket } from "lucide-react";
import { useSiteActions } from "@/lib/actions/registry";
import { siteConfig } from "@/lib/site-config";

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-sm font-medium uppercase tracking-widest text-accent">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}

const services = [
  {
    icon: Boxes,
    title: "3D & Motion",
    body: "Real-time 3D scenes, scroll-driven animation, and micro-interactions that make a site feel alive.",
  },
  {
    icon: Bot,
    title: "Integrated AI",
    body: "AI agents built into the site itself: assistants that answer, qualify, and convert visitors 24/7.",
  },
  {
    icon: Gauge,
    title: "Performance",
    body: "Fast where it counts. Optimized 3D, smart loading, and clean code that scores high on Lighthouse.",
  },
  {
    icon: Sparkles,
    title: "Design & UX",
    body: "Modern, considered interfaces. Every pixel and transition earns its place.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="What I do"
            title="Not just a website. An experience."
            subtitle="Most sites are flat and static. I build ones that move, respond, and think."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-accent/40 hover:bg-white/[0.04]">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const projects = [
  {
    name: "This site",
    tag: "3D + AI Assistant",
    desc: "The page you're on. 3D hero, scroll motion, and an AI agent that qualifies leads.",
    accent: "from-accent/30 to-accent-2/30",
  },
  {
    name: "Your project",
    tag: "Coming soon",
    desc: "Your brand could be the next case study here. Let's build something worth showing off.",
    accent: "from-zinc-700/40 to-zinc-800/40",
  },
];

export function Work() {
  return (
    <section id="work" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Work"
            title="Selected projects"
            subtitle="A growing portfolio. Quality over quantity, always."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                <div
                  className={`relative aspect-[16/10] bg-gradient-to-br ${p.accent}`}
                >
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <div className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur">
                    {p.tag}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {p.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Search,
    title: "Discovery",
    body: "We talk through your goals, brand, and what success looks like. The AI assistant on this site can even kick it off.",
  },
  {
    icon: Sparkles,
    title: "Design & Build",
    body: "I design and develop in tight loops, sharing progress early. 3D, motion, and AI come together here.",
  },
  {
    icon: Rocket,
    title: "Launch & Grow",
    body: "Deploy, measure, refine. Your site ships fast and keeps improving after launch.",
  },
];

export function Process() {
  return (
    <section id="process" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Process"
            title="How we'll work together"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-sm font-mono text-zinc-600">
                    0{i + 1}
                  </span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 text-accent">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const tiers = [
  {
    name: "Landing",
    price: "Let's talk",
    desc: "A single, stunning page. 3D hero, motion, and a contact flow.",
    features: ["One-page site", "3D hero + motion", "Mobile-perfect", "Basic SEO"],
    featured: false,
  },
  {
    name: "Signature",
    price: "Let's talk",
    desc: "A full multi-page site with an integrated AI assistant. The flagship.",
    features: [
      "Multi-page site",
      "Custom 3D experiences",
      "Integrated AI agent",
      "CMS + analytics",
      "Performance tuned",
    ],
    featured: true,
  },
  {
    name: "Custom",
    price: "Let's talk",
    desc: "Something ambitious? Web apps, dashboards, deeper AI. Scoped to you.",
    features: ["Web apps", "Advanced AI agents", "Integrations", "Ongoing support"],
    featured: false,
  },
];

export function Pricing() {
  const { runAction } = useSiteActions();
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Built for your scope"
            subtitle="Every project is custom. Here's roughly how it breaks down. Use the chat to get a tailored quote."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-7 ${
                  t.featured
                    ? "glow border-accent/50 bg-gradient-to-b from-accent/[0.08] to-transparent"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-accent to-accent-2 px-3 py-1 text-xs font-medium text-black">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="mt-3 text-3xl font-semibold tracking-tight">
                  {t.price}
                </div>
                <p className="mt-3 text-sm text-zinc-400">{t.desc}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-zinc-300">
                      <span className="text-accent">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => runAction("openAppointmentBooking")}
                  className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-medium transition-transform hover:scale-[1.03] ${
                    t.featured
                      ? "bg-white text-black"
                      : "border border-white/15 text-white hover:bg-white/5"
                  }`}
                >
                  Get a quote
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { runAction } = useSiteActions();
  return (
    <section id="contact" className="relative py-28">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="glow relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-10 text-center sm:p-16">
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />
            <div className="relative">
              <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Let&apos;s build something{" "}
                <span className="gradient-text">unforgettable</span>.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-zinc-400">
                Tell me about your project. The fastest way is the chat in the
                corner, or reach me directly.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => runAction("openAppointmentBooking")}
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-105"
                >
                  Book a call
                </button>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  Email me
                </a>
                {siteConfig.instagram ? (
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                  >
                    Instagram
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-black">
            O
          </span>
          <span>{siteConfig.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${siteConfig.email}`}
            className="transition-colors hover:text-white"
          >
            {siteConfig.email}
          </a>
          {siteConfig.instagram ? (
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Instagram
            </a>
          ) : null}
        </div>
        <p>© {new Date().getFullYear()} — Built with Next.js, 3D & AI.</p>
      </div>
    </footer>
  );
}
