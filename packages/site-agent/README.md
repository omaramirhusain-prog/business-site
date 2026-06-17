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

### 7. Voice agent

```ts
import { createUseVoiceAgent, getToolConfirmation } from "@ais-os/site-agent";

export const useVoiceAgent = createUseVoiceAgent({
  useAgent,
  useOpenChat: () => useSiteActions().setChatOpen,
  getToolConfirmation: (m) => getToolConfirmation(m, yourConfirmationMap),
  voiceCommandNames: ["acme"], // optional wake names
});
```

## What stays site-specific

| File | Purpose |
|------|---------|
| `definitions.ts` | Tool schemas for the LLM |
| `handlers.ts` | What each action actually does |
| `infer-intent.ts` | Regex fast-path before LLM |
| `tool-confirmations.ts` | Spoken fallbacks per action |
| `api/chat/route.ts` | System prompt + fallback copy |
| Booking/calendar | Optional per-site plugin |

## Env vars

Same as business-site: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, etc.

## Reference implementation

See `business-site/` in this repo — Omar's portfolio is the first consumer.
