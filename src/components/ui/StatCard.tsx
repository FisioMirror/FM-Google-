import React from 'react';
import { SpotlightCard } from './SpotlightCard';
import { NumberTicker } from './NumberTicker';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
    label?: string;
  };
  badge?: string;
  className?: string;
  loading?: boolean;
}

/**
 * StatCard (Combines Aceternity Spotlight + Magic UI NumberTicker)
 * Designed for clinical dashboards, displaying real-time patient metrics,
 * compliance, ROM angles, and session counts.
 */
export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  icon,
  trend,
  badge = 'En vivo',
  className,
  loading = false,
}: StatCardProps) {
  return (
    <SpotlightCard className={cn('p-5 sm:p-6 flex flex-col justify-between group', className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        {icon && (
          <div className="size-11 sm:size-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold ring-1 ring-teal-500/20 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
        )}

        {badge && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
            <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>{badge}</span>
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface-variant truncate">
          {label}
        </p>

        {loading ? (
          <div className="h-8 w-24 rounded-lg bg-surface-container-high animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              <NumberTicker value={value} prefix={prefix} suffix={suffix} />
            </h3>
          </div>
        )}

        {trend && (
          <div className="flex items-center gap-1 pt-2 text-[11px] font-semibold">
            {trend.positive ? (
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3.5" /> +{trend.value}%
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="size-3.5" /> -{trend.value}%
              </span>
            )}
            <span className="text-outline">{trend.label || 'vs. semana anterior'}</span>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}
