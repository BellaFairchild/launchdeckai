import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingTeaserSection } from "@/components/landing/PricingTeaserSection";
import { ProblemSection } from "@/components/landing/ProblemSection";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingTeaserSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
