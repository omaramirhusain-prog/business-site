/**
 * Detect obvious intents from the user's words.
 * Runs immediately on send so the site acts even if the model skips a tool call.
 */

export type InferredAction = {
  name: string;
  args: Record<string, unknown>;
};

function extractEmail(text: string): string | null {
  const match = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return match?.[0] ?? null;
}

function extractSlotFromText(text: string): { date: string; time: string } | null {
  const t = text.toLowerCase();

  const atTime = t.match(
    /\b(?:at|for)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/
  );
  const time = atTime?.[1]?.replace(/\s+/g, " ").trim();
  if (!time) return null;

  const dayMatch = t.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow)\b/
  );
  const isoMatch = t.match(/\b(\d{4}-\d{2}-\d{2})\b/);

  const date = isoMatch?.[1] ?? dayMatch?.[1];
  if (!date) return null;

  return { date, time };
}

export function inferActionsFromUserText(text: string): InferredAction[] {
  const t = text.toLowerCase();
  const actions: InferredAction[] = [];

  const wantsNav =
    /\b(show|see|go|take|navigate|scroll|open|view|bring|jump)\b/.test(t) ||
    /\b(where|what).*(pric|cost|plan|service|work|portfolio|process|contact)\b/.test(t);

  if (/\b(home|top|start|beginning)\b/.test(t) && wantsNav) {
    actions.push({ name: "navigateTo", args: { section: "home" } });
  } else if (/\b(pric(e|ing)|prices|cost|rates|plans|how much)\b/.test(t)) {
    actions.push({ name: "navigateTo", args: { section: "pricing" } });
  } else if (/\b(work|portfolio|projects|case stud)/.test(t)) {
    actions.push({ name: "navigateTo", args: { section: "work" } });
  } else if (/\b(services|what you do|offerings|what you build)\b/.test(t)) {
    actions.push({ name: "navigateTo", args: { section: "services" } });
  } else if (/\b(process|how it works|how we work|how you work)\b/.test(t)) {
    actions.push({ name: "navigateTo", args: { section: "process" } });
  } else if (/\b(contact|get in touch|reach you|email you)\b/.test(t)) {
    actions.push({ name: "navigateTo", args: { section: "contact" } });
  }

  if (/\b(scroll down|go down|page down)\b/.test(t)) {
    actions.push({ name: "scrollPage", args: { direction: "down" } });
  } else if (/\b(scroll up|go up|page up)\b/.test(t)) {
    actions.push({ name: "scrollPage", args: { direction: "up" } });
  } else if (/\b(back to top|scroll to top|go to top)\b/.test(t)) {
    actions.push({ name: "scrollPage", args: { direction: "top" } });
  }

  if (/\b(open|show|start)\s+(the\s+)?chat\b/.test(t)) {
    actions.push({ name: "openChat", args: {} });
  }
  if (/\b(close|hide|minimize)\s+(the\s+)?chat\b/.test(t)) {
    actions.push({ name: "closeChat", args: {} });
  }

  if (
    /\b(close|cancel|never mind|nevermind)\s+(the\s+)?(booking|appointment)\b/.test(t) ||
    /\bclose (the )?dialog\b/.test(t)
  ) {
    actions.push({ name: "closeAppointmentBooking", args: {} });
  }

  if (
    /\b(when|what times|availability|available|openings)\b/.test(t) &&
    /\b(book|appointment|call|schedule|meeting|slot)\b/.test(t)
  ) {
    actions.push({ name: "checkAppointmentAvailability", args: {} });
  }

  if (
    /\b(book|schedule|appointment|set up a call|book a call|meeting)\b/.test(t) &&
    !/\b(don't|do not|cancel|close|no)\b/.test(t)
  ) {
    actions.push({ name: "openAppointmentBooking", args: {} });
  }

  const slot = extractSlotFromText(text);
  if (slot && /\b(book|schedule|pick|choose|select|tuesday|monday|wednesday|thursday|friday|at \d)/.test(t)) {
    actions.push({
      name: "selectAppointmentSlot",
      args: { date: slot.date, time: slot.time },
    });
  }

  const email = extractEmail(text);
  if (
    email &&
    (/\bconfirm\b/.test(t) ||
      /\bbook it\b/.test(t) ||
      /\bmy name is\b/.test(t) ||
      /\bemail is\b/.test(t))
  ) {
    const nameMatch = text.match(/\bmy name is\s+([a-z][a-z\s'-]{1,40})/i);
    actions.push({
      name: "confirmAppointment",
      args: {
        name: nameMatch?.[1]?.trim() ?? "Visitor",
        email,
      },
    });
  }

  if (/\b(start a project|start project|new project|hire you)\b/.test(t)) {
    actions.push({ name: "startProject", args: {} });
  }

  return actions;
}
