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
