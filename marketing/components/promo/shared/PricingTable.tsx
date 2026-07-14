"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  FEATURE_MATRIX,
  PLAN_ORDER,
  PLANS,
  type FeatureMatrixValue,
} from "@/lib/plans";
import { SALES_COPY } from "@/lib/salesContent";
import { cn } from "@/lib/cn";

function MatrixCell({ value }: { value: FeatureMatrixValue }) {
  if (value === true) {
    return <span className="text-brand-teal" aria-label="Included">✓</span>;
  }
  if (value === false) {
    return <span className="text-text-muted" aria-label="Not included">—</span>;
  }
  return <span className="font-mono text-xs text-text-secondary">{value}</span>;
}

interface PricingTableProps {
  variant?: "cards" | "matrix" | "columns";
}

export function PricingTable({ variant = "cards" }: PricingTableProps) {
  const [yearly, setYearly] = useState(false);
  const { pricing } = SALES_COPY;

  if (variant === "matrix") {
    return (
      <div>
        <div className="overflow-x-auto rounded-3xl border border-border-default">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-default bg-bg-surface">
                <th className="p-4 font-display font-semibold text-text-primary">Feature</th>
                {PLAN_ORDER.map((id) => (
                  <th key={id} className="p-4 font-display font-semibold text-text-primary">
                    {PLANS[id].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((row) => (
                <tr key={row.label} className="border-b border-border-default/60">
                  <td className="p-4 text-text-secondary">{row.label}</td>
                  {PLAN_ORDER.map((id) => (
                    <td key={id} className="p-4 text-center">
                      <MatrixCell value={row[id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-sm text-text-tertiary">{pricing.disclaimer}</p>
      </div>
    );
  }

  return (
    <div>
      {variant === "columns" && (
        <div className="mb-8 flex justify-center gap-2">
          <Button
            type="button"
            variant={!yearly ? "primary" : "secondary"}
            onClick={() => setYearly(false)}
          >
            {pricing.toggleMonthly}
          </Button>
          <Button
            type="button"
            variant={yearly ? "primary" : "secondary"}
            onClick={() => setYearly(true)}
          >
            {pricing.toggleYearly}
          </Button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isFeatured = planId === "commander";
          const displayPrice =
            yearly && plan.priceYearly ? plan.priceYearly : plan.price;

          return (
            <Card
              key={planId}
              variant={planId === "admiral" ? "premium" : "glass"}
              className={cn(
                isFeatured && "border-brand-teal/40 ring-1 ring-brand-teal/20",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-semibold text-text-primary">
                  {plan.name}
                </h3>
                <span
                  className="font-mono text-lg font-medium"
                  style={{ color: plan.beltColor }}
                >
                  {displayPrice}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{plan.bestFor}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2 text-sm text-text-secondary"
                  >
                    <span className="text-brand-teal shrink-0" aria-hidden>
                      ✓
                    </span>
                    {feature}
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
      <p className="mt-8 text-center text-sm text-text-tertiary">{pricing.disclaimer}</p>
    </div>
  );
}
