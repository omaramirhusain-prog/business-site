"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteActions } from "@/lib/actions/registry";
import { useAgent } from "@/components/agent-provider";
import { extractMessageText } from "@/lib/agent/extract-text";
import type { UIMessage } from "ai";

function visibleMessages(messages: UIMessage[]) {
  return messages.filter((m, i) => {
    if (i === 0) return true;
    const prev = messages[i - 1];
    if (m.role === "user" && prev.role === "user") {
      return extractMessageText(m) !== extractMessageText(prev);
    }
    return true;
  });
}

const ACTION_LABELS: Record<string, string> = {
  navigateTo: "Navigating",
  scrollPage: "Scrolling",
  readSection: "Reading section",
  highlightElement: "Highlighting",
  repeatLast: "Repeating",
  stopSpeaking: "Stopping",
  openChat: "Opening chat",
  closeChat: "Closing chat",
  openAppointmentBooking: "Opening booking",
  closeAppointmentBooking: "Closing booking",
  checkAppointmentAvailability: "Checking availability",
  selectAppointmentSlot: "Selecting time",
  confirmAppointment: "Confirming booking",
  getBookingStatus: "Checking booking",
  rescheduleAppointment: "Rescheduling",
  cancelAppointment: "Cancelling",
  startProject: "Starting a project",
  submitLead: "Sending inquiry",
  startGuidedTour: "Starting tour",
  getFAQAnswer: "Answering",
  controlScene: "Updating 3D scene",
  openExternalLink: "Opening link",
};

const suggestions = [
  "Give me a tour of the site",
  "How much does a site cost?",
  "Book a discovery call",
];

export function ChatWidget() {
  const { chatOpen: open, setChatOpen } = useSiteActions();
  const { messages, sendMessage, status } = useAgent();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setChatOpen(!open)}
        aria-label="Open chat assistant"
        className="glow fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-black transition-transform hover:scale-110"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "msg"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed bottom-24 right-5 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-black">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Omar&apos;s Assistant</div>
                <div className="text-xs text-zinc-400">
                  Text or voice — ask me anything
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm text-zinc-200">
                    Hey, I&apos;m Omar&apos;s AI assistant. I can help scope your
                    website, navigate the site, book a call, and answer questions.
                    Use the mic on the bottom left, or type here.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-accent/40 hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visibleMessages(messages).map((m) => {
                const text = extractMessageText(m);
                const toolNames = [
                  ...new Set(
                    m.parts
                      .filter(
                        (p) =>
                          p.type.startsWith("tool-") || p.type === "dynamic-tool"
                      )
                      .map((p) =>
                        p.type === "dynamic-tool"
                          ? (p as { toolName: string }).toolName
                          : p.type.replace("tool-", "")
                      )
                  ),
                ];

                return (
                  <div key={m.id} className="space-y-2">
                    {toolNames.map((name, i) => (
                      <div
                        key={`${m.id}-tool-${i}`}
                        className="flex items-center gap-1.5 text-xs text-accent-2"
                      >
                        <Zap className="h-3 w-3" />
                        {ACTION_LABELS[name] ?? name}
                      </div>
                    ))}
                    {(text || (m.role === "assistant" && toolNames.length === 0)) && (
                      <div
                        className={cn(
                          "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
                          m.role === "user"
                            ? "ml-auto rounded-2xl rounded-tr-sm bg-gradient-to-br from-accent to-accent-2 text-black"
                            : "rounded-2xl rounded-tl-sm bg-white/5 text-zinc-200"
                        )}
                      >
                        {text || (
                          <span className="inline-flex gap-1">
                            <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {busy &&
                messages[messages.length - 1]?.role === "user" && (
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3">
                    <span className="inline-flex gap-1">
                      <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                    </span>
                  </div>
                )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
    />
  );
}
