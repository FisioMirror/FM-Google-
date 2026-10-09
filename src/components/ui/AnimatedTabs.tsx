import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'secondary';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onTabChange?: (id: string) => void;
}

export function AnimatedTabs({
  tabs,
  defaultTab,
  variant = 'default',
  orientation = 'horizontal',
  className,
  onTabChange,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const isVertical = orientation === 'vertical';
  const isPills = variant === 'pills' || variant === 'secondary';

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onTabChange?.(id);
  };

  return (
    <div className={cn('flex w-full', isVertical ? 'flex-row gap-6' : 'flex-col', className)}>
      <div
        className={cn(
          isVertical
            ? 'flex flex-col space-y-1.5 border-r border-outline/15 pr-4'
            : isPills
              ? 'flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-container-high/60 border border-outline/10 w-fit overflow-x-auto max-w-full'
              : 'flex border-b border-outline/15 overflow-x-auto overflow-y-hidden flex-nowrap scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'relative px-4 py-2 text-xs md:text-sm font-semibold transition-colors whitespace-nowrap min-h-[38px] flex items-center justify-center gap-2 rounded-xl select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                tab.disabled && 'opacity-40 cursor-not-allowed',
                !tab.disabled && 'cursor-pointer',
                isPills
                  ? isActive
                    ? 'text-white'
                    : 'text-on-surface-variant hover:text-on-surface'
                  : isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface',
                isVertical && isActive && !isPills && 'border-l-2 border-primary bg-primary/5 rounded-r-xl',
              )}
            >
              {/* Aceternity UI style sliding pill background */}
              {isPills && isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 shadow-md shadow-teal-600/25 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span className="relative z-10">{tab.label}</span>

              {/* Standard bottom line indicator */}
              {!isPills && !isVertical && isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {tabs.find((t) => t.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

