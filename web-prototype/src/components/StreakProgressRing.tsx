import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame } from 'lucide-react';

interface StreakProgressRingProps {
  size?: number;
  iconSize?: number;
  showText?: boolean;
  isHot?: boolean;
}

export function StreakProgressRing({ size = 36, iconSize = 14, showText = false, isHot = false }: StreakProgressRingProps) {
  const [stats, setStats] = useState({ completed: 0, total: 3 });

  useEffect(() => {
    const loadStats = () => {
      const saved = localStorage.getItem('subspace_daily_tasks_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const completed = parsed.filter((t: any) => t.completed).length;
            setStats({ completed, total: parsed.length || 3 });
            return;
          }
        } catch (e) {
          // ignore parsing error, fallback to default
        }
      }
      setStats({ completed: 0, total: 3 });
    };

    loadStats();
    window.addEventListener('storage', loadStats);
    return () => {
      window.removeEventListener('storage', loadStats);
    };
  }, []);

  const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // Pie chart data: slice the pie up to showcase progress clockwise from absolute 12 o'clock
  const chartData = [
    { name: 'completed', value: stats.completed },
    { name: 'remaining', value: Math.max(0, stats.total - stats.completed) },
  ];

  // If there are zero completed tasks, render 100% track so it has smooth placeholder outline
  const finalChartData = stats.completed === 0 
    ? [{ name: 'completed', value: 0 }, { name: 'remaining', value: 3 }]
    : chartData;

  // Dynamic status-colored indicator stroke based on completion level
  const strokeColor = percentage === 100 
    ? '#FFB800' // Glorious mission-gold upon absolute verification
    : percentage > 0 
      ? '#00F0FF' // Dynamic cyan for partial progress
      : '#475569'; // Neutral dark slate when idle

  const trackColor = 'rgba(255, 255, 255, 0.08)';

  return (
    <div className="flex items-center gap-2">
      <div 
        className="relative flex items-center justify-center select-none shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Recharts container executing smooth layout scaling */}
        <div className="absolute inset-0 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={finalChartData}
                cx="50%"
                cy="50%"
                innerRadius="73%"
                outerRadius="98%"
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={650}
                stroke="none"
              >
                <Cell fill={strokeColor} />
                <Cell fill={trackColor} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Floating flame center-icon with variable emission filters depending on completion */}
        <div className="relative z-10 flex items-center justify-center">
          <Flame 
            size={iconSize} 
            className={`transition-all duration-300 ${
              isHot
                ? 'text-[#FF5533] fill-[#FF5533]/60 drop-shadow-[0_0_10px_rgba(255,85,51,0.8)] animate-[pulse_2s_ease-in-out_infinite] scale-110'
                : stats.completed > 0 
                  ? 'text-[#FF5533] fill-[#FF5533]/20 drop-shadow-[0_0_5px_rgba(255,85,51,0.55)] animate-pulse'
                  : 'text-text-tertiary'
            }`}
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left font-mono">
          <span className="text-[9px] text-text-tertiary uppercase tracking-wider leading-none">Telemetry Goal</span>
          <span className={`text-[11px] font-bold mt-0.5 ${percentage === 100 ? 'text-brand-gold' : 'text-[#00F0FF]'}`}>
            {stats.completed}/{stats.total} SECURED ({Math.round(percentage)}%)
          </span>
        </div>
      )}
    </div>
  );
}
