"use client";

import { useCallback, useRef, useState } from "react";

export type GuidedTourStep = {
  section?: string;
  voiceId?: string;
  message: string;
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

  const cancelTour = useCallback(() => {
    cancelRef.current = true;
    setRunning(false);
  }, []);

  const startTour = useCallback(async () => {
    if (running) {
      cancelTour();
      return "Tour cancelled.";
    }

    cancelRef.current = false;
    setRunning(true);

    for (const step of options.steps) {
      if (cancelRef.current) break;

      if (step.section) {
        options.navigate(step.section);
      }
      if (step.voiceId) {
        options.highlight?.(step.voiceId);
      }

      const wait = step.delayMs ?? options.delayBetweenStepsMs ?? 1200;
      await new Promise((r) => setTimeout(r, wait));

      if (cancelRef.current) break;

      if (options.speak) {
        await options.speak(step.message);
      }
    }

    setRunning(false);
    cancelRef.current = false;
    return "Tour complete. Ask me anything or say book a call when you're ready.";
  }, [running, cancelTour, options]);

  return { running, startTour, cancelTour };
}
