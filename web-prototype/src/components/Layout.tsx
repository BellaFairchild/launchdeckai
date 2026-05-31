import React from 'react';
import { StarryNight } from './StarryNight';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center overflow-hidden font-body text-text-primary relative">
      <StarryNight />
      {/* Phone Simulation Container */}
      <div className="relative w-full h-[100dvh] md:w-[390px] md:h-[844px] md:rounded-[40px] bg-transparent overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.05)] md:border-[8px] border-[#111] z-10">
        
        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
