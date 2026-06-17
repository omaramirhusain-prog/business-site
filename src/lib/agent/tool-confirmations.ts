import type { ToolConfirmationMap } from "@ais-os/site-agent";

export const toolConfirmations: ToolConfirmationMap = {
  navigateTo: (input) =>
    `Sure — here's the ${String(input?.section ?? "page")}.`,
  scrollPage: () => "Scrolled the page for you.",
  readSection: (input) =>
    `Here's what's on the ${String(input?.section ?? "page")} section.`,
  highlightElement: () => "Highlighted that for you.",
  repeatLast: () => "Repeating that.",
  stopSpeaking: () => "Stopped.",
  openAppointmentBooking: () =>
    "I've opened the booking calendar. Pick a date and time that works for you.",
  checkAppointmentAvailability: () =>
    "Here are the available times. Which works best for you?",
  selectAppointmentSlot: () =>
    "Got it — that time is selected. What's your name and email to confirm?",
  confirmAppointment: () =>
    "You're all booked. Check your email for confirmation.",
  getBookingStatus: () => "Here's your booking status.",
  rescheduleAppointment: () => "I've rescheduled your appointment.",
  cancelAppointment: () => "Your booking has been cancelled in this session.",
  closeAppointmentBooking: () => "Booking closed.",
  startProject: () => "Here's how to start a project with Omar.",
  submitLead: () => "Your inquiry has been sent. Check your email for confirmation.",
  openExternalLink: () => "Opening that link.",
  startGuidedTour: () => "Starting the tour.",
  getFAQAnswer: () => "Here's what I know.",
  controlScene: () => "Updated the 3D scene.",
  openChat: () => "Chat is open. What can I help you with?",
  closeChat: () => "Chat closed.",
};
