"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
    };

    // Placeholder request – replace with real API/Convex mutation when ready.
    window.setTimeout(() => {
      console.info("Contact form submission", payload);
      form.reset();
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 4000);
    }, 600);
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
        <p className="text-sm-fluid text-[#0f9b6c]">Thanks! We&apos;ll get back to you within one business day.</p>
      ) : null}
    </form>
  );
}
