import { z } from "zod";
import type { ActionDefinition } from "@ais-os/site-agent";

/**
 * Omar site actions — declare what the voice/chat agent can do.
 * Handlers live in handlers.ts; server tools are built from this list.
 */

export const SECTION_VALUES = [
  "home",
  "services",
  "work",
  "process",
  "pricing",
  "contact",
] as const;

export type { ActionDefinition };

export const actionDefinitions: ActionDefinition[] = [
  {
    name: "navigateTo",
    description:
      "Scroll the page to a section. Use for 'show pricing', 'take me to contact', 'go to work/projects', 'go home'.",
    parameters: z.object({
      section: z
        .enum(SECTION_VALUES)
        .describe("Which section of the site to navigate to."),
    }),
  },
  {
    name: "scrollPage",
    description:
      "Scroll the page up, down, or back to the top. Use for 'scroll down', 'go back up', 'back to top'.",
    parameters: z.object({
      direction: z
        .enum(["up", "down", "top"])
        .describe("Scroll direction."),
    }),
  },
  {
    name: "openChat",
    description:
      "Open the text chat assistant panel. Use for 'open chat', 'show the chat', 'let me type'.",
    parameters: z.object({}),
  },
  {
    name: "closeChat",
    description:
      "Close the text chat panel. Use for 'close chat', 'hide chat', 'minimize chat'.",
    parameters: z.object({}),
  },
  {
    name: "openAppointmentBooking",
    description:
      "Open the appointment booking dialog with available dates. Use for 'book an appointment', 'schedule a call', 'set up a meeting'.",
    parameters: z.object({}),
  },
  {
    name: "closeAppointmentBooking",
    description:
      "Close the booking dialog without confirming. Use for 'close booking', 'cancel appointment', 'never mind on booking'.",
    parameters: z.object({}),
  },
  {
    name: "checkAppointmentAvailability",
    description:
      "List available appointment dates and times for a discovery call. Use when the visitor asks what's available, before suggesting times, or to answer 'when can I book?'.",
    parameters: z.object({}),
  },
  {
    name: "selectAppointmentSlot",
    description:
      "Pick a date and time in the booking dialog. Opens the dialog if needed. Date can be YYYY-MM-DD or a weekday name; time like '10:00 AM' or '2pm'.",
    parameters: z.object({
      date: z.string().describe("Date: ISO YYYY-MM-DD or weekday like Tuesday."),
      time: z.string().describe("Time like 10:00 AM, 1:00 PM, or 2pm."),
    }),
  },
  {
    name: "confirmAppointment",
    description:
      "Book the currently selected appointment slot. Requires the visitor's name and email. Use after a slot is selected when they say 'confirm', 'book it', or give their contact info.",
    parameters: z.object({
      name: z.string().describe("Visitor's full name."),
      email: z.string().email().describe("Visitor's email for confirmation."),
      notes: z
        .string()
        .optional()
        .describe("Optional project notes or context."),
    }),
  },
  {
    name: "startProject",
    description:
      "Take the visitor to the contact / start-a-project area to begin a project with Omar.",
    parameters: z.object({}),
  },
];
