import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function StarryNight() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stars = useMemo(() => {
    const driftAnimations = ['drift-a', 'drift-b', 'drift-c', 'drift-d'];
    return Array.from({ length: 200 }).map((_, i) => {
      const size = Math.random() * 2 + 0.5;
      const driftIndex = Math.floor(Math.random() * driftAnimations.length);
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${Math.random() * 4 + 2}s`,
        driftAnimation: driftAnimations[driftIndex],
        driftDuration: `${Math.random() * 40 + 35}s`, // slow 35s to 75s drift loops
        driftDelay: `-${Math.random() * 60}s`, // pre-dispersed timeline offset
        opacity: Math.random() * 0.8 + 0.2
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#060B14]/80 to-[#0A1220]/80" />
      
      {/* Stars */}
      <div 
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }}
      >
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute"
            style={{
              top: star.top,
              left: star.left,
              animation: `${star.driftAnimation} ${star.driftDuration} linear infinite ${star.driftDelay}`
            }}
          >
            <div
              className="rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{
                width: star.width,
                height: star.height,
                opacity: star.opacity,
                animation: `twinkle ${star.animationDuration} ease-in-out infinite alternate ${star.animationDelay}`
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Subtle nebula effect */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full blur-[100px] pointer-events-none mix-blend-screen transition-transform duration-1000 animate-nebula"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-transform duration-1000 animate-nebula-delayed"
        style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}
      />
    </div>
  );
}
