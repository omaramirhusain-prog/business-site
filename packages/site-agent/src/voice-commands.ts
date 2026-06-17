export type VoiceCommandConfig = {
  startNamePatterns?: string[];
};

const DEFAULT_END_PATTERNS = [
  /^(\s*(ok(ay)?|alright),?\s*)?(end|stop|close|exit|cancel)\s+(the\s+)?(conversation|chat|session)\s*\.?$/i,
  /^(\s*(that('s| is)|i'm)\s+(all|done|it|everything))\s*\.?$/i,
  /^(goodbye|good bye|bye|see you|talk later|never mind|nevermind)\s*\.?$/i,
  /^stop listening\s*\.?$/i,
  /^stop\s*\.?$/i,
];

function buildStartPatterns(names: string[] = []) {
  const nameGroup =
    names.length > 0
      ? `(assistant|${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}|there)`
      : "(assistant|there)";
  return [
    new RegExp(`^(hey|hi|hello|ok)\\s+${nameGroup}\\s*\\.?$`, "i"),
    /^start (the )?(conversation|chat|session)\s*\.?$/i,
    /^talk to me\s*\.?$/i,
    /^i('m| am) (ready|listening|here)\s*\.?$/i,
  ];
}

const STOP_SPEAKING_PATTERNS = [
  /^(\s*(ok(ay)?|alright),?\s*)?(stop|pause|quiet|shush|hold on|wait)\s*(talking|speaking)?\s*\.?$/i,
  /^stop\s*\.?$/i,
  /^be quiet\s*\.?$/i,
];

const REPEAT_PATTERNS = [
  /^(say that again|repeat( that)?|what did you say|come again)\s*\.?$/i,
  /^repeat\s*\.?$/i,
];

export function isStopSpeakingCommand(text: string): boolean {
  const t = text.trim();
  return STOP_SPEAKING_PATTERNS.some((p) => p.test(t));
}

export function isRepeatCommand(text: string): boolean {
  const t = text.trim();
  return REPEAT_PATTERNS.some((p) => p.test(t));
}

export function isEndConversationCommand(text: string): boolean {
  const t = text.trim();
  return DEFAULT_END_PATTERNS.some((p) => p.test(t));
}

export function isStartConversationCommand(
  text: string,
  config: VoiceCommandConfig = {}
): boolean {
  const t = text.trim();
  return buildStartPatterns(config.startNamePatterns).some((p) => p.test(t));
}

export const VOICE_HINT_START = 'Say "start conversation" or tap the mic';
export const VOICE_HINT_END = 'Say "end conversation" to stop';
