import { LayoutDashboard, Radio, Settings, Database, Hammer, Sparkles, CheckSquare, Book, LayoutTemplate } from 'lucide-react';
import { motion } from 'motion/react';
import { playNavigate, playSuccess } from '../lib/audio';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openCopilot: () => void;
}

export function BottomNav({ currentTab, setCurrentTab, openCopilot }: BottomNavProps) {
  const tabs = [
    { id: 'deck', icon: LayoutDashboard, label: 'Deck' },
    { id: 'mission', icon: CheckSquare, label: 'Missions' },
    { id: 'copilot', isOrb: true },
    { id: 'blueprints', icon: LayoutTemplate, label: 'Blueprints' },
    { id: 'foundry', icon: Hammer, label: 'Foundry' },
  ];

  return (
    <div className="absolute flex bottom-0 w-full h-[80px] bg-[#1A100A]/95 px-4 pb-4 pt-2 justify-between items-center z-40 border-t border-[#2A1D00]">
      {/* Wood texture simulation overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
      
      {tabs.map((tab) => {
        if (tab.isOrb) {
          return (
            <div key="copilot" className="relative -top-4 flex flex-col items-center justify-center pointer-events-auto">
              {/* Twinkling star glow background */}
              <div 
                className="absolute w-[72px] h-[72px] rounded-full bg-brand-teal/20 blur-xl pointer-events-none animate-pulse" 
                style={{ animationDuration: '3s' }}
              />
              
              {/* Twinkling small decorative stars surrounding the orb */}
              <div 
                className="absolute top-0 -left-2 w-1.5 h-1.5 bg-[#4DC8C0] rounded-full shadow-[0_0_8px_#ffffff]" 
                style={{ animation: 'twinkle 2.5s ease-in-out infinite' }}
              />
              <div 
                className="absolute bottom-1 -right-2 w-1.5 h-1.5 bg-[#7DDBD6] rounded-full shadow-[0_0_8px_#ffffff]" 
                style={{ animation: 'twinkle 4s ease-in-out infinite 1s' }}
              />
              <div 
                className="absolute -top-3 right-1 w-1 h-1 bg-[#F3B233] rounded-full shadow-[0_0_6px_#ffffff]" 
                style={{ animation: 'twinkle 3s ease-in-out infinite 0.5s' }}
              />

              <motion.button 
                id="copilot-middle-orb"
                onClick={() => {
                  playSuccess();
                  openCopilot();
                }}
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg relative cursor-pointer group active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #4DC8C0, #7DDBD6)',
                  boxShadow: '0 0 20px rgba(77,200,192,0.4)',
                }}
                animate={{
                  y: [0, -3.5, 1, -2.5, 1.5, 0],
                  x: [0, 1.5, -2, 2.5, -1, 0],
                }}
                transition={{
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <div className="absolute w-[72px] h-[72px] rounded-full -z-10" />
                
                {/* Tiny star points inside the orb face */}
                <div 
                  className="absolute top-2 right-3 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#fff]" 
                  style={{ animation: 'twinkle 1.8s ease-in-out infinite' }}
                />
                <div 
                  className="absolute bottom-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_3px_#fff]" 
                  style={{ animation: 'twinkle 2.2s ease-in-out infinite 0.7s' }}
                />

                <Sparkles size={28} className="text-brand-blue drop-shadow-md group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
              </motion.button>
            </div>
          );
        }

        const Icon = tab.icon!;
        const isActive = currentTab === tab.id;

        return (
          <button 
            key={tab.id}
            onClick={() => {
              playNavigate();
              setCurrentTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center gap-1 w-[48px] z-10 ${isActive ? 'opacity-100' : 'opacity-70'}`}
          >
            <div className="relative">
              <Icon size={24} className={isActive ? 'text-brand-teal' : 'text-text-tertiary'} />
              {isActive && (
                <div className="absolute inset-0 bg-brand-teal blur-md opacity-40 rounded-full" />
              )}
            </div>
            <span className={`font-body text-[10px] font-medium ${isActive ? 'text-brand-teal' : 'text-text-tertiary'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
