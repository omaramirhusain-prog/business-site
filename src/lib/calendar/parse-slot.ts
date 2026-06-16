import type { AppointmentSlot } from "@/lib/calendar/types";

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function normalizeTime(input: string): string | null {
  const t = input.trim().toLowerCase().replace(/\./g, "");
  if (!t) return null;

  const labeled = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (labeled) {
    const hours = Number(labeled[1]);
    const minutes = labeled[2] ?? "00";
    const meridiem = labeled[3]!.toUpperCase();
    return `${hours}:${minutes.padStart(2, "0")} ${meridiem}`;
  }

  const twentyFour = t.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    let hours = Number(twentyFour[1]);
    const minutes = twentyFour[2];
    const meridiem = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${meridiem}`;
  }

  return null;
}

function slotTimeKey(time: string) {
  const normalized = normalizeTime(time);
  if (!normalized) return time.trim().toLowerCase();
  return normalized.replace(/\s/g, "").toLowerCase();
}

function matchDate(slots: AppointmentSlot[], dateInput: string): AppointmentSlot | null {
  const raw = dateInput.trim().toLowerCase();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (iso) {
    return slots.find((s) => s.date === iso[1]) ?? null;
  }

  for (const slot of slots) {
    if (slot.label.toLowerCase().includes(raw)) return slot;
    if (slot.date.includes(raw)) return slot;
  }

  for (let i = 0; i < WEEKDAYS.length; i++) {
    if (!raw.includes(WEEKDAYS[i]!)) continue;
    const match = slots.find((s) => {
      const d = new Date(`${s.date}T12:00:00`);
      return d.getDay() === i;
    });
    if (match) return match;
  }

  if (raw === "today") return slots[0] ?? null;
  if (raw === "tomorrow") return slots[1] ?? slots[0] ?? null;

  return null;
}

function matchTime(slot: AppointmentSlot, timeInput: string): string | null {
  const key = slotTimeKey(timeInput);
  for (const t of slot.times) {
    if (slotTimeKey(t) === key) return t;
  }

  const normalized = normalizeTime(timeInput);
  if (!normalized) return null;

  for (const t of slot.times) {
    if (slotTimeKey(t) === slotTimeKey(normalized)) return t;
  }

  return null;
}

export function resolveAppointmentSlot(
  slots: AppointmentSlot[],
  dateInput: string,
  timeInput: string
): { date: string; time: string; label: string } | null {
  const day = matchDate(slots, dateInput);
  if (!day) return null;

  const time = matchTime(day, timeInput);
  if (!time) return null;

  return { date: day.date, time, label: day.label };
}
