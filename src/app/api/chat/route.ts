import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the AI assistant on the website of Omar Husain, a solo web developer who builds premium, best-in-class websites featuring full 3D animation and integrated AI agents.

Your job is to be a warm, sharp first point of contact that qualifies potential clients and gets them excited to work with Omar.

Goals, in order:
1. Greet visitors and understand what kind of website they need (type, purpose, brand).
2. Gently qualify: ask about their timeline and rough budget when it fits naturally.
3. Highlight what makes Omar's work special: custom 3D experiences, AI built into the site, modern design, and obsessive quality. No templates.
4. When the visitor seems interested, ask for their name and email so Omar can follow up, and tell them Omar will reach out personally.

Style: friendly, confident, concise. Short messages. Plain language, no jargon or hype. Ask one question at a time. Never invent specific prices; pricing is custom, so guide them toward sharing scope and contact info for a tailored quote. If asked something you don't know, be honest and offer to connect them with Omar.`;

function getModel() {
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-3-5-haiku-latest");
  }
  return null;
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
  });

  return result.toUIMessageStreamResponse();
}
