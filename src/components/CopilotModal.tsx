import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MISSION, MOCK_TASKS } from '../types';
import { playClick, playToggle, playSuccess } from '../lib/audio';

interface CopilotModalProps {
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export function CopilotModal({ onClose }: CopilotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_1',
      role: 'assistant',
      content: 'Commander, your mission is online. You have an active launch gap regarding your App Store screenshots.\n\nType or use the microphone to execute voice commands:\n🎤 "Add task Create screenshots"\n🎤 "Complete task Create screenshots"\n🎤 "Readiness status report"\n\nWhat can I help you forge today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [isVoiceFeedback, setIsVoiceFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Refs to prevent state capture in async callback event handlers
  const recognitionRef = useRef<any>(null);
  const autoSubmitTimeoutRef = useRef<any>(null);
  const handleSendRef = useRef<any>(null);
  const isHandsFreeRef = useRef(isHandsFree);
  const isListeningRef = useRef(isListening);
  const isVoiceFeedbackRef = useRef(isVoiceFeedback);

  const suggestedPrompts = [
    "What should I fix today?",
    "Review my App Store copy",
    "Find launch risks",
    "Generate launch marketing copy",
    "Analyze social media signals",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isScraping]);

  // Synchronize refs with state to prevent stale closure captures in async events
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [isScraping, isListening, isHandsFree, isVoiceFeedback]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
    // If user turns on hands-free, ensure standard speech recognition is active
    if (isHandsFree && !isListening) {
      toggleListening();
    }
  }, [isHandsFree]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isVoiceFeedbackRef.current = isVoiceFeedback;
  }, [isVoiceFeedback]);

  // Handle Speech Synthesis
  const speakResponse = (text: string) => {
    if (!isVoiceFeedbackRef.current || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    try {
      window.speechSynthesis.cancel(); // Stop former utterances
      
      const cleanText = text
        .replace(/\*\*|__/g, '')
        .replace(/\*|_/g, '')
        .replace(/#+/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/-\s+/g, '')
        .substring(0, 320); // Keep voice readback punchy and brief

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.lang.startsWith('en'));
      if (match) {
        utterance.voice = match;
      }
      utterance.rate = 1.05; // Slightly faster for slick cyber feedback
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis warning:", e);
    }
  };

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInputValue((prev) => {
            const trimmed = prev.trim();
            const chunk = finalTranscript.trim();
            if (trimmed.endsWith(chunk) || trimmed.includes(chunk)) {
              return prev; // Filter out repeated speech signals
            }
            return trimmed + (trimmed.length > 0 ? ' ' : '') + chunk;
          });

          // Reset hands-free silence timeout tracker
          if (autoSubmitTimeoutRef.current) {
            clearTimeout(autoSubmitTimeoutRef.current);
          }

          if (isHandsFreeRef.current) {
            autoSubmitTimeoutRef.current = setTimeout(() => {
              setInputValue((prev) => {
                const queryText = prev.trim();
                if (queryText && handleSendRef.current) {
                  handleSendRef.current(queryText);
                }
                return '';
              });
            }, 1800); // 1.8 seconds of silence to auto-send
          }
        } else if (interimTranscript && isHandsFreeRef.current) {
          // If speaking but not final, pause early timer
          if (autoSubmitTimeoutRef.current) {
            clearTimeout(autoSubmitTimeoutRef.current);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          console.warn("Mic permission blocked in frame.");
        }
      };

      recognition.onend = () => {
        // Automatically wake back up if we are in continuous listening or hands-free mode
        if (isListeningRef.current || isHandsFreeRef.current) {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // Suppress starting error
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (autoSubmitTimeoutRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);
      }
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported or permission is blocked in this browser frame.");
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start speech recognition", e);
      }
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isScraping) return;
    
    // Stop listening if sending outside of continuous hands-free mode
    if (isListening && !isHandsFree) {
      toggleListening();
    }
    
    // Reset hands-free silence timeout
    if (autoSubmitTimeoutRef.current) {
      clearTimeout(autoSubmitTimeoutRef.current);
    }
    
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsScraping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      playSuccess();
      const lowerText = text.toLowerCase();
      let aiReplyContent = "Acknowledged, Commander! Running general diagnostics on your launch parameters. Trajectory looks excellent.";
      
      // Parse Speech Commands for Interactive Mission Updates!
      if (lowerText.includes('add task') || lowerText.includes('create task')) {
        const taskTitle = text.replace(/add task|create task/i, '').trim();
        if (taskTitle.length > 2) {
          try {
            const saved = localStorage.getItem('subspace_cached_tasks');
            const currentTasks = saved ? JSON.parse(saved) : MOCK_TASKS;
            const newTask = {
              id: `t_${Date.now()}`,
              title: taskTitle,
              status: 'active' as const,
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
            };
            const updated = [...currentTasks, newTask];
            localStorage.setItem('subspace_cached_tasks', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage')); // trigger reactive update across other screen listeners
            
            aiReplyContent = `Affirmative! I have logged the new task: "**${taskTitle}**" to your spacecraft logs. Cabin dashboard synchronized!`;
          } catch (e) {
            aiReplyContent = "Processed command, but failed to write checklist to local storage database. Let's try again.";
          }
        } else {
          aiReplyContent = "Commander, please state the task title. For example: 'Add task write onboarding copy'.";
        }
      } else if (lowerText.includes('complete task') || lowerText.includes('finish task') || lowerText.includes('check task') || lowerText.includes('done task')) {
        const targetSearch = text.replace(/complete task|finish task|check task|done task|complete|finish|check/i, '').trim();
        if (targetSearch.length > 2) {
          try {
            const saved = localStorage.getItem('subspace_cached_tasks');
            const currentTasks = saved ? JSON.parse(saved) : MOCK_TASKS;
            
            const idx = currentTasks.findIndex((t: any) => t.title.toLowerCase().includes(targetSearch.toLowerCase()));
            if (idx !== -1) {
              const updated = currentTasks.map((t: any, index: number) => {
                if (index === idx) {
                  return { ...t, status: 'completed' as const };
                }
                return t;
              });
              localStorage.setItem('subspace_cached_tasks', JSON.stringify(updated));
              window.dispatchEvent(new Event('storage'));
              
              aiReplyContent = `Roger that. Task "**${currentTasks[idx].title}**" has been successfully verified & completed in your launch deck!`;
            } else {
              aiReplyContent = `I searched your checklists but could not find any active milestone containing "${targetSearch}". Let's double check the key name.`;
            }
          } catch (e) {
            aiReplyContent = "Error accessing cabin logs storage to update task readiness.";
          }
        } else {
          aiReplyContent = "Please specify which item to check off. Say: 'Complete task upload logo'.";
        }
      } else if (lowerText.includes('status') || lowerText.includes('readiness') || lowerText.includes('report') || lowerText.includes('metrics')) {
        try {
          const savedTasks = localStorage.getItem('subspace_cached_tasks');
          const currentTasks = savedTasks ? JSON.parse(savedTasks) : MOCK_TASKS;
          const total = currentTasks.length;
          const completed = currentTasks.filter((t: any) => t.status === 'completed').length;
          
          aiReplyContent = `Here is your Ship Status & Launch Readiness Briefing:\n\n* **Primary App**: FocusFlow\n* **Checklist Completion**: ${completed}/${total} active goals checked\n* **Launch Date Grid**: Target T-14 Days\n* **Telemetry Status**: All systems nominal. ready for further voice commands!`;
        } catch (e) {
          aiReplyContent = "Establishing satellite sync... Mission readiness stands at 68%. 3 checkboxes in store_prep are active.";
        }
      } else if (lowerText.includes('risk') || lowerText.includes('blocking') || lowerText.includes('fix')) {
        aiReplyContent = "Analyzing mission parameters...\n\nBased on your current telemetry, your App Store conversion rate is projected to be suboptimal. I recommend deploying a targeted A/B test for your screenshots.";
      } else if (lowerText.includes('marketing') || lowerText.includes('copy')) {
        aiReplyContent = "Drafting high-conversion copy...\n\n'Launch into the future with Subspace. Secure, fast, and built for commanders.'\n\nWould you like me to push this to your social channels?";
      } else if (lowerText.includes('social') || lowerText.includes('analyze')) {
        aiReplyContent = "Scanning hyperspace frequencies…\n\nYour post engagement is up 40% in the last hour. Twitter is currently your most active platform. Consider deploying a follow-up transmission now.";
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiReplyContent };
      setMessages(prev => [...prev, aiMsg]);
      setIsScraping(false);

      // Read output response voice out loud if optional voice readback is ON
      speakResponse(aiReplyContent);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm transition-opacity"
        onClick={() => { playClick(); onClose(); }}
      />
      
      {/* Custom sliding modal */}
      <div className="relative w-full h-[85%] bg-bg-surface rounded-t-3xl border-t border-border-med flex flex-col pt-2 shadow-2xl">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-border-med rounded-full mx-auto mb-4" />
        
        {/* Header */}
        <div className="px-4 pb-4 border-b border-border-default flex justify-between items-center bg-bg-surface">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center overflow-hidden">
                 {/* Using a bot icon as a placeholder for the uploaded image. User can replace src with /astro.png once uploaded to public folder */}
                 <div className="w-full h-full bg-brand-teal/20 flex flex-col items-center justify-end">
                    <Bot size={28} className="text-brand-teal -mb-1" />
                 </div>
              </div>
              <div>
                 <h2 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
                    Astro
                 </h2>
                 <p className="font-body text-xs text-text-secondary mt-0.5">
                    AI Copilot
                 </p>
              </div>
           </div>
           <button onClick={() => { playClick(); onClose(); }} className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-bg-card border border-border-default transition-colors cursor-pointer">
              <X size={20} />
           </button>
        </div>

        <AnimatePresence>
           {isListening && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="bg-status-warning/10 border-b border-status-warning/20 overflow-hidden shrink-0"
             >
               <div className="flex items-center justify-center gap-1.5 py-3">
                 {[...Array(15)].map((_, i) => (
                   <motion.div
                     key={i}
                     className="w-1 bg-status-warning rounded-full"
                     initial={{ height: 4 }}
                     animate={{ height: [4, 18, 4] }}
                     transition={{
                       duration: 0.8,
                       repeat: Infinity,
                       ease: "easeInOut",
                       delay: i * 0.05,
                     }}
                   />
                 ))}
                 <span className="ml-3 font-mono text-[10px] uppercase text-status-warning font-bold tracking-widest">Listening...</span>
               </div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Context Chip */}
        <div className="px-4 py-3 bg-bg-card/50 border-b border-border-default flex justify-center">
            <span className="font-body text-[11px] text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/20 flex items-center gap-1.5">
               <Sparkles size={12} />
               Using context from: {MOCK_MISSION.appName}
            </span>
        </div>

         {/* Chat Area */}
        <div className="flex-1 px-4 py-6 overflow-y-auto flex flex-col space-y-4 relative">
           
           {messages.map((msg) => (
             <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'assistant' && (
                  <span className="font-body text-[10px] text-text-tertiary ml-1 flex items-center gap-1"><Sparkles size={8} className="text-brand-teal" /> Astro</span>
                )}
                <div className={`
                  ${msg.role === 'user' ? 'bg-brand-blue/20 border-brand-blue/30 text-brand-blue-light' : 'bg-bg-card border-border-default text-text-primary'}
                  border rounded-2xl p-3.5 max-w-[85%] shadow-sm
                  ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}
                `}>
                   {msg.content.split('\n').map((line, i) => (
                     <React.Fragment key={i}>
                       <p className={`font-body text-[13px] leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>
                         {line}
                       </p>
                     </React.Fragment>
                   ))}
                </div>
             </div>
           ))}

           {isScraping && (
             <div className="flex flex-col gap-1 items-start">
               <div className="bg-bg-card border border-border-default rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
           )}

           {/* Prompts - only show if there is only 1 message (the greeting) */}
           {messages.length === 1 && (
             <div className="flex flex-wrap gap-2 mt-4 pb-4">
                {suggestedPrompts.map((prompt, i) => (
                   <button 
                    key={i}
                    onClick={() => { playClick(); handleSend(prompt); }}
                    className="font-body text-[11px] text-brand-blue-light bg-[#1E3A5F]/40 border border-[#1E3A5F]/60 px-3 py-2 rounded-full hover:bg-[#1E3A5F]/80 transition-colors text-left flex items-center gap-1.5"
                   >
                      <Sparkles size={10} className="opacity-70" /> {prompt}
                   </button>
                ))}
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

         {/* Input Bar */}
        <div className="p-4 border-t border-border-default bg-bg-surface">
            {/* Mic tuning parameters */}
            <div className="flex items-center justify-between gap-3 mb-3 text-[11px] px-1 select-none">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsHandsFree(prev => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all ${
                  isHandsFree
                    ? 'bg-status-warning/10 border-status-warning/30 text-status-warning font-semibold'
                    : 'bg-bg-card border-border-default text-text-tertiary hover:text-text-secondary font-body'
                }`}
                title="Automatically submits your voice transcripts 1.8 seconds after you stop speaking"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isHandsFree ? 'bg-status-warning animate-pulse' : 'bg-white/25'}`} />
                <span>Hands-Free {isHandsFree ? 'Active' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  const nextVal = !isVoiceFeedback;
                  setIsVoiceFeedback(nextVal);
                  if (!nextVal && typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all ${
                  isVoiceFeedback
                    ? 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal font-semibold'
                    : 'bg-bg-card border-border-default text-text-tertiary hover:text-text-secondary font-body'
                }`}
                title="Astro speaks incoming messages out loud"
              >
                {isVoiceFeedback ? <Volume2 size={12} className="text-brand-teal" /> : <VolumeX size={12} className="text-text-tertiary" />}
                <span>Voice feedback {isVoiceFeedback ? 'ON' : 'OFF'}</span>
              </button>
            </div>
           <form 
              onSubmit={(e) => { e.preventDefault(); playClick(); handleSend(inputValue); }}
              className="relative flex items-center"
           >
              <input 
                 type="text"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 disabled={isScraping}
                 placeholder={isListening ? (isHandsFree ? "Listening... (Pause to send)" : "Listening...") : "Type your voice command..."}
                 className={`w-full bg-bg-card border ${isListening ? 'border-brand-teal/50 ring-1 ring-brand-teal/50' : 'border-border-med'} rounded-full py-3.5 pl-4 pr-[100px] text-[13px] font-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/50 disabled:opacity-50 transition-all`}
              />
              {/* Controls */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 mr-1 text-text-tertiary">
                   <span className="font-mono text-[10px] opacity-80">⚡1</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => { playToggle(!isListening); toggleListening(); }}
                  className={`w-9 h-9 rounded-full flex justify-center items-center transition-colors ${
                    isListening 
                      ? 'bg-status-warning/20 text-status-warning hover:bg-status-warning/30 animate-pulse' 
                      : 'bg-bg-surface border border-border-med text-text-secondary hover:text-text-primary hover:border-brand-teal/30'
                  }`}
                  title={isListening ? "Stop listening" : "Start typing with voice"}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>

                <button 
                  type="submit"
                  onClick={() => playClick()}
                  disabled={!inputValue.trim() || isScraping}
                  className="bg-brand-teal disabled:bg-border-med shrink-0 w-9 h-9 rounded-full flex justify-center items-center transition-colors shadow-sm"
                >
                    <Send size={14} className="text-white ml-0.5" />
                </button>
              </div>
           </form>
        </div>
        
      </div>
    </div>
  );
}
