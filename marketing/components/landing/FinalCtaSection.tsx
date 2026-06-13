import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          Ready when you are, Commander.
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          Join the early access list. We&apos;ll reach out when LaunchDeckAI opens
          its doors — no noise, just your next move toward launch.
        </p>
      </div>
      <WaitlistForm source="landing_footer" className="mx-auto mt-10 max-w-md" />
    </section>
  );
}
