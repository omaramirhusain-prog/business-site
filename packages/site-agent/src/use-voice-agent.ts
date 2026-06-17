"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { useSpeechRecognition } from "./use-speech-recognition";
import {
  extractLastAssistantText,
  isToolTurnInProgress,
  getLastCompletedToolName,
} from "./extract-text";
import {
  isEndConversationCommand,
  isRepeatCommand,
  isStartConversationCommand,
  isStopSpeakingCommand,
  VOICE_HINT_END,
  VOICE_HINT_START,
} from "./voice-commands";
import { StreamingTtsPlayer } from "./streaming-tts";
import { registerVoiceControl } from "./voice-control";
import { isTourActive } from "./tour-state";

export type VoicePhase = "idle" | "listening" | "thinking" | "speaking";

export type UseVoiceAgentConfig = {
  useAgent: () => {
    messages: UIMessage[];
    sendMessage: (message: { text: string }) => void;
    status: string;
    error: Error | undefined;
  };
  useOpenChat?: () => (open: boolean) => void;
  getToolConfirmation: (messages: UIMessage[]) => string | null;
  ttsEndpoint?: string;
  sttEndpoint?: string;
  voiceCommandNames?: string[];
  awaitingStartHint?: string;
  enableBargeIn?: boolean;
  speechRate?: number;
  /** Tools that handle their own speech (e.g. guided tour). */
  selfSpeakingTools?: string[];
};

const MIC_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone blocked — allow access in your browser settings, then tap the mic.",
  "service-not-allowed": "Microphone not allowed on this page. Tap the mic to try again.",
  "no-speech": "",
  aborted: "",
};

function speakWithBrowser(text: string, rate = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Speech synthesis unavailable"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));
    window.speechSynthesis.speak(utterance);
  });
}

export function createUseVoiceAgent(config: UseVoiceAgentConfig) {
  const ttsEndpoint = config.ttsEndpoint ?? "/api/tts";
  const sttEndpoint = config.sttEndpoint ?? "/api/stt";
  const awaitingStartHint =
    config.awaitingStartHint ?? "Tap anywhere on the page to start talking";
  const enableBargeIn = config.enableBargeIn !== false;
  const speechRate = config.speechRate ?? 1;
  const selfSpeakingTools = config.selfSpeakingTools ?? ["startGuidedTour"];

  return function useVoiceAgent() {
    const { messages, sendMessage, status, error: chatError } = config.useAgent();
    const setChatOpen = config.useOpenChat?.();
    const { supported, listening, interim, start, stop } = useSpeechRecognition({
      sttEndpoint,
    });

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
    const ttsPlayerRef = useRef<StreamingTtsPlayer | null>(null);
    const lastSpokenTextRef = useRef<string | null>(null);
    const bargeInRecognitionRef = useRef<SpeechRecognition | null>(null);

    const beginListeningRef = useRef<() => void>(() => {});
    const endConversationRef = useRef<(silent?: boolean) => void>(() => {});
    const startConversationRef = useRef<() => void>(() => {});
    const busyRef = useRef(false);
    const userGestureRef = useRef(false);
    const speakingRef = useRef(false);

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

    const stopBargeInListener = useCallback(() => {
      bargeInRecognitionRef.current?.stop();
      bargeInRecognitionRef.current = null;
    }, []);

    const cancelSpeech = useCallback(() => {
      speakingRef.current = false;
      ttsPlayerRef.current?.cancel();
      ttsPlayerRef.current = null;
      stopBargeInListener();
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    }, [stopBargeInListener]);

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
        if (inConversationRef.current && !voiceTurnRef.current && !speakingRef.current) {
          beginListeningRef.current();
        }
      }, 450);
    }, [clearResumeListenTimer]);

    const interruptSpeaking = useCallback(() => {
      if (!speakingRef.current) return false;
      cancelSpeech();
      setPhase("idle");
      setVoiceError(null);
      if (inConversationRef.current) {
        scheduleResumeListening();
      }
      return true;
    }, [cancelSpeech, scheduleResumeListening]);

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
          void speakWithBrowser("Conversation ended.", speechRate);
        }
      },
      [stop, cancelSpeech, clearFallbackTimer, clearThinkingTimeout, clearResumeListenTimer, speechRate]
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

    const startBargeInListener = useCallback(() => {
      if (!enableBargeIn || isTourActive() || typeof window === "undefined") return;

      const w = window as Window & {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      };
      const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (!Ctor) return;

      stopBargeInListener();
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!speakingRef.current) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0]?.transcript?.trim() ?? "";
          if (chunk.length >= 3) {
            interruptSpeaking();
            break;
          }
        }
      };

      recognition.onerror = () => {
        stopBargeInListener();
      };

      recognition.onend = () => {
        if (speakingRef.current && inConversationRef.current) {
          try {
            recognition.start();
          } catch {
            /* mic busy */
          }
        }
      };

      try {
        recognition.start();
        bargeInRecognitionRef.current = recognition;
      } catch {
        /* mic may be busy */
      }
    }, [enableBargeIn, interruptSpeaking, stopBargeInListener]);

    const speakChainRef = useRef(Promise.resolve());

    const speak = useCallback(
      (text: string) => {
        const run = async () => {
          clearFallbackTimer();
          cancelSpeech();
          lastSpokenTextRef.current = text;
          speakingRef.current = true;
          setPhase("speaking");
          setVoiceError(null);

          const player = new StreamingTtsPlayer({
            ttsEndpoint,
            speechRate,
            onError: () => {
              if (!isTourActive()) {
                setVoiceError("Could not play voice response.");
              }
            },
          });
          ttsPlayerRef.current = player;
          startBargeInListener();

          try {
            await player.speak(text);
          } finally {
            speakingRef.current = false;
            stopBargeInListener();
            ttsPlayerRef.current = null;
            if (inConversationRef.current && !isTourActive()) {
              setPhase("idle");
              scheduleResumeListening();
            } else if (!isTourActive()) {
              setPhase("idle");
            }
          }
        };

        speakChainRef.current = speakChainRef.current.then(run, run);
        return speakChainRef.current;
      },
      [
        cancelSpeech,
        clearFallbackTimer,
        scheduleResumeListening,
        startBargeInListener,
        stopBargeInListener,
        speechRate,
      ]
    );

    const releaseVoiceTurnWithoutSpeaking = useCallback(() => {
      clearThinkingTimeout();
      clearFallbackTimer();
      voiceTurnRef.current = false;
      setVoiceError(null);
      if (inConversationRef.current && !isTourActive() && !speakingRef.current) {
        setPhase("idle");
        scheduleResumeListening();
      }
    }, [clearThinkingTimeout, clearFallbackTimer, scheduleResumeListening]);

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
        setChatOpen?.(true);

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
        if (isStopSpeakingCommand(transcript)) {
          if (interruptSpeaking()) return;
        }

        if (isRepeatCommand(transcript)) {
          const last = lastSpokenTextRef.current;
          if (last) {
            void speak(last);
          } else {
            void speakWithBrowser("I haven't said anything yet.", speechRate);
          }
          return;
        }

        if (isEndConversationCommand(transcript)) {
          endConversationRef.current(false);
          return;
        }

        if (
          isStartConversationCommand(transcript, {
            startNamePatterns: config.voiceCommandNames,
          })
        ) {
          inConversationRef.current = true;
          setInConversation(true);
          setVoiceError(null);
          void speakWithBrowser("I'm listening. What can I help with?", speechRate);
          scheduleResumeListening();
          return;
        }

        if (speakingRef.current) {
          interruptSpeaking();
        }

        submitVoiceMessage(transcript);
      },
      [submitVoiceMessage, scheduleResumeListening, interruptSpeaking, speak, speechRate]
    );

    const beginListening = useCallback(() => {
      if (busy || voiceTurnRef.current || speakingRef.current) return;

      cancelSpeech();
      setVoiceError(null);
      setPhase("listening");

      start(handleTranscript, {
        onEnd: () => {
          if (
            inConversationRef.current &&
            !voiceTurnRef.current &&
            !busyRef.current &&
            !speakingRef.current
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

    useEffect(() => {
      registerVoiceControl({
        repeatLast: async () => {
          const last = lastSpokenTextRef.current;
          if (!last) return "Nothing to repeat yet.";
          await speak(last);
          return "Repeated the last response.";
        },
        stopSpeaking: () => {
          if (interruptSpeaking()) return "Stopped speaking.";
          return "I wasn't speaking.";
        },
        getLastSpokenText: () => lastSpokenTextRef.current,
        speakDirect: speak,
        resumeListening: () => scheduleResumeListening(),
      });
      return () => registerVoiceControl(null);
    }, [speak, interruptSpeaking]);

    useEffect(() => {
      if (!voiceTurnRef.current) return;

      if (isTourActive()) {
        if (!busy) {
          releaseVoiceTurnWithoutSpeaking();
        }
        return;
      }

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
        const toolName = getLastCompletedToolName(messages);
        if (toolName && selfSpeakingTools.includes(toolName)) {
          releaseVoiceTurnWithoutSpeaking();
          return;
        }
        finishVoiceTurn(reply);
        return;
      }

      if (isToolTurnInProgress(messages)) {
        setPhase("thinking");

        if (!fallbackTimerRef.current) {
          fallbackTimerRef.current = setTimeout(() => {
            fallbackTimerRef.current = null;
            if (!voiceTurnRef.current || isTourActive()) return;

            const lateReply = extractLastAssistantText(messages);
            if (lateReply) {
              const toolName = getLastCompletedToolName(messages);
              if (toolName && selfSpeakingTools.includes(toolName)) {
                releaseVoiceTurnWithoutSpeaking();
                return;
              }
              finishVoiceTurn(lateReply);
              return;
            }

            const confirmation = config.getToolConfirmation(messages);
            if (confirmation) {
              const toolName = getLastCompletedToolName(messages);
              if (toolName && selfSpeakingTools.includes(toolName)) {
                releaseVoiceTurnWithoutSpeaking();
                return;
              }
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
      releaseVoiceTurnWithoutSpeaking,
      selfSpeakingTools,
    ]);

    useEffect(
      () => () => {
        clearFallbackTimer();
        clearThinkingTimeout();
        clearResumeListenTimer();
        stopBargeInListener();
      },
      [clearFallbackTimer, clearThinkingTimeout, clearResumeListenTimer, stopBargeInListener]
    );

    useEffect(() => {
      if (!supported) return;

      const timer = setTimeout(() => {
        if (!inConversationRef.current) {
          startConversationRef.current();
        }
      }, 600);

      return () => clearTimeout(timer);
    }, [supported]);

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

      if (speakingRef.current) {
        interruptSpeaking();
        return;
      }

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

      if (busy || phase === "thinking") {
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
      interruptSpeaking,
    ]);

    const statusHint = inConversation
      ? VOICE_HINT_END
      : awaitingStart
        ? awaitingStartHint
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
      speakDirect: speak,
      interruptSpeaking,
      getLastSpokenText: () => lastSpokenTextRef.current,
    };
  };
}
