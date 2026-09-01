import { cn } from '../../lib/utils';
import {
  Activity,
  Dumbbell,
  Target,
  RotateCw,
  Layers,
  Sparkles,
  Flame,
  Compass,
  Footprints,
  Shield,
  CircleDot,
} from 'lucide-react';

interface ExerciseImageProps {
  /** URL de la imagen del ejercicio (de Pexels). Si es undefined, se muestra el fallback. */
  src?: string;
  /** Nombre del ejercicio, usado en el fallback y como texto alternativo. */
  name: string;
  /** Articulación o región anatómica opcional para afinar el icono */
  articulacion?: string | null;
  /** Categoría del ejercicio (fuerza, movilidad, etc.) */
  categoria?: string | null;
  /** Clases adicionales para el contenedor. */
  className?: string;
  /** Altura del banner. Por defecto h-40. */
  heightClass?: string;
}

/**
 * Heurística biomecánica para seleccionar el icono y degradado idóneo según el ejercicio.
 */
function getBiomechanicalVisual(name: string, articulacion?: string | null, categoria?: string | null) {
  const n = (name || '').toLowerCase();
  const a = (articulacion || '').toLowerCase();
  const c = (categoria || '').toLowerCase();

  // Tobillo, pie, pantorrilla, marcha
  if (n.includes('tobillo') || n.includes('pie') || n.includes('gemelo') || n.includes('plantar') || n.includes('marcha') || a.includes('tobillo')) {
    return {
      IconComponent: Footprints,
      bgClass: 'bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/5',
      iconClass: 'text-teal-600 dark:text-teal-400',
      badge: 'Tobillo & Apoyo',
    };
  }

  // Rodilla, cuádriceps, sentadilla, estocada
  if (n.includes('rodilla') || n.includes('sentadilla') || n.includes('cuadriceps') || n.includes('isquio') || n.includes('patela') || a.includes('rodilla')) {
    return {
      IconComponent: Target,
      bgClass: 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Rodilla & Carga',
    };
  }

  // Hombro, deltoides, manguito rotador, escápula
  if (n.includes('hombro') || n.includes('escapul') || n.includes('deltoid') || n.includes('manguito') || a.includes('hombro')) {
    return {
      IconComponent: CircleDot,
      bgClass: 'bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-blue-500/5',
      iconClass: 'text-cyan-600 dark:text-cyan-400',
      badge: 'Complejo Glenohumeral',
    };
  }

  // Codo, muñeca, antebrazo, bíceps, tríceps
  if (n.includes('codo') || n.includes('muñeca') || n.includes('mano') || n.includes('antebrazo') || n.includes('biceps') || n.includes('triceps') || a.includes('codo') || a.includes('brazo')) {
    return {
      IconComponent: Dumbbell,
      bgClass: 'bg-gradient-to-br from-teal-500/15 via-blue-500/10 to-cyan-500/5',
      iconClass: 'text-teal-600 dark:text-teal-400',
      badge: 'Miembro Superior',
    };
  }

  // Columna, tronco, lumbar, core, postura
  if (n.includes('lumbar') || n.includes('tronco') || n.includes('columna') || n.includes('postura') || n.includes('core') || n.includes('puente') || a.includes('columna') || a.includes('tronco')) {
    return {
      IconComponent: Shield,
      bgClass: 'bg-gradient-to-br from-teal-600/15 via-emerald-600/10 to-teal-500/5',
      iconClass: 'text-teal-700 dark:text-teal-300',
      badge: 'Control Espinal & Core',
    };
  }

  // Cervical, cuello, trapecio
  if (n.includes('cervical') || n.includes('cuello') || n.includes('trapecio') || a.includes('cervical') || a.includes('cuello')) {
    return {
      IconComponent: Sparkles,
      bgClass: 'bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-emerald-500/5',
      iconClass: 'text-cyan-600 dark:text-cyan-300',
      badge: 'Región Cervical',
    };
  }

  // Rotaciones, circunducción
  if (n.includes('rotacion') || n.includes('circunducc') || n.includes('giro') || n.includes('arco') || n.includes('movilidad')) {
    return {
      IconComponent: RotateCw,
      bgClass: 'bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-blue-500/5',
      iconClass: 'text-teal-600 dark:text-teal-400',
      badge: 'Arco de Movimiento (ROM)',
    };
  }

  // Fuerza o potencia
  if (c.includes('fuerza') || n.includes('resistencia') || n.includes('pesa') || n.includes('banda') || n.includes('isometric')) {
    return {
      IconComponent: Flame,
      bgClass: 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Fortalecimiento Progresivo',
    };
  }

  // Equilibrio y propiocepción
  if (n.includes('equilibrio') || n.includes('propiocepc') || n.includes('unipodal') || c.includes('equilibrio')) {
    return {
      IconComponent: Compass,
      bgClass: 'bg-gradient-to-br from-blue-500/15 via-teal-500/10 to-emerald-500/5',
      iconClass: 'text-blue-600 dark:text-blue-400',
      badge: 'Propiocepción & Balance',
    };
  }

  // Flexibilidad y estiramiento
  if (n.includes('estiramiento') || n.includes('flexibilidad') || n.includes('elongacion') || c.includes('estiramiento')) {
    return {
      IconComponent: Layers,
      bgClass: 'bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-blue-500/5',
      iconClass: 'text-teal-600 dark:text-teal-400',
      badge: 'Flexibilidad Muscular',
    };
  }

  // Por defecto: Dinámica articular y cinemática
  return {
    IconComponent: Activity,
    bgClass: 'bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/5',
    iconClass: 'text-teal-600 dark:text-teal-400',
    badge: 'Kinesioterapia Activa',
  };
}

/**
 * Muestra la imagen de un ejercicio como banner superior de la tarjeta.
 * Si no hay imagen, muestra un fallback estilizado con iconos biomecánicos diferenciados,
 * gradientes clínicos (esmeralda/azul/verde) y badge de región anatómica.
 */
export function ExerciseImage({ src, name, articulacion, categoria, className, heightClass = 'h-40' }: ExerciseImageProps) {
  if (src) {
    return (
      <div className={cn('relative w-full overflow-hidden rounded-2xl mb-4', heightClass, className)}>
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradiente sutil inferior para legibilidad del nombre */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <span className="absolute bottom-2 left-3 right-3 text-white font-title-md text-title-md drop-shadow line-clamp-1">
          {name}
        </span>
      </div>
    );
  }

  const visual = getBiomechanicalVisual(name, articulacion, categoria);
  const IconCmp = visual.IconComponent;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl mb-4 flex flex-col items-center justify-center p-4 border border-teal-500/15 transition-all duration-300 group-hover:border-teal-500/30',
        visual.bgClass,
        heightClass,
        className,
      )}
    >
      <div className="size-12 rounded-2xl bg-white/70 dark:bg-slate-800/80 shadow-xs flex items-center justify-center mb-2.5 backdrop-blur-md">
        <IconCmp className={cn('size-6 animate-breathe-icon', visual.iconClass)} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-white/60 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-full mb-1">
        {visual.badge}
      </span>
      <span className="font-title-md text-sm sm:text-base font-bold text-on-surface text-center px-2 line-clamp-1">
        {name}
      </span>
    </div>
  );
}
