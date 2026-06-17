import type { UIMessage } from "ai";
import type { ToolConfirmationMap } from "./types";

export function extractMessageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("")
    .trim();
}

export function extractLastAssistantText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "assistant") continue;
    const text = extractMessageText(messages[i]);
    if (text) return text;
  }
  return "";
}

function isToolPart(part: UIMessage["parts"][number]) {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool";
}

function toolState(part: UIMessage["parts"][number]) {
  return (part as { state?: string }).state;
}

function toolName(part: UIMessage["parts"][number]) {
  if (part.type === "dynamic-tool") {
    return (part as { toolName: string }).toolName;
  }
  return part.type.replace("tool-", "");
}

function toolInput(part: UIMessage["parts"][number]) {
  return (part as { input?: Record<string, unknown> }).input;
}

/** True while a tool call is in flight or waiting on a follow-up LLM reply. */
export function isToolTurnInProgress(messages: UIMessage[]): boolean {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return false;
  if (extractMessageText(lastAssistant)) return false;

  const toolParts = lastAssistant.parts.filter(isToolPart);
  if (toolParts.length === 0) return false;

  if (
    toolParts.some(
      (p) => toolState(p) === "input-streaming" || toolState(p) === "input-available"
    )
  ) {
    return true;
  }

  if (toolParts.some((p) => toolState(p) === "output-available")) {
    return true;
  }

  return false;
}

/** Spoken fallback when tools ran but the model returned no text. */
export function getToolConfirmation(
  messages: UIMessage[],
  confirmations: ToolConfirmationMap = {}
): string | null {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return null;

  for (const part of lastAssistant.parts) {
    if (!isToolPart(part) || toolState(part) !== "output-available") continue;

    const name = toolName(part);
    const input = toolInput(part);
    const custom = confirmations[name]?.(input);
    if (custom) return custom;
    return "Done — let me know if you need anything else.";
  }

  return null;
}

/** Name of the most recent completed tool on the last assistant message. */
export function getLastCompletedToolName(messages: UIMessage[]): string | null {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return null;

  let last: string | null = null;
  for (const part of lastAssistant.parts) {
    if (!isToolPart(part) || toolState(part) !== "output-available") continue;
    last = toolName(part);
  }
  return last;
}
