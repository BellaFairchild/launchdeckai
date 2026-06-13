"use client";

import { useMutation } from "convex/react";
import { useState, type FormEvent } from "react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { trackWaitlistSignup } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type PlatformInterest = "ios" | "android" | "both" | "unsure";

interface WaitlistFormProps {
  source: "landing_hero" | "landing_footer";
  className?: string;
}

export function WaitlistForm({ source, className }: WaitlistFormProps) {
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const [email, setEmail] = useState("");
  const [platformInterest, setPlatformInterest] = useState<PlatformInterest | "">(
    "",
  );
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const result = await joinWaitlist({
        email: trimmed,
        source,
        referrer:
          typeof document !== "undefined" ? document.referrer || undefined : undefined,
        platformInterest: platformInterest || undefined,
        website: website || undefined,
      });
      setStatus("success");
      setMessage(result.message);
      trackWaitlistSignup({ source, status: result.status });
      setEmail("");
      setPlatformInterest("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          "rounded-3xl border border-brand-teal/30 bg-bg-card/80 p-6 lit-edge",
          className,
        )}
        role="status"
      >
        <p className="font-display text-xl text-brand-flame">{message}</p>
        <p className="mt-2 text-sm text-text-secondary">
          We&apos;ll reach out when early access opens. No spam — just launch clarity.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-3xl border border-border-default bg-bg-card/80 p-5 md:p-6 lit-edge",
        className,
      )}
      noValidate
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor={`email-${source}`} className="sr-only">
            Email address
          </label>
          <input
            id={`email-${source}`}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded-full border border-border-default bg-bg-surface px-4 text-text-primary placeholder:text-text-tertiary focus:border-brand-teal focus:outline-none"
            disabled={status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor={`platform-${source}`} className="mb-2 block text-sm text-text-secondary">
            Platform (optional)
          </label>
          <select
            id={`platform-${source}`}
            name="platform"
            value={platformInterest}
            onChange={(e) =>
              setPlatformInterest(e.target.value as PlatformInterest | "")
            }
            className="min-h-11 w-full rounded-full border border-border-default bg-bg-surface px-4 text-text-primary focus:border-brand-teal focus:outline-none"
            disabled={status === "submitting"}
          >
            <option value="">Not sure yet</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="both">Both</option>
            <option value="unsure">Still deciding</option>
          </select>
        </div>

        {/* Honeypot — hidden from humans */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={`website-${source}`}>Website</label>
          <input
            id={`website-${source}`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={status === "submitting"}>
          {status === "submitting" ? "Joining…" : "Join early access"}
        </Button>

        {status === "error" && message ? (
          <p className="text-sm text-status-error" role="alert">
            {message}
          </p>
        ) : null}

        <p className="text-center text-xs text-text-tertiary">
          Free to join. We&apos;ll only email you about LaunchDeckAI early access.
        </p>
      </div>
    </form>
  );
}
