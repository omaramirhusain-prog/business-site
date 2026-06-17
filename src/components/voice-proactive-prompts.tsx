"use client";

import { useVoiceProactivePrompts } from "@ais-os/site-agent";
import { useVoiceAgent } from "@/hooks/use-voice-agent";

export function VoiceProactivePrompts() {
  const { speakDirect, inConversation } = useVoiceAgent();

  useVoiceProactivePrompts({
    speak: speakDirect,
    isInConversation: () => inConversation,
    firstVisitMessage:
      "Hi, I'm Omar's assistant. Say give me a tour, show pricing, or book a call whenever you're ready.",
    firstVisitIdleMs: 8000,
  });

  return null;
}
