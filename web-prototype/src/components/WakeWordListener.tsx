import React, { useEffect, useState, useRef } from 'react';
import { useToast } from './ToastContext';
import { playSuccess } from '../lib/audio';

interface WakeWordListenerProps {
  onWakeWord: () => void;
  isCopilotOpen: boolean;
}

export function WakeWordListener({ onWakeWord, isCopilotOpen }: WakeWordListenerProps) {
  const { addToast } = useToast();
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('subspace_cached_wake_word_enabled') === 'true';
  });

  const recognitionRef = useRef<any>(null);
  const activeRef = useRef(false);
  const consecutiveErrorsRef = useRef(0);
  const restartTimeoutRef = useRef<any>(null);

  // Sync state for async callback contexts
  const isCopilotOpenRef = useRef(isCopilotOpen);
  const isEnabledRef = useRef(isEnabled);

  useEffect(() => {
    isCopilotOpenRef.current = isCopilotOpen;
  }, [isCopilotOpen]);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // Listen to toggle events from Settings screen
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== undefined) {
        setIsEnabled(!!customEvent.detail);
      }
    };

    window.addEventListener('subspace_wake_word_toggle', handleToggle);
    return () => {
      window.removeEventListener('subspace_wake_word_toggle', handleToggle);
    };
  }, []);

  // Main listener control loop
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // Cleanup if disabled or Copilot is already open
    if (!SpeechRecognition || !isEnabled || isCopilotOpen) {
      if (activeRef.current) {
        try {
          recognitionRef.current?.stop();
        } catch (e) {}
        activeRef.current = false;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      return;
    }

    // Initialize Recognition
    if (!recognitionRef.current) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          activeRef.current = true;
          consecutiveErrorsRef.current = 0;
        };

        rec.onresult = (event: any) => {
          // If Copilot was opened in the meantime, ignore
          if (isCopilotOpenRef.current) return;

          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal || event.results[i][0].confidence > 0.3) {
              transcript += event.results[i][0].transcript;
            }
          }

          const lowerTranscript = transcript.toLowerCase().trim();
          
          // Detect wake phrase: 'astro' or 'hey astro'
          if (lowerTranscript.includes('astro') || lowerTranscript.includes('hey astro')) {
            // Trigger activation
            playSuccess();
            addToast('Astro Activated', 'Background voice activation detected! Opening Copilot...');
            
            // Open Copilot
            onWakeWord();

            // Stop background engine to avoid resource locking with the active copilot modal mic
            try {
              rec.stop();
            } catch (err) {}
            activeRef.current = false;
          }
        };

        rec.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            console.warn("Astro Background mic permissions are blocked.");
            consecutiveErrorsRef.current = 10; // Avoid looping aggressively
          } else {
            consecutiveErrorsRef.current++;
          }
        };

        rec.onend = () => {
          activeRef.current = false;

          // Restart if configuration is still active and error threshold not exceeded
          if (isEnabledRef.current && !isCopilotOpenRef.current && consecutiveErrorsRef.current < 5) {
            const delay = consecutiveErrorsRef.current > 0 ? 3000 : 800;
            restartTimeoutRef.current = setTimeout(() => {
              if (isEnabledRef.current && !isCopilotOpenRef.current) {
                try {
                  rec.start();
                } catch (e) {}
              }
            }, delay);
          }
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Failed to instantiate SpeechRecognition background service:", err);
      }
    }

    // Start Listening
    if (!activeRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isEnabled, isCopilotOpen]);

  // Render a tiny glowing visual indicator when wake-word background mode is active
  if (!isEnabled || isCopilotOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 pointer-events-none flex items-center gap-1.5 bg-[#03040C]/85 px-2.5 py-1.5 rounded-full border border-brand-teal/20 backdrop-blur-md animate-fade-in shadow-lg">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
      </div>
      <span className="font-mono text-[9px] text-[#A9B2C3] uppercase tracking-wide">Astro Active</span>
    </div>
  );
}
