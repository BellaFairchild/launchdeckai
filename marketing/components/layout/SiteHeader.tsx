import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#problem", label: "Why" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-default/60 bg-bg-deep/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex min-h-11 items-center gap-3">
          <Image
            src="/images/icon.png"
            alt=""
            width={36}
            height={36}
            className="rounded-xl"
            aria-hidden
          />
          <span className="font-display text-lg font-semibold text-text-primary">
            LaunchDeck<span className="text-brand-teal">AI</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="min-h-11 py-2 text-sm text-text-secondary transition-colors hover:text-brand-teal"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#waitlist"
            className="min-h-11 rounded-full bg-gradient-to-r from-rocket-teal to-deep-indigo px-5 py-2.5 text-sm font-semibold text-white primary-glow"
          >
            Join waitlist
          </a>
        </nav>
        <a
          href="#waitlist"
          className="min-h-11 rounded-full bg-gradient-to-r from-rocket-teal to-deep-indigo px-4 py-2.5 text-sm font-semibold text-white primary-glow md:hidden"
        >
          Join
        </a>
      </div>
    </header>
  );
}
