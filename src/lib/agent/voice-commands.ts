/** Voice commands to open / close a continuous conversation session. */

const END_PATTERNS = [
  /^(\s*(ok(ay)?|alright),?\s*)?(end|stop|close|exit|cancel)\s+(the\s+)?(conversation|chat|session)\s*\.?$/i,
  /^(\s*(that('s| is)|i'm)\s+(all|done|it|everything))\s*\.?$/i,
  /^(goodbye|good bye|bye|see you|talk later|never mind|nevermind)\s*\.?$/i,
  /^stop listening\s*\.?$/i,
  /^stop\s*\.?$/i,
];

const START_PATTERNS = [
  /^(hey|hi|hello|ok)\s+(assistant|omar|there)\s*\.?$/i,
  /^start (the )?(conversation|chat|session)\s*\.?$/i,
  /^talk to me\s*\.?$/i,
  /^i('m| am) (ready|listening|here)\s*\.?$/i,
];

export function isEndConversationCommand(text: string): boolean {
  const t = text.trim();
  return END_PATTERNS.some((p) => p.test(t));
}

export function isStartConversationCommand(text: string): boolean {
  const t = text.trim();
  return START_PATTERNS.some((p) => p.test(t));
}

export const VOICE_HINT_START = 'Say "start conversation" or tap the mic';
export const VOICE_HINT_END = 'Say "end conversation" to stop';
