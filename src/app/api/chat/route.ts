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

You can take actions on the site using your tools:
- navigateTo: scroll to a section (services, work, process, pricing, contact, home).
- openAppointmentBooking: open the booking dialog so they can pick a date.
- startProject: take them to the contact / start-a-project area.
- openChat: open the chat panel.

When a visitor asks to see or go somewhere ("show me pricing", "take me to your work") call navigateTo. When they want to book or schedule, call openAppointmentBooking. Always pair an action with a short, friendly spoken confirmation (e.g. "Sure — here's the pricing.").

Goals: understand what kind of website they need, gently qualify timeline and rough budget, highlight what makes Omar special (custom 3D, integrated AI, modern design, obsessive quality, no templates), and when they're interested, open the booking dialog or collect their name and email.

Style: friendly, confident, concise. Short messages. Plain language, no jargon or hype. Ask one question at a time. Never invent specific prices; pricing is custom.`;

function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-3-5-haiku-latest");
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

  return result.toUIMessageStreamResponse();
}
