"use client";

import { useEffect, useRef } from "react";

export type ProactivePromptConfig = {
  /** First-visit onboarding after idle ms */
  firstVisitIdleMs?: number;
  firstVisitMessage?: string;
  /** localStorage key to track visits */
  visitKey?: string;
  /** Speak callback */
  speak: (text: string) => Promise<void>;
  /** Whether voice is ready */
  enabled?: boolean;
  /** Skip if already in conversation */
  isInConversation: () => boolean;
};

export function useVoiceProactivePrompts(config: ProactivePromptConfig) {
  const firedRef = useRef(false);
  const visitKey = config.visitKey ?? "site-agent-visited";
  const idleMs = config.firstVisitIdleMs ?? 8000;
  const message =
    config.firstVisitMessage ??
    "I'm the site assistant. Say give me a tour, show pricing, or book a call.";

  useEffect(() => {
    if (config.enabled === false) return;
    if (firedRef.current) return;
    if (typeof window === "undefined") return;

    const visited = localStorage.getItem(visitKey);
    if (visited) return;

    const timer = setTimeout(() => {
      if (firedRef.current) return;
      if (config.isInConversation()) return;

      firedRef.current = true;
      localStorage.setItem(visitKey, "1");
      void config.speak(message);
    }, idleMs);

    return () => clearTimeout(timer);
  }, [config, idleMs, message, visitKey]);
}
