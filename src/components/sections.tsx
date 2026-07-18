"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Armchair,
  BriefcaseBusiness,
  Car,
  Check,
  Clock,
  Gauge,
  HeartHandshake,
  MapPin,
  Phone,
  Quote,
  Shield,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { QuoteForm } from "@/components/quote-form";
import { useSiteActions } from "@/lib/actions/registry";
import { siteConfig } from "@/lib/site-config";
import { siteFaq } from "@/lib/faq";

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <div
        className={`mb-4 flex items-center gap-3 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-8 bg-accent" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

const trustPoints = [
  ["4.9 / 5", "180+ verified reviews"],
  ["6+ years", "Detailing Austin"],
  ["100%", "Satisfaction promise"],
  ["3–7 years", "Coating protection"],
];

export function TrustStrip() {
  return (
    <section aria-label="Why drivers trust Northline" className="border-y border-white/8 bg-white/[0.015]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 lg:grid-cols-4 lg:px-10">
        {trustPoints.map(([value, label], index) => (
          <div
            key={value}
            className={`py-7 ${
              index % 2 === 0 ? "border-r border-white/8" : ""
            } ${index > 1 ? "border-t border-white/8 lg:border-t-0" : ""} ${
              index > 0 ? "lg:border-l lg:border-white/8 lg:pl-8" : ""
            }`}
          >
            <div className="text-xl font-semibold tracking-tight text-white">{value}</div>
            <div className="mt-1 text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const services = [
  {
    icon: Car,
    title: "Exterior Reset",
    price: "From $189",
    body: "Hand wash, chemical decontamination, clay treatment, wheel detail, and a gloss sealant.",
  },
  {
    icon: Armchair,
    title: "Interior Revival",
    price: "From $219",
    body: "Deep vacuum, steam cleaning, stain treatment, leather care, and odor neutralization.",
  },
  {
    icon: Sparkles,
    title: "Paint Correction",
    price: "From $449",
    body: "Measured one- or two-stage polishing to remove swirls, oxidation, haze, and light defects.",
  },
  {
    icon: Shield,
    title: "Ceramic Coating",
    price: "From $799",
    body: "Professional 3–7 year coatings with paint prep, infrared curing, and aftercare support.",
  },
  {
    icon: Waves,
    title: "Maintenance Detail",
    price: "From $129",
    body: "A recurring inside-and-out reset for protected vehicles that always need to look ready.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Fleet & Business",
    price: "Custom plans",
    body: "Reliable on-site care and simple recurring billing for executive, rental, and sales fleets.",
  },
];

export function Services() {
  const { runAction } = useSiteActions();

  return (
    <section id="services" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Detailing services"
              title="Every surface, considered."
              subtitle="Choose a focused service or let us build the right treatment around your vehicle."
              align="left"
            />
            <button
              onClick={() => runAction("openAppointmentBooking")}
              className="group inline-flex w-fit items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium text-white transition-colors hover:border-accent hover:text-accent"
            >
              Get a recommendation
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.05}>
              <article className="service-card group h-full bg-background p-7 sm:p-8">
                <div className="mb-10 flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-accent transition-colors group-hover:border-accent/50 group-hover:bg-accent/10">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-zinc-500">{service.price}</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{service.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const results = [
  {
    name: "Studio Finish",
    service: "Paint inspection + ceramic protection",
    stat: "Deep gloss restored",
    image: "/car-studio.jpg",
    position: "center",
  },
  {
    name: "Precision Wash",
    service: "Safe decontamination + hand wash",
    stat: "Contact-safe clean",
    image: "/car-wash.jpg",
    position: "center",
  },
  {
    name: "Surface Correction",
    service: "Machine polish + defect removal",
    stat: "Clarity recovered",
    image: "/car-polish.jpg",
    position: "center",
  },
];

export function Results() {
  return (
    <section id="results" className="relative overflow-hidden py-28 sm:py-36">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/8" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Recent transformations"
            title="The finish speaks first."
            subtitle="Correction you can see. Protection you feel every time the water beads."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {results.map((result, index) => (
            <Reveal key={result.name} delay={index * 0.08}>
              <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="result-visual relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={result.image}
                    alt={`${result.name} real-world auto detailing result`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    style={{ objectPosition: result.position }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
                  <div className="absolute inset-0 result-lines opacity-25" />
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-white/70 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Real studio work
                  </div>
                  <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
                    <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] backdrop-blur">
                      {result.stat}
                    </span>
                    <span className="text-5xl font-light text-white/20">0{index + 1}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{result.name}</h3>
                  <p className="mt-1.5 text-sm text-zinc-500">{result.service}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const reviews = [
  {
    quote:
      "My black 911 looked better than the day I picked it up. They explained every step, found defects I had missed, and the finish is unreal.",
    name: "Marcus T.",
    vehicle: "Porsche 911 Carrera",
  },
  {
    quote:
      "Two kids and a golden retriever had taken over the interior. Northline somehow made it feel new again—without leaving it soaked or perfumed.",
    name: "Elena R.",
    vehicle: "Volvo XC90",
  },
  {
    quote:
      "The booking was easy, the updates were clear, and there were no surprise add-ons. Six months later, the coating still beads like day one.",
    name: "David K.",
    vehicle: "Rivian R1T",
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="border-y border-white/8 bg-white/[0.015] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Driver stories" title="Trusted with the cars they love." align="left" />
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="flex gap-0.5 text-accent">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </span>
              4.9 average rating
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-background p-7">
                <Quote className="h-7 w-7 text-accent" />
                <blockquote className="mt-7 flex-1 text-lg leading-8 text-zinc-200">
                  “{review.quote}”
                </blockquote>
                <figcaption className="mt-9 border-t border-white/8 pt-5">
                  <div className="font-medium text-white">{review.name}</div>
                  <div className="mt-1 text-xs text-zinc-500">{review.vehicle}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const packages = [
  {
    name: "Essential",
    price: "$189",
    note: "A disciplined reset",
    duration: "2–3 hours",
    features: [
      "Foam pre-wash + hand wash",
      "Wheels, tires, and jambs",
      "Interior vacuum + wipe-down",
      "3-month paint sealant",
    ],
  },
  {
    name: "Signature",
    price: "$349",
    note: "Our complete inside-out detail",
    duration: "4–6 hours",
    featured: true,
    features: [
      "Everything in Essential",
      "Clay + iron decontamination",
      "Steam and stain treatment",
      "Leather clean + condition",
      "6-month ceramic sealant",
    ],
  },
  {
    name: "Preservation",
    price: "$799",
    note: "Correct, coat, and keep",
    duration: "1–2 days",
    features: [
      "Full Signature preparation",
      "Single-stage paint correction",
      "3-year ceramic coating",
      "Glass + wheel-face coating",
      "Annual coating inspection",
    ],
  },
];

export function Pricing() {
  const { runAction } = useSiteActions();

  return (
    <section id="packages" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Detail packages"
            title="Straightforward care. No mystery menu."
            subtitle="Final pricing depends on vehicle size and condition. You approve every recommendation before we begin."
          />
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {packages.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.08}>
              <article
                className={`relative flex h-full flex-col rounded-3xl border p-7 sm:p-8 ${
                  item.featured
                    ? "border-accent/50 bg-accent/[0.055] shadow-[0_0_80px_-38px_var(--accent)]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {item.featured ? (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0a0d0e]">
                    Most booked
                  </span>
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{item.name}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{item.note}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-zinc-400">
                    {item.duration}
                  </span>
                </div>
                <div className="mt-9">
                  <span className="text-sm text-zinc-500">From </span>
                  <span className="text-4xl font-semibold tracking-[-0.04em]">{item.price}</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3.5">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => runAction("openAppointmentBooking")}
                  className={`mt-9 rounded-full px-5 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    item.featured
                      ? "bg-accent text-[#090c0d]"
                      : "border border-white/15 text-white hover:bg-white/5"
                  }`}
                >
                  Choose {item.name}
                </button>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-zinc-600">
          Oversize vehicles, heavy pet hair, excessive soil, and paint correction may affect final pricing.
        </p>
      </div>
    </section>
  );
}

export function PromiseSection() {
  const promises = [
    [Gauge, "Measured work", "Paint depth, lighting, and product dwell times—not guesswork."],
    [HeartHandshake, "No-pressure advice", "We recommend only what your vehicle actually needs."],
    [Shield, "Insured & guaranteed", "Fully insured care backed by our satisfaction promise."],
  ] as const;

  return (
    <section className="pb-28 sm:pb-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1213]">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            <Reveal className="p-8 sm:p-12">
              <SectionHeading
                eyebrow="The Northline standard"
                title="Care without shortcuts."
                subtitle="Your vehicle is inspected, documented, and treated by a trained detailer from arrival to handoff."
                align="left"
              />
            </Reveal>
            <div className="grid border-t border-white/8 lg:border-l lg:border-t-0">
              {promises.map(([Icon, title, body]) => (
                <div key={title} className="flex gap-5 border-b border-white/8 p-7 last:border-b-0 sm:p-8">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-400">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
        <Reveal>
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              eyebrow="Good to know"
              title="Questions before the keys change hands."
              subtitle="Still unsure what to book? Send a few photos and we’ll recommend the right starting point."
              align="left"
            />
            <a
              href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.phone}
            </a>
          </div>
        </Reveal>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {siteFaq.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.04}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium marker:hidden">
                  {item.question}
                  <span className="text-2xl font-light text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pr-12 pt-4 text-sm leading-7 text-zinc-400">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/8 py-28 sm:py-36">
      <div className="absolute -bottom-60 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/10 blur-[150px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <Reveal>
          <div>
            <SectionHeading
              eyebrow="Request your detail"
              title="Tell us what you drive."
              subtitle="Share your vehicle, goals, and preferred date. We’ll reply with the right service and a clear estimate."
              align="left"
            />
            <div className="mt-10 space-y-5 border-t border-white/10 pt-8 text-sm">
              <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-4 text-zinc-300 hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 text-accent" />
                <span>
                  <span className="block text-xs text-zinc-600">Call or text</span>
                  <span className="mt-1 block">{siteConfig.phone}</span>
                </span>
              </a>
              <div className="flex items-start gap-4 text-zinc-300">
                <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                <span>
                  <span className="block text-xs text-zinc-600">Studio</span>
                  <span className="mt-1 block">{siteConfig.address}</span>
                </span>
              </div>
              <div className="flex items-start gap-4 text-zinc-300">
                <Clock className="mt-0.5 h-4 w-4 text-accent" />
                <span>
                  <span className="block text-xs text-zinc-600">Hours</span>
                  <span className="mt-1 block">Mon–Sat, 8:00am–6:00pm</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <QuoteForm />
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06090a] py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-accent/40 text-xs font-bold text-accent">
              N
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.14em]">NORTHLINE</span>
              <span className="block text-[9px] uppercase tracking-[0.26em] text-zinc-600">Detail Co.</span>
            </span>
          </a>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#process" className="hover:text-white">Process</a>
            <a href="#packages" className="hover:text-white">Packages</a>
            <a href="#results" className="hover:text-white">Results</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-white/8 pt-6 text-[11px] text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Fully insured.</p>
          <p>Austin, Texas · By appointment</p>
        </div>
      </div>
    </footer>
  );
}
