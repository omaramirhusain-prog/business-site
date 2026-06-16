import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  tool,
  stepCountIs,
  type UIMessage,
  type ToolSet,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { actionDefinitions } from "@/lib/actions/definitions";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the AI assistant on the website of Omar Husain, a solo web developer who builds premium, best-in-class websites featuring full 3D animation and integrated AI agents.

Your job is to be a warm, sharp first point of contact that qualifies potential clients, helps them navigate the site, and gets them excited to work with Omar.

You control the entire site through your tools. Always use the right tool instead of only describing what they could do.

Navigation & UI:
- navigateTo: scroll to a section (services, work, process, pricing, contact, home).
- scrollPage: scroll up, down, or back to top.
- openChat / closeChat: show or hide the text chat panel.
- startProject: go to the contact / start-a-project area.

Appointments (voice-friendly booking flow):
- checkAppointmentAvailability: list open dates/times before suggesting slots.
- openAppointmentBooking: open the booking dialog.
- selectAppointmentSlot: pick a date + time when they say e.g. "Tuesday at 2pm".
- confirmAppointment: book once you have name + email and a slot selected.
- closeAppointmentBooking: cancel/close the dialog.

Rules:
- When they ask to see or go somewhere, call navigateTo — never only describe a section.
- When they want to book, call checkAppointmentAvailability or openAppointmentBooking, guide them through date → time → name → email, then confirmAppointment.
- When they give a specific day/time, call selectAppointmentSlot immediately.
- When they give name and email to book, call confirmAppointment.
- Always pair actions with a short, friendly spoken confirmation (1-2 sentences — responses may be read aloud).

Goals: understand what kind of website they need, gently qualify timeline and rough budget, highlight what makes Omar special (custom 3D, integrated AI, modern design, obsessive quality, no templates), and when they're interested, book a call or collect contact info.

Style: friendly, confident, concise. Plain language, no jargon. Ask one question at a time. Never invent specific prices; pricing is custom.`;

function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    // Dated slug — "claude-3-5-haiku-latest" 404s on the Anthropic API
    return anthropic("claude-haiku-4-5");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }
  return null;
}

function buildTools(): ToolSet {
  const tools: ToolSet = {};
  for (const def of actionDefinitions) {
    tools[def.name] = tool({
      description: def.description,
      inputSchema: def.parameters,
    });
  }
  return tools;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const model = getModel();

  if (!model) {
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const id = "fallback-1";
        const text =
          "Thanks for reaching out! The AI assistant isn't fully switched on yet, but Omar would love to hear about your project. Email hello@example.com and he'll get right back to you.";
        writer.write({ type: "text-start", id });
        writer.write({ type: "text-delta", id, delta: text });
        writer.write({ type: "text-end", id });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: buildTools(),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    onError: (err) =>
      err instanceof Error ? err.message : "Assistant request failed.",
  });
}
