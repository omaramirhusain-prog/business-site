export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  keywords?: string[];
};

export const siteFaq: FaqItem[] = [
  {
    id: "what-you-build",
    question: "What kind of websites do you build?",
    answer:
      "Premium custom sites with 3D animation, integrated AI assistants, and modern UX. Landing pages, multi-page sites, and ambitious web apps.",
    keywords: ["what do you build", "services", "websites"],
  },
  {
    id: "pricing",
    question: "How much does a website cost?",
    answer:
      "Every project is scoped custom. Landing pages, full multi-page sites with AI, and custom web apps are priced based on scope. Book a discovery call for a tailored quote.",
    keywords: ["price", "cost", "how much", "pricing"],
  },
  {
    id: "timeline",
    question: "How long does a project take?",
    answer:
      "Timelines depend on scope. A focused landing page can ship in a few weeks; a full site with 3D and AI typically takes longer. We'll nail down timing on the discovery call.",
    keywords: ["timeline", "how long", "delivery"],
  },
  {
    id: "ai-assistant",
    question: "Can my site have a voice assistant like this one?",
    answer:
      "Yes. Integrated voice and chat agents are a core part of what I build. Visitors can navigate, book, and get answers hands-free.",
    keywords: ["voice", "ai assistant", "chatbot"],
  },
  {
    id: "process",
    question: "What is your process?",
    answer:
      "Discovery to understand your goals, design and build in tight loops with early previews, then launch and refine. The assistant on this site can book the first discovery call.",
    keywords: ["process", "how it works", "workflow"],
  },
];

export function findFaqAnswer(query: string): FaqItem | null {
  const t = query.toLowerCase();
  for (const item of siteFaq) {
    if (t.includes(item.question.toLowerCase())) return item;
    if (item.keywords?.some((k) => t.includes(k))) return item;
  }
  return null;
}
