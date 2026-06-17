export type BookingSession = {
  date: string;
  time: string;
  dateLabel?: string;
  name: string;
  email: string;
  notes?: string;
  bookedAt: string;
};

const SESSION_KEY = "omar-site-booking-session";

export function getBookingSession(): BookingSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingSession;
  } catch {
    return null;
  }
}

export function setBookingSession(session: BookingSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearBookingSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
