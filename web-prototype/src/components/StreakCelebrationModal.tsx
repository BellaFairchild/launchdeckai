import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, CheckCircle2, Circle, X, Trash2, Calendar, Award, Zap, Sparkles, Terminal, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_USER } from '../types';

// Cockpit digital chime for action feedback
const playChimeSound = (success: boolean) => {
  if (typeof window !== 'undefined' && localStorage.getItem('subspace_cached_sound_enabled') === 'false') {
    return;
  }
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (success) {
      // Ascending triumphant chord signature
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      // Standard rapid action beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch (err) {
    console.warn('Audio feedback error:', err);
  }
};

interface StreakCelebrationProps {
  onClose: () => void;
  onStreakUpdate?: (newStreak: number) => void;
}

export function StreakCelebrationModal({ onClose, onStreakUpdate }: StreakCelebrationProps) {
  // Load current stats from localStorage falling back to Mock User definitions
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('subspace_user_streak');
    return saved ? parseInt(saved, 10) : MOCK_USER.currentStreak;
  });

  const [level] = useState<number>(() => {
    const saved = localStorage.getItem('subspace_user_level');
    return saved ? parseInt(saved, 10) : MOCK_USER.level;
  });

  // Keep track of which tasks are finished today
  const [tasks, setTasks] = useState<{ id: string; title: string; category: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('subspace_daily_tasks_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to defaults
      }
    }
    return [
      { id: 'dt_1', title: 'Verify active roadblock node', category: 'ROADMAP', completed: false },
      { id: 'dt_2', title: 'Calibrate propellant block supply', category: 'REFUEL', completed: false },
      { id: 'dt_3', title: 'Forge structural copy in Foundry', category: 'ASSETS', completed: false },
    ];
  });

  // Has today's streak been officially claimed and locked in?
  const [streakClaimed, setStreakClaimed] = useState<boolean>(() => {
    const todayStr = new Date().toDateString();
    const lastClaim = localStorage.getItem('subspace_last_streak_claim_date');
    return lastClaim === todayStr;
  });

  // Interactive state to lock UI while celebrating
  const [animatingStreak, setAnimatingStreak] = useState(false);

  // Sync daily task arrays to storage
  useEffect(() => {
    localStorage.setItem('subspace_daily_tasks_state', JSON.stringify(tasks));
    window.dispatchEvent(new Event('storage'));
  }, [tasks]);

  // Check if complete on mount
  const allTasksCompleted = tasks.every(t => t.completed);

  // Toggle a daily task to maintain the streak
  const handleToggleTask = (id: string) => {
    if (streakClaimed) return; // Locked in for today already

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          playChimeSound(nextState);
          
          if (nextState) {
            // Little sparkle puff over clicked task
            confetti({
              particleCount: 15,
              spread: 35,
              origin: { y: 0.65 },
              colors: ['#00F0FF', '#FFB800', '#FFFFFF']
            });
          }
          return { ...t, completed: nextState };
        }
        return t;
      });

      // Check if all are now completed
      const allCompleted = updated.every(item => item.completed);
      if (allCompleted && !streakClaimed) {
        // Automatically trigger secure/celebration stream
        setTimeout(() => {
          handleSecureStreak(updated);
        }, 150);
      }

      return updated;
    });
  };

  // Secure streak ceremony (increments level telemetry & triggers confetti cascades)
  const handleSecureStreak = (currentTasksState = tasks) => {
    if (streakClaimed || animatingStreak) return;
    
    // Check constraints
    const isReady = currentTasksState.every(t => t.completed);
    if (!isReady) return;

    setAnimatingStreak(true);
    playChimeSound(true);

    const nextStreak = streak + 1;
    
    // Animate counter upwards
    setTimeout(() => {
      setStreak(nextStreak);
      setStreakClaimed(true);
      
      const today = new Date().toDateString();
      localStorage.setItem('subspace_user_streak', String(nextStreak));
      localStorage.setItem('subspace_last_streak_claim_date', today);
      
      if (onStreakUpdate) {
        onStreakUpdate(nextStreak);
      }

      // Massive vector particle shower scaled around User's level.
      const isMilestone = [7, 30, 100].includes(nextStreak) || nextStreak % 100 === 0;
      const colors = isMilestone 
        ? ['#FFD700', '#FF8C00', '#FF0000', '#FFFFFF', '#00FFFF', '#FF1493']
        : ['#00F0FF', '#FFB800', '#3B82F6', '#EC4899', '#10B981', '#FFFFFF'];
      const streamVolume = isMilestone ? (150 + level * 10) : (70 + level * 10);
      
      confetti({
        particleCount: streamVolume,
        spread: isMilestone ? 120 : 80,
        origin: { y: 0.6 },
        colors: colors,
        scalar: isMilestone ? 1.4 : 1.2
      });

      // Secondary delay firework
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(streamVolume / 2),
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: colors,
          scalar: isMilestone ? 1.3 : 1
        });
        confetti({
          particleCount: Math.floor(streamVolume / 2),
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: colors,
          scalar: isMilestone ? 1.3 : 1
        });
        
        if (isMilestone) {
          // Tertiary delayed burst for milestones
          setTimeout(() => {
            confetti({
              particleCount: streamVolume,
              spread: 140,
              origin: { y: 0.4 },
              colors: colors,
              scalar: 1.6,
              startVelocity: 45
            });
          }, 300);
        }
        
        setAnimatingStreak(false);
      }, 350);

    }, 600);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Ambient Blurry Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#02050A]/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Floating Tactical Pod */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-[#040812] border border-[#00F0FF]/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col justify-end overflow-hidden"
      >
        {/* Neon HUD grids */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[#00F0FF]/15 to-transparent" />
        
        {/* Corner Alignment brackets */}
        <div className="absolute top-2 left-2 font-mono text-[9px] text-[#00F0FF]/30 select-none">┌ CALIBRATE_STRK ┐</div>
        <div className="absolute top-2 right-2 font-mono text-[9px] text-[#00F0FF]/30 select-none">L_CHIP_0493</div>
        
        {/* Header Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-[#00F0FF]/20 bg-black/40 text-text-secondary hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors z-20"
        >
          <X size={14} />
        </button>

        {/* Outer Circular Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.12)_0%,_transparent_65%)] pointer-events-none" />

        {/* Modal Body content */}
        <div className="relative z-10 text-center pt-4 flex flex-col items-center">
          
          {/* Main Status Stamp */}
          <span className="font-mono text-[9px] tracking-[0.25em] bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 px-3 py-1 rounded-full uppercase mb-4 shadow-[0_0_10px_rgba(0,240,255,0.1)] flex items-center gap-1.5 animate-pulse">
            <Sparkles size={10} name="starburst" /> CONSTELLATION CHAIN ACTIVE
          </span>

          {/* Large Interactive Fiery Streak Indicator with bouncy scale effects */}
          <motion.div 
            className="relative w-28 h-28 flex items-center justify-center mb-4 cursor-help"
            animate={animatingStreak ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.5 }}
            title="Maintain daily checkins to expand app capabilities!"
          >
            {/* Outer flame shockwave ring */}
            <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-[#FFB800]/40 animate-spin-slow" />
            
            {/* Center firepod */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-b from-orange-600/25 to-red-900/10 border border-[#FF4B4B]/30 flex flex-col items-center justify-center shadow-[inset_0_0_12px_rgba(255,75,75,0.2)]">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="text-[#FF4B4B] filter drop-shadow-[0_0_10px_rgba(255,75,75,0.7)]"
              >
                <Flame size={38} className="fill-current" />
              </motion.div>
              <span className="font-mono font-bold text-2xl text-white tracking-widest mt-0.5 leading-none">
                {streak}
              </span>
            </div>
          </motion.div>

          <h3 className="font-display font-bold text-xl text-white tracking-tight uppercase">
            {streakClaimed ? "STREAK LOCKED IN!" : "CHRONO STREAK READY"}
          </h3>

          <p className="font-mono text-[11px] text-[#80A0B0] mt-2 mb-6 max-w-xs leading-relaxed">
            {streakClaimed 
              ? `Check-in routine verified for standard terrestrial rotation. Your ${streak}-day system multiplier is secured.`
              : `Commit checklist telemetry to maintain the launch engine's momentum. Fill today's indicators to claim +1 metric.`
            }
          </p>

          {/* Daily Checklist Deck */}
          <div className="w-full bg-[#02050B] border border-white/5 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
            {/* Internal scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
            
            <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
              <span className="font-mono text-[9px] text-[#80A0B0] uppercase flex items-center gap-1.5">
                <Terminal size={10} className="text-[#00F0FF]" /> Daily Telemetry Jobs
              </span>
              <span className="font-mono text-[9px] text-[#00F0FF] uppercase font-bold tracking-widest">
                {tasks.filter(t => t.completed).length} / {tasks.length} SECURED
              </span>
            </div>

            <div className="space-y-2.5 relative z-10">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-250 select-none ${
                    streakClaimed 
                      ? 'bg-white/5 border-transparent opacity-75 cursor-default'
                      : task.completed
                        ? 'bg-[#10B981]/5 border-[#10B981]/20 hover:bg-[#10B981]/10 cursor-pointer'
                        : 'bg-black/40 border-white/5 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0 ${
                      task.completed 
                        ? 'bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/45' 
                        : 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                    }`}>
                      {task.category}
                    </span>
                    <span className={`font-mono text-[11px] truncate leading-tight ${
                      task.completed ? 'text-text-tertiary line-through' : 'text-text-primary'
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center pr-1">
                    {task.completed ? (
                      <CheckCircle2 size={15} className="text-[#10B981] fill-[#10B981]/10" />
                    ) : (
                      <Circle size={15} className="text-[#80A0B0]/40 group-hover:text-[#00F0FF] transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-white/10 hover:border-white/20 text-white font-mono text-[12px] uppercase tracking-widest transition-all bg-black/40 hover:bg-black/60 cursor-pointer"
            >
              Minimize Feed
            </button>
            
            {allTasksCompleted && !streakClaimed ? (
              <button 
                onClick={() => handleSecureStreak()}
                disabled={animatingStreak}
                className="flex-[1.2] h-11 rounded-xl bg-gradient-to-r from-[#00F0FF] to-blue-500 hover:from-[#00F0FF] hover:to-blue-400 text-black font-mono text-[11px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap size={13} className="fill-current animate-pulse" /> Secure Streak
              </button>
            ) : (
              <button 
                onClick={onClose}
                className={`flex-[1.2] h-11 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  streakClaimed 
                    ? 'bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] shadow-[0_0_15px_rgba(74,222,128,0.15)] hover:bg-[#10B981]/15'
                    : 'bg-white/5 text-text-tertiary border border-white/5 cursor-not-allowed opacity-60'
                }`}
                disabled={!streakClaimed}
              >
                {streakClaimed ? (
                  <>
                    <CheckCircle2 size={13} /> Secured Today
                  </>
                ) : (
                  <>Locked</>
                )}
              </button>
            )}
          </div>

          {/* Progress Tracker Bar */}
          <div className="w-full mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-text-tertiary font-mono text-[9px] uppercase">
            <span>Streak multiplier active: {Math.min(1 + (streak * 0.1), 3.0).toFixed(1)}x</span>
            <span>Level {level} Pilot</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
