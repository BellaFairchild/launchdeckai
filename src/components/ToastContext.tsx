import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: string;
  title: string;
  message: string;
}

interface ToastContextType {
  addToast: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, title, message }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-[90%] md:max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="pointer-events-auto bg-[#0F1826]/95 border border-brand-teal/40 backdrop-blur-md rounded-2xl p-3 shadow-[0_4px_24px_rgba(77,200,192,0.2)] flex items-start gap-3"
            >
               <div className="mt-0.5 w-7 h-7 rounded-full bg-brand-teal/20 flex items-center justify-center shrink-0">
                 <CheckCircle2 size={16} className="text-brand-teal" />
               </div>
               <div className="flex-1 min-w-0">
                 <h4 className="font-mono text-[11px] uppercase text-brand-teal tracking-widest font-bold mb-0.5">{toast.title}</h4>
                 <p className="font-body text-xs text-brand-teal-light leading-snug">{toast.message}</p>
               </div>
               <button onClick={() => removeToast(toast.id)} className="text-brand-teal/60 hover:text-brand-teal p-1 rounded-md hover:bg-brand-teal/10 transition-colors">
                 <X size={14} />
               </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
