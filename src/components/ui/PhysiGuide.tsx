import { useState } from 'react';
import { Bot } from 'lucide-react';
import { PhysiChatbot } from './PhysiChatbot';

interface PhysiGuideProps {
  variant?: 'floating' | 'header';
}

export function PhysiGuide({ variant = 'header' }: PhysiGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Chatbot IA Physi"
        aria-label="Abrir Chatbot IA Physi"
        className={
          variant === 'floating'
            ? 'fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-teal-600/90 to-emerald-600/90 hover:from-teal-500 hover:to-emerald-500 text-white backdrop-blur-xl border border-white/30 shadow-xl shadow-teal-700/25 active:scale-95 transition-all flex items-center gap-2'
            : 'p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/60 dark:hover:bg-slate-800/60 backdrop-blur-xs transition-all flex items-center gap-1.5'
        }
      >
        <Bot size={20} className={variant === 'floating' ? 'text-white' : 'text-teal-600 dark:text-teal-400'} />
        {variant === 'header' && (
          <span className="hidden xl:inline text-xs font-semibold text-teal-800 dark:text-teal-300">
            Chatbot Physi
          </span>
        )}
      </button>

      <PhysiChatbot isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

export { PhysiChatbot };
export default PhysiGuide;
