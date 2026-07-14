import { SiteFooter } from "@/components/layout/SiteFooter";
import { PromoHeader } from "@/components/promo/PromoHeader";
import { ClassicHero, PromoSection } from "@/components/promo/PromoHeroes";
import { TrustStrip } from "@/components/promo/shared/TrustStrip";
import { ProblemBlock } from "@/components/promo/shared/ProblemBlock";
import { ShowcaseRows } from "@/components/promo/shared/ShowcaseRows";
import { HowItWorksBlock } from "@/components/promo/shared/HowItWorksBlock";
import { RoadmapTimeline } from "@/components/promo/shared/RoadmapTimeline";
import { PricingTable } from "@/components/promo/shared/PricingTable";
import { FaqSection } from "@/components/promo/shared/FaqSection";
import { WaitlistCta } from "@/components/promo/shared/WaitlistCta";
import { SALES_COPY } from "@/lib/salesContent";
import Image from "next/image";

export function ClassicLayout() {
  const { features, howItWorks, roadmap, pricing } = SALES_COPY;

  return (
    <>
      <PromoHeader />
      <main>
        <ClassicHero />
        <TrustStrip />
        <PromoSection id="problem" title={SALES_COPY.problem.title}>
          <div className="mx-auto max-w-3xl">
            <ProblemBlock />
          </div>
        </PromoSection>
        <PromoSection
          id="features"
          title={features.title}
          subtitle={features.subtitle}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <div className="mx-auto max-w-4xl space-y-16">
            {features.pillars.map((pillar) => (
              <div key={pillar.id} className="text-center">
                <Image
                  src={pillar.icon}
                  alt=""
                  width={64}
                  height={64}
                  className="mx-auto h-16 w-16"
                />
                <h3 className="font-display mt-4 text-2xl font-semibold text-text-primary">
                  {pillar.name}
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-text-secondary">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </PromoSection>
        <PromoSection id="showcase" title={SALES_COPY.showcase.title}>
          <div className="mx-auto max-w-lg">
            <ShowcaseRows variant="stacked" />
          </div>
        </PromoSection>
        <PromoSection
          id="how-it-works"
          title={howItWorks.title}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <HowItWorksBlock variant="steps" />
        </PromoSection>
        <PromoSection
          id="roadmap"
          title={roadmap.title}
          subtitle={roadmap.subtitle}
        >
          <div className="mx-auto max-w-xl">
            <RoadmapTimeline orientation="vertical" />
          </div>
        </PromoSection>
        <PromoSection
          id="pricing"
          title={pricing.title}
          subtitle={pricing.subtitle}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <PricingTable variant="columns" />
        </PromoSection>
        <PromoSection id="faq" title={SALES_COPY.faq.title}>
          <div className="mx-auto max-w-3xl">
            <FaqSection />
          </div>
        </PromoSection>
        <div className="mx-auto max-w-2xl px-5 pb-20">
          <WaitlistCta source="promo_classic_footer" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
