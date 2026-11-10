import { cn } from '../../lib/utils';
import { PixelImage } from './PixelImage';
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

  // 1. Retracción escapular
  if (n.includes('retraccion') || n.includes('escapul') || a.includes('escapula')) {
    return {
      IconComponent: Shield,
      bgClass: 'bg-gradient-to-br from-indigo-500/20 via-teal-500/15 to-emerald-500/10 dark:from-indigo-900/40 dark:via-teal-900/30 dark:to-slate-900/60',
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      badge: 'Cintura Escapular & Romboideos (45°)',
      specialDiagram: 'escapula',
      romTag: 'Aducción Escapular 45°',
    };
  }

  // 2. Dorsiflexión y flexión plantar de tobillo
  if ((n.includes('dorsiflexion') && n.includes('plantar')) || (n.includes('tobillo') && n.includes('flexion')) || n.includes('dorsiflex')) {
    return {
      IconComponent: Footprints,
      bgClass: 'bg-gradient-to-br from-teal-500/20 via-emerald-500/15 to-cyan-500/10 dark:from-teal-900/40 dark:via-emerald-900/30 dark:to-slate-900/60',
      iconClass: 'text-teal-600 dark:text-teal-400',
      badge: 'Complejo Tobillo-Pie (20° / 40°)',
      specialDiagram: 'tobillo',
      romTag: 'Dorsiflexión 20° • Plantar 40°',
    };
  }

  // 3. Abducción de cadera de pie
  if ((n.includes('abduccion') && n.includes('cadera')) || (n.includes('cadera') && n.includes('pie')) || a.includes('cadera')) {
    return {
      IconComponent: Compass,
      bgClass: 'bg-gradient-to-br from-sky-500/20 via-teal-500/15 to-blue-500/10 dark:from-sky-900/40 dark:via-teal-900/30 dark:to-slate-900/60',
      iconClass: 'text-sky-600 dark:text-sky-400',
      badge: 'Cintura Pélvica & Glúteo Medio (40°)',
      specialDiagram: 'cadera',
      romTag: 'Abducción Frontal 40°',
    };
  }

  // Tobillo, pie, pantorrilla, marcha general
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

  // Hombro, deltoides, manguito rotador
  if (n.includes('hombro') || n.includes('deltoid') || n.includes('manguito') || a.includes('hombro')) {
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
        <PixelImage
          src={src}
          alt={name}
          grid="6x4"
          className="w-full h-full"
          imageClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        'relative w-full overflow-hidden rounded-2xl mb-4 flex flex-col items-center justify-center p-4 border border-teal-500/20 transition-all duration-300 group-hover:border-teal-500/40 relative shadow-inner',
        visual.bgClass,
        heightClass,
        className,
      )}
    >
      {/* Biomechanical Goniometric Vector Diagram */}
      {visual.specialDiagram === 'escapula' && (
        <svg viewBox="0 0 160 80" className="w-36 h-18 text-teal-600 dark:text-teal-400 opacity-90 drop-shadow mb-1" fill="none">
          {/* Thoracic spine */}
          <line x1="80" y1="10" x2="80" y2="70" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.6" />
          {/* Left Scapula & Arrow */}
          <path d="M50 25 C45 35 48 55 58 58 C62 50 60 30 50 25 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
          <path d="M46 42 L66 42 M62 38 L66 42 L62 46" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Right Scapula & Arrow */}
          <path d="M110 25 C115 35 112 55 102 58 C98 50 100 30 110 25 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
          <path d="M114 42 L94 42 M98 38 L94 42 L98 46" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Angle badge */}
          <text x="80" y="76" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace">ROM 45° ADUCCIÓN</text>
        </svg>
      )}

      {visual.specialDiagram === 'tobillo' && (
        <svg viewBox="0 0 160 80" className="w-36 h-18 text-teal-600 dark:text-teal-400 opacity-90 drop-shadow mb-1" fill="none">
          {/* Leg bone line */}
          <line x1="60" y1="12" x2="60" y2="52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          {/* Pivot point */}
          <circle cx="60" cy="52" r="5" fill="#0D9488" stroke="#fff" strokeWidth="1.5" />
          {/* Neutral foot line */}
          <line x1="45" y1="52" x2="115" y2="52" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />
          {/* Dorsiflexion 20° line */}
          <line x1="60" y1="52" x2="112" y2="34" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M102 52 A45 45 0 0 0 100 38" stroke="#14B8A6" strokeWidth="2" fill="none" strokeDasharray="2 2" />
          <text x="116" y="32" fill="#0D9488" fontSize="8" fontWeight="bold">+20°</text>
          {/* Plantar flexion 40° line */}
          <line x1="60" y1="52" x2="108" y2="70" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M102 52 A45 45 0 0 1 98 64" stroke="#06B6D4" strokeWidth="2" fill="none" strokeDasharray="2 2" />
          <text x="114" y="74" fill="#06B6D4" fontSize="8" fontWeight="bold">-40°</text>
        </svg>
      )}

      {visual.specialDiagram === 'cadera' && (
        <svg viewBox="0 0 160 80" className="w-36 h-18 text-sky-600 dark:text-sky-400 opacity-90 drop-shadow mb-1" fill="none">
          {/* Pelvis bar horizontal */}
          <line x1="50" y1="20" x2="110" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="65" cy="20" r="4.5" fill="#0284C7" stroke="#fff" strokeWidth="1.5" />
          <circle cx="95" cy="20" r="4.5" fill="#0284C7" stroke="#fff" strokeWidth="1.5" />
          {/* Stance leg vertical */}
          <line x1="65" y1="20" x2="65" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Abducted leg 40° */}
          <line x1="95" y1="20" x2="132" y2="58" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          {/* Neutral line */}
          <line x1="95" y1="20" x2="95" y2="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.4" />
          {/* Arc */}
          <path d="M95 50 A30 30 0 0 1 115 44" stroke="#0284C7" strokeWidth="2" fill="none" strokeDasharray="2 2" />
          <text x="112" y="38" fill="#0284C7" fontSize="8" fontWeight="bold">40° ABD</text>
        </svg>
      )}

      {!visual.specialDiagram && (
        <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center mb-2.5">
          <IconCmp className={cn('size-6 animate-breathe-icon', visual.iconClass)} />
        </div>
      )}

      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-full mb-1 border border-teal-500/20">
        {visual.badge}
      </span>
      <span className="font-title-md text-sm sm:text-base font-bold text-on-surface text-center px-2 line-clamp-1">
        {name}
      </span>
    </div>
  );
}
