import type { SectionMap } from "@ais-os/site-agent";
import { resolveAppointmentSlot } from "@/lib/calendar/parse-slot";
import type { AppointmentSlot } from "@/lib/calendar/types";

export const SECTIONS: SectionMap = {
  home: { id: "top", aliases: ["home", "top", "start", "beginning"] },
  services: { id: "services", aliases: ["services", "what you do", "offerings"] },
  work: { id: "work", aliases: ["work", "projects", "portfolio", "case studies"] },
  process: { id: "process", aliases: ["process", "how it works", "steps"] },
  pricing: { id: "pricing", aliases: ["pricing", "price", "cost", "rates", "plans"] },
  contact: { id: "contact", aliases: ["contact", "get in touch", "reach you"] },
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
};

function slotsSummary(slots: AppointmentSlot[]): string {
  if (slots.length === 0) return "No appointment slots are available right now.";
  return slots.map((s) => `${s.label}: ${s.times.join(", ")}`).join("; ");
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
        return data.message;
      } catch {
        return "Booking failed. Please try again.";
      } finally {
        deps.setAppointmentBooking(false);
      }
    },
    startProject: () => {
      deps.navigate("contact");
      return "Opened the start-a-project / contact area.";
    },
  };
}
