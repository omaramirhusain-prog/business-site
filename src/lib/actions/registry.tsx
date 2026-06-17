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
import {
  createActionsFromDefinitions,
  runAction,
  scrollPage as scrollPageFn,
  scrollToSection,
  type ActionResult,
  type SiteAction,
} from "@ais-os/site-agent";
import { actionDefinitions } from "@/lib/actions/definitions";
import { SECTIONS, createSiteHandlers } from "@/lib/actions/handlers";
import type { AppointmentSlot } from "@/lib/calendar/types";

export { SECTIONS };

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

async function fetchAppointmentSlots(): Promise<AppointmentSlot[]> {
  const res = await fetch("/api/calendar/slots");
  if (!res.ok) throw new Error("Could not load availability.");
  const data = (await res.json()) as { slots: AppointmentSlot[] };
  return data.slots;
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
    scrollToSection(target, SECTIONS);
  }, []);

  const scrollPage = useCallback((direction: "up" | "down" | "top") => {
    scrollPageFn(direction);
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
    const handlers = createSiteHandlers({
      navigate,
      scrollPage,
      setChatOpen,
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
      loadSlots,
      setAppointmentDate,
      setAppointmentTime,
      setAppointmentBooked,
      setAppointmentBooking,
    });
    return createActionsFromDefinitions(actionDefinitions, handlers);
  }, [
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
    loadSlots,
  ]);

  const runActionFn = useCallback(
    (name: string, args: Record<string, unknown> = {}) => runAction(actions, name, args),
    [actions]
  );

  const value = useMemo<ActionContextValue>(
    () => ({
      actions,
      runAction: runActionFn,
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
      runActionFn,
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
