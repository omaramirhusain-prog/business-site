"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Calendar, Check } from "lucide-react";
import { useSiteActions } from "@/lib/actions/registry";

/** Mock availability for now. Phase D swaps this for Google Calendar. */
function getAvailableSlots() {
  const slots: { date: string; label: string; times: string[] }[] = [];
  const times = ["10:00 AM", "1:00 PM", "3:30 PM"];
  const now = new Date();
  let added = 0;
  let offset = 1;
  while (added < 5) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    offset++;
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // weekdays only
    slots.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      times,
    });
    added++;
  }
  return slots;
}

export function AppointmentModal() {
  const { appointmentOpen, closeAppointment } = useSiteActions();
  const slots = useMemo(getAvailableSlots, []);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const activeDay = slots.find((s) => s.date === date);

  function reset() {
    setDate(null);
    setTime(null);
    setBooked(false);
  }

  return (
    <AnimatePresence>
      {appointmentOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              closeAppointment();
              setTimeout(reset, 250);
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative z-10 w-full max-w-lg overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-black">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-semibold">Book a call with Omar</span>
              </div>
              <button
                aria-label="Close"
                onClick={() => {
                  closeAppointment();
                  setTimeout(reset, 250);
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {booked ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-500/15 text-green-400">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold">You&apos;re booked!</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {activeDay?.label} at {time}. Omar will confirm by email.
                  </p>
                  <button
                    onClick={() => {
                      closeAppointment();
                      setTimeout(reset, 250);
                    }}
                    className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-zinc-400">
                    Pick a day and time that works for you.
                  </p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.date}
                        onClick={() => {
                          setDate(s.date);
                          setTime(null);
                        }}
                        className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                          date === s.date
                            ? "border-accent bg-accent/15 text-white"
                            : "border-white/10 text-zinc-300 hover:border-white/25"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {activeDay && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {activeDay.times.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                            time === t
                              ? "border-accent bg-accent/15 text-white"
                              : "border-white/10 text-zinc-300 hover:border-white/25"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    disabled={!date || !time}
                    onClick={() => setBooked(true)}
                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02] disabled:opacity-40"
                  >
                    {date && time ? `Book ${activeDay?.label} at ${time}` : "Select a date and time"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
