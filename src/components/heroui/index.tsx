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
  Ban,
  Menu,
  FilePlus,
  FolderOpen,
  Eye,
  Calendar,
  X,
  User,
  Home,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ==========================================
// 1. Accordion
// ==========================================
export const CustomAccordion = ({
  items = [
    { title: '¿Cómo creo un paciente?', content: 'Ve a la sección Pacientes y pulsa en "Nuevo paciente" para ingresar sus datos clínicos y generar su token.' },
    { title: '¿Cómo asigno una rutina?', content: 'Desde la biblioteca de ejercicios o el perfil del paciente, pulsa "Reasignar rutina" y selecciona los ejercicios.' },
    { title: '¿Cómo uso el modo AR?', content: 'Accede a la sección Modo AR, concede permiso a tu cámara y sigue las instrucciones en pantalla del modelo 3D.' },
  ],
  className,
}: {
  items?: { title: string; content: string }[];
  className?: string;
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className={cn('w-full max-w-md rounded-2xl border border-outline/15 bg-surface-container-low/50 overflow-hidden divide-y divide-outline/10', className)}>
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="transition-colors">
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left font-medium text-on-surface hover:bg-surface-container-high/40 transition-colors"
            >
              <span className="text-sm font-semibold">{item.title}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="size-4 text-outline" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-surface/50"
                >
                  <p className="p-4 pt-1 text-xs text-on-surface-variant leading-relaxed">
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
// 2. Alert (Basic)
// ==========================================
export const BasicAlert = ({ className }: { className?: string }) => {
  return (
    <div className={cn('grid gap-3 max-w-xl w-full', className)}>
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Paciente guardado correctamente</p>
          <p className="text-xs opacity-80">El perfil se creó y se generó el token de un solo uso.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-950 dark:text-red-200">
        <XCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Error al procesar documento</p>
          <p className="text-xs opacity-80">Revisa la nitidez y formato del archivo.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-950 dark:text-teal-200">
        <Info className="size-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Procesando prescripción con IA</p>
          <p className="text-xs opacity-80">Extrayendo ejercicios sugeridos y rangos articulares...</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. AlertDialog
// ==========================================
export const DeleteDialog = ({
  onConfirm,
  title = '¿Eliminar paciente?',
  description = 'Esta acción no se puede deshacer y archivará el historial clínico.',
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
        className="flex items-center gap-2 rounded-xl bg-error/10 text-error hover:bg-error/20 px-3.5 py-2 text-sm font-medium transition-colors"
      >
        <Trash2 className="size-4" />
        Eliminar paciente
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl bg-surface border border-outline/20 p-6 shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 text-error mb-3">
                <div className="p-2.5 rounded-2xl bg-error/10">
                  <Trash2 className="size-5" />
                </div>
                <h3 className="text-base font-bold text-on-surface">{title}</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">{description}</p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm?.();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-error text-white hover:bg-error/90 shadow-sm"
                >
                  Confirmar
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
// 4. Avatar
// ==========================================
export const BasicAvatar = ({
  src,
  fallback = 'JD',
  size = 'md',
  alt = 'Avatar',
}: {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}) => {
  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-base',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl overflow-hidden bg-primary/15 text-primary font-bold shadow-sm select-none',
        sizeClasses[size]
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : null}
      <span>{fallback}</span>
    </div>
  );
};

// ==========================================
// 5. Avatar + Badge
// ==========================================
export const AvatarWithBadge = ({
  src,
  fallback = 'AB',
  badgeCount = 3,
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
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-surface">
          {badgeCount}
        </span>
      ) : (
        <span
          className={cn(
            'absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-surface',
            status === 'online' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-outline'
          )}
        />
      )}
    </div>
  );
};

// ==========================================
// 6. Breadcrumbs
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
    <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.href ? (
            <a href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-on-surface font-semibold">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="opacity-40">{separator}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

// ==========================================
// 7. Button with Icons
// ==========================================
export const IconButtons = () => {
  return (
    <div className="flex flex-wrap gap-2.5">
      <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all active:scale-95 shadow-sm">
        <Globe className="size-4" /> Buscar
      </button>
      <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/20 transition-all active:scale-95">
        <Plus className="size-4" /> Agregar
      </button>
      <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-all active:scale-95">
        <Mail className="size-4" /> Enviar
      </button>
      <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-error/10 text-error border border-error/20 text-xs font-semibold hover:bg-error/20 transition-all active:scale-95">
        <Trash2 className="size-4" /> Eliminar
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
      <button className="p-2.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
        <MoreHorizontal className="size-4" />
      </button>
      <button className="p-2.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
        <Settings className="size-4" />
      </button>
      <button className="p-2.5 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
};

// ==========================================
// 9. ButtonGroup + Dropdown
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
    <div className="relative inline-flex rounded-xl bg-surface border border-outline/20 shadow-sm">
      <button
        onClick={() => onSelect?.(selected)}
        className="px-3.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-l-xl transition-colors"
      >
        Filtrar: {selected}
      </button>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-2 text-outline hover:text-primary border-l border-outline/20 hover:bg-surface-container-high rounded-r-xl transition-colors"
      >
        <ChevronDown className="size-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-full right-0 mt-1.5 w-40 rounded-2xl bg-surface border border-outline/20 p-1.5 shadow-xl z-30"
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
                  'w-full text-left px-3 py-1.5 text-xs rounded-xl font-medium transition-colors',
                  selected === opt ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container-high'
                )}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 10. Card with Avatar
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
    <div className="w-full max-w-[240px] rounded-3xl border border-outline/15 bg-surface p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <BasicAvatar fallback={name.split(' ').map(n => n[0]).join('').slice(0, 2)} />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-on-surface truncate">{name}</h4>
          <p className="text-[11px] text-on-surface-variant truncate">{subtitle}</p>
        </div>
      </div>
      <div className="pt-2 border-t border-outline/10 flex items-center justify-between text-[11px] text-outline">
        <span>Fisio: {therapist}</span>
        <span className="font-semibold text-primary">85% Adh.</span>
      </div>
    </div>
  );
};

// ==========================================
// 11. Card with Images
// ==========================================
export const CardWithImage = ({
  title = 'Ejercicio de Hombro',
  category = 'Manguito Rotador',
  onAction,
}: {
  title?: string;
  category?: string;
  onAction?: () => void;
}) => {
  return (
    <div className="relative min-h-[180px] w-full max-w-sm rounded-3xl overflow-hidden shadow-md group border border-teal-500/20 bg-gradient-to-br from-teal-900 via-zinc-900 to-slate-950 p-5 flex flex-col justify-between">
      <div className="relative z-10">
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
          {category}
        </span>
        <h4 className="text-lg font-bold text-white mt-2">{title}</h4>
      </div>
      <div className="relative z-10 flex items-center justify-between pt-4">
        <span className="text-xs text-teal-200/70">3 series • 12 reps</span>
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-bold hover:bg-teal-50 transition-colors shadow"
        >
          Ver demostración
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 12. Card Custom (Pricing / Plan)
// ==========================================
export const PremiumCard = ({
  title = 'Plan Clínico Pro',
  description = 'Para consultorios y clínicas de rehabilitación',
  features = ['Informes biomecánicos avanzados en PDF', 'Soporte prioritario WhatsApp 24/7', 'Acceso a Physi Asistente IA sin límites', 'Seguimiento de hasta 50 pacientes'],
  onUpgrade,
}: {
  title?: string;
  description?: string;
  features?: string[];
  onUpgrade?: () => void;
}) => {
  return (
    <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-surface to-emerald-500/5 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
          <Star className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-on-surface">{title}</h3>
          <p className="text-xs text-on-surface-variant">{description}</p>
        </div>
      </div>
      <ul className="space-y-2.5 py-3 border-y border-outline/10 my-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-on-surface">
            <Check className="size-4 text-teal-500 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onUpgrade}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:opacity-95 active:scale-[0.98] transition-all"
      >
        Actualizar plan
      </button>
    </div>
  );
};

// ==========================================
// 13. StatusChips
// ==========================================
export const StatusChips = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Check className="size-3" /> Activo
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <AlertTriangle className="size-3" /> Pendiente
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
        <Ban className="size-3" /> Inactivo
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
        <Info className="size-3" /> Nuevo
      </span>
    </div>
  );
};

// ==========================================
// 14. Disclosure Group
// ==========================================
export const DisclosureConfig = () => {
  const [expanded, setExpanded] = useState<string | null>('profile');

  return (
    <div className="w-full max-w-md rounded-2xl border border-outline/15 bg-surface p-3 space-y-2">
      <div className="border-b border-outline/10 pb-2">
        <button
          onClick={() => setExpanded(expanded === 'profile' ? null : 'profile')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span>Perfil & Preferencias</span>
          <ChevronDown className={cn('size-4 transition-transform', expanded === 'profile' && 'rotate-180')} />
        </button>
        {expanded === 'profile' && (
          <div className="p-3 text-xs text-on-surface-variant space-y-2">
            <p>Configura tu nombre de clínica, teléfono de soporte y notificaciones push.</p>
          </div>
        )}
      </div>
      <div>
        <button
          onClick={() => setExpanded(expanded === 'security' ? null : 'security')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span>Seguridad & Tokens</span>
          <ChevronDown className={cn('size-4 transition-transform', expanded === 'security' && 'rotate-180')} />
        </button>
        {expanded === 'security' && (
          <div className="p-3 text-xs text-on-surface-variant space-y-2">
            <p>Gestión de contraseñas y tokens de activación de un solo uso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 15. Drawer (Navigation)
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
        className="p-2.5 rounded-xl bg-surface-container-high text-on-surface hover:text-primary transition-colors flex items-center gap-2 text-xs font-semibold"
      >
        <Menu className="size-4" /> Menú
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[140] flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={setOpen}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-64 max-w-[80vw] h-full bg-surface border-r border-outline/15 p-5 shadow-2xl flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline/10">
                  <span className="font-bold text-sm text-primary">Navegación</span>
                  <button onClick={setOpen} className="p-1 rounded-lg text-outline hover:text-on-surface">
                    <X className="size-4" />
                  </button>
                </div>
                <nav className="space-y-1.5 mt-4">
                  {[
                    { label: 'Inicio', icon: Home, href: '/' },
                    { label: 'Pacientes', icon: User, href: '/pacientes' },
                    { label: 'Ejercicios', icon: Star, href: '/ejercicios' },
                    { label: 'Estadísticas', icon: Globe, href: '/estadisticas' },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
              <p className="text-[10px] text-outline text-center">FisioMirror v2.5</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==========================================
// 16. Dropdown with Descriptions
// ==========================================
export const ActionDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all flex items-center gap-2"
      >
        Acciones <ChevronDown className="size-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute left-0 mt-2 w-56 rounded-2xl bg-surface border border-outline/20 p-2 shadow-2xl z-30 space-y-1"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors"
            >
              <FilePlus className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-on-surface">Nuevo paciente</p>
                <p className="text-[10px] text-on-surface-variant">Generar expediente y token</p>
              </div>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-surface-container-high text-left transition-colors"
            >
              <FolderOpen className="size-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-on-surface">Abrir biblioteca</p>
                <p className="text-[10px] text-on-surface-variant">Explorar +50 ejercicios</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 17. Popover (Simple)
// ==========================================
export const SimplePopover = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
      >
        <MoreHorizontal className="size-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 mt-2 w-52 rounded-2xl bg-surface border border-outline/20 p-3 shadow-xl z-30"
          >
            <h5 className="text-xs font-bold text-on-surface mb-1">Opciones rápidas</h5>
            <p className="text-[11px] text-on-surface-variant">Exporta en PDF o comparte rutina.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 18. ProgressBar Sizes
// ==========================================
export const ProgressSizes = ({ value = 65 }: { value?: number }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <div>
        <span className="text-[10px] font-semibold text-outline">Pequeña (sm)</span>
        <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden mt-1">
          <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} />
        </div>
      </div>
      <div>
        <span className="text-xs font-semibold text-outline">Mediana (md)</span>
        <div className="h-2.5 w-full rounded-full bg-surface-container-high overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${value}%` }} />
        </div>
      </div>
      <div>
        <span className="text-xs font-semibold text-outline">Grande (lg)</span>
        <div className="h-4 w-full rounded-full bg-surface-container-high overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 19. RangeCalendar (DateRange)
// ==========================================
export const DateRange = ({
  startDate = '2025-02-03',
  endDate = '2025-02-12',
}: {
  startDate?: string;
  endDate?: string;
}) => {
  return (
    <div className="p-4 rounded-3xl bg-surface border border-outline/15 max-w-sm shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-outline/10 text-xs font-bold text-on-surface">
        <span className="flex items-center gap-1.5"><Calendar className="size-4 text-primary" /> Febrero 2025</span>
        <span className="text-[11px] text-primary">{startDate} - {endDate}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 pt-3 text-center text-xs">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <span key={d} className="font-bold text-outline text-[10px]">{d}</span>
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const day = i + 1;
          const isSelected = day >= 3 && day <= 12;
          return (
            <span
              key={i}
              className={cn(
                'py-1 rounded-lg text-xs font-medium',
                isSelected ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface-variant'
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
// 20. ScrollShadow (ScrollableList)
// ==========================================
export const ScrollableList = ({ itemsCount = 12 }: { itemsCount?: number }) => {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-surface border border-outline/15 p-4 overflow-hidden shadow-sm">
      <h4 className="text-xs font-bold text-on-surface mb-2">Lista con Scroll Suave</h4>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {Array.from({ length: itemsCount }).map((_, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface flex items-center justify-between">
            <span>Registro #{i + 1} de rehabilitación</span>
            <span className="text-[10px] text-outline">Hace {i + 1}d</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 21. Toast Variants
// ==========================================
export const ToastVariants = () => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const trigger = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex flex-wrap gap-2 relative">
      <button onClick={() => trigger('✅ Paciente guardado')} className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 text-xs font-semibold">
        Éxito
      </button>
      <button onClick={() => trigger('⚠️ Advertencia: Sesión pendiente')} className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 text-xs font-semibold">
        Alerta
      </button>
      <button onClick={() => trigger('❌ Error de conexión')} className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-600 text-xs font-semibold">
        Error
      </button>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-0 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-xl z-50"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 22. Table Custom Cells (PatientsTable)
// ==========================================
export const PatientsTable = ({
  users = [
    { id: 1, name: 'María Rodríguez', email: 'maria@fisio.com', status: 'Activo' },
    { id: 2, name: 'Carlos Gómez', email: 'carlos@fisio.com', status: 'Pendiente' },
    { id: 3, name: 'Lucía Fernández', email: 'lucia@fisio.com', status: 'Inactivo' },
  ],
}: {
  users?: { id: number; name: string; email: string; status: string }[];
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-outline/15 bg-surface shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-outline/10 bg-surface-container-low text-on-surface-variant font-semibold">
          <tr>
            <th className="p-3.5">Paciente</th>
            <th className="p-3.5">Estado</th>
            <th className="p-3.5 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/10">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-surface-container-high/40 transition-colors">
              <td className="p-3.5">
                <div className="flex items-center gap-2.5">
                  <BasicAvatar fallback={u.name[0]} size="sm" />
                  <div>
                    <p className="font-bold text-on-surface">{u.name}</p>
                    <p className="text-[10px] text-outline">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-3.5">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold',
                    u.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-600' : u.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                  )}
                >
                  {u.status}
                </span>
              </td>
              <td className="p-3.5 text-right">
                <button className="p-1.5 rounded-lg text-outline hover:text-primary transition-colors">
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
// 23. Alert CustomStyles (CustomAlert)
// ==========================================
export const CustomAlert = ({
  title = 'Tu plan está por vencer',
  description = 'Actualiza tu información de pago para evitar interrupciones en la clínica.',
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-surface to-amber-500/5 p-4 shadow-sm">
      <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-amber-500/15 blur-2xl" />
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-on-surface">{title}</h4>
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        </div>
        <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shrink-0">
          Actualizar
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 24. Chip Variants
// ==========================================
export const ChipVariants = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-sm">Primary</span>
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">Secondary</span>
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">Tertiary</span>
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-600">Soft</span>
    </div>
  );
};

// ==========================================
// 25. Chip Statuses
// ==========================================
export const ChipStatuses = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
        <span className="size-1.5 rounded-full bg-emerald-500" /> Activo
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
        <span className="size-1.5 rounded-full bg-amber-500" /> Pendiente
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
        <span className="size-1.5 rounded-full bg-red-500" /> Inactivo
      </span>
    </div>
  );
};

// ==========================================
// 26. Popover Interactive
// ==========================================
export const PopoverInteractive = ({
  name = 'Sarah Johnson',
  handle = '@sarahj',
  bio = 'Paciente en rehabilitación de hombro. Última sesión: hace 2 días.',
}: {
  name?: string;
  handle?: string;
  bio?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [following, setFollowing] = useState(false);

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-surface-container-high transition-colors">
        <BasicAvatar fallback="SJ" size="sm" />
        <span className="text-xs font-bold text-on-surface">{name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 mt-2 w-72 rounded-3xl bg-surface border border-outline/20 p-4 shadow-2xl z-30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <BasicAvatar fallback="SJ" size="md" />
                <div>
                  <p className="text-sm font-bold text-on-surface">{name}</p>
                  <p className="text-[10px] text-outline">{handle}</p>
                </div>
              </div>
              <button
                onClick={() => setFollowing(!following)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold transition-all',
                  following ? 'bg-surface-container-high text-on-surface' : 'bg-primary text-white'
                )}
              >
                {following ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{bio}</p>
            <div className="mt-3 pt-3 border-t border-outline/10 flex items-center justify-between text-xs font-semibold">
              <span>12 Sesiones</span>
              <span className="text-primary">80% Adherencia</span>
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
      {['Izquierda', 'Derecha', 'Arriba', 'Abajo'].map((p) => (
        <span key={p} className="px-3 py-1.5 rounded-xl bg-surface-container-high text-xs font-medium text-on-surface">
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
