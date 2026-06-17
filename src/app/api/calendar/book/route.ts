import { NextResponse } from "next/server";
import { z } from "zod";
import { bookAppointment } from "@/lib/calendar";
import { sendBookingEmails } from "@/lib/email/booking";

export const runtime = "nodejs";

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  notes: z.string().optional(),
});

function formatDateLabel(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: process.env.CALENDAR_TIMEZONE ?? "America/New_York",
  });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid booking details." },
        { status: 400 }
      );
    }

    const result = await bookAppointment(parsed.data);
    if (!result.ok) {
      return NextResponse.json(result, { status: 500 });
    }

    const dateLabel = formatDateLabel(parsed.data.date);
    const emailResult = await sendBookingEmails({
      ...parsed.data,
      dateLabel,
    });

    const message = emailResult.sent
      ? `${result.message} Confirmation email sent.`
      : result.message;

    return NextResponse.json({ ...result, message, emailSent: emailResult.sent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
