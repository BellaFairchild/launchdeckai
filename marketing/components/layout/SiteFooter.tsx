import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-default bg-bg-surface/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-text-primary">
            LaunchDeck<span className="text-brand-teal">AI</span>
          </p>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Guided launch clarity for first-time app creators. Calm mission control,
            not another checklist.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          <Link
            href="/privacy"
            className="min-h-11 py-2 text-sm text-text-secondary hover:text-brand-teal"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="min-h-11 py-2 text-sm text-text-secondary hover:text-brand-teal"
          >
            Terms
          </Link>
          <a
            href="mailto:hello@launchdeckai.com"
            className="min-h-11 py-2 text-sm text-text-secondary hover:text-brand-teal"
          >
            Contact
          </a>
        </nav>
      </div>
      <div className="border-t border-border-default/60 px-5 py-4 text-center text-xs text-text-tertiary">
        © {new Date().getFullYear()} LaunchDeckAI. All rights reserved.
      </div>
    </footer>
  );
}
