import { useState } from "react";

import { Play, Pause, Radio, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "./animated-list";
import { toast } from "./toastApi";

export interface ClinicalFeedItem {
  id: string
  name: string
  description: string
  time: string
  icon: React.ReactNode
  badge: string
  category: "sesion" | "alerta" | "sistema" | "ia"
  color: string
}

export function ClinicalNotificationCard({ item }: { item: ClinicalFeedItem }) {
  return (
    <figure
      onClick={() => toast.info(item.name, { description: item.description })}
      className={cn(
        "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-3.5 sm:p-4",
        "transition-all duration-300 ease-out hover:scale-[101.5%]",
        // Light styles
        "bg-white/80 border border-outline-variant/30 [box-shadow:0_4px_20px_-4px_rgba(0,0,0,0.06)]",
        // Dark styles
        "dark:bg-slate-900/60 dark:border-white/10 dark:backdrop-blur-xl dark:[box-shadow:0_-15px_60px_-15px_rgba(255,255,255,0.06)_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform"
          style={{ backgroundColor: `${item.color}18` }}
        >
          {item.icon}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <figcaption className="text-sm font-semibold tracking-tight text-on-surface truncate">
              {item.name}
            </figcaption>
            <span className="text-[11px] font-medium text-on-surface-variant/70 shrink-0">
              {item.time}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5 font-normal">
            {item.description}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${item.color}15`,
                color: item.color,
              }}
            >
              {item.badge}
            </span>
          </div>
        </div>
      </div>
    </figure>
  )
}

export interface ClinicalActivityFeedProps {
  className?: string
  delay?: number
  /** Actividad clínica real proveniente de Supabase. */
  items?: ClinicalFeedItem[]
  title?: string
  subtitle?: string
  emptyMessage?: string
}

export function ClinicalActivityFeed({
  className,
  delay = 2400,
  items = [],
  title = 'Feed de Actividad en Vivo',
  subtitle = 'Sincronización en tiempo real de sesiones y MediaPipe',
  emptyMessage = 'Aún no hay sesiones registradas. La actividad aparecerá aquí cuando tus pacientes completen ejercicios.',
}: ClinicalActivityFeedProps) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col w-full max-w-xl mx-auto rounded-3xl p-5 sm:p-6",
        "bg-surface/80 dark:bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-outline-variant/20 dark:border-white/10">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-on-surface tracking-tight truncate">{title}</h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", (isPaused || items.length === 0) && "hidden")} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {items.length > 0 && <Radio className="size-3.5 text-primary animate-pulse" />}
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? "Reanudar ticker" : "Pausar ticker"}
              title={isPaused ? "Reanudar" : "Pausar"}
              className="p-1.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              {isPaused ? <Play className="size-3.5 text-emerald-500" /> : <Pause className="size-3.5" />}
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant">
            <Inbox className="size-5" />
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-[28ch]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative max-h-[380px] overflow-hidden py-1">
          <AnimatedList delay={isPaused ? 999999 : delay}>
            {items.map((item) => (
              <ClinicalNotificationCard key={item.id} item={item} />
            ))}
          </AnimatedList>

          {/* Gradient Blur Mask at the bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface dark:from-surface-container to-transparent" />
        </div>
      )}
    </div>
  )
}

