import type { UIMessage } from "ai";

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

  // Tool still streaming / waiting to run on the client
  if (
    toolParts.some(
      (p) => toolState(p) === "input-streaming" || toolState(p) === "input-available"
    )
  ) {
    return true;
  }

  // Tool ran but Claude may still send a spoken confirmation in a follow-up step
  if (toolParts.some((p) => toolState(p) === "output-available")) {
    return true;
  }

  return false;
}

/** Spoken fallback when tools ran but the model returned no text. */
export function getToolConfirmation(messages: UIMessage[]): string | null {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return null;

  for (const part of lastAssistant.parts) {
    if (!isToolPart(part) || toolState(part) !== "output-available") continue;

    const name = toolName(part);
    const input = toolInput(part);

    switch (name) {
      case "navigateTo":
        return `Sure — here's the ${String(input?.section ?? "page")}.`;
      case "scrollPage":
        return "Scrolled the page for you.";
      case "openAppointmentBooking":
        return "I've opened the booking calendar. Pick a date and time that works for you.";
      case "checkAppointmentAvailability":
        return "Here are the available times. Which works best for you?";
      case "selectAppointmentSlot":
        return "Got it — that time is selected. What's your name and email to confirm?";
      case "confirmAppointment":
        return "You're all booked. Check your email for confirmation.";
      case "closeAppointmentBooking":
        return "Booking closed.";
      case "startProject":
        return "Here's how to start a project with Omar.";
      case "openChat":
        return "Chat is open. What can I help you with?";
      case "closeChat":
        return "Chat closed.";
      default:
        return "Done — let me know if you need anything else.";
    }
  }

  return null;
}
