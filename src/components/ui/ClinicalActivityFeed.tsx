import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  KeyRound, 
  Play, 
  Pause, 
  Plus, 
  Radio
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedList } from "./animated-list"
import { toast } from "./Toast"

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

const INITIAL_NOTIFICATIONS: ClinicalFeedItem[] = [
  {
    id: "notif-1",
    name: "Sesión completada con éxito",
    description: "Carlos Gómez finalizó 'Extensión Lumbar' • ROM 94% alcanzado",
    time: "Hace 2 min",
    icon: <CheckCircle2 className="size-4 text-emerald-500" />,
    badge: "ROM 94%",
    category: "sesion",
    color: "#10b981",
  },
  {
    id: "notif-2",
    name: "Alerta Biomecánica MediaPipe",
    description: "Compensación pélvica detectada en sentadilla unipodal",
    time: "Hace 7 min",
    icon: <AlertTriangle className="size-4 text-amber-500" />,
    badge: "Compensación",
    category: "alerta",
    color: "#f59e0b",
  },
  {
    id: "notif-3",
    name: "Nuevo paciente vinculado",
    description: "Lucía Navarro canjeó el token #FM-9821 y activó su rutina",
    time: "Hace 15 min",
    icon: <KeyRound className="size-4 text-teal-500" />,
    badge: "Token canjeado",
    category: "sistema",
    color: "#006965",
  },
  {
    id: "notif-4",
    name: "Análisis IA Physi disponible",
    description: "Resumen de evolución semanal preparado para María Fernández",
    time: "Hace 22 min",
    icon: <Sparkles className="size-4 text-cyan-500" />,
    badge: "Physi IA",
    category: "ia",
    color: "#06b6d4",
  },
  {
    id: "notif-5",
    name: "Excelente adherencia clínica",
    description: "Roberto Silva completó 5 días seguidos de fortalecimiento",
    time: "Hace 35 min",
    icon: <Activity className="size-4 text-primary" />,
    badge: "Racha 5 días",
    category: "sesion",
    color: "#00504d",
  },
]

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

export function ClinicalActivityFeed({
  className,
  delay = 2400,
}: {
  className?: string
  delay?: number
}) {
  const [items, setItems] = useState<ClinicalFeedItem[]>(INITIAL_NOTIFICATIONS)
  const [isPaused, setIsPaused] = useState(false)

  const handleAddLiveEvent = () => {
    const names = ["Elena Suárez", "Mateo Valenzuela", "Beatriz Cano", "Javier Rivas"]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const newEvent: ClinicalFeedItem = {
      id: `notif-${Date.now()}`,
      name: "Nueva calibración de ángulo articular",
      description: `${randomName} completó calibración con MediaPipe • Desviación < 2°`,
      time: "Ahora mismo",
      icon: <Activity className="size-4 text-emerald-500" />,
      badge: "En vivo",
      category: "sesion",
      color: "#10b981",
    }
    setItems((prev) => [newEvent, ...prev])
    toast.success("Evento clínico simulado en vivo", {
      description: `${randomName} registró su medición en el feed.`,
    })
  }

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
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-3">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75", isPaused && "hidden")} />
            <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
              Feed de Actividad en Vivo
              <Radio className="size-3.5 text-primary animate-pulse" />
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium">
              Sincronización en tiempo real de sesiones y MediaPipe
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Reanudar ticker" : "Pausar ticker"}
            title={isPaused ? "Reanudar" : "Pausar"}
            className="p-1.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            {isPaused ? <Play className="size-3.5 text-emerald-500" /> : <Pause className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleAddLiveEvent}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-xs"
          >
            <Plus className="size-3.5" />
            Simular Evento
          </button>
        </div>
      </div>

      {/* Animated Stream Container */}
      <div className="relative max-h-[380px] overflow-hidden py-1">
        <AnimatedList delay={isPaused ? 999999 : delay}>
          {items.map((item) => (
            <ClinicalNotificationCard key={item.id} item={item} />
          ))}
        </AnimatedList>

        {/* Gradient Blur Mask at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface dark:from-surface-container to-transparent" />
      </div>
    </div>
  )
}
