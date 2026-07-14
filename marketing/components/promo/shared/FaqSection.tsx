import Image from "next/image";
import { SALES_COPY } from "@/lib/salesContent";
import { Card } from "@/components/ui/Card";

export function FaqSection() {
  const { faq } = SALES_COPY;

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_280px] md:items-start">
      <div className="space-y-4">
        {faq.items.map((item) => (
          <details
            key={item.question}
            className="group rounded-3xl border border-border-default bg-bg-card lit-edge"
          >
            <summary className="cursor-pointer list-none p-5 font-display font-semibold text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
              {item.question}
            </summary>
            <p className="border-t border-border-default/60 px-5 pt-0 pb-5 text-sm leading-relaxed text-text-secondary">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      <Card variant="elevated" className="text-center">
        <Image
          src="/astro/cadet-CrossedArms.png"
          alt="Astro, your launch coach"
          width={160}
          height={200}
          className="mx-auto h-40 w-auto object-contain"
        />
        <p className="mt-4 text-sm text-text-secondary">{faq.astroCallout}</p>
      </Card>
    </div>
  );
}
