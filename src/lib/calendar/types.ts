export type AppointmentSlot = {
  date: string;
  label: string;
  times: string[];
};

export type BookAppointmentInput = {
  date: string;
  time: string;
  name: string;
  email: string;
  notes?: string;
};

export type BookAppointmentResult = {
  ok: boolean;
  message: string;
  eventId?: string;
};
