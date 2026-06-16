import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/calendar";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { slots, source } = await getAvailableSlots();
    return NextResponse.json({ slots, source });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load slots.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
