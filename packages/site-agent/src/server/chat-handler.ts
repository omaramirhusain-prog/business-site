import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildToolsFromDefinitions } from "../build-tools";
import type { ActionDefinition } from "../types";

export type CreateChatHandlerOptions = {
  definitions: ActionDefinition[];
  systemPrompt: string;
  fallbackMessage: string;
  maxSteps?: number;
  anthropicModel?: string;
  openaiModel?: string;
};

function getModel(options: CreateChatHandlerOptions) {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(options.anthropicModel ?? "claude-haiku-4-5");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai(options.openaiModel ?? "gpt-4o-mini");
  }
  return null;
}

export function createChatHandler(options: CreateChatHandlerOptions) {
  const tools = buildToolsFromDefinitions(options.definitions);

  return async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const model = getModel(options);

    if (!model) {
      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          const id = "fallback-1";
          const text = options.fallbackMessage;
          writer.write({ type: "text-start", id });
          writer.write({ type: "text-delta", id, delta: text });
          writer.write({ type: "text-end", id });
        },
      });
      return createUIMessageStreamResponse({ stream });
    }

    const result = streamText({
      model,
      system: options.systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(options.maxSteps ?? 5),
    });

    return result.toUIMessageStreamResponse({
      onError: (err) =>
        err instanceof Error ? err.message : "Assistant request failed.",
    });
  };
}
