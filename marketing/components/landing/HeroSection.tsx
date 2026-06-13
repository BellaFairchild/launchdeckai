import Image from "next/image";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { Starfield } from "@/components/ui/Starfield";

export function HeroSection() {
  return (
    <section
      id="waitlist"
      className="relative overflow-hidden border-b border-border-default/40"
    >
      <Starfield />
      <div className="absolute inset-0">
        <Image
          src="/images/nebula-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/40 via-bg-deep/80 to-bg-deep" />
      </div>

      <div className="relative mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand-teal">
            Early access · App launch clarity
          </p>
          <h1 className="font-display mt-4 text-4xl leading-tight font-bold text-text-primary md:text-5xl">
            Your launch doesn&apos;t have to feel like{" "}
            <span className="text-brand-flame">guesswork.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-text-secondary">
            LaunchDeckAI turns launch confusion into launch readiness — with Astro
            coaching, guided Blueprints, and a Signal Deck that shows you the next
            move without the whole mountain at once.
          </p>
          <p className="mt-4 font-mono text-sm text-text-tertiary">
            For indie React Native, Flutter, and solo founders shipping their first
            app.
          </p>
        </div>
        <WaitlistForm source="landing_hero" />
      </div>
    </section>
  );
}
