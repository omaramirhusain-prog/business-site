import type { SectionMap } from "@ais-os/site-agent";
import {
  getVoiceControl,
  highlightElementByVoiceId,
  readSectionText,
} from "@ais-os/site-agent";
import { resolveAppointmentSlot } from "@/lib/calendar/parse-slot";
import type { AppointmentSlot } from "@/lib/calendar/types";
import {
  clearBookingSession,
  getBookingSession,
  setBookingSession,
} from "@/lib/booking-session";
import { findFaqAnswer } from "@/lib/faq";
import { siteConfig } from "@/lib/site-config";
import type { SceneControls } from "@/components/scene-context";

export const SECTIONS: SectionMap = {
  home: { id: "top", aliases: ["home", "top", "start", "beginning"] },
  services: { id: "services", aliases: ["services", "what you do", "offerings"] },
  results: { id: "results", aliases: ["results", "gallery", "work", "transformations"] },
  process: { id: "process", aliases: ["process", "how it works", "detailing steps"] },
  packages: { id: "packages", aliases: ["packages", "pricing", "price", "cost", "plans"] },
  contact: { id: "contact", aliases: ["contact", "get in touch", "reach you"] },
  faq: { id: "faq", aliases: ["faq", "questions", "answers"] },
};

const COLOR_MAP: Record<string, string> = {
  blue: "#21d4fd",
  purple: "#9f7aea",
  cyan: "#21d4fd",
  violet: "#9f7aea",
  pink: "#e879f9",
  green: "#d8ff55",
};

export type AppointmentState = {
  appointmentOpen: boolean;
  appointmentSlots: AppointmentSlot[];
  appointmentSlotsLoading: boolean;
  appointmentDate: string | null;
  appointmentTime: string | null;
  appointmentBooked: boolean;
  appointmentBooking: boolean;
  openAppointment: () => void;
  closeAppointment: () => void;
  resetAppointment: () => void;
  selectAppointmentDay: (date: string) => void;
  loadSlots: () => Promise<AppointmentSlot[]>;
  setAppointmentDate: (date: string | null) => void;
  setAppointmentTime: (time: string | null) => void;
  setAppointmentBooked: (booked: boolean) => void;
  setAppointmentBooking: (booking: boolean) => void;
};

export type SiteHandlerDeps = AppointmentState & {
  navigate: (target: string) => void;
  scrollPage: (direction: "up" | "down" | "top") => void;
  setChatOpen: (open: boolean) => void;
  startGuidedTour: () => Promise<string>;
  applySceneControl: (args: Partial<SceneControls>) => string;
};

function slotsSummary(slots: AppointmentSlot[]): string {
  if (slots.length === 0) return "No appointment slots are available right now.";
  return slots.map((s) => `${s.label}: ${s.times.join(", ")}`).join("; ");
}

function resolveSceneColor(input?: string): string | undefined {
  if (!input) return undefined;
  const lower = input.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  if (/^#[0-9a-f]{3,8}$/i.test(lower)) return lower;
  return undefined;
}

export function createSiteHandlers(deps: SiteHandlerDeps) {
  return {
    navigateTo: (args: Record<string, unknown>) => {
      const section = String(args.section ?? "");
      deps.navigate(section);
      return `Navigated to the ${section} section.`;
    },
    scrollPage: (args: Record<string, unknown>) => {
      const direction = args.direction as "up" | "down" | "top";
      deps.scrollPage(direction);
      if (direction === "top") return "Scrolled back to the top.";
      return direction === "down" ? "Scrolled down." : "Scrolled up.";
    },
    readSection: (args: Record<string, unknown>) => {
      const section = String(args.section ?? "home");
      deps.navigate(section);
      const text = readSectionText(section, SECTIONS);
      return text;
    },
    highlightElement: (args: Record<string, unknown>) => {
      const voiceId = String(args.voiceId ?? "");
      return highlightElementByVoiceId(voiceId);
    },
    repeatLast: async () => {
      const vc = getVoiceControl();
      if (!vc) return "Voice repeat is not available right now.";
      return vc.repeatLast();
    },
    stopSpeaking: () => {
      const vc = getVoiceControl();
      if (!vc) return "Voice control is not available right now.";
      return vc.stopSpeaking();
    },
    openChat: () => {
      deps.setChatOpen(true);
      return "Opened the chat panel.";
    },
    closeChat: () => {
      deps.setChatOpen(false);
      return "Closed the chat panel.";
    },
    openAppointmentBooking: async () => {
      deps.openAppointment();
      const slots =
        deps.appointmentSlots.length > 0
          ? deps.appointmentSlots
          : await deps.loadSlots();
      return `Opened booking. Available: ${slotsSummary(slots)}`;
    },
    closeAppointmentBooking: () => {
      deps.closeAppointment();
      return "Closed the booking dialog.";
    },
    checkAppointmentAvailability: async () => {
      const slots =
        deps.appointmentSlots.length > 0
          ? deps.appointmentSlots
          : await deps.loadSlots();
      return slotsSummary(slots);
    },
    selectAppointmentSlot: async (args: Record<string, unknown>) => {
      deps.openAppointment();
      const slots =
        deps.appointmentSlots.length > 0
          ? deps.appointmentSlots
          : await deps.loadSlots();
      const date = String(args.date ?? "");
      const time = String(args.time ?? "");
      const resolved = resolveAppointmentSlot(slots, date, time);

      if (!resolved) {
        return `Could not match ${date} at ${time}. Available: ${slotsSummary(slots)}`;
      }

      deps.setAppointmentDate(resolved.date);
      deps.setAppointmentTime(resolved.time);
      deps.setAppointmentBooked(false);
      return `Selected ${resolved.label} at ${resolved.time}. Ask for their name and email to confirm.`;
    },
    confirmAppointment: async (args: Record<string, unknown>) => {
      const name = String(args.name ?? "").trim();
      const email = String(args.email ?? "").trim();
      const notes = args.notes ? String(args.notes) : undefined;

      if (!deps.appointmentDate || !deps.appointmentTime) {
        return "No slot selected yet. Use selectAppointmentSlot or ask what time works, then confirm.";
      }

      deps.setAppointmentBooking(true);
      try {
        const res = await fetch("/api/calendar/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: deps.appointmentDate,
            time: deps.appointmentTime,
            name,
            email,
            notes,
          }),
        });
        const data = (await res.json()) as { ok: boolean; message: string };
        if (!data.ok) return data.message;

        deps.setAppointmentBooked(true);
        setBookingSession({
          date: deps.appointmentDate,
          time: deps.appointmentTime,
          name,
          email,
          notes,
          bookedAt: new Date().toISOString(),
        });
        return data.message;
      } catch {
        return "Booking failed. Please try again.";
      } finally {
        deps.setAppointmentBooking(false);
      }
    },
    getBookingStatus: () => {
      const session = getBookingSession();
      if (!session) {
        return "You don't have a booking saved in this session yet.";
      }
      return `You're booked for ${session.date} at ${session.time} as ${session.name}.`;
    },
    rescheduleAppointment: async (args: Record<string, unknown>) => {
      const session = getBookingSession();
      if (!session) {
        return "No booking found in this session. Book a call first, then you can reschedule.";
      }

      const slots =
        deps.appointmentSlots.length > 0
          ? deps.appointmentSlots
          : await deps.loadSlots();
      const date = String(args.date ?? "");
      const time = String(args.time ?? "");
      const resolved = resolveAppointmentSlot(slots, date, time);

      if (!resolved) {
        return `Could not match ${date} at ${time}. Available: ${slotsSummary(slots)}`;
      }

      deps.openAppointment();
      deps.setAppointmentDate(resolved.date);
      deps.setAppointmentTime(resolved.time);

      deps.setAppointmentBooking(true);
      try {
        const res = await fetch("/api/calendar/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: resolved.date,
            time: resolved.time,
            name: session.name,
            email: session.email,
            notes: session.notes
              ? `${session.notes} (rescheduled from ${session.date} ${session.time})`
              : `Rescheduled from ${session.date} ${session.time}`,
          }),
        });
        const data = (await res.json()) as { ok: boolean; message: string };
        if (!data.ok) return data.message;

        setBookingSession({
          ...session,
          date: resolved.date,
          time: resolved.time,
        });
        deps.setAppointmentBooked(true);
        return `Rescheduled to ${resolved.label} at ${resolved.time}. ${data.message}`;
      } catch {
        return "Reschedule failed. Please try again.";
      } finally {
        deps.setAppointmentBooking(false);
      }
    },
    cancelAppointment: () => {
      const session = getBookingSession();
      clearBookingSession();
      deps.closeAppointment();
      deps.resetAppointment();
      if (!session) {
        return "No active booking in this session.";
      }
      return `Cancelled your ${session.date} at ${session.time} booking in this session. Email ${siteConfig.email} if you need to cancel a confirmed calendar event.`;
    },
    startProject: () => {
      deps.navigate("contact");
      return "Opened the start-a-project / contact area.";
    },
    submitLead: async (args: Record<string, unknown>) => {
      const name = String(args.name ?? "").trim();
      const email = String(args.email ?? "").trim();
      const message = String(args.message ?? "").trim();

      if (!name || !email || !message) {
        return "I need your name, email, and a short project description to send your inquiry.";
      }

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message, source: "voice/chat assistant" }),
        });
        const data = (await res.json()) as { ok: boolean; message: string };
        return data.message;
      } catch {
        return "Could not send your inquiry. Try emailing directly.";
      }
    },
    openExternalLink: (args: Record<string, unknown>) => {
      const target = String(args.target ?? "");
      if (target === "email") {
        window.location.href = `mailto:${siteConfig.email}`;
        return `Opening email to ${siteConfig.email}.`;
      }
      if (target === "instagram" && siteConfig.instagram) {
        window.open(siteConfig.instagram, "_blank", "noopener,noreferrer");
        return "Opening Instagram.";
      }
      if (target === "instagram") {
        return "Instagram is not linked on this site yet.";
      }
      return "Unknown link target.";
    },
    startGuidedTour: async () => deps.startGuidedTour(),
    getFAQAnswer: (args: Record<string, unknown>) => {
      const question = String(args.question ?? "");
      const match = findFaqAnswer(question);
      if (match) {
        deps.navigate("faq");
        return match.answer;
      }
      return "I don't have a specific FAQ for that. Want to book a discovery call or leave your project details?";
    },
    controlScene: (args: Record<string, unknown>) => {
      deps.navigate("home");
      const color = resolveSceneColor(
        args.color ? String(args.color) : undefined
      );
      return deps.applySceneControl({
        spinSpeed:
          typeof args.spinSpeed === "number" ? args.spinSpeed : undefined,
        distort: typeof args.distort === "number" ? args.distort : undefined,
        color,
        floatIntensity:
          typeof args.floatIntensity === "number"
            ? args.floatIntensity
            : undefined,
      });
    },
  };
}
