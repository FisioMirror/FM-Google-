import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Globe,
  Plus,
  Mail,
  MoreHorizontal,
  Settings,
  Star,
  Check,
  Menu,
  FilePlus,
  FolderOpen,
  Eye,
  Calendar,
  X,
  User,
  Home,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ==========================================
// 1. Accordion (HeroUI Fluid Accordion)
// ==========================================
export const CustomAccordion = ({
  items = [
    { title: '¿Cómo creo un paciente?', content: 'Ve a la sección Pacientes y pulsa en "Nuevo paciente" para ingresar sus datos clínicos y generar su token seguro de activación.' },
    { title: '¿Cómo asigno una rutina?', content: 'Desde la biblioteca de ejercicios o el perfil del paciente, pulsa "Reasignar rutina" y selecciona los ejercicios terapéuticos.' },
    { title: '¿Cómo uso el modo AR?', content: 'Accede a la sección Modo AR, concede permiso a tu cámara y sigue las instrucciones en pantalla con bio-feedback biomecánico.' },
  ],
  className,
}: {
  items?: { title: string; content: string }[];
  className?: string;
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className={cn('w-full max-w-md rounded-3xl border border-outline/15 bg-surface/80 backdrop-blur-md overflow-hidden divide-y divide-outline/10 shadow-sm', className)}>
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="transition-colors group">
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-3 p-4.5 text-left font-medium text-on-surface hover:bg-teal-500/5 transition-colors cursor-pointer"
            >
              <span className={cn('text-xs sm:text-sm font-bold transition-colors', isOpen && 'text-teal-600 dark:text-teal-400')}>
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="size-7 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-teal-600 shrink-0"
              >
                <ChevronDown className="size-4" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden bg-surface-container-lowest/50"
                >
                  <p className="p-4.5 pt-1 text-xs text-on-surface-variant leading-relaxed">
                    {item.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 2. Alert (Basic HeroUI Glass Alerts)
// ==========================================
export const BasicAlert = ({ className }: { className?: string }) => {
  return (
    <div className={cn('grid gap-3 max-w-xl w-full', className)}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 shadow-sm"
      >
        <div className="size-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold">Paciente guardado correctamente</p>
          <p className="text-[11px] sm:text-xs opacity-80 mt-0.5">El expediente se sincronizó y se generó el token de un solo uso.</p>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200 shadow-sm"
      >
        <div className="size-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <XCircle className="size-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold">Error al procesar documento</p>
          <p className="text-[11px] sm:text-xs opacity-80 mt-0.5">Revisa la iluminación y el formato del archivo médico (PDF/JPG).</p>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="flex items-start gap-3.5 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-950 dark:text-teal-200 shadow-sm"
      >
        <div className="size-8 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="size-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold">Procesando prescripción con Physi IA</p>
          <p className="text-[11px] sm:text-xs opacity-80 mt-0.5">Extrayendo ejercicios sugeridos y calibrando rangos articulares...</p>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. AlertDialog (HeroUI Modal Dialog)
// ==========================================
export const DeleteDialog = ({
  onConfirm,
  title = '¿Eliminar paciente?',
  description = 'Esta acción no se puede deshacer y archivará el historial clínico completo del expediente.',
}: {
  onConfirm?: () => void;
  title?: string;
  description?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer active:scale-95"
      >
        <Trash2 className="size-3.5" />
        Eliminar paciente
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md rounded-3xl bg-surface border border-outline/20 p-6 sm:p-7 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/20 shrink-0">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">{title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{description}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline/10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm?.();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Confirmar eliminación
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 4. Avatar (HeroUI Ring Avatar)
// ==========================================
export const BasicAvatar = ({
  src,
  fallback = 'JD',
  size = 'md',
  alt = 'Avatar',
}: {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}) => {
  const sizeClasses = {
    sm: 'size-8 text-[11px]',
    md: 'size-10 text-xs',
    lg: 'size-14 text-sm',
    xl: 'size-16 text-base',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-extrabold shadow-sm ring-2 ring-teal-500/20 select-none',
        sizeClasses[size]
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : null}
      <span>{fallback}</span>
    </div>
  );
};

// ==========================================
// 5. Avatar + Badge (HeroUI Presence)
// ==========================================
export const AvatarWithBadge = ({
  src,
  fallback = 'AB',
  badgeCount = 0,
  status = 'online',
}: {
  src?: string;
  fallback?: string;
  badgeCount?: number;
  status?: 'online' | 'offline' | 'warning';
}) => {
  return (
    <div className="relative inline-block">
      <BasicAvatar src={src} fallback={fallback} size="md" />
      {badgeCount > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-surface">
          {badgeCount}
        </span>
      ) : (
        <span
          className={cn(
            'absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-surface',
            status === 'online' ? 'bg-emerald-500 animate-pulse' : status === 'warning' ? 'bg-amber-500' : 'bg-outline'
          )}
        />
      )}
    </div>
  );
};

// ==========================================
// 6. Breadcrumbs (HeroUI Clean Breadcrumbs)
// ==========================================
export const CustomBreadcrumbs = ({
  items = [
    { label: 'Inicio', href: '/' },
    { label: 'Pacientes', href: '/pacientes' },
    { label: 'María Rodríguez' },
  ],
  separator = '/',
}: {
  items?: { label: string; href?: string }[];
  separator?: React.ReactNode;
}) => {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.href ? (
            <a
              href={item.href}
              className="px-2 py-1 rounded-lg hover:bg-surface-container-high hover:text-teal-600 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold">
              {item.label}
            </span>
          )}
          {idx < items.length - 1 && <span className="opacity-30">{separator}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

// ==========================================
// 7. Button with Icons (HeroUI Ripple Buttons)
// ==========================================
export const IconButtons = () => {
  return (
    <div className="flex flex-wrap gap-2.5">
      <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-all active:scale-95 shadow-md shadow-teal-600/20 cursor-pointer">
        <Globe className="size-3.5" /> Buscar
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold hover:bg-teal-500/20 transition-all active:scale-95 cursor-pointer">
        <Plus className="size-3.5" /> Agregar
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-all active:scale-95 cursor-pointer">
        <Mail className="size-3.5" /> Enviar
      </button>
      <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-all active:scale-95 cursor-pointer">
        <Trash2 className="size-3.5" /> Eliminar
      </button>
    </div>
  );
};

// ==========================================
// 8. Button Icon Only
// ==========================================
export const IconOnlyButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <button className="size-9 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-teal-600 hover:bg-teal-500/10 transition-all flex items-center justify-center cursor-pointer active:scale-90">
        <MoreHorizontal className="size-4" />
      </button>
      <button className="size-9 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-teal-600 hover:bg-teal-500/10 transition-all flex items-center justify-center cursor-pointer active:scale-90">
        <Settings className="size-4" />
      </button>
      <button className="size-9 rounded-2xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all flex items-center justify-center cursor-pointer active:scale-90">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};

// ==========================================
// 9. ButtonGroup + Dropdown (HeroUI Split Button)
// ==========================================
export const ButtonGroupDropdown = ({
  onSelect,
}: {
  onSelect?: (filter: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Hoy');

  const options = ['Hoy', 'Esta semana', 'Este mes', 'Histórico completo'];

  return (
    <div className="relative inline-flex rounded-2xl bg-surface border border-outline/20 shadow-sm">
      <button
        onClick={() => onSelect?.(selected)}
        className="px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-high rounded-l-2xl transition-colors cursor-pointer"
      >
        Filtrar: <span className="text-teal-600 dark:text-teal-400">{selected}</span>
      </button>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-2 text-outline hover:text-teal-600 border-l border-outline/20 hover:bg-surface-container-high rounded-r-2xl transition-colors cursor-pointer"
      >
        <ChevronDown className="size-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-surface border border-outline/20 p-1.5 shadow-2xl z-30 space-y-1"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  onSelect?.(opt);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3.5 py-2 text-xs rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-between',
                  selected === opt ? 'bg-teal-600 text-white' : 'text-on-surface hover:bg-surface-container-high'
                )}
              >
                <span>{opt}</span>
                {selected === opt && <Check className="size-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 10. Card with Avatar (HeroUI Clinical Card)
// ==========================================
export const CardWithAvatar = ({
  name = 'María Rodríguez',
  subtitle = '3 sesiones completadas esta semana',
  therapist = 'Dra. Demo',
}: {
  name?: string;
  subtitle?: string;
  therapist?: string;
}) => {
  return (
    <div className="w-full max-w-[260px] rounded-3xl border border-outline/15 bg-surface p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3.5 mb-3.5">
        <BasicAvatar fallback={name.split(' ').map(n => n[0]).join('').slice(0, 2)} size="md" />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-on-surface truncate">{name}</h4>
          <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="pt-3 border-t border-outline/10 flex items-center justify-between text-[11px]">
        <span className="text-outline">Fisio: {therapist}</span>
        <span className="font-extrabold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
          85% Adh.
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 11. Card with Images (HeroUI Media Card)
// ==========================================
export const CardWithImage = ({
  title = 'Ejercicio de Hombro',
  category = 'Manguito Rotador',
  onAction,
}: {
  title?: string;
  category?: string;
  onAction?: () => void;
  className?: string;
}) => {
  return (
    <div className="relative min-h-[190px] w-full max-w-sm rounded-3xl overflow-hidden shadow-lg group border border-teal-500/20 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 p-6 flex flex-col justify-between">
      {/* Background glow mesh */}
      <div className="absolute top-0 right-0 size-36 bg-teal-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div className="relative z-10">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
          {category}
        </span>
        <h4 className="text-base sm:text-lg font-extrabold text-white mt-2.5 tracking-tight">{title}</h4>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-xs text-teal-200/80 font-medium">3 series • 12 reps</span>
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-teal-100 transition-all shadow cursor-pointer active:scale-95"
        >
          Ver demostración
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 12. PremiumCard (HeroUI Plan Pro)
// ==========================================
export const PremiumCard = ({
  title = 'Plan Clínico Pro',
  description = 'Para consultorios y clínicas de tele-rehabilitación',
  features = ['Informes biomecánicos avanzados en PDF', 'Soporte prioritario 24/7', 'Acceso a Physi Asistente IA sin límites', 'Seguimiento de hasta 50 pacientes'],
  onUpgrade,
}: {
  title?: string;
  description?: string;
  features?: string[];
  onUpgrade?: () => void;
}) => {
  return (
    <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-surface to-emerald-500/5 p-7 shadow-xl">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="size-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
          <Star className="size-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-on-surface">{title}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        </div>
      </div>

      <ul className="space-y-3 py-4 border-y border-outline/10 my-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5 text-xs font-medium text-on-surface">
            <div className="size-5 rounded-full bg-teal-500/15 text-teal-600 flex items-center justify-center shrink-0">
              <Check className="size-3" />
            </div>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onUpgrade}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-600/25 active:scale-[0.98] transition-all cursor-pointer"
      >
        Actualizar plan
      </button>
    </div>
  );
};

// ==========================================
// 13. StatusChips (HeroUI Chips)
// ==========================================
export const StatusChips = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <span className="size-1.5 rounded-full bg-amber-500" /> Pendiente
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <span className="size-1.5 rounded-full bg-rose-500" /> Inactivo
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
        <Sparkles className="size-3" /> Nuevo
      </span>
    </div>
  );
};

// ==========================================
// 14. Disclosure Group (HeroUI Disclosures)
// ==========================================
export const DisclosureConfig = () => {
  const [expanded, setExpanded] = useState<string | null>('profile');

  return (
    <div className="w-full max-w-md rounded-3xl border border-outline/15 bg-surface p-4 space-y-2 shadow-sm">
      <div className="border-b border-outline/10 pb-2">
        <button
          onClick={() => setExpanded(expanded === 'profile' ? null : 'profile')}
          className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <span>Perfil & Preferencias</span>
          <ChevronDown className={cn('size-4 transition-transform duration-200', expanded === 'profile' && 'rotate-180')} />
        </button>
        {expanded === 'profile' && (
          <div className="p-3 text-xs text-on-surface-variant leading-relaxed">
            Configura el nombre de tu consultorio, contacto directo de soporte y alertas de sesiones en vivo.
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => setExpanded(expanded === 'security' ? null : 'security')}
          className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <span>Seguridad & Tokens de Activación</span>
          <ChevronDown className={cn('size-4 transition-transform duration-200', expanded === 'security' && 'rotate-180')} />
        </button>
        {expanded === 'security' && (
          <div className="p-3 text-xs text-on-surface-variant leading-relaxed">
            Generación y revocación de tokens criptográficos de un solo uso para enrolar pacientes de forma segura.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 15. Drawer (HeroUI Navigation Drawer)
// ==========================================
export const NavigationDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onClose ?? (() => setInternalOpen(false));

  return (
    <>
      <button
        onClick={() => setInternalOpen(true)}
        className="px-4 py-2 rounded-2xl bg-surface-container-high text-on-surface hover:text-teal-600 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
      >
        <Menu className="size-4" /> Menú Lateral
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[160] flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={setOpen}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[80vw] h-full bg-surface border-r border-outline/15 p-6 shadow-2xl flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline/10">
                  <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400">FisioMirror Suite</span>
                  <button onClick={setOpen} className="p-1 rounded-lg text-outline hover:text-on-surface">
                    <X className="size-4" />
                  </button>
                </div>
                <nav className="space-y-1.5 mt-5">
                  {[
                    { label: 'Dashboard Clínico', icon: Home, href: '/dashboard-fisio' },
                    { label: 'Pacientes & Tokens', icon: User, href: '/patients' },
                    { label: 'Biblioteca de Ejercicios', icon: Star, href: '/fisio-exercises' },
                    { label: 'Estadísticas Biomecánicas', icon: Globe, href: '/fisio-stats' },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-on-surface hover:bg-teal-500/10 hover:text-teal-600 transition-colors"
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
              <p className="text-[10px] font-semibold text-outline text-center">FisioMirror • Tele-rehabilitación v3</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==========================================
// 16. Dropdown with Descriptions (HeroUI Actions)
// ==========================================
export const ActionDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-2xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-all flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer active:scale-95"
      >
        <span>Acciones Rápidas</span>
        <ChevronDown className="size-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="absolute left-0 mt-2 w-64 rounded-3xl bg-surface border border-outline/20 p-2 shadow-2xl z-30 space-y-1"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-surface-container-high text-left transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 shrink-0 mt-0.5">
                <FilePlus className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Nuevo paciente</p>
                <p className="text-[10px] text-on-surface-variant">Generar expediente y token de activación</p>
              </div>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-surface-container-high text-left transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 shrink-0 mt-0.5">
                <FolderOpen className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Abrir biblioteca</p>
                <p className="text-[10px] text-on-surface-variant">Explorar +50 ejercicios preconfigurados</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 17. Popover Simple
// ==========================================
export const SimplePopover = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-9 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-teal-600 transition-colors flex items-center justify-center cursor-pointer"
      >
        <MoreHorizontal className="size-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="absolute left-0 mt-2 w-56 rounded-3xl bg-surface border border-outline/20 p-4 shadow-xl z-30"
          >
            <h5 className="text-xs font-bold text-on-surface mb-1">Opciones Rápidas</h5>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Exporta informes de progreso biomecánico o comparte rutinas directamente.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 18. ProgressBar Sizes (HeroUI Striped Progress)
// ==========================================
export const ProgressSizes = ({ value = 75 }: { value?: number }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div>
        <div className="flex justify-between text-[11px] font-bold text-outline mb-1">
          <span>Rango inicial (sm)</span>
          <span>{value}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden">
          <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${value}%` }} />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-outline mb-1">
          <span>Adherencia estándar (md)</span>
          <span>{value}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-surface-container-high overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${value}%` }} />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-outline mb-1">
          <span>Precisión AR (lg)</span>
          <span>{value}%</span>
        </div>
        <div className="h-4 w-full rounded-full bg-surface-container-high overflow-hidden p-0.5">
          <div className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-500 shadow" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 19. RangeCalendar (HeroUI Range Calendar)
// ==========================================
export const DateRange = ({
  startDate = '03 Mar',
  endDate = '12 Mar',
}: {
  startDate?: string;
  endDate?: string;
}) => {
  return (
    <div className="p-5 rounded-3xl bg-surface border border-outline/15 max-w-sm shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-outline/10 text-xs font-bold text-on-surface">
        <span className="flex items-center gap-2">
          <Calendar className="size-4 text-teal-600" /> Marzo 2026
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-extrabold text-[10px]">
          {startDate} - {endDate}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <span key={d} className="font-extrabold text-outline text-[10px] py-1">{d}</span>
        ))}
        {Array.from({ length: 31 }).map((_, i) => {
          const day = i + 1;
          const isSelected = day >= 3 && day <= 12;
          const isEndpoint = day === 3 || day === 12;
          return (
            <span
              key={i}
              className={cn(
                'py-1.5 rounded-xl text-xs font-semibold transition-colors',
                isEndpoint
                  ? 'bg-teal-600 text-white font-black shadow-sm'
                  : isSelected
                  ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 20. ScrollShadow (HeroUI Scroll Shadows)
// ==========================================
export const ScrollableList = ({ itemsCount = 8 }: { itemsCount?: number }) => {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-surface border border-outline/15 p-5 overflow-hidden shadow-sm">
      <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Historial con Scroll Suave</h4>
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
        {Array.from({ length: itemsCount }).map((_, i) => (
          <div key={i} className="p-3 rounded-2xl bg-surface-container-low text-xs text-on-surface flex items-center justify-between hover:bg-surface-container transition-colors">
            <span className="font-medium">Sesión #{i + 1} de rehabilitación</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">
              92% ROM
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 21. Toast Variants (HeroUI Toasts)
// ==========================================
export const ToastVariants = () => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const trigger = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex flex-wrap gap-2 relative">
      <button onClick={() => trigger('Paciente guardado exitosamente')} className="px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all cursor-pointer">
        Toast Éxito
      </button>
      <button onClick={() => trigger('Advertencia: Ángulo fuera del rango seguro')} className="px-4 py-2 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition-all cursor-pointer">
        Toast Alerta
      </button>
      <button onClick={() => trigger('Error de calibración en la cámara')} className="px-4 py-2 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition-all cursor-pointer">
        Toast Error
      </button>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="absolute -top-14 left-0 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl z-50 flex items-center gap-2 border border-white/10"
          >
            <Sparkles className="size-3.5 text-teal-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 22. PatientsTable (HeroUI Interactive Table)
// ==========================================
export const PatientsTable = ({
  users = [
    { id: 1, name: 'María Rodríguez', email: 'maria@fisio.com', status: 'Activo', adherence: 94 },
    { id: 2, name: 'Carlos Gómez', email: 'carlos@fisio.com', status: 'Pendiente', adherence: 68 },
    { id: 3, name: 'Lucía Fernández', email: 'lucia@fisio.com', status: 'Inactivo', adherence: 42 },
  ],
}: {
  users?: { id: number; name: string; email: string; status: string; adherence: number }[];
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-outline/15 bg-surface shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-outline/10 bg-surface-container-low text-on-surface-variant font-extrabold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="p-4">Paciente</th>
            <th className="p-4">Adherencia</th>
            <th className="p-4">Estado</th>
            <th className="p-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/10">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-teal-500/5 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <BasicAvatar fallback={u.name[0]} size="sm" />
                  <div>
                    <p className="font-bold text-on-surface">{u.name}</p>
                    <p className="text-[10px] text-outline">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${u.adherence}%` }} />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-on-surface">{u.adherence}%</span>
                </div>
              </td>
              <td className="p-4">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                    u.status === 'Activo'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : u.status === 'Pendiente'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  )}
                >
                  {u.status}
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="size-8 rounded-xl bg-surface-container hover:bg-teal-500 hover:text-white transition-colors inline-flex items-center justify-center text-outline cursor-pointer">
                  <Eye className="size-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// 23. CustomAlert (HeroUI Warning Notice)
// ==========================================
export const CustomAlert = ({
  title = 'Tu plan está por vencer',
  description = 'Actualiza tu suscripción clínica para evitar interrupciones en la atención de pacientes.',
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-surface to-amber-500/5 p-5 shadow-sm">
      <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-amber-500/15 blur-2xl" />
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 shrink-0">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-on-surface">{title}</h4>
          <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 leading-relaxed">{description}</p>
        </div>
        <button className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shrink-0 shadow-sm cursor-pointer">
          Actualizar
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 24. Chip Variants (HeroUI Chip Types)
// ==========================================
export const ChipVariants = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-600 text-white shadow-sm">Solid</span>
      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">Bordered</span>
      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">Flat</span>
      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">Light</span>
    </div>
  );
};

// ==========================================
// 25. Chip Statuses
// ==========================================
export const ChipStatuses = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <span className="size-1.5 rounded-full bg-amber-500" /> En revisión
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
        <span className="size-1.5 rounded-full bg-rose-500" /> Suspendido
      </span>
    </div>
  );
};

// ==========================================
// 26. Popover Interactive (HeroUI User Profile Popover)
// ==========================================
export const PopoverInteractive = ({
  name = 'Sarah Johnson',
  handle = '@sarahj',
  bio = 'Paciente en rehabilitación de hombro. 3 semanas de progreso constante con biofeedback AR.',
}: {
  name?: string;
  handle?: string;
  bio?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [following, setFollowing] = useState(false);

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-surface-container-high transition-colors cursor-pointer">
        <BasicAvatar fallback="SJ" size="sm" />
        <span className="text-xs font-bold text-on-surface">{name}</span>
        <ChevronDown className="size-3 text-outline" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="absolute left-0 mt-2 w-80 rounded-3xl bg-surface border border-outline/20 p-5 shadow-2xl z-30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BasicAvatar fallback="SJ" size="md" />
                <div>
                  <p className="text-sm font-bold text-on-surface">{name}</p>
                  <p className="text-[10px] text-outline">{handle}</p>
                </div>
              </div>
              <button
                onClick={() => setFollowing(!following)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                  following ? 'bg-surface-container-high text-on-surface' : 'bg-teal-600 text-white shadow-sm'
                )}
              >
                {following ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{bio}</p>
            <div className="pt-3 border-t border-outline/10 flex items-center justify-between text-xs font-semibold">
              <span className="text-on-surface">12 Sesiones Realizadas</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">
                88% Adherencia
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 27. Drawer Placements
// ==========================================
export const Placements = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {['Izquierda', 'Derecha', 'Superior', 'Inferior'].map((p) => (
        <span key={p} className="px-3.5 py-1.5 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface">
          {p}
        </span>
      ))}
    </div>
  );
};

// ==========================================
// 28. Drawer Navigation
// ==========================================
export const Navigation = () => {
  return <NavigationDrawer />;
};
