import type { ToolConfirmationMap } from "@ais-os/site-agent";

export const toolConfirmations: ToolConfirmationMap = {
  navigateTo: (input) =>
    `Sure — here's the ${String(input?.section ?? "page")}.`,
  scrollPage: () => "Scrolled the page for you.",
  openAppointmentBooking: () =>
    "I've opened the booking calendar. Pick a date and time that works for you.",
  checkAppointmentAvailability: () =>
    "Here are the available times. Which works best for you?",
  selectAppointmentSlot: () =>
    "Got it — that time is selected. What's your name and email to confirm?",
  confirmAppointment: () =>
    "You're all booked. Check your email for confirmation.",
  closeAppointmentBooking: () => "Booking closed.",
  startProject: () => "Here's how to start a project with Omar.",
  openChat: () => "Chat is open. What can I help you with?",
  closeChat: () => "Chat closed.",
};
