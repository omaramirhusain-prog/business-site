import { getGoogleAvailableSlots, createGoogleBooking, isGoogleCalendarConfigured } from "@/lib/calendar/google";
import { getMockAvailableSlots } from "@/lib/calendar/mock-slots";
import type { AppointmentSlot, BookAppointmentInput, BookAppointmentResult } from "@/lib/calendar/types";

export type { AppointmentSlot, BookAppointmentInput, BookAppointmentResult };

export function slotsSummary(slots: AppointmentSlot[]): string {
  if (slots.length === 0) return "No appointment slots are available right now.";
  return slots
    .map((s) => `${s.label}: ${s.times.join(", ")}`)
    .join("; ");
}

export async function getAvailableSlots(): Promise<{
  slots: AppointmentSlot[];
  source: "google" | "mock";
}> {
  if (isGoogleCalendarConfigured()) {
    try {
      const slots = await getGoogleAvailableSlots();
      if (slots.length > 0) return { slots, source: "google" };
    } catch {
      // Fall through to mock if Google API fails.
    }
  }
  return { slots: getMockAvailableSlots(), source: "mock" };
}

export async function bookAppointment(
  input: BookAppointmentInput
): Promise<BookAppointmentResult> {
  if (isGoogleCalendarConfigured()) {
    return createGoogleBooking(input);
  }

  return {
    ok: true,
    message: `Demo booking saved for ${input.name} on ${input.date} at ${input.time}. Connect Google Calendar to create real events.`,
  };
}
