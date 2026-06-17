export type {
  ActionDefinition,
  ActionResult,
  InferredAction,
  SectionMap,
  SiteAction,
  ToolConfirmationFn,
  ToolConfirmationMap,
} from "./types";

export { buildToolsFromDefinitions } from "./build-tools";
export { resolveSection, scrollToSection, scrollPage } from "./navigation";
export { createActionsFromDefinitions, runAction } from "./run-action";
export {
  extractMessageText,
  extractLastAssistantText,
  isToolTurnInProgress,
  getToolConfirmation,
} from "./extract-text";
export {
  isEndConversationCommand,
  isStartConversationCommand,
  VOICE_HINT_END,
  VOICE_HINT_START,
  type VoiceCommandConfig,
} from "./voice-commands";
export {
  createAgentProvider,
  type CreateAgentProviderOptions,
  type RunActionFn,
} from "./agent-provider";
export { useSpeechRecognition } from "./use-speech-recognition";
export {
  createUseVoiceAgent,
  type VoicePhase,
  type UseVoiceAgentConfig,
} from "./use-voice-agent";
