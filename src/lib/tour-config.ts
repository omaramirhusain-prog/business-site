import type { GuidedTourStep } from "@ais-os/site-agent";

export const siteTourSteps: GuidedTourStep[] = [
  {
    section: "home",
    message:
      "Welcome. This is a premium portfolio site with a 3D hero and a voice assistant — the same stack I build for clients.",
    delayMs: 800,
  },
  {
    section: "services",
    message:
      "Here are the services: 3D and motion, integrated AI, performance, and design. Every site is custom.",
    delayMs: 1000,
  },
  {
    section: "work",
    message: "Selected projects and case studies. This site itself is the first portfolio piece.",
    delayMs: 1000,
  },
  {
    section: "pricing",
    voiceId: "tier-signature",
    message:
      "Pricing is scoped per project. Signature is the flagship tier with multi-page sites and an integrated AI agent.",
    delayMs: 1200,
  },
  {
    section: "faq",
    message:
      "Common questions about timelines, pricing, and AI assistants. Or just ask me directly.",
    delayMs: 1000,
  },
  {
    section: "contact",
    message:
      "Ready to start? Say book a call, or tell me about your project and I'll capture your details.",
    delayMs: 800,
  },
];
