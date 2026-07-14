import Image from "next/image";
import Link from "next/link";
import { PROMO_VARIANTS } from "@/lib/salesContent";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Card } from "@/components/ui/Card";

export default function PromoChooserPage() {
  return (
    <>
      <header className="border-b border-border-default/60 bg-bg-deep">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-6">
          <Image src="/images/icon.png" alt="" width={36} height={36} className="rounded-xl" />
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">
              LaunchDeck<span className="text-brand-teal">AI</span> Promo Pages
            </h1>
            <p className="text-sm text-text-secondary">
              Three layout variants — same copy, different visual treatment.
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {PROMO_VARIANTS.map((variant) => (
            <Link key={variant.id} href={variant.href} className="group block">
              <Card variant="elevated" className="h-full transition-transform group-hover:scale-[1.02]">
                <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl">
                  <Image
                    src={variant.preview}
                    alt=""
                    fill
                    className="object-cover opacity-60 transition-opacity group-hover:opacity-80"
                  />
                </div>
                <h2 className="font-display text-xl font-semibold text-text-primary">
                  {variant.name}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">{variant.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-brand-teal">
                  View layout →
                </span>
              </Card>
            </Link>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-text-tertiary">
          <Link href="/" className="text-brand-teal hover:underline">
            ← Back to main landing
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
