# @ais-os/site-agent

Reusable voice + chat agent for AI-powered websites. Declare your site's actions once; voice and text chat both run through the same typed registry.

## Quick start (new site)

### 1. Add the package

```json
{
  "dependencies": {
    "@ais-os/site-agent": "file:./packages/site-agent"
  }
}
```

In `next.config.ts`:

```ts
transpilePackages: ["@ais-os/site-agent"],
```

### 2. Define actions (`src/lib/actions/definitions.ts`)

```ts
import { z } from "zod";
import type { ActionDefinition } from "@ais-os/site-agent";

export const actionDefinitions: ActionDefinition[] = [
  {
    name: "navigateTo",
    description: "Scroll to a section",
    parameters: z.object({ section: z.enum(["home", "pricing"]) }),
  },
];
```

### 3. Wire handlers (`src/lib/actions/handlers.ts`)

Return a map of `actionName → (args) => string | Promise<string>`.

### 4. Action provider (`src/lib/actions/registry.tsx`)

Use `createActionsFromDefinitions`, `runAction`, `scrollToSection`, `scrollPage` from the package.

### 5. Agent provider (`src/components/agent-provider.tsx`)

```ts
import { createAgentProvider } from "@ais-os/site-agent";

export const { AgentProvider, useAgent } = createAgentProvider({
  useRunAction: () => useSiteActions().runAction,
  inferActions: inferActionsFromUserText, // optional fast-path rules
});
```

### 6. API routes

```ts
// src/app/api/chat/route.ts
import { createChatHandler } from "@ais-os/site-agent/server";

export const POST = createChatHandler({
  definitions: actionDefinitions,
  systemPrompt: "You are...",
  fallbackMessage: "Email us at hello@example.com",
});
```

```ts
// src/app/api/tts/route.ts
import { createTtsHandler } from "@ais-os/site-agent/server";

export const POST = createTtsHandler();
```

```ts
// src/app/api/stt/route.ts — Safari/Firefox fallback (OpenAI Whisper)
import { createSttHandler } from "@ais-os/site-agent/server";

export const POST = createSttHandler();
```

```ts
// src/app/api/contact/route.ts — voice lead capture
import { createContactHandler } from "@ais-os/site-agent/server";

export const POST = createContactHandler({
  getFromEmail: () => process.env.RESEND_FROM_EMAIL!,
  getOwnerEmail: () => process.env.OWNER_EMAIL!,
  getSiteName: () => "Acme",
  getSiteUrl: () => "https://acme.com",
});
```

### 7. Voice agent

```ts
import { createUseVoiceAgent, getToolConfirmation } from "@ais-os/site-agent";

export const useVoiceAgent = createUseVoiceAgent({
  useAgent,
  useOpenChat: () => useSiteActions().setChatOpen,
  getToolConfirmation: (m) => getToolConfirmation(m, yourConfirmationMap),
  voiceCommandNames: ["acme"],
  enableBargeIn: true, // interrupt TTS when user speaks
});
```

### 8. Proactive onboarding (optional)

```ts
import { useVoiceProactivePrompts } from "@ais-os/site-agent";

useVoiceProactivePrompts({
  speak: speakDirect,
  isInConversation: () => inConversation,
  firstVisitMessage: "Say give me a tour or book a call.",
});
```

### 9. Guided tour (optional)

```ts
import { useGuidedTour } from "@ais-os/site-agent";

const { startTour } = useGuidedTour({
  steps: [
    { section: "home", message: "Welcome..." },
    { section: "pricing", voiceId: "tier-pro", message: "Our plans..." },
  ],
  navigate: (s) => scrollToSection(s, SECTIONS),
  highlight: (id) => highlightElementByVoiceId(id),
  speak: (text) => getVoiceControl()?.speakDirect(text),
});
```

## Fully voiced site checklist

1. **`data-voice-id` on every CTA and card** — pricing tiers, service cards, FAQ items. The agent uses `highlightElement` to scroll and pulse them.

```tsx
<div
  data-voice-id="tier-pro"
  data-voice-label="Pro pricing tier"
  aria-label="Pro pricing tier"
>
```

2. **Semantic section IDs** — match `SECTIONS` map (`services` → `#services`).

3. **Generic actions** — `readSection`, `highlightElement`, `repeatLast`, `stopSpeaking`, `submitLead`, `startGuidedTour`, `getFAQAnswer`.

4. **`llms.txt`** at `/public/llms.txt` — content map for AI agents.

5. **JSON-LD** — `ProfessionalService` + `Offer` schema on the layout.

6. **Voice infra** — streaming TTS (sentence-by-sentence), barge-in, optional `/api/stt` for Safari.

## Package exports

| Export | Purpose |
|--------|---------|
| `createUseVoiceAgent` | Voice hook with streaming TTS + barge-in |
| `registerVoiceControl` / `getVoiceControl` | Bridge for `repeatLast` / `stopSpeaking` actions |
| `highlightElementByVoiceId` | Scroll + highlight any `data-voice-id` element |
| `readSectionText` | Extract section text for `readSection` action |
| `useGuidedTour` | Multi-step voice tour |
| `useVoiceProactivePrompts` | First-visit spoken onboarding |
| `prefersServerStt` | Detect Safari/Firefox for Whisper fallback |
| `createContactHandler` | Resend lead email factory |
| `createSttHandler` | OpenAI Whisper transcription factory |

## What stays site-specific

| File | Purpose |
|------|---------|
| `definitions.ts` | Tool schemas for the LLM |
| `handlers.ts` | What each action actually does |
| `infer-intent.ts` | Regex fast-path before LLM |
| `tool-confirmations.ts` | Spoken fallbacks per action |
| `api/chat/route.ts` | System prompt + fallback copy |
| `tour-config.ts` | Guided tour steps |
| `faq.ts` | FAQ content |
| Booking/calendar | Optional per-site plugin |

## Env vars

| Var | Purpose |
|-----|---------|
| `ANTHROPIC_API_KEY` | Chat model |
| `OPENAI_API_KEY` | Chat fallback + Whisper STT |
| `ELEVENLABS_API_KEY` | TTS |
| `RESEND_API_KEY` | Booking + lead emails |
| Google Calendar vars | Booking slots |

## Reference implementation

See `business-site/` in this repo — Omar's portfolio is the first consumer with full voice-first features.
