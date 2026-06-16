import { z } from "zod";

/**
 * Shared action definitions — the single source of truth for what the agent
 * can do. Imported by the client registry (which attaches the runtime
 * handlers) and by the server route (which exposes them to the LLM as tools).
 * Keep this file free of React / browser code so the server can import it.
 */

export const SECTION_VALUES = [
  "home",
  "services",
  "work",
  "process",
  "pricing",
  "contact",
] as const;

export type ActionDefinition = {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
};

export const actionDefinitions: ActionDefinition[] = [
  {
    name: "navigateTo",
    description:
      "Scroll the page to a section. Use for requests like 'show pricing', 'take me to contact', 'go to the work/projects', 'go home'.",
    parameters: z.object({
      section: z
        .enum(SECTION_VALUES)
        .describe("Which section of the site to navigate to."),
    }),
  },
  {
    name: "openAppointmentBooking",
    description:
      "Open the appointment booking dialog so the visitor can see available dates and book a call with Omar. Use for 'book an appointment', 'schedule a call', 'set up a meeting'.",
    parameters: z.object({}),
  },
  {
    name: "startProject",
    description:
      "Take the visitor to the contact / start-a-project area to begin a project with Omar.",
    parameters: z.object({}),
  },
  {
    name: "openChat",
    description: "Open the text chat assistant panel.",
    parameters: z.object({}),
  },
];
