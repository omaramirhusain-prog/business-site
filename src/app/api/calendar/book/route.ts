import { NextResponse } from "next/server";
import { z } from "zod";
import { bookAppointment } from "@/lib/calendar";

export const runtime = "nodejs";

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  notes: z.string().optional(),
});

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
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
