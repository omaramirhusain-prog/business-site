import type { AppointmentSlot, BookAppointmentInput, BookAppointmentResult } from "@/lib/calendar/types";
import { getCalendarClient, isGoogleCalendarConfigured } from "@/lib/calendar/auth";

export { isGoogleCalendarConfigured };

const SLOT_TIMES = ["10:00 AM", "1:00 PM", "3:30 PM"];
const WEEKDAY_COUNT = 5;

function getTimezone() {
  return process.env.CALENDAR_TIMEZONE ?? "America/New_York";
}

function getDurationMinutes() {
  const raw = Number(process.env.BOOKING_DURATION_MINUTES ?? "30");
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}

async function calendarApi() {
  return getCalendarClient();
}

function parseTimeLabel(time: string, date: string): Date | null {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3].toLowerCase();

  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;

  const d = new Date(`${date}T00:00:00`);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function formatSlotLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: getTimezone(),
  });
}

function buildWeekdayDates(count: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  let offset = 1;

  while (dates.length < count) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    offset++;
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    dates.push(d);
  }

  return dates;
}

export async function getGoogleAvailableSlots(): Promise<AppointmentSlot[]> {
  if (!isGoogleCalendarConfigured()) {
    throw new Error("Google Calendar is not configured");
  }

  const calendar = await calendarApi();
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;
  const tz = getTimezone();
  const weekdays = buildWeekdayDates(WEEKDAY_COUNT);

  const timeMin = new Date(weekdays[0]!);
  timeMin.setHours(0, 0, 0, 0);
  const timeMax = new Date(weekdays[weekdays.length - 1]!);
  timeMax.setHours(23, 59, 59, 999);

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: tz,
      items: [{ id: calendarId }],
    },
  });

  const busy = freeBusy.data.calendars?.[calendarId]?.busy ?? [];
  const slots: AppointmentSlot[] = [];

  for (const day of weekdays) {
    const date = day.toISOString().slice(0, 10);
    const availableTimes: string[] = [];
    const duration = getDurationMinutes();

    for (const label of SLOT_TIMES) {
      const start = parseTimeLabel(label, date);
      if (!start) continue;

      const end = new Date(start.getTime() + duration * 60_000);
      const overlaps = busy.some((block) => {
        if (!block.start || !block.end) return false;
        const bStart = new Date(block.start).getTime();
        const bEnd = new Date(block.end).getTime();
        return start.getTime() < bEnd && end.getTime() > bStart;
      });

      if (!overlaps) availableTimes.push(label);
    }

    if (availableTimes.length > 0) {
      slots.push({
        date,
        label: formatSlotLabel(day),
        times: availableTimes,
      });
    }
  }

  return slots;
}

export async function createGoogleBooking(
  input: BookAppointmentInput
): Promise<BookAppointmentResult> {
  if (!isGoogleCalendarConfigured()) {
    return {
      ok: false,
      message: "Google Calendar is not configured on the server.",
    };
  }

  const start = parseTimeLabel(input.time, input.date);
  if (!start) {
    return { ok: false, message: `Could not parse time "${input.time}".` };
  }

  const duration = getDurationMinutes();
  const end = new Date(start.getTime() + duration * 60_000);
  const calendar = await calendarApi();
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;
  const tz = getTimezone();

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Discovery call — ${input.name}`,
        description: [
          `Visitor: ${input.name}`,
          `Email: ${input.email}`,
          input.notes ? `Notes: ${input.notes}` : "",
          "Booked via Omar's website voice/chat assistant.",
        ]
          .filter(Boolean)
          .join("\n"),
        start: { dateTime: start.toISOString(), timeZone: tz },
        end: { dateTime: end.toISOString(), timeZone: tz },
        attendees: [{ email: input.email }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      },
      sendUpdates: "all",
    });

    return {
      ok: true,
      message: `Booked ${input.name} for ${formatSlotLabel(start)} at ${input.time}. Confirmation sent to ${input.email}.`,
      eventId: event.data.id ?? undefined,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create calendar event.";
    return { ok: false, message };
  }
}
