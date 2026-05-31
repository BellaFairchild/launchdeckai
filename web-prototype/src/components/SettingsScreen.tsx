import React, { useState } from 'react';
import { Settings, Bell, Shield, Smartphone, Globe, Key, Moon, Volume2, Mic } from 'lucide-react';
import { playToggle } from '../lib/audio';

export function SettingsScreen() {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('subspace_cached_notifications_enabled') !== 'false';
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('subspace_cached_dark_mode') !== 'false';
  });

  const [haptic, setHaptic] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('subspace_cached_haptic_feedback') !== 'false';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('subspace_cached_sound_enabled') !== 'false';
  });

  const [wakeWord, setWakeWord] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('subspace_cached_wake_word_enabled') === 'true';
  });

  const toggleNotifications = () => {
    const val = !notifications;
    setNotifications(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('subspace_cached_notifications_enabled', String(val));
    }
    playToggle(val);
  };

  const toggleDarkMode = () => {
    const val = !darkMode;
    setDarkMode(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('subspace_cached_dark_mode', String(val));
    }
    playToggle(val);
  };

  const toggleHaptic = () => {
    const val = !haptic;
    setHaptic(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('subspace_cached_haptic_feedback', String(val));
    }
    playToggle(val);
  };

  const toggleSound = () => {
    const val = !soundEnabled;
    setSoundEnabled(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('subspace_cached_sound_enabled', String(val));
    }
    playToggle(val);
  };

  const toggleWakeWord = () => {
    const val = !wakeWord;
    setWakeWord(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('subspace_cached_wake_word_enabled', String(val));
      window.dispatchEvent(new CustomEvent('subspace_wake_word_toggle', { detail: val }));
    }
    playToggle(val);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-6">
      
      {/* Header Card */}
      <div className="relative w-full rounded-3xl overflow-hidden glass-card p-6 border-border-med flex justify-between items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-teal/5 opacity-40 z-0" />
        <div className="relative z-10 flex items-center gap-4 w-full">
           <div className="w-12 h-12 rounded-full bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center flex-shrink-0">
              <Settings className="text-brand-teal" size={24} />
           </div>
           <div>
              <h2 className="font-display font-bold text-xl text-text-primary tracking-tight">Settings</h2>
              <p className="font-body text-sm text-text-secondary mt-1">Manage your mission preferences and command center configurations.</p>
           </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        
        {/* Account Section */}
        <div className="glass-card overflow-hidden border border-border-med">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-bold">Account</h3>
          </div>
          <div className="flex flex-col">
            <SettingRow icon={<Shield size={18} />} title="Security & Authentication" description="Manage passwords and 2FA" />
            <SettingRow icon={<Globe size={18} />} title="Mission Region" description="Default subspace deployment zone" borderBottom={false} />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="glass-card overflow-hidden border border-border-med">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-bold">Preferences</h3>
          </div>
          <div className="flex flex-col">
            <SettingRow 
              icon={<Bell size={18} />} 
              title="Notifications" 
              description="Launch alerts and status updates" 
              hasToggle 
              toggled={notifications} 
              onToggle={toggleNotifications}
            />
            <SettingRow 
              icon={<Moon size={18} />} 
              title="Cosmic Dark Mode" 
              description="Default visual theme (Ambient Slate)" 
              hasToggle 
              toggled={darkMode} 
              onToggle={toggleDarkMode}
            />
            <SettingRow 
              icon={<Volume2 size={18} />} 
              title="Audio Feedback" 
              description="Sound effects during button clicks and nav actions" 
              hasToggle 
              toggled={soundEnabled} 
              onToggle={toggleSound}
            />
            <SettingRow 
              icon={<Smartphone size={18} />} 
              title="Haptic Feedback" 
              description="Tactile vibration patterns on tactile triggers" 
              hasToggle 
              toggled={haptic} 
              onToggle={toggleHaptic}
            />
            <SettingRow 
              icon={<Mic size={18} />} 
              title="Voice Activation (Astro)" 
              description="Say 'Astro' in the background to automatically open Copilot" 
              hasToggle 
              toggled={wakeWord} 
              onToggle={toggleWakeWord}
              borderBottom={false} 
            />
          </div>
        </div>

        {/* Guided Setup Section */}
        <div className="glass-card overflow-hidden border border-border-med" id="settings-guided-setup">
          <div className="p-4 border-b border-white/5 bg-white/5 text-left">
            <h3 className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-bold">Guided Setup</h3>
          </div>
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-[#18D6C8]">
                 <Smartphone size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-body font-medium text-sm text-text-primary">Onboarding Flow</span>
                <span className="font-body text-xs text-[#AAB2D5]">Re-run customization to rebuild guidelines and checklists</span>
              </div>
            </div>
            <button 
              onClick={() => {
                window.dispatchEvent(new Event('subspace_trigger_restart_onboarding'));
              }}
              className="h-8 px-3 bg-[#18D6C8]/10 hover:bg-[#18D6C8]/20 text-[#18D6C8] font-mono text-[10px] font-black uppercase tracking-wider border border-[#18D6C8]/20 hover:border-[#18D6C8]/40 rounded-xl transition-all duration-200 cursor-pointer text-center whitespace-nowrap"
            >
              Restart Flow
            </button>
          </div>
        </div>

        {/* Developers Section */}
        <div className="glass-card overflow-hidden border border-border-med">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-bold">Developers</h3>
          </div>
          <div className="flex flex-col">
            <SettingRow icon={<Key size={18} />} title="API Keys" description="Manage programmatic access" borderBottom={false} />
          </div>
        </div>

      </div>

    </div>
  );
}

function SettingRow({ 
  icon, 
  title, 
  description, 
  hasToggle = false, 
  toggled = false, 
  onToggle,
  borderBottom = true 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  hasToggle?: boolean; 
  toggled?: boolean; 
  onToggle?: () => void;
  borderBottom?: boolean; 
}) {
  return (
    <div 
      onClick={hasToggle ? onToggle : undefined}
      className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${borderBottom ? 'border-b border-border-default' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-text-secondary">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-body font-medium text-sm text-text-primary">{title}</span>
          <span className="font-body text-xs text-text-tertiary">{description}</span>
        </div>
      </div>
      {hasToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors relative outline-none cursor-pointer focus:ring-1 focus:ring-brand-teal ${toggled ? 'bg-brand-teal' : 'bg-bg-deep border border-border-med'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toggled ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      )}
    </div>
  );
}
