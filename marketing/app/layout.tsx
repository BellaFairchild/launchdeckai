import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "LaunchDeckAI — Guided launch clarity for app creators",
  description:
    "Turn launch confusion into launch readiness. Astro coaching, guided Blueprints, and a Signal Deck for first-time app creators.",
  metadataBase: new URL("https://launchdeckai.com"),
  openGraph: {
    title: "LaunchDeckAI — Guided launch clarity for app creators",
    description:
      "Turn launch confusion into launch readiness. Join early access for calm mission control, not another checklist.",
    type: "website",
    images: [
      {
        url: "/images/nebula-hero.jpg",
        width: 1200,
        height: 630,
        alt: "LaunchDeckAI — calm mission control for app launches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LaunchDeckAI — Guided launch clarity for app creators",
    description:
      "Turn launch confusion into launch readiness. Join early access today.",
    images: ["/images/nebula-hero.jpg"],
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg-deep font-body text-text-primary">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
