"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Calendar, Check, Loader2 } from "lucide-react";
import { useSiteActions } from "@/lib/actions/registry";

export function AppointmentModal() {
  const {
    appointmentOpen,
    appointmentSlots,
    appointmentSlotsLoading,
    appointmentDate,
    appointmentTime,
    appointmentBooked,
    appointmentBooking,
    closeAppointment,
    runAction,
    selectAppointmentDay,
  } = useSiteActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const activeDay = appointmentSlots.find((s) => s.date === appointmentDate);

  async function confirmBooking() {
    if (!name.trim() || !email.trim()) return;
    await runAction("confirmAppointment", {
      name: name.trim(),
      email: email.trim(),
    });
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
            onClick={() => closeAppointment()}
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
                aria-label="Close booking"
                onClick={() => closeAppointment()}
                className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {appointmentBooked ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-500/15 text-green-400">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold">You&apos;re booked!</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {activeDay?.label} at {appointmentTime}. Check your email for confirmation.
                  </p>
                  <button
                    onClick={() => closeAppointment()}
                    className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-zinc-400">
                    Pick a day and time, or say it out loud — e.g. &ldquo;Tuesday at 2pm&rdquo;.
                  </p>

                  {appointmentSlotsLoading ? (
                    <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading availability…
                    </div>
                  ) : (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {appointmentSlots.map((s) => (
                        <button
                          key={s.date}
                          onClick={() => selectAppointmentDay(s.date)}
                          className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                            appointmentDate === s.date
                              ? "border-accent bg-accent/15 text-white"
                              : "border-white/10 text-zinc-300 hover:border-white/25"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeDay && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {activeDay.times.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            void runAction("selectAppointmentSlot", {
                              date: activeDay.date,
                              time: t,
                            });
                          }}
                          className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                            appointmentTime === t
                              ? "border-accent bg-accent/15 text-white"
                              : "border-white/10 text-zinc-300 hover:border-white/25"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {appointmentDate && appointmentTime && (
                    <div className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-zinc-300">
                        {activeDay?.label} at {appointmentTime}
                      </p>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
                      />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Your email"
                        className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  )}

                  <button
                    disabled={
                      !appointmentDate ||
                      !appointmentTime ||
                      !name.trim() ||
                      !email.trim() ||
                      appointmentBooking
                    }
                    onClick={() => void confirmBooking()}
                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02] disabled:opacity-40"
                  >
                    {appointmentBooking ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking…
                      </span>
                    ) : appointmentDate && appointmentTime ? (
                      "Confirm booking"
                    ) : (
                      "Select a date and time"
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-zinc-500">
                    Or say your name and email out loud after picking a time.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
