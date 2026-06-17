"use client";

import { useCallback, useRef, useState } from "react";
import { setTourActive } from "./tour-state";
import { getVoiceControl } from "./voice-control";

export type GuidedTourStep = {
  section?: string;
  voiceId?: string;
  message: string;
  /** Wait after navigation before speaking (scroll settle). */
  delayMs?: number;
};

export type UseGuidedTourOptions = {
  steps: GuidedTourStep[];
  navigate: (section: string) => void;
  highlight?: (voiceId: string) => void;
  speak?: (text: string) => Promise<void>;
  delayBetweenStepsMs?: number;
};

export function useGuidedTour(options: UseGuidedTourOptions) {
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);
  const lockRef = useRef(false);

  const cancelTour = useCallback(() => {
    cancelRef.current = true;
    lockRef.current = false;
    setRunning(false);
    setTourActive(false);
  }, []);

  const startTour = useCallback(async () => {
    if (lockRef.current) {
      return "Tour is already running — follow along or say stop to interrupt.";
    }

    cancelRef.current = false;
    lockRef.current = true;
    setRunning(true);
    setTourActive(true);

    try {
      for (const step of options.steps) {
        if (cancelRef.current) break;

        if (step.section) {
          options.navigate(step.section);
        }
        if (step.voiceId) {
          options.highlight?.(step.voiceId);
        }

        const settleMs = step.delayMs ?? options.delayBetweenStepsMs ?? 1400;
        await new Promise((r) => setTimeout(r, settleMs));

        if (cancelRef.current) break;

        if (options.speak) {
          try {
            await options.speak(step.message);
          } catch {
            /* tour continues; voice hook surfaces errors */
          }
        }
      }

      if (cancelRef.current) {
        return "Tour stopped.";
      }

      return "Tour complete. Ask me anything or say book a call when you're ready.";
    } finally {
      lockRef.current = false;
      setRunning(false);
      setTourActive(false);
      cancelRef.current = false;
      getVoiceControl()?.resumeListening?.();
    }
  }, [options]);

  return { running, startTour, cancelTour };
}
