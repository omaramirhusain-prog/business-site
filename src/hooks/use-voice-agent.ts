"use client";

import { createUseVoiceAgent, getToolConfirmation } from "@ais-os/site-agent";
import { useAgent } from "@/components/agent-provider";
import { useSiteActions } from "@/lib/actions/registry";
import { toolConfirmations } from "@/lib/agent/tool-confirmations";

export const useVoiceAgent = createUseVoiceAgent({
  useAgent,
  useOpenChat: () => useSiteActions().setChatOpen,
  getToolConfirmation: (messages) => getToolConfirmation(messages, toolConfirmations),
  voiceCommandNames: ["omar"],
});

export type { VoicePhase } from "@ais-os/site-agent";
