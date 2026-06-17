"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type StartOptions = {
  onEnd?: () => void;
  onError?: (error: string) => void;
};

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalRef = useRef<(text: string) => void>(() => {});
  const onEndRef = useRef<(() => void) | undefined>(undefined);
  const onErrorRef = useRef<((error: string) => void) | undefined>(undefined);
  const gotFinalRef = useRef(false);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void, options?: StartOptions) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;

      stop();
      onFinalRef.current = onFinal;
      onEndRef.current = options?.onEnd;
      onErrorRef.current = options?.onError;
      gotFinalRef.current = false;
      setFinalTranscript("");

      const recognition = new Ctor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setInterim("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) {
            finalText += chunk;
          } else {
            interimText += chunk;
          }
        }

        if (interimText) setInterim(interimText);
        if (finalText.trim()) {
          gotFinalRef.current = true;
          setFinalTranscript(finalText.trim());
          setInterim("");
          onFinalRef.current(finalText.trim());
          recognition.stop();
        }
      };

      recognition.onerror = (event: Event) => {
        const code = (event as SpeechRecognitionErrorEvent).error ?? "unknown";
        setListening(false);
        setInterim("");
        onErrorRef.current?.(code);
      };

      recognition.onend = () => {
        setListening(false);
        setInterim("");
        recognitionRef.current = null;
        if (!gotFinalRef.current) {
          onEndRef.current?.();
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setListening(false);
        onErrorRef.current?.("not-allowed");
      }
    },
    [stop]
  );

  return {
    supported,
    listening,
    interim,
    finalTranscript,
    start,
    stop,
  };
}
