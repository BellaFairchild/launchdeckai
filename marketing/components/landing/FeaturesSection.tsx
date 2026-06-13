import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    name: "Deck",
    description:
      "Your launch countdown and readiness at a glance. One calm home base before launch day.",
  },
  {
    name: "Missions",
    description:
      "Milestones that break the mountain into moves you can finish tonight — with fuel when you do.",
  },
  {
    name: "Blueprints",
    description:
      "Structured prep for store listings, audience, and positioning — no blank-page panic.",
  },
  {
    name: "Foundry",
    description:
      "AI-generated assets for screenshots, copy, and launch content — forged when you need them.",
  },
  {
    name: "Cargo Bay",
    description:
      "Every launch asset in one vault. Know what's flight-ready and what still needs clearance.",
  },
  {
    name: "Signal Deck",
    description:
      "Sixteen promotional signals mapped to your timeline — dev logs, emails, and launch-day posts.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-5 py-16 md:py-20">
      <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
        Everything in one launch world
      </h2>
      <p className="mt-3 max-w-xl text-lg text-text-secondary">
        Deck, Fuel, Signal, Missions — a coherent metaphor that makes abstract launch
        work feel concrete and navigable.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.name} variant="glass">
            <h3 className="font-display text-lg font-semibold text-brand-teal">
              {feature.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
