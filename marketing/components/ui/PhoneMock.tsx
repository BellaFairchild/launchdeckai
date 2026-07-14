import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface PhoneMockProps {
  imageSrc?: string;
  imageAlt?: string;
  children?: ReactNode;
  className?: string;
  priority?: boolean;
}

export function PhoneMock({
  imageSrc,
  imageAlt = "LaunchDeckAI app screenshot",
  children,
  className,
  priority = false,
}: PhoneMockProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[260px] rounded-[2.5rem] border border-border-med bg-bg-surface p-2 lit-edge primary-glow md:w-[280px]",
        className,
      )}
    >
      <div className="absolute top-3 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-cosmic-black/80" />
      <div className="overflow-hidden rounded-[2rem] bg-bg-deep">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={540}
            height={1170}
            priority={priority}
            className="h-auto w-full object-cover object-top"
          />
        ) : (
          <div className="aspect-[9/19.5] w-full">{children}</div>
        )}
      </div>
    </div>
  );
}
