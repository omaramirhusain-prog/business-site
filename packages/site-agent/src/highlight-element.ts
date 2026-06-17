const HIGHLIGHT_CLASS = "voice-highlight";

export function highlightElementByVoiceId(
  voiceId: string,
  durationMs = 3500
): string {
  if (typeof document === "undefined") {
    return `Cannot highlight "${voiceId}" on the server.`;
  }

  const el = document.querySelector(`[data-voice-id="${voiceId}"]`);
  if (!el) {
    return `Could not find "${voiceId}" on the page.`;
  }

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add(HIGHLIGHT_CLASS);

  window.setTimeout(() => {
    el.classList.remove(HIGHLIGHT_CLASS);
  }, durationMs);

  const label =
    el.getAttribute("aria-label") ??
    el.getAttribute("data-voice-label") ??
    voiceId;

  return `Highlighted ${label}.`;
}
