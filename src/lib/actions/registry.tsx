"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { actionDefinitions } from "@/lib/actions/definitions";

/**
 * Site Action Registry
 * --------------------
 * The reusable core of the voice/chat agent. Every interactive capability on
 * the site is registered here as a typed action with a plain-English
 * description. Both the voice agent and the text chat run through this registry,
 * and future sites only need to redefine their own actions.
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
  // Direct controls (also exposed so plain UI clicks share the same plumbing)
  navigate: (target: string) => void;
  appointmentOpen: boolean;
  openAppointment: () => void;
  closeAppointment: () => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
};

const ActionContext = createContext<ActionContextValue | null>(null);

/** Navigable sections + the words a user might say to reach them. */
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

export function ActionProvider({ children }: { children: ReactNode }) {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = useCallback((target: string) => {
    if (typeof document === "undefined") return;
    const id = resolveSection(target) ?? target;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openAppointment = useCallback(() => setAppointmentOpen(true), []);
  const closeAppointment = useCallback(() => setAppointmentOpen(false), []);

  const actions = useMemo<SiteAction[]>(() => {
    const handlers: Record<string, SiteAction["run"]> = {
      navigateTo: (args) => {
        const section = String(args.section ?? "");
        navigate(section);
        return `Navigated to the ${section} section.`;
      },
      openAppointmentBooking: () => {
        openAppointment();
        return "Opened the appointment booking dialog with available dates.";
      },
      startProject: () => {
        navigate("contact");
        return "Opened the start-a-project / contact area.";
      },
      openChat: () => {
        setChatOpen(true);
        return "Opened the chat panel.";
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
  }, [navigate, openAppointment]);

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
      appointmentOpen,
      openAppointment,
      closeAppointment,
      chatOpen,
      setChatOpen,
    }),
    [
      actions,
      runAction,
      navigate,
      appointmentOpen,
      openAppointment,
      closeAppointment,
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
