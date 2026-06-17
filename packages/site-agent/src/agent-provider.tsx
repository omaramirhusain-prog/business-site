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
import type { ActionResult, InferredAction } from "./types";

export type RunActionFn = (
  name: string,
  args?: Record<string, unknown>
) => Promise<ActionResult>;

export type CreateAgentProviderOptions = {
  useRunAction: () => RunActionFn;
  inferActions?: (text: string) => InferredAction[];
};

type BaseChat = ReturnType<typeof useChat>;
type AgentContextValue = BaseChat & {
  sendMessage: BaseChat["sendMessage"];
};

function getUserText(
  message: Parameters<BaseChat["sendMessage"]>[0]
): string | null {
  if (!message || typeof message !== "object") return null;
  if ("text" in message && typeof message.text === "string") return message.text;
  return null;
}

export function createAgentProvider(options: CreateAgentProviderOptions) {
  const AgentContext = createContext<AgentContextValue | null>(null);

  function AgentProvider({ children }: { children: ReactNode }) {
    const runAction = options.useRunAction();
    const chatRef = useRef<BaseChat | null>(null);

    const chat = useChat({
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onToolCall({ toolCall }) {
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
        if (!options.inferActions) return;
        for (const action of options.inferActions(text)) {
          void runAction(action.name, action.args);
        }
      },
      [runAction]
    );

    const sendMessage = useCallback<AgentContextValue["sendMessage"]>(
      (message, opts) => {
        const text = getUserText(message);
        if (text) runInferredActions(text);
        return chat.sendMessage(message, opts);
      },
      [chat, runInferredActions]
    );

    const value = useMemo<AgentContextValue>(
      () => ({ ...chat, sendMessage }),
      [chat, sendMessage]
    );

    return (
      <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
    );
  }

  function useAgent() {
    const ctx = useContext(AgentContext);
    if (!ctx) {
      throw new Error("useAgent must be used within an AgentProvider");
    }
    return ctx;
  }

  return { AgentProvider, useAgent };
}
