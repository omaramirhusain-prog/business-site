/** Split assistant text into speakable sentence chunks. */
export function splitIntoSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) return [trimmed];

  return parts.map((s) => s.trim()).filter(Boolean);
}

export type StreamingTtsOptions = {
  ttsEndpoint: string;
  onSentenceStart?: (index: number) => void;
  onComplete?: () => void;
  onError?: (err: Error) => void;
  speechRate?: number;
};

function speakWithBrowser(text: string, rate = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis unavailable"));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));
    window.speechSynthesis.speak(utterance);
  });
}

async function fetchAndPlayAudio(
  text: string,
  ttsEndpoint: string,
  audioRef: { current: HTMLAudioElement | null },
  cancelled: () => boolean
): Promise<boolean> {
  const res = await fetch(ttsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return false;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      void audio.play().catch(reject);
    });
    return true;
  } catch {
    if (cancelled()) return false;
    return false;
  } finally {
    URL.revokeObjectURL(url);
    audioRef.current = null;
  }
}

export class StreamingTtsPlayer {
  private cancelled = false;
  private audioRef: { current: HTMLAudioElement | null } = { current: null };
  private options: StreamingTtsOptions;

  constructor(options: StreamingTtsOptions) {
    this.options = options;
  }

  cancel() {
    this.cancelled = true;
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    if (this.audioRef.current) {
      this.audioRef.current.pause();
      this.audioRef.current = null;
    }
  }

  isCancelled() {
    return this.cancelled;
  }

  async speak(text: string): Promise<void> {
    this.cancelled = false;
    const sentences = splitIntoSentences(text);
    const chunks = sentences.length > 0 ? sentences : [text.trim()];
    const rate = this.options.speechRate ?? 1;

    for (let i = 0; i < chunks.length; i++) {
      if (this.cancelled) return;

      const sentence = chunks[i];
      this.options.onSentenceStart?.(i);

      try {
        const usedElevenLabs = await fetchAndPlayAudio(
          sentence,
          this.options.ttsEndpoint,
          this.audioRef,
          () => this.cancelled
        );
        if (this.cancelled) return;

        if (!usedElevenLabs) {
          if (typeof window !== "undefined") {
            window.speechSynthesis?.cancel();
          }
          await speakWithBrowser(sentence, rate);
        }
      } catch (err) {
        if (!this.cancelled) {
          this.options.onError?.(
            err instanceof Error ? err : new Error("TTS playback failed")
          );
        }
        return;
      }
    }

    if (!this.cancelled) {
      this.options.onComplete?.();
    }
  }
}
