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
import { isTourActive } from "./tour-state";

export type RunActionFn = (
  name: string,
  args?: Record<string, unknown>
) => Promise<ActionResult>;

export type CreateAgentProviderOptions = {
  useRunAction: () => RunActionFn;
  inferActions?: (text: string) => InferredAction[];
  /** Skip client infer when the LLM should own these tools (avoids double execution). */
  llmOnlyTools?: string[];
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
  const llmOnlyTools = new Set(options.llmOnlyTools ?? ["startGuidedTour"]);
  const AgentContext = createContext<AgentContextValue | null>(null);

  function AgentProvider({ children }: { children: ReactNode }) {
    const runAction = options.useRunAction();
    const chatRef = useRef<BaseChat | null>(null);
    const handledToolCallsRef = useRef<Set<string>>(new Set());
    const lastUserSendRef = useRef<{ text: string; at: number } | null>(null);

    const chat = useChat({
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onToolCall({ toolCall }) {
        if (handledToolCallsRef.current.has(toolCall.toolCallId)) return;
        handledToolCallsRef.current.add(toolCall.toolCallId);

        if (toolCall.toolName === "startGuidedTour" && isTourActive()) {
          void chatRef.current?.addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: "Tour is already running.",
          });
          return;
        }

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
          if (llmOnlyTools.has(action.name)) continue;
          void runAction(action.name, action.args);
        }
      },
      [runAction]
    );

    const sendMessage = useCallback<AgentContextValue["sendMessage"]>(
      (message, opts) => {
        const text = getUserText(message);
        if (text) {
          const now = Date.now();
          const last = lastUserSendRef.current;
          if (last && last.text === text && now - last.at < 2500) {
            return Promise.resolve(undefined) as ReturnType<
              BaseChat["sendMessage"]
            >;
          }
          lastUserSendRef.current = { text, at: now };
          runInferredActions(text);
        }
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
