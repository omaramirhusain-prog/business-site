"use client";

import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceAgent, type VoicePhase } from "@/hooks/use-voice-agent";

const PHASE_LABEL: Record<VoicePhase, string> = {
  idle: "Tap to start conversation",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

export function VoiceAgent() {
  const {
    supported,
    inConversation,
    awaitingStart,
    phase,
    interim,
    error,
    statusHint,
    toggleListening,
  } = useVoiceAgent();

  if (!supported) return null;

  const active = phase !== "idle" || inConversation;
  const showBubble = awaitingStart || interim || error || active;
  const label =
    awaitingStart && !inConversation
      ? "Ready when you are"
      : phase === "idle" && inConversation
        ? "Conversation active"
        : PHASE_LABEL[phase];

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass max-w-[min(300px,calc(100vw-5rem))] rounded-2xl px-4 py-3 text-sm shadow-xl"
          >
            {error ? (
              <div className="space-y-1">
                <p className="text-red-300">{error}</p>
                {awaitingStart && (
                  <p className="text-xs text-zinc-500">{statusHint}</p>
                )}
              </div>
            ) : interim ? (
              <p className="text-zinc-200">&ldquo;{interim}&rdquo;</p>
            ) : (
              <div className="space-y-1">
                <p className="text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-500">{statusHint}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleListening}
        aria-label={inConversation ? "End conversation" : label}
        className="group relative grid h-14 w-14 place-items-center"
      >
        <VoiceOrb
          phase={phase}
          inConversation={inConversation}
          awaitingStart={awaitingStart}
        />
        <span
          className={cn(
            "relative z-10 grid h-12 w-12 place-items-center rounded-full transition-colors",
            inConversation && phase === "idle"
              ? "bg-green-500 text-white"
              : phase === "listening"
                ? "bg-red-500 text-white"
                : phase === "speaking"
                  ? "bg-accent-2 text-black"
                  : phase === "thinking"
                    ? "bg-accent text-white"
                    : "bg-white/10 text-white group-hover:bg-white/20"
          )}
        >
          {inConversation && phase === "idle" ? (
            <PhoneOff className="h-5 w-5" />
          ) : phase === "speaking" ? (
            <Volume2 className="h-5 w-5" />
          ) : phase === "listening" ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </span>
      </button>
    </div>
  );
}

function VoiceOrb({
  phase,
  inConversation,
  awaitingStart,
}: {
  phase: VoicePhase;
  inConversation: boolean;
  awaitingStart: boolean;
}) {
  const pulse =
    phase === "listening"
      ? [1, 1.35, 1]
      : phase === "thinking"
        ? [1, 1.2, 1]
        : phase === "speaking"
          ? [1, 1.25, 0.95, 1.15, 1]
          : inConversation
            ? [1, 1.12, 1]
            : awaitingStart
              ? [1, 1.15, 1]
              : [1, 1.08, 1];

  return (
    <>
      <motion.span
        className={cn(
          "absolute inset-0 rounded-full blur-md",
          phase === "listening"
            ? "bg-red-500/40"
            : phase === "speaking"
              ? "bg-accent-2/50"
              : phase === "thinking"
                ? "bg-accent/50"
                : inConversation
                  ? "bg-green-500/35"
                  : awaitingStart
                    ? "bg-accent/35"
                    : "bg-accent/20"
        )}
        animate={{
          scale: pulse,
          opacity:
            phase === "idle" && !inConversation && !awaitingStart ? 0.5 : 0.9,
        }}
        transition={{
          duration: phase === "speaking" ? 0.55 : 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {activeRing(phase, inConversation) && (
        <motion.span
          className={cn(
            "absolute inset-[-6px] rounded-full border-2",
            phase === "listening"
              ? "border-red-400/60"
              : phase === "speaking"
                ? "border-accent-2/60"
                : inConversation && phase === "idle"
                  ? "border-green-400/60"
                  : "border-accent/60"
          )}
          animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
    </>
  );
}

function activeRing(phase: VoicePhase, inConversation: boolean) {
  return (
    phase === "listening" ||
    phase === "thinking" ||
    phase === "speaking" ||
    (inConversation && phase === "idle")
  );
}
