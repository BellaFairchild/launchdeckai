import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — LaunchDeckAI",
  description: "Terms for using LaunchDeckAI.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <Link
          href="/"
          className="text-sm text-brand-teal hover:text-brand-teal-light"
        >
          ← Back to home
        </Link>
        <h1 className="font-display mt-6 text-3xl font-bold text-text-primary">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-text-tertiary">
          Last updated: June 10, 2026
        </p>

        <div className="mt-8 space-y-6 text-text-secondary">
          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Early access
            </h2>
            <p className="mt-2">
              LaunchDeckAI is offered in early access. Features, pricing, and
              availability may change before general release. Joining the waitlist does
              not guarantee access or a specific launch date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Acceptable use
            </h2>
            <p className="mt-2">
              Use LaunchDeckAI to prepare and launch your applications lawfully. Do not
              abuse AI generation, attempt to disrupt the service, or use the product
              for spam or harmful content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              AI-generated content
            </h2>
            <p className="mt-2">
              Foundry and Astro may produce draft assets and guidance. You are
              responsible for reviewing, editing, and complying with app store and
              platform policies before publishing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Contact
            </h2>
            <p className="mt-2">
              Questions about these terms? Email{" "}
              <a
                href="mailto:hello@launchdeckai.com"
                className="text-brand-teal hover:underline"
              >
                hello@launchdeckai.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
