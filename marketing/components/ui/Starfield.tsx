"use client";

import { useMemo } from "react";

const STAR_COUNT = 120;

export function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => {
      const size = (i % 7) * 0.25 + 0.75;
      return {
        id: i,
        top: `${(i * 17) % 100}%`,
        left: `${(i * 23 + 11) % 100}%`,
        size,
        delay: `${(i % 10) * 0.4}s`,
        duration: `${2 + (i % 5)}s`,
        drift: i % 2 === 0 ? "animate-drift-a" : "animate-drift-b",
      };
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-black via-bg-deep/90 to-bg-surface/80" />
      <div className="absolute inset-0">
        {stars.map((star) => (
          <span
            key={star.id}
            className={`absolute rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)] ${star.drift}`}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
      <div className="absolute top-[15%] left-[10%] h-[35%] w-[35%] rounded-full bg-brand-teal/10 blur-[100px] animate-nebula" />
      <div className="absolute right-[10%] bottom-[15%] h-[40%] w-[40%] rounded-full bg-deep-indigo/20 blur-[120px] animate-nebula" />
    </div>
  );
}
