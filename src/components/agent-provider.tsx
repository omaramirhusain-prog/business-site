"use client";

import { createAgentProvider } from "@ais-os/site-agent";
import { useSiteActions } from "@/lib/actions/registry";
import { inferActionsFromUserText } from "@/lib/agent/infer-intent";

export const { AgentProvider, useAgent } = createAgentProvider({
  useRunAction: () => useSiteActions().runAction,
  inferActions: inferActionsFromUserText,
});
