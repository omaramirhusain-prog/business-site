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
  "faq",
] as const;

export const VOICE_ID_VALUES = [
  "tier-landing",
  "tier-signature",
  "tier-custom",
  "service-3d",
  "service-ai",
  "service-performance",
  "service-design",
] as const;

export type { ActionDefinition };

export const actionDefinitions: ActionDefinition[] = [
  {
    name: "navigateTo",
    description:
      "Scroll the page to a section. Use for 'show pricing', 'take me to contact', 'go to work/projects', 'go home', 'show FAQ'.",
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
    name: "readSection",
    description:
      "Read aloud the text content of a page section. Use when they ask what's on a section, to read pricing, or 'tell me about your services'.",
    parameters: z.object({
      section: z
        .enum(SECTION_VALUES)
        .describe("Section to read."),
    }),
  },
  {
    name: "highlightElement",
    description:
      "Highlight and scroll to a specific card or tier on the page. Use for 'show me Signature', 'highlight the AI service', pricing tiers.",
    parameters: z.object({
      voiceId: z
        .enum(VOICE_ID_VALUES)
        .describe("The data-voice-id of the element to highlight."),
    }),
  },
  {
    name: "repeatLast",
    description:
      "Repeat the last spoken assistant response. Use for 'say that again', 'repeat', 'what did you say'.",
    parameters: z.object({}),
  },
  {
    name: "stopSpeaking",
    description:
      "Stop the assistant from speaking. Use for 'stop talking', 'be quiet', 'hold on'.",
    parameters: z.object({}),
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
      "Close the booking dialog without confirming. Use for 'close booking', 'cancel appointment dialog', 'never mind on booking'.",
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
    name: "getBookingStatus",
    description:
      "Tell the visitor what appointment they booked in this session, if any.",
    parameters: z.object({}),
  },
  {
    name: "rescheduleAppointment",
    description:
      "Change the visitor's booked appointment to a new date and time. Requires a prior booking in this session.",
    parameters: z.object({
      date: z.string().describe("New date: ISO or weekday."),
      time: z.string().describe("New time like 1:00 PM."),
    }),
  },
  {
    name: "cancelAppointment",
    description:
      "Cancel the visitor's booked appointment from this session.",
    parameters: z.object({}),
  },
  {
    name: "startProject",
    description:
      "Take the visitor to the contact / start-a-project area to begin a project with Omar.",
    parameters: z.object({}),
  },
  {
    name: "submitLead",
    description:
      "Submit a project inquiry with name, email, and message. Use when they describe their project and give contact info without booking a call.",
    parameters: z.object({
      name: z.string().describe("Visitor's full name."),
      email: z.string().email().describe("Visitor's email."),
      message: z
        .string()
        .describe("Project description, timeline, budget notes, etc."),
    }),
  },
  {
    name: "openExternalLink",
    description:
      "Open an external link such as email or Instagram. Use for 'email Omar', 'open Instagram'.",
    parameters: z.object({
      target: z
        .enum(["email", "instagram"])
        .describe("Which external link to open."),
    }),
  },
  {
    name: "startGuidedTour",
    description:
      "Give a guided voice tour of the site: home, services, work, pricing, contact. Use for 'give me a tour', 'show me around'.",
    parameters: z.object({}),
  },
  {
    name: "getFAQAnswer",
    description:
      "Answer a common question from the site FAQ. Use for general questions about pricing, timeline, process, or AI assistants.",
    parameters: z.object({
      question: z
        .string()
        .describe("The visitor's question or topic."),
    }),
  },
  {
    name: "controlScene",
    description:
      "Control the 3D hero scene. Use for 'spin faster', 'make it calmer', 'change color to blue', 'slow down the animation'.",
    parameters: z.object({
      spinSpeed: z.number().optional().describe("Animation speed, 0.5 to 3."),
      distort: z.number().optional().describe("Shape distortion, 0.1 to 0.8."),
      color: z
        .string()
        .optional()
        .describe("Hex color like #7c5cff or color name blue/purple/cyan."),
      floatIntensity: z.number().optional().describe("Float amount, 0.5 to 3."),
    }),
  },
];
