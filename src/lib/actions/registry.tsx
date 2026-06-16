"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { actionDefinitions } from "@/lib/actions/definitions";
import { resolveAppointmentSlot } from "@/lib/calendar/parse-slot";
import type { AppointmentSlot } from "@/lib/calendar/types";

/**
 * Site Action Registry
 * --------------------
 * Every interactive capability on the site is registered here as a typed action.
 * Voice and text chat both run through this registry.
 */

export type SiteAction = {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
  run: (args: Record<string, unknown>) => Promise<string> | string;
};

export type ActionResult = {
  ok: boolean;
  message: string;
};

type ActionContextValue = {
  actions: SiteAction[];
  runAction: (name: string, args?: Record<string, unknown>) => Promise<ActionResult>;
  navigate: (target: string) => void;
  scrollPage: (direction: "up" | "down" | "top") => void;
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
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
};

const ActionContext = createContext<ActionContextValue | null>(null);

export const SECTIONS: Record<string, { id: string; aliases: string[] }> = {
  home: { id: "top", aliases: ["home", "top", "start", "beginning"] },
  services: { id: "services", aliases: ["services", "what you do", "offerings"] },
  work: { id: "work", aliases: ["work", "projects", "portfolio", "case studies"] },
  process: { id: "process", aliases: ["process", "how it works", "steps"] },
  pricing: { id: "pricing", aliases: ["pricing", "price", "cost", "rates", "plans"] },
  contact: { id: "contact", aliases: ["contact", "get in touch", "reach you"] },
};

function resolveSection(target: string): string | null {
  const t = target.toLowerCase().trim();
  for (const key of Object.keys(SECTIONS)) {
    const s = SECTIONS[key];
    if (key === t || s.id === t || s.aliases.some((a) => t.includes(a))) {
      return s.id;
    }
  }
  return null;
}

async function fetchAppointmentSlots(): Promise<AppointmentSlot[]> {
  const res = await fetch("/api/calendar/slots");
  if (!res.ok) throw new Error("Could not load availability.");
  const data = (await res.json()) as { slots: AppointmentSlot[] };
  return data.slots;
}

function slotsSummary(slots: AppointmentSlot[]): string {
  if (slots.length === 0) return "No appointment slots are available right now.";
  return slots.map((s) => `${s.label}: ${s.times.join(", ")}`).join("; ");
}

export function ActionProvider({ children }: { children: ReactNode }) {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);
  const [appointmentSlotsLoading, setAppointmentSlotsLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [appointmentBooking, setAppointmentBooking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const loadSlots = useCallback(async () => {
    setAppointmentSlotsLoading(true);
    try {
      const slots = await fetchAppointmentSlots();
      setAppointmentSlots(slots);
      return slots;
    } catch {
      setAppointmentSlots([]);
      return [] as AppointmentSlot[];
    } finally {
      setAppointmentSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const navigate = useCallback((target: string) => {
    if (typeof document === "undefined") return;
    const id = resolveSection(target) ?? target;

    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("section-flash");
      window.setTimeout(() => el.classList.remove("section-flash"), 1400);
    });
  }, []);

  const scrollPage = useCallback((direction: "up" | "down" | "top") => {
    if (typeof window === "undefined") return;
    if (direction === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const amount = direction === "down" ? window.innerHeight * 0.85 : -window.innerHeight * 0.85;
    window.scrollBy({ top: amount, behavior: "smooth" });
  }, []);

  const resetAppointment = useCallback(() => {
    setAppointmentDate(null);
    setAppointmentTime(null);
    setAppointmentBooked(false);
    setAppointmentBooking(false);
  }, []);

  const openAppointment = useCallback(() => {
    setAppointmentOpen(true);
    void loadSlots();
  }, [loadSlots]);

  const closeAppointment = useCallback(() => {
    setAppointmentOpen(false);
    window.setTimeout(resetAppointment, 250);
  }, [resetAppointment]);

  const selectAppointmentDay = useCallback((date: string) => {
    setAppointmentDate(date);
    setAppointmentTime(null);
    setAppointmentBooked(false);
  }, []);

  const actions = useMemo<SiteAction[]>(() => {
    const handlers: Record<string, SiteAction["run"]> = {
      navigateTo: (args) => {
        const section = String(args.section ?? "");
        navigate(section);
        return `Navigated to the ${section} section.`;
      },
      scrollPage: (args) => {
        const direction = args.direction as "up" | "down" | "top";
        scrollPage(direction);
        if (direction === "top") return "Scrolled back to the top.";
        return direction === "down" ? "Scrolled down." : "Scrolled up.";
      },
      openChat: () => {
        setChatOpen(true);
        return "Opened the chat panel.";
      },
      closeChat: () => {
        setChatOpen(false);
        return "Closed the chat panel.";
      },
      openAppointmentBooking: async () => {
        openAppointment();
        const slots =
          appointmentSlots.length > 0 ? appointmentSlots : await loadSlots();
        return `Opened booking. Available: ${slotsSummary(slots)}`;
      },
      closeAppointmentBooking: () => {
        closeAppointment();
        return "Closed the booking dialog.";
      },
      checkAppointmentAvailability: async () => {
        const slots =
          appointmentSlots.length > 0 ? appointmentSlots : await loadSlots();
        return slotsSummary(slots);
      },
      selectAppointmentSlot: async (args) => {
        openAppointment();
        const slots =
          appointmentSlots.length > 0 ? appointmentSlots : await loadSlots();
        const date = String(args.date ?? "");
        const time = String(args.time ?? "");
        const resolved = resolveAppointmentSlot(slots, date, time);

        if (!resolved) {
          return `Could not match ${date} at ${time}. Available: ${slotsSummary(slots)}`;
        }

        setAppointmentDate(resolved.date);
        setAppointmentTime(resolved.time);
        setAppointmentBooked(false);
        return `Selected ${resolved.label} at ${resolved.time}. Ask for their name and email to confirm.`;
      },
      confirmAppointment: async (args) => {
        const name = String(args.name ?? "").trim();
        const email = String(args.email ?? "").trim();
        const notes = args.notes ? String(args.notes) : undefined;

        if (!appointmentDate || !appointmentTime) {
          return "No slot selected yet. Use selectAppointmentSlot or ask what time works, then confirm.";
        }

        setAppointmentBooking(true);
        try {
          const res = await fetch("/api/calendar/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: appointmentDate,
              time: appointmentTime,
              name,
              email,
              notes,
            }),
          });
          const data = (await res.json()) as { ok: boolean; message: string };
          if (!data.ok) return data.message;

          setAppointmentBooked(true);
          return data.message;
        } catch {
          return "Booking failed. Please try again.";
        } finally {
          setAppointmentBooking(false);
        }
      },
      startProject: () => {
        navigate("contact");
        return "Opened the start-a-project / contact area.";
      },
    };

    return actionDefinitions.map((def) => ({
      name: def.name,
      description: def.description,
      parameters: def.parameters,
      run:
        handlers[def.name] ??
        (() => `No handler registered for action "${def.name}".`),
    }));
  }, [
    navigate,
    scrollPage,
    openAppointment,
    closeAppointment,
    loadSlots,
    appointmentSlots,
    appointmentDate,
    appointmentTime,
  ]);

  const runAction = useCallback(
    async (name: string, args: Record<string, unknown> = {}): Promise<ActionResult> => {
      const action = actions.find((a) => a.name === name);
      if (!action) {
        return { ok: false, message: `Unknown action: ${name}` };
      }
      try {
        const parsed = action.parameters.safeParse(args);
        const finalArgs = parsed.success ? (parsed.data as Record<string, unknown>) : args;
        const message = await action.run(finalArgs);
        return { ok: true, message };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : "Action failed.",
        };
      }
    },
    [actions]
  );

  const value = useMemo<ActionContextValue>(
    () => ({
      actions,
      runAction,
      navigate,
      scrollPage,
      appointmentOpen,
      appointmentSlots,
      appointmentSlotsLoading,
      appointmentDate,
      appointmentTime,
      appointmentBooked,
      appointmentBooking,
      openAppointment,
      closeAppointment,
      resetAppointment,
      selectAppointmentDay,
      chatOpen,
      setChatOpen,
    }),
    [
      actions,
      runAction,
      navigate,
      scrollPage,
      appointmentOpen,
      appointmentSlots,
      appointmentSlotsLoading,
      appointmentDate,
      appointmentTime,
      appointmentBooked,
      appointmentBooking,
      openAppointment,
      closeAppointment,
      resetAppointment,
      selectAppointmentDay,
      chatOpen,
    ]
  );

  return <ActionContext.Provider value={value}>{children}</ActionContext.Provider>;
}

export function useSiteActions() {
  const ctx = useContext(ActionContext);
  if (!ctx) {
    throw new Error("useSiteActions must be used within an ActionProvider");
  }
  return ctx;
}
