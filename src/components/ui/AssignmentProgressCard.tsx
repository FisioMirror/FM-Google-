import React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

export interface RoutineCardData {
  id: number;
  colorClass?: string;
  date: string;
  title: string;
  description: string;
  progressPercent?: string;
  progressValue: string; // e.g. "75%"
  imgSrc1?: string;
  imgAlt1?: string;
  imgSrc2?: string;
  imgAlt2?: string;
  countdownText: string;
  badge?: string;
}

export interface AssignmentProgressCardProps {
  data: RoutineCardData;
  className?: string;
  onAction?: () => void;
}

export const AssignmentProgressCard: React.FC<AssignmentProgressCardProps> = ({ data, className = '', onAction }) => {
  const {
    colorClass = '',
    date,
    title,
    description,
    progressValue,
    imgSrc1,
    imgAlt1,
    imgSrc2,
    imgAlt2,
    countdownText,
    badge,
  } = data;

  return (
    <div
      className={`card ${colorClass} p-5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 ${className}`}
    >
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{date}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={onAction}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Más opciones"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="flex items-center gap-2.5 mt-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Progreso</span>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: progressValue }}
            />
          </div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums">
            {progressValue}
          </span>
        </div>
      </div>

      {/* Footer with Physio/Patient Avatars & Countdown */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <ul className="flex items-center -space-x-2">
          {imgSrc1 && (
            <li>
              <img
                src={imgSrc1}
                alt={imgAlt1 || 'Fisioterapeuta asignado'}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover"
              />
            </li>
          )}
          {imgSrc2 && (
            <li>
              <img
                src={imgSrc2}
                alt={imgAlt2 || 'Paciente'}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover"
              />
            </li>
          )}
          <li>
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border-2 border-white dark:border-slate-900 font-semibold"
              title="Añadir terapeuta o nota"
            >
              <Plus className="w-3.5 h-3.5" />
            </span>
          </li>
        </ul>

        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">
          {countdownText}
        </span>
      </div>
    </div>
  );
};

export default AssignmentProgressCard;
