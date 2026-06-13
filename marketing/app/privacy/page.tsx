import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — LaunchDeckAI",
  description: "How LaunchDeckAI handles your data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-text-tertiary">
          Last updated: June 10, 2026
        </p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-text-secondary">
          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              What we collect
            </h2>
            <p className="mt-2">
              When you join our waitlist, we collect your email address and optional
              platform preference. If you create an account later, we collect account
              information through our authentication provider (Clerk) and usage data
              necessary to operate the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              How we use it
            </h2>
            <p className="mt-2">
              We use waitlist information to notify you about early access and product
              updates related to LaunchDeckAI. We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Data storage
            </h2>
            <p className="mt-2">
              Waitlist and product data are stored securely via Convex. Analytics and
              error monitoring may use third-party services configured at launch.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Contact
            </h2>
            <p className="mt-2">
              Questions about privacy? Email{" "}
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
