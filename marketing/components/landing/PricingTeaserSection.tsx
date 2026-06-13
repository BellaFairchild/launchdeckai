import { Card } from "@/components/ui/Card";
import { PLANS, PLAN_ORDER } from "@/lib/plans";

export function PricingTeaserSection() {
  return (
    <section
      id="pricing"
      className="border-y border-border-default/40 bg-bg-surface/30 py-16 md:py-20"
    >
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          Start free as a Cadet
        </h2>
        <p className="mt-3 max-w-xl text-lg text-text-secondary">
          Get organized and follow your first Mission at no cost. Upgrade when
          you&apos;re ready to export and go all-in on launch.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isFeatured = planId === "cadet";
            return (
              <Card
                key={planId}
                variant={planId === "admiral" ? "premium" : "glass"}
                className={
                  isFeatured ? "border-brand-teal/40 ring-1 ring-brand-teal/20" : ""
                }
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold text-text-primary">
                    {plan.name}
                  </h3>
                  <span
                    className="font-mono text-lg font-medium"
                    style={{ color: plan.beltColor }}
                  >
                    {plan.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{plan.bestFor}</p>
                <ul className="mt-4 space-y-2">
                  {plan.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-2 text-sm text-text-secondary"
                    >
                      <span className="text-brand-teal" aria-hidden>
                        ✓
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-xs text-text-tertiary">
                  {plan.fuel} · {plan.activeMissions}
                </p>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-text-tertiary">
          Pricing shown for planning. Checkout opens when the app launches.
        </p>
      </div>
    </section>
  );
}
