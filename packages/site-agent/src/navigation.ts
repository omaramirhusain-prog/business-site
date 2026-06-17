import type { SectionMap } from "./types";

export function resolveSection(
  sections: SectionMap,
  target: string
): string | null {
  const t = target.toLowerCase().trim();
  for (const key of Object.keys(sections)) {
    const s = sections[key];
    if (key === t || s.id === t || s.aliases.some((a) => t.includes(a))) {
      return s.id;
    }
  }
  return null;
}

export function scrollToSection(
  target: string,
  sections: SectionMap,
  flashClass = "section-flash"
) {
  if (typeof document === "undefined") return;
  const id = resolveSection(sections, target) ?? target;

  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add(flashClass);
    window.setTimeout(() => el.classList.remove(flashClass), 1400);
  });
}

export function scrollPage(direction: "up" | "down" | "top") {
  if (typeof window === "undefined") return;
  if (direction === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const amount =
    direction === "down" ? window.innerHeight * 0.85 : -window.innerHeight * 0.85;
  window.scrollBy({ top: amount, behavior: "smooth" });
}
