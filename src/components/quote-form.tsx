"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";

const serviceOptions = [
  "Not sure — recommend one",
  "Exterior reset",
  "Interior revival",
  "Paint correction",
  "Ceramic coating",
  "Maintenance detail",
  "Fleet care",
];

export function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const vehicle = String(form.get("vehicle") ?? "");
    const service = String(form.get("service") ?? "");
    const notes = String(form.get("notes") ?? "");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source: "detailing quote form",
          message: [
            `Phone: ${phone || "Not provided"}`,
            `Vehicle: ${vehicle}`,
            `Interested in: ${service}`,
            `Notes: ${notes || "None"}`,
          ].join("\n"),
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-[2rem] border border-accent/30 bg-accent/[0.05] p-8 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-[#080b0c]">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold">Request received.</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400">
            We&apos;ll review your vehicle and goals, then reply with a clear recommendation.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-7 text-sm font-medium text-accent"
          >
            Send another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitQuote}
      className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="form-field">
          <span>Name</span>
          <input name="name" autoComplete="name" placeholder="Your name" required />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="form-field">
          <span>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="(512) 555-0100" />
        </label>
        <label className="form-field">
          <span>Vehicle</span>
          <input name="vehicle" placeholder="2024 Porsche 911" required />
        </label>
      </div>
      <label className="form-field mt-5">
        <span>Service</span>
        <select name="service" defaultValue={serviceOptions[0]}>
          {serviceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="form-field mt-5">
        <span>What would you like us to address?</span>
        <textarea
          name="notes"
          rows={4}
          placeholder="Swirls in black paint, coffee stain on passenger seat..."
        />
      </label>
      {status === "error" ? (
        <p role="alert" className="mt-4 text-sm text-red-300">
          We couldn&apos;t send that request. Please call or try again.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-[#080b0c] transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending request
          </>
        ) : (
          <>
            Request my estimate
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <p className="mt-4 text-center text-[11px] text-zinc-600">
        No spam. No surprise work. Your information stays private.
      </p>
    </form>
  );
}
