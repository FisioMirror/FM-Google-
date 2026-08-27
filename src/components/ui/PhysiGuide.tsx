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
        className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/60 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
      >
        <Bot size={20} className="text-teal-600 dark:text-teal-400" />
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
