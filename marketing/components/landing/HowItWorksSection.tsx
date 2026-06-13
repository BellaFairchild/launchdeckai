import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    step: "01",
    title: "Start a Mission",
    description:
      "Tell us about your app, platform, and launch date. Your Deck becomes mission control.",
  },
  {
    step: "02",
    title: "Follow Blueprints",
    description:
      "Guided sections for store prep, marketing, and launch day — one clear field at a time.",
  },
  {
    step: "03",
    title: "Launch with Signal Deck",
    description:
      "A 16-step promotional timeline so you know what to post, email, and ship — and when.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border-default/40 bg-bg-surface/30 py-16 md:py-20"
    >
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          Progress you can feel
        </h2>
        <p className="mt-3 max-w-xl text-lg text-text-secondary">
          Three moves from confused to launch-ready — with readiness scores and fuel
          that make momentum visible.
        </p>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.step}>
              <Card variant="glass" className="h-full">
                <p className="font-mono text-sm text-brand-teal">{item.step}</p>
                <h3 className="font-display mt-3 text-xl font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
