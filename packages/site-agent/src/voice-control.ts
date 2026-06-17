/** Shared bridge so action handlers can control the voice agent. */

export type VoiceControlApi = {
  repeatLast: () => Promise<string>;
  stopSpeaking: () => string;
  getLastSpokenText: () => string | null;
  speakDirect: (text: string) => Promise<void>;
  resumeListening?: () => void;
};

let voiceControl: VoiceControlApi | null = null;

export function registerVoiceControl(api: VoiceControlApi | null) {
  voiceControl = api;
}

export function getVoiceControl(): VoiceControlApi | null {
  return voiceControl;
}
