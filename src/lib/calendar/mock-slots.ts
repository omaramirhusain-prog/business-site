import type { AppointmentSlot } from "@/lib/calendar/types";

const DEFAULT_TIMES = ["10:00 AM", "1:00 PM", "3:30 PM"];

/** Mock weekday slots when Google Calendar is not configured. */
export function getMockAvailableSlots(count = 5): AppointmentSlot[] {
  const slots: AppointmentSlot[] = [];
  const now = new Date();
  let added = 0;
  let offset = 1;

  while (added < count) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    offset++;
    const day = d.getDay();
    if (day === 0 || day === 6) continue;

    slots.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      times: DEFAULT_TIMES,
    });
    added++;
  }

  return slots;
}
