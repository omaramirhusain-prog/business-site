import type { SectionMap } from "./types";

export function readSectionText(
  sectionKey: string,
  sections: SectionMap,
  maxChars = 2000
): string {
  if (typeof document === "undefined") {
    return "Section content is only available in the browser.";
  }

  const mapped = sections[sectionKey];
  const id = mapped?.id ?? sectionKey;
  const el = document.getElementById(id);

  if (!el) {
    return `Could not find the ${sectionKey} section.`;
  }

  const text = el.innerText.replace(/\s+/g, " ").trim();
  if (!text) {
    return `The ${sectionKey} section appears empty.`;
  }

  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}
