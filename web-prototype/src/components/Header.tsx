import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { MOCK_USER } from '../types';
import { StreakProgressRing } from './StreakProgressRing';
import { playPopup, playClick } from '../lib/audio';

interface HeaderProps {
  onOpenDrawer?: () => void;
  onOpenRefuel?: () => void;
  onOpenStreak?: () => void;
}

export function Header({ onOpenDrawer, onOpenRefuel, onOpenStreak }: HeaderProps) {
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('subspace_user_streak');
    return saved ? parseInt(saved, 10) : MOCK_USER.currentStreak;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('subspace_user_streak');
      setStreak(saved ? parseInt(saved, 10) : MOCK_USER.currentStreak);
    };
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  return (
    <div className="h-[56px] px-4 w-full bg-bg-surface flex items-center justify-between border-b-[0.5px] border-border-default z-20 relative">
      <button className="text-text-primary p-2 -ml-2 cursor-pointer relative z-10" onClick={() => { playPopup(); onOpenDrawer?.(); }}>
        <Menu size={24} />
      </button>
      
      {/* Centered Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <img 
          src="/logo.png" 
          alt="LaunchDeck AI Logo" 
          className="h-[44px] w-auto drop-shadow-md rounded-full object-contain"
          onError={(e) => {
            // Fallback to text if the image fails to load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
        <div className="font-display font-bold text-lg tracking-tight items-center gap-1 hidden">
          <span className="text-brand-blue">Launch</span>
          <span className="text-text-primary">Deck</span>
          <span className="text-brand-teal text-sm">AI</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 relative z-10">
        {/* Fuel Chip */}
        <button 
          className="bg-bg-card border border-border-med rounded-full px-3 py-1 flex items-center gap-1 hover:border-brand-teal/50 transition-colors cursor-pointer"
          onClick={() => { playPopup(); onOpenRefuel?.(); }}
        >
          <span className="text-brand-flame text-sm">⚡</span>
          <span className="font-mono text-brand-teal text-sm">{MOCK_USER.fuelBalance}</span>
        </button>

        {/* Streak Progress Ring Button */}
        {onOpenStreak && (
          <button 
            className="bg-bg-card border border-border-med rounded-full pl-1.5 pr-3 py-0.5 flex items-center gap-1.5 hover:border-orange-500/50 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,100,50,0.05)] hover:shadow-[0_0_12px_rgba(255,100,50,0.15)] group"
            onClick={() => { playPopup(); onOpenStreak?.(); }}
            title="Claim Daily Streak Telemetry"
          >
            <StreakProgressRing size={22} iconSize={10} isHot={streak > 7} />
            <span className="font-mono text-[11px] font-bold text-text-primary group-hover:text-status-warning transition-colors">
              {streak}
            </span>
          </button>
        )}
        
      </div>
    </div>
  );
}
