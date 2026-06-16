"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useSiteActions } from "@/lib/actions/registry";
import { inferActionsFromUserText } from "@/lib/agent/infer-intent";

type BaseChat = ReturnType<typeof useChat>;
type AgentContextValue = BaseChat & {
  sendMessage: BaseChat["sendMessage"];
};

const AgentContext = createContext<AgentContextValue | null>(null);

function getUserText(message: Parameters<BaseChat["sendMessage"]>[0]): string | null {
  if (!message || typeof message !== "object") return null;
  if ("text" in message && typeof message.text === "string") return message.text;
  return null;
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const { runAction } = useSiteActions();
  const chatRef = useRef<BaseChat | null>(null);

  const chat = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      // Do NOT await addToolOutput here — it uses the same job queue as the
      // stream and will deadlock if awaited mid-chunk (stuck on "thinking").
      void runAction(
        toolCall.toolName,
        (toolCall.input ?? {}) as Record<string, unknown>
      ).then((result) =>
        chatRef.current?.addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: result.message,
        })
      );
    },
  });

  chatRef.current = chat;

  const runInferredActions = useCallback(
    (text: string) => {
      for (const action of inferActionsFromUserText(text)) {
        void runAction(action.name, action.args);
      }
    },
    [runAction]
  );

  const sendMessage = useCallback<AgentContextValue["sendMessage"]>(
    (message, options) => {
      const text = getUserText(message);
      if (text) runInferredActions(text);
      return chat.sendMessage(message, options);
    },
    [chat, runInferredActions]
  );

  const value = useMemo<AgentContextValue>(
    () => ({
      ...chat,
      sendMessage,
    }),
    [chat, sendMessage]
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return ctx;
}
