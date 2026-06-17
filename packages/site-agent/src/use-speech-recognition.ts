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

/** Chrome/Edge have reliable Web Speech; Safari/Firefox often need server STT. */
export function prefersServerStt(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);
  return isSafari || isFirefox;
}

type StartOptions = {
  onEnd?: () => void;
  onError?: (error: string) => void;
};

type UseSpeechRecognitionOptions = {
  sttEndpoint?: string;
  preferServerStt?: boolean;
};

async function transcribeBlob(
  blob: Blob,
  sttEndpoint: string
): Promise<string | null> {
  const form = new FormData();
  form.append("audio", blob, "recording.webm");

  const res = await fetch(sttEndpoint, { method: "POST", body: form });
  if (!res.ok) return null;

  const data = (await res.json()) as { text?: string };
  return data.text?.trim() ?? null;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const sttEndpoint = options.sttEndpoint ?? "/api/stt";
  const useServerStt =
    options.preferServerStt ?? prefersServerStt();

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onFinalRef = useRef<(text: string) => void>(() => {});
  const onEndRef = useRef<(() => void) | undefined>(undefined);
  const onErrorRef = useRef<((error: string) => void) | undefined>(undefined);
  const gotFinalRef = useRef(false);

  const stopMedia = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    const hasBrowserStt = !!getRecognitionCtor();
    const hasMedia =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia;
    setSupported(hasBrowserStt || hasMedia);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    stopMedia();
    setListening(false);
    setInterim("");
  }, [stopMedia]);

  const startServerRecording = useCallback(
    async (onFinal: (text: string) => void, opts?: StartOptions) => {
      onFinalRef.current = onFinal;
      onEndRef.current = opts?.onEnd;
      onErrorRef.current = opts?.onError;
      gotFinalRef.current = false;
      setFinalTranscript("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        chunksRef.current = [];

        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          setListening(false);
          setInterim("Transcribing…");

          const blob = new Blob(chunksRef.current, { type: mimeType });
          stopMedia();

          if (blob.size < 1000) {
            setInterim("");
            onErrorRef.current?.("no-speech");
            onEndRef.current?.();
            return;
          }

          const text = await transcribeBlob(blob, sttEndpoint);
          setInterim("");

          if (text) {
            gotFinalRef.current = true;
            setFinalTranscript(text);
            onFinalRef.current(text);
          } else {
            onErrorRef.current?.("no-speech");
            onEndRef.current?.();
          }
        };

        recorder.onerror = () => {
          setListening(false);
          setInterim("");
          stopMedia();
          onErrorRef.current?.("unknown");
        };

        setListening(true);
        setInterim("Listening…");
        recorder.start();

        window.setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, 6500);
      } catch {
        setListening(false);
        onErrorRef.current?.("not-allowed");
      }
    },
    [sttEndpoint, stopMedia]
  );

  const startBrowserRecognition = useCallback(
    (onFinal: (text: string) => void, opts?: StartOptions) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;

      stop();
      onFinalRef.current = onFinal;
      onEndRef.current = opts?.onEnd;
      onErrorRef.current = opts?.onError;
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

  const start = useCallback(
    (onFinal: (text: string) => void, opts?: StartOptions) => {
      if (useServerStt) {
        void startServerRecording(onFinal, opts);
        return;
      }
      startBrowserRecognition(onFinal, opts);
    },
    [useServerStt, startServerRecording, startBrowserRecognition]
  );

  const stopServerRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const stopFn = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      stopServerRecording();
      return;
    }
    stop();
  }, [stop, stopServerRecording]);

  return {
    supported,
    listening,
    interim,
    finalTranscript,
    start,
    stop: stopFn,
    usingServerStt: useServerStt,
  };
}
