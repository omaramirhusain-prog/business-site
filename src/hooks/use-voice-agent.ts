"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAgent } from "@/components/agent-provider";
import { useSiteActions } from "@/lib/actions/registry";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import {
  extractLastAssistantText,
  getToolConfirmation,
  isToolTurnInProgress,
} from "@/lib/agent/extract-text";
import {
  isEndConversationCommand,
  isStartConversationCommand,
  VOICE_HINT_END,
  VOICE_HINT_START,
} from "@/lib/agent/voice-commands";

export type VoicePhase = "idle" | "listening" | "thinking" | "speaking";

const MIC_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone blocked — allow access in your browser settings, then tap the mic.",
  "service-not-allowed": "Microphone not allowed on this page. Tap the mic to try again.",
  "no-speech": "",
  aborted: "",
};

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis unavailable"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));
    window.speechSynthesis.speak(utterance);
  });
}

async function speakWithElevenLabs(text: string): Promise<boolean> {
  const res = await fetch("/api/tts", {
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
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      void audio.play().catch(reject);
    });
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function useVoiceAgent() {
  const { messages, sendMessage, status, error: chatError } = useAgent();
  const { setChatOpen } = useSiteActions();
  const { supported, listening, interim, start, stop } = useSpeechRecognition();

  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [inConversation, setInConversation] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [awaitingStart, setAwaitingStart] = useState(true);

  const inConversationRef = useRef(false);
  const voiceTurnRef = useRef(false);
  const messageCountAtSendRef = useRef(0);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeListenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginListeningRef = useRef<() => void>(() => {});
  const endConversationRef = useRef<(silent?: boolean) => void>(() => {});
  const startConversationRef = useRef<() => void>(() => {});
  const busyRef = useRef(false);
  const userGestureRef = useRef(false);

  const busy = status === "submitted" || status === "streaming";
  busyRef.current = busy;

  const clearThinkingTimeout = useCallback(() => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
  }, []);

  const clearResumeListenTimer = useCallback(() => {
    if (resumeListenTimerRef.current) {
      clearTimeout(resumeListenTimerRef.current);
      resumeListenTimerRef.current = null;
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }, []);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const scheduleResumeListening = useCallback(() => {
    clearResumeListenTimer();
    if (!inConversationRef.current) return;

    resumeListenTimerRef.current = setTimeout(() => {
      resumeListenTimerRef.current = null;
      if (inConversationRef.current && !voiceTurnRef.current) {
        beginListeningRef.current();
      }
    }, 450);
  }, [clearResumeListenTimer]);

  const endConversation = useCallback(
    (silent = false) => {
      inConversationRef.current = false;
      setInConversation(false);
      clearFallbackTimer();
      clearThinkingTimeout();
      clearResumeListenTimer();
      voiceTurnRef.current = false;
      stop();
      cancelSpeech();
      setPhase("idle");
      setVoiceError(null);

      if (!silent) {
        void speakWithBrowser("Conversation ended.");
      }
    },
    [stop, cancelSpeech, clearFallbackTimer, clearThinkingTimeout, clearResumeListenTimer]
  );

  endConversationRef.current = endConversation;

  const resetVoiceTurn = useCallback(
    (message: string) => {
      clearFallbackTimer();
      clearThinkingTimeout();
      voiceTurnRef.current = false;
      setPhase("idle");
      setVoiceError(message);
      if (inConversationRef.current) {
        scheduleResumeListening();
      } else {
        inConversationRef.current = false;
        setInConversation(false);
      }
    },
    [clearFallbackTimer, clearThinkingTimeout, scheduleResumeListening]
  );

  const speak = useCallback(
    async (text: string) => {
      clearFallbackTimer();
      cancelSpeech();
      setPhase("speaking");
      setVoiceError(null);

      try {
        const usedElevenLabs = await speakWithElevenLabs(text);
        if (!usedElevenLabs) {
          await speakWithBrowser(text);
        }
      } catch {
        setVoiceError("Could not play voice response.");
      } finally {
        if (inConversationRef.current) {
          setPhase("idle");
          scheduleResumeListening();
        } else {
          setPhase("idle");
        }
      }
    },
    [cancelSpeech, clearFallbackTimer, scheduleResumeListening]
  );

  const finishVoiceTurn = useCallback(
    (text: string) => {
      clearThinkingTimeout();
      voiceTurnRef.current = false;
      setVoiceError(null);
      void speak(text);
    },
    [speak, clearThinkingTimeout]
  );

  const submitVoiceMessage = useCallback(
    (transcript: string) => {
      setPhase("thinking");
      voiceTurnRef.current = true;
      messageCountAtSendRef.current = messages.length;
      setChatOpen(true);

      clearThinkingTimeout();
      thinkingTimeoutRef.current = setTimeout(() => {
        if (!voiceTurnRef.current) return;
        resetVoiceTurn("Taking too long — try again.");
      }, 20000);

      sendMessage({ text: transcript });
    },
    [messages.length, setChatOpen, sendMessage, clearThinkingTimeout, resetVoiceTurn]
  );

  const handleTranscript = useCallback(
    (transcript: string) => {
      if (isEndConversationCommand(transcript)) {
        endConversationRef.current(false);
        return;
      }

      if (isStartConversationCommand(transcript)) {
        inConversationRef.current = true;
        setInConversation(true);
        setVoiceError(null);
        void speakWithBrowser("I'm listening. What can I help with?");
        scheduleResumeListening();
        return;
      }

      submitVoiceMessage(transcript);
    },
    [submitVoiceMessage, scheduleResumeListening]
  );

  const beginListening = useCallback(() => {
    if (busy || voiceTurnRef.current) return;

    cancelSpeech();
    setVoiceError(null);
    setPhase("listening");

    start(handleTranscript, {
      onEnd: () => {
        if (
          inConversationRef.current &&
          !voiceTurnRef.current &&
          !busyRef.current
        ) {
          scheduleResumeListening();
        }
      },
      onError: (code) => {
        const message = MIC_ERROR_MESSAGES[code];
        if (message) {
          setVoiceError(message);
          setPhase("idle");
          if (!userGestureRef.current) {
            inConversationRef.current = false;
            setInConversation(false);
            setAwaitingStart(true);
          }
        } else if (code === "no-speech" && inConversationRef.current) {
          scheduleResumeListening();
        }
      },
    });
  }, [
    busy,
    cancelSpeech,
    start,
    handleTranscript,
    scheduleResumeListening,
  ]);

  beginListeningRef.current = beginListening;

  const startConversation = useCallback(() => {
    inConversationRef.current = true;
    setInConversation(true);
    setAwaitingStart(false);
    setVoiceError(null);
    beginListening();
  }, [beginListening]);

  startConversationRef.current = startConversation;

  // Handle assistant reply after a voice turn.
  useEffect(() => {
    if (!voiceTurnRef.current) return;

    if (chatError || status === "error") {
      resetVoiceTurn("Assistant error. Try again in a moment.");
      return;
    }

    if (busy) {
      clearFallbackTimer();
      setPhase("thinking");
      return;
    }

    const reply = extractLastAssistantText(messages);
    if (reply) {
      finishVoiceTurn(reply);
      return;
    }

    if (isToolTurnInProgress(messages)) {
      setPhase("thinking");

      if (!fallbackTimerRef.current) {
        fallbackTimerRef.current = setTimeout(() => {
          fallbackTimerRef.current = null;
          if (!voiceTurnRef.current) return;

          const lateReply = extractLastAssistantText(messages);
          if (lateReply) {
            finishVoiceTurn(lateReply);
            return;
          }

          const confirmation = getToolConfirmation(messages);
          if (confirmation) {
            finishVoiceTurn(confirmation);
            return;
          }

          resetVoiceTurn("No response from the assistant. Try again.");
        }, 2000);
      }
      return;
    }

    if (messages.length > messageCountAtSendRef.current) {
      resetVoiceTurn("No response from the assistant. Try again.");
    }
  }, [
    busy,
    messages,
    chatError,
    status,
    finishVoiceTurn,
    resetVoiceTurn,
    clearFallbackTimer,
  ]);

  useEffect(
    () => () => {
      clearFallbackTimer();
      clearThinkingTimeout();
      clearResumeListenTimer();
    },
    [clearFallbackTimer, clearThinkingTimeout, clearResumeListenTimer]
  );

  // Auto-start conversation when the page loads (may need one tap if mic is blocked).
  useEffect(() => {
    if (!supported) return;

    const timer = setTimeout(() => {
      if (!inConversationRef.current) {
        startConversationRef.current();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [supported]);

  // Browsers require a user gesture for mic — first tap anywhere starts listening.
  useEffect(() => {
    if (!supported) return;

    const onFirstGesture = () => {
      userGestureRef.current = true;
      if (!inConversationRef.current) {
        startConversationRef.current();
      } else {
        beginListeningRef.current();
      }
    };

    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstGesture);
  }, [supported]);

  const toggleListening = useCallback(() => {
    userGestureRef.current = true;
    setVoiceError(null);
    clearFallbackTimer();

    if (inConversationRef.current) {
      endConversation(true);
      setAwaitingStart(true);
      return;
    }

    if (listening || phase === "listening") {
      stop();
      setPhase("idle");
      return;
    }

    if (busy || phase === "speaking" || phase === "thinking") {
      return;
    }

    startConversation();
  }, [
    listening,
    phase,
    busy,
    stop,
    clearFallbackTimer,
    startConversation,
    endConversation,
  ]);

  const statusHint = inConversation
    ? VOICE_HINT_END
    : awaitingStart
      ? "Tap anywhere on the page to start talking"
      : VOICE_HINT_START;

  return {
    supported,
    inConversation,
    awaitingStart,
    phase: listening ? "listening" : phase,
    interim,
    error: voiceError,
    statusHint,
    toggleListening,
    cancelSpeech,
  };
}
