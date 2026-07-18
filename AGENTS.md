<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is a Next.js 16 (Turbopack) business site with an embedded voice + chat AI agent. Scripts live in `package.json`: `npm run dev` (dev server on `http://localhost:3000`), `npm run lint`, `npm run build`. Node 22 is used; dependencies install with `npm install` (package-lock.json).

Runs fully without any secrets — the core site and the "Book a call" flow work out of the box: the calendar returns mock slots (`src/lib/calendar/mock-slots.ts`, response `source: "mock"`), chat falls back to a canned message when no LLM key is set, and email sending is skipped without `RESEND_API_KEY`. All external integrations are opt-in via env vars and degrade gracefully: `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` (chat LLM), `OPENAI_API_KEY` (STT), `ELEVENLABS_API_KEY`+`ELEVENLABS_VOICE_ID` (TTS), `RESEND_API_KEY`+`RESEND_FROM_EMAIL` (contact/booking emails), and `GOOGLE_CALENDAR_ID`/`GOOGLE_CLIENT_*`/`GOOGLE_REFRESH_TOKEN` or `GOOGLE_SERVICE_ACCOUNT_*` (real Google Calendar instead of mock slots).

The agent lives in the local workspace package `@ais-os/site-agent` (`packages/site-agent`, linked via `file:./packages/site-agent`) and is compiled through `transpilePackages` in `next.config.ts`, so editing package source hot-reloads in dev. `npm run lint` currently reports pre-existing errors/warnings in `src/lib/actions/registry.tsx` and `packages/site-agent/src/use-voice-agent.ts` — these are not environment issues.
