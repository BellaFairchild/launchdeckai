import { User, Fuel, LayoutTemplate, LifeBuoy, Settings, LogOut, X, Database, Smartphone, Book, Radio } from 'lucide-react';
import { MOCK_USER } from '../types';
import { playClick, playNavigate } from '../lib/audio';

interface DrawerProps {
  onClose: () => void;
  onMenuAction: (id: string) => void;
}

export function Drawer({ onClose, onMenuAction }: DrawerProps) {
  const menuItems = [
    { icon: User, label: 'Profile', id: 'profile' },
    { icon: Smartphone, label: 'Run Onboarding', id: 'onboarding' },
    { icon: Book, label: 'Launch Library', id: 'library' },
    { icon: Radio, label: 'Signals', id: 'signals' },
    { icon: Database, label: 'Cargo', id: 'cargo' },
    { icon: Fuel, label: 'Refuel Station', id: 'refuel' },
    { icon: LifeBuoy, label: 'Support', id: 'support' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex">
      {/* ... rest of your drawer ... */}
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm transition-opacity" 
        onClick={() => { playClick(); onClose(); }}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-[80%] max-w-[300px] h-full bg-bg-surface border-r border-border-med flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border-default flex justify-between items-start">
           <div className="flex flex-col gap-1">
              {/* Profile Overview */}
              <div className="w-12 h-12 rounded-full bg-border-med mb-2 flex items-center justify-center">
                 <User className="text-text-secondary" size={24} />
              </div>
              <span className="font-display font-bold text-lg text-text-primary">{MOCK_USER.displayName}</span>
              <span className="font-body text-xs text-text-secondary">{MOCK_USER.email}</span>
              <span className="inline-block px-2 py-1 bg-[#1E3A5F] text-[#60A5FA] text-[10px] font-mono leading-none rounded mt-2 w-fit uppercase">
                {MOCK_USER.plan}
              </span>
           </div>
           <button onClick={() => { playClick(); onClose(); }} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-white/5 transition-colors cursor-pointer">
              <X size={20} />
           </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 flex flex-col">
           {menuItems.map((item) => (
             <button 
                key={item.id} 
                className="flex items-center gap-3 px-6 py-4 w-full text-left hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => {
                  playNavigate();
                  onClose();
                  onMenuAction(item.id);
                }}
             >
                <item.icon size={20} className="text-text-secondary" />
                <span className="font-body font-medium text-[15px] text-text-primary">{item.label}</span>
             </button>
           ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default">
           <button onClick={() => { playClick(); }} className="flex items-center gap-3 px-2 w-full text-left font-body font-medium text-sm text-status-error hover:opacity-80 transition-opacity cursor-pointer">
              <LogOut size={18} />
              LOG OUT OF COMMAND
           </button>
        </div>
      </div>
    </div>
  );
}
