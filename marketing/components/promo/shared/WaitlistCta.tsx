import { SALES_COPY } from "@/lib/salesContent";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

interface WaitlistCtaProps {
  source?: string;
}

export function WaitlistCta({ source = "promo_footer" }: WaitlistCtaProps) {
  const { finalCta } = SALES_COPY;

  return (
    <section className="rounded-3xl border border-border-med bg-bg-surface/50 p-8 text-center md:p-12">
      <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
        {finalCta.title}
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-lg text-text-secondary">{finalCta.body}</p>
      <div className="mx-auto mt-8 max-w-md">
        <WaitlistForm source={source} />
      </div>
    </section>
  );
}
