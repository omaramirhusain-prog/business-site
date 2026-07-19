export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  keywords?: string[];
};

export const siteFaq: FaqItem[] = [
  {
    id: "how-long",
    question: "How long will my detail take?",
    answer:
      "An Essential detail usually takes 2–3 hours, Signature takes 4–6 hours, and paint correction or ceramic coating may require 1–2 days. We confirm timing after inspecting your vehicle.",
    keywords: ["time", "how long", "duration"],
  },
  {
    id: "ceramic",
    question: "Is ceramic coating worth it?",
    answer:
      "Ceramic coating is a strong fit if you want durable gloss, easier maintenance washes, UV resistance, and chemical protection. It does not prevent rock chips or make paint scratch-proof, and we will never claim that it does.",
    keywords: ["ceramic", "coating", "protection"],
  },
  {
    id: "mobile",
    question: "Do you offer mobile detailing?",
    answer:
      "Maintenance and fleet services can be performed mobile within our Austin service area when power, water, shade, and safe working space are available. Correction and coating work is completed in our controlled studio.",
    keywords: ["mobile", "at home", "come to me"],
  },
  {
    id: "weather",
    question: "What happens if it rains after my appointment?",
    answer:
      "Rain will not undo a completed detail or cured coating. For fresh ceramic coatings, we keep the vehicle through the initial cure window and provide simple aftercare instructions before handoff.",
    keywords: ["rain", "weather", "aftercare"],
  },
  {
    id: "belongings",
    question: "How should I prepare my vehicle?",
    answer:
      "Remove personal belongings, child seats, and valuables where possible. Please point out delicate trim, prior repairs, or specific concerns at drop-off. We handle the rest.",
    keywords: ["prepare", "before appointment", "belongings"],
  },
  {
    id: "pricing",
    question: "Why might the final price change?",
    answer:
      "Vehicle size, condition, heavy pet hair, biohazards, excessive soil, and the level of paint correction can affect pricing. We inspect first and get your approval before adding any work.",
    keywords: ["price", "cost", "extra", "pricing"],
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
