"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "submitting" | "success" | "error";
type ContactPayload = {
  name: string;
  email: string;
  company: string;
  message: string;
};

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const simulateSubmission = (payload: ContactPayload) =>
    new Promise<void>((resolve) => {
      window.setTimeout(() => {
        console.info("Contact form submission", payload);
        resolve();
      }, 600);
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: ContactPayload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      // Placeholder request – replace with real API/Convex mutation when ready.
      await simulateSubmission(payload);

      setStatus("success");
      window.setTimeout(() => {
        form.reset();
        setStatus("idle");
      }, 4000);
    } catch (error) {
      console.error("Contact form submission failed", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your message. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5 rounded-[28px] border border-white/50 bg-white/80 p-6 shadow-[0_25px_55px_rgba(17,24,39,0.06)] backdrop-blur"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-body text-[#0f172a]">
          Full name
          <Input
            required
            name="name"
            placeholder="Jordan Daniels"
            className="h-12 rounded-2xl border border-[#cbd5f5]/70 bg-white/90 text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-[#0ea5e9] focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/40"
          />
        </label>
        <label className="flex flex-col gap-2 text-body text-[#0f172a]">
          Email
          <Input
            required
            type="email"
            name="email"
            placeholder="you@company.com"
            className="h-12 rounded-2xl border border-[#cbd5f5]/70 bg-white/90 text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-[#0ea5e9] focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/40"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-body text-[#0f172a]">
        Company (optional)
        <Input
          name="company"
          placeholder="Bossin Investments"
          className="h-12 rounded-2xl border border-[#cbd5f5]/70 bg-white/90 text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-[#0ea5e9] focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-body text-[#0f172a]">
        Message
        <Textarea
          required
          name="message"
          placeholder="Tell us about the recipients, occasion, or desired product mix."
          className="min-h-[160px] rounded-3xl border border-[#cbd5f5]/70 bg-white/90 text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-[#0ea5e9] focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/40"
        />
      </label>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-12 min-h-[44px] rounded-full bg-[#0f172a] text-body font-semibold text-white transition hover:bg-[#0f172a]/90"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>

      {status === "success" ? (
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm-fluid text-[#0f9b6c]">
          Thanks! We&apos;ll get back to you within one business day.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p className="text-sm-fluid text-[#dc2626]">{errorMessage}</p>
      ) : null}
    </form>
  );
}
