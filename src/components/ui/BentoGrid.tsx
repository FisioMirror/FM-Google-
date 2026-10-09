import React, { type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ComponentType<{ className?: string }>;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
  badge?: string;
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href: _href,
  cta = 'Ver detalles',
  onClick,
  badge,
}: BentoCardProps) {
  return (
    <div
      key={name}
      onClick={onClick}
      className={cn(
        'group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-outline/15 bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-outline/10 cursor-pointer',
        className
      )}
    >
      {/* Background layer */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-60 transition-opacity duration-300 group-hover:opacity-90">
        {background}
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-start justify-between">
        {Icon ? (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 transition-all duration-300 group-hover:bg-teal-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-teal-500/30 dark:text-teal-400">
            <Icon className="size-6 transition-transform duration-300 group-hover:scale-110" />
          </div>
        ) : null}

        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Content & CTA */}
      <div className="relative z-10 flex flex-col gap-2 pt-8">
        <h3 className="text-lg font-bold tracking-tight text-on-surface transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
          {name}
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
          {description}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
          <span>{cta}</span>
          <ArrowRight className="size-3.5" />
        </div>
      </div>

      {/* Ambient gradient corner */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 size-32 rounded-full bg-teal-500/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-teal-500/20" />
    </div>
  );
}
