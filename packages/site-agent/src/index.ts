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
  isStopSpeakingCommand,
  isRepeatCommand,
  VOICE_HINT_END,
  VOICE_HINT_START,
  type VoiceCommandConfig,
} from "./voice-commands";
export {
  registerVoiceControl,
  getVoiceControl,
  type VoiceControlApi,
} from "./voice-control";
export { splitIntoSentences, StreamingTtsPlayer } from "./streaming-tts";
export { highlightElementByVoiceId } from "./highlight-element";
export { readSectionText } from "./read-section";
export { useGuidedTour, type GuidedTourStep, type UseGuidedTourOptions } from "./use-guided-tour";
export {
  useVoiceProactivePrompts,
  type ProactivePromptConfig,
} from "./use-voice-proactive-prompts";
export { prefersServerStt } from "./use-speech-recognition";
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
