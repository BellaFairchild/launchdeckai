"use client";

import Image from "next/image";
import { SALES_COPY } from "@/lib/salesContent";
import { Card } from "@/components/ui/Card";

interface FeatureCardsProps {
  layout?: "grid" | "scroll" | "bento";
}

export function FeatureCards({ layout = "grid" }: FeatureCardsProps) {
  const { features } = SALES_COPY;

  if (layout === "scroll") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {features.pillars.map((pillar) => (
          <Card key={pillar.id} variant="glass" className="min-w-[240px] shrink-0">
            <Image src={pillar.icon} alt="" width={48} height={48} className="h-12 w-12" />
            <h3 className="font-display mt-4 text-lg font-semibold text-text-primary">
              {pillar.name}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">{pillar.description}</p>
          </Card>
        ))}
      </div>
    );
  }

  if (layout === "bento") {
    return (
      <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
        {features.pillars.map((pillar, i) => (
          <Card
            key={pillar.id}
            variant={i === 0 || i === 5 ? "elevated" : "glass"}
            className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
          >
            <Image src={pillar.icon} alt="" width={56} height={56} className="h-14 w-14" />
            <h3 className="font-display mt-4 text-lg font-semibold text-text-primary">
              {pillar.name}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">{pillar.description}</p>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {features.pillars.map((pillar) => (
        <Card key={pillar.id} variant="glass">
          <Image src={pillar.icon} alt="" width={48} height={48} className="h-12 w-12" />
          <h3 className="font-display mt-4 text-lg font-semibold text-text-primary">
            {pillar.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {pillar.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
