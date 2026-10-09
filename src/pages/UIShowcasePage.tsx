import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Check, 
  Copy, 
  Heart, 
  ArrowLeft, 
  Zap, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  CheckCircle, 
  ExternalLink,
  Sliders,
  Eye,
  RefreshCw,
  Search,
  ArrowRight,
  MousePointer,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronRight,
  BarChart3,
  ListTodo,
  Bell,
  AlertTriangle,
  UserCheck,
  Megaphone,
  CheckSquare,
  Tag
} from 'lucide-react';
import { Button, IconButton, BackButton } from '../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, ConfirmDialog } from '../components/ui/Dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, StatCard, CardWithImage } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';
import { Tooltip } from '../components/ui/Tooltip';
import { CardSpotlight } from '../components/ui/CardSpotlight';
import { BorderBeam } from '../components/ui/BorderBeam';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { ClinicalSlider } from '../components/ui/ClinicalSlider';
import { AuroraText } from '../components/ui/AuroraText';
import { ShimmerText } from '../components/ui/ShimmerText';

// 8 Componentes Solicitados Previos
import { IncidentReportCard } from '../components/ui/IncidentReportCard';
import { AssignmentProgressCard, type RoutineCardData } from '../components/ui/AssignmentProgressCard';
import { Alert, BasicAlertsDemo } from '../components/ui/HeroAlert';
import { AlertDialog, DeleteProjectDialogDemo } from '../components/ui/HeroAlertDialog';
import { Avatar, AvatarDemo } from '../components/ui/HeroAvatar';
import { PromoCardDemo } from '../components/ui/HeroPromoCard';
import { CheckboxPreferencesDemo } from '../components/ui/HeroCheckbox';
import { Chip, ChipStatusesDemo } from '../components/ui/HeroChip';

// 4 Componentes de Suite Reciente (Modal, Popover, Drawer, DateRangePicker)
import { CustomModalDemo } from '../components/ui/Modal';
import { PopoverMetricDemo } from '../components/ui/Popover';
import { DrawerClinicalDemo } from '../components/ui/Drawer';
import { 
  DateRangePickerDemo, 
  BasicRangeCalendar, 
  WeekViewRangeCalendar, 
  DefaultValueRangeCalendar 
} from '../components/ui/DateRangePicker';

// Nuevos componentes estandarizados: ScrollShadow, Skeleton, Toast
import { ScrollShadow } from '../components/ui/ScrollShadow';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';

import { useNavigate } from 'react-router-dom';

type FilterTab = 'todos' | 'solicitados' | 'comparativa' | 'botones' | 'tarjetas' | 'modales' | 'entradas' | 'clinicos' | 'luces';

interface InventoryComparison {
  category: string;
  originalComponent: string;
  originalFile: string;
  evolvedComponent: string;
  librarySource: 'Magic UI' | 'Aceternity UI' | '21st.dev' | 'HeroUI' | 'Origin UI' | 'Shadcn UI' | 'Reaviz';
  keyImprovements: string[];
  status: 'Activo en Galería' | 'Listo para Producción';
}

const INVENTORY_COMPARISONS: InventoryComparison[] = [
  {
    category: '1. Reportes y Analítica Temporal',
    originalComponent: 'Gráficos o tarjetas estadísticas planas',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'IncidentReportCard (Reaviz AreaChart)',
    librarySource: 'Reaviz',
    keyImprovements: [
      'Gráficos vectoriales con interpolación suavizada (smooth area interpolation)',
      'Gradientes translúcidos automáticos compatibles con modo oscuro',
      'Desglose en tiempo real de 3 variables clínicas (ROM, Precisión AR y Adherencia)',
      'Métricas de respuesta y compensaciones con íconos de tendencia direccional'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '2. Rutinas y Tareas Asignadas',
    originalComponent: 'Listados de texto plano sin avance temporal',
    originalFile: 'src/pages/ExercisesPage.tsx',
    evolvedComponent: 'AssignmentProgressCard (Tarjetas de Asignación)',
    librarySource: 'HeroUI / 21st.dev',
    keyImprovements: [
      'Barra de progreso con gradiente esmeralda dinámico y valor porcentual',
      'Avatares superpuestos del fisioterapeuta supervisor y paciente vinculado',
      'Contador de cuenta regresiva para la próxima revisión médica presencial u online',
      'Badge de fase clínica y menú de opciones rápidas contextual'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '3. Avisos y Notificaciones del Sistema',
    originalComponent: 'Banners caseros o textos planos de alerta',
    originalFile: 'src/components/ui/InsightBanner.tsx',
    evolvedComponent: 'HeroUI Alert (Alert, Indicator, Content, Title)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Estados semánticos con contraste accesible: default, accent, success, warning, danger',
      'Micro-animación de entrada Framer Motion con botón de cierre suave',
      'Iconografía de advertencia, éxito o conexión con Supabase contextualizada',
      'Diseño en caja de cristal con bordes refinados para no saturar la vista'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '4. Diálogos de Confirmación Críticos',
    originalComponent: 'Ventanas nativas window.confirm',
    originalFile: 'src/pages/Tokens.tsx / PatientsPage.tsx',
    evolvedComponent: 'HeroUI AlertDialog (Backdrop, Container, Dialog)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Backdrop de cristal líquido oscuro (backdrop-blur-md) sin romper el Glassmorphism',
      'Física de muelle spring (damping: 25, stiffness: 350) en apertura y cierre',
      'Icono de advertencia en escudo para operaciones destructivas irreversibles',
      'Botones con slot="close" para cierre instantáneo en un solo toque'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '5. Avatares e Identificación de Usuarios',
    originalComponent: 'Elementos img simples sin fallback de iniciales',
    originalFile: 'src/components/FisioLayout.tsx',
    evolvedComponent: 'HeroUI Avatar (Avatar, Avatar.Image, Avatar.Fallback)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Respaldo automático con iniciales en caso de falla o demora en cargar la imagen',
      'Anillo luminoso perimetral en verde azulado médico (ring-teal-500/20)',
      'Escalabilidad en 4 tamaños estándar (sm, md, lg, xl)',
      'Manejo de errores seguro con referrerPolicy="no-referrer"'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '6. Paneles Multimedia y Anuncios',
    originalComponent: 'Tarjetas de contenido planas sin soporte multimedia',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'HeroUI PromoCard (Cards with Images)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Disposición horizontal responsive (columna en móvil, fila en escritorio)',
      'Contenedor de imagen con efecto zoom suave en hover e indicador Sparkles',
      'Botón de cierre rápido y botón CTA para explorar novedades de la plataforma',
      'Fondo con destello radial ambiental difuminado'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '7. Preferencias y Casillas Múltiples',
    originalComponent: 'Inputs checkbox HTML sin estilos de modo oscuro',
    originalFile: 'src/pages/SettingsPage.tsx',
    evolvedComponent: 'HeroUI Checkbox (Surface, CheckboxGroup, Indicator)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Superficie acolchada con retroalimentación visual al seleccionar',
      'Casilla animada con check marcado de alto contraste y borde en teal',
      'Títulos y descripciones clínicas explicativas por cada canal de notificación',
      'Soporte completo de navegación por teclado y selección múltiple'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '8. Etiquetas de Estado Rápido',
    originalComponent: 'Badges de texto coloreados manualmente',
    originalFile: 'src/components/clinical/PatientCard.tsx',
    evolvedComponent: 'HeroUI Chip (Chip, Chip.Label)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Colores semánticos definidos: success, warning, danger, primary, neutral',
      'Punto de actividad animado o íconos SVG vectoriales',
      'Diseño compacto estilo píldora con micro-borde sutil',
      'Ideal para semáforos de adherencia y severidad diagnóstica'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '9. Modales Interactivos & Parámetros',
    originalComponent: 'Modales básicos con posicionado absolute o fixed',
    originalFile: 'src/components/ui/GlassModal.tsx',
    evolvedComponent: 'HeroUI Modal (Backdrop, Container, Dialog, CloseTrigger)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Backdrop con blur óptico profundo, spring physics y tecla Escape',
      'Encabezados semánticos con icono de acción y disparador de cierre automático',
      'Integración con slot="close" en botones de pie para flujo sin boilerplate',
      'Control deslizante interactivo de calibración biomecánica y sensibilidad'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '10. Menú Desplegable Contextual',
    originalComponent: 'Tooltips planos o cajas estáticas sin anclaje dinámico',
    originalFile: 'src/components/ui/Tooltip.tsx',
    evolvedComponent: 'HeroUI Popover (Popover, Popover.Content, Popover.Dialog)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Anclaje dinámico automático al botón disparador con soporte táctil y clic',
      'Desglose biomecánico por articulación (rodilla, hombro, codo)',
      'Semáforo visual de rangos fisiológicos óptimos en tiempo real',
      'Cierre inteligente al pulsar fuera (click outside) o Escape'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '11. Panel Lateral Deslizante',
    originalComponent: 'Navegación completa obligatoria a otra página para editar',
    originalFile: 'src/pages/PatientDetailPage.tsx',
    evolvedComponent: 'HeroUI Drawer (Drawer, Drawer.Dialog, Drawer.Body)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Apertura lateral suave desde la derecha sin perder el contexto de sesión',
      'Ajuste clínico directo de tolerancia biomecánica y repeticiones objetivo',
      'Área de observaciones del terapeuta y notas clínicas integradas',
      'Física de resorte táctil con esquinas redondeadas en radio unificado 3xl'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '12. Selector de Rango de Fechas',
    originalComponent: 'Inputs de fecha estándar HTML o calendarios simples',
    originalFile: 'src/components/ui/SimpleCalendar.tsx',
    evolvedComponent: 'HeroUI DateRangePicker (RangeCalendar, Grid, Popover)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Selección de intervalo temporal interactivo (fecha de inicio y fin)',
      'Presets rápidos clínicos para terapeutas (7 días, 14 días, 30 días)',
      'Resaltado en degradado teal/esmeralda con bordes redondeados en extremos',
      'Cálculo dinámico de días de evolución y sesiones programadas'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '13. Sombras de Desbordamiento de Scroll',
    originalComponent: 'Contenedores estándar overflow-y-auto sin avisos de contenido oculto',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'HeroUI ScrollShadow (Sombras automáticas de gradiente)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Detecta desbordamiento y aplica gradientes superiores e inferiores automáticos',
      'Soporte vertical y horizontal con offset configurable',
      'Evita que el terapeuta pierda de vista tareas o ejercicios ocultos por scroll',
      'Transición suave con opacidad y sin barras de scroll invasivas'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '14. Placeholders de Carga Progresiva',
    originalComponent: 'Spinners genéricos o pantallas en blanco parpadeantes',
    originalFile: 'src/components/ui/Loader.tsx',
    evolvedComponent: 'HeroUI Skeleton (Shimmer, Wave, Pulse)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Efectos shimmer, pulse y wave con degradados cinéticos de FisioMirror',
      'Soporte isLoaded con preservación de dimensiones del layout',
      'Variantes text, rect y circle alineadas a radios redondeados 2xl/3xl',
      'Feedback táctil inmediato durante consultas clínicas asíncronas'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '15. Notificaciones Toast Canónicas',
    originalComponent: 'Alerts bloqueantes o mensajes estáticos en cabecera',
    originalFile: 'src/components/ui/GlassToast.tsx',
    evolvedComponent: 'HeroUI / Sonner Toast (toast, toast.success, indicator, action)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'Llamada directa desde cualquier función o callback: toast("Mensaje")',
      'Soporte para action buttons interactivos, duraciones y custom indicators',
      'Física de resortes de Framer Motion con deslizamiento y cierre táctil',
      'Contraste de alto impacto en modo oscuro con bordes luminosos por severidad'
    ],
    status: 'Activo en Galería'
  }
];

const SAMPLE_ROUTINE_CARDS: RoutineCardData[] = [
  {
    id: 1,
    date: 'Prescrito: 08 Octubre',
    title: 'Rutina Lumbar & Movilidad Activa',
    description: '3 ejercicios diarios enfocados en estabilización del core y descompresión lumbosacra.',
    progressValue: '75%',
    countdownText: 'Revisión en 2 días',
    badge: 'Fase 2',
    imgSrc1: '/physi.png',
    imgAlt1: 'Fisio Dra. Ramos',
    imgSrc2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    imgAlt2: 'Paciente Carlos',
  },
  {
    id: 2,
    date: 'Prescrito: 06 Octubre',
    title: 'Rehabilitación Manguito Rotador',
    description: 'Rotación externa con banda elástica y bio-feedback angular en tiempo real.',
    progressValue: '40%',
    countdownText: 'Próxima sesión: Hoy',
    badge: 'Fase 1',
    imgSrc1: '/physi.png',
    imgAlt1: 'Fisio Dra. Ramos',
  },
  {
    id: 3,
    date: 'Prescrito: 01 Octubre',
    title: 'Fortalecimiento Cuádriceps & Rodilla',
    description: 'Sentadilla asistida a 90° con detección de valgo dinámico por cámara web.',
    progressValue: '90%',
    countdownText: 'Alta próxima en 4 días',
    badge: 'Alta próxima',
    imgSrc1: '/physi.png',
    imgAlt1: 'Fisio Dra. Ramos',
    imgSrc2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    imgAlt2: 'Paciente Lucía',
  },
];

export function UIShowcasePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('todos');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSize, setDialogSize] = useState<'sm' | 'md' | 'lg' | 'full'>('md');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Button state
  const [buttonLoading, setButtonLoading] = useState(false);

  // Input states
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [inputGlass, setInputGlass] = useState(true);

  // OTP state
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpCompletedCode, setOtpCompletedCode] = useState<string | null>(null);

  // Clinical Slider state
  const [clinicalRom, setClinicalRom] = useState(115);
  const [tickerTrigger, setTickerTrigger] = useState(1);

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'todos', label: 'Todos los Componentes', icon: <Layers className="w-4 h-4" /> },
    { id: 'solicitados', label: '✨ 12 Componentes Solicitados', icon: <Sparkles className="w-4 h-4" />, count: 12 },
    { id: 'comparativa', label: 'Inventario & Mapeo', icon: <Search className="w-4 h-4" />, count: INVENTORY_COMPARISONS.length },
    { id: 'botones', label: 'Botones Evolved', icon: <Zap className="w-4 h-4" /> },
    { id: 'tarjetas', label: 'Tarjetas & Bento', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'modales', label: 'Modales Glass', icon: <Eye className="w-4 h-4" /> },
    { id: 'entradas', label: 'Inputs & OTP', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'clinicos', label: 'Controles Clínicos', icon: <Sliders className="w-4 h-4" /> },
    { id: 'luces', label: 'Tipografía & Luces', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d12] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Volver</span>
            </BackButton>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  FisioMirror UI Lab v2.0
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
                  Ecosistema CLI / MCP Activo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Reaviz · HeroUI · Magic UI · Aceternity
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
                Galería de Componentes Evolved
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Inventario de componentes de FisioMirror con integración completa de Reaviz, HeroUI, Magic UI y Aceternity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Ir al panel del fisioterapeuta" side="bottom">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard-fisio')}>
                Panel Clínico
              </Button>
            </Tooltip>
            <Tooltip content="Ir a la pantalla de vinculación de paciente" side="bottom">
              <Button variant="glow" glowEffect size="sm" onClick={() => navigate('/registro-paciente')} icon={<Zap className="w-3.5 h-3.5" />}>
                Registro Token
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* System KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Componentes Usados</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums flex items-baseline gap-1">
              <span>72</span>
              <span className="text-[10px] font-medium text-slate-400">en FisioMirror</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Nuevos Solicitados</span>
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tabular-nums flex items-baseline gap-1">
              <span>12</span>
              <span className="text-[10px] font-medium text-teal-500/80">integrados 100%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gráficos Vectoriales</span>
            <div className="text-xl sm:text-2xl font-black text-lime-600 dark:text-lime-400 tabular-nums flex items-baseline gap-1">
              <span>Reaviz</span>
              <span className="text-[10px] font-medium text-slate-400">Áreas Suaves</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Micro-interacción</span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums flex items-baseline gap-1">
              <span>&lt; 300ms</span>
              <span className="text-[10px] font-medium text-slate-400">Regla Oro</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-slate-800/80 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN ESPECIAL: LOS 8 COMPONENTES SOLICITADOS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'solicitados') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-teal-500/5 border border-teal-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-500/15">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  Suite Integrada
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Los 12 Componentes Solicitados con Temática FisioMirror
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Implementación funcional adaptada a la paleta médica (Teal, Azure, Kinetic Lime) y tipografías oficiales.
                </p>
              </div>
            </div>

            {/* 1. Tarjeta de Reportes con Gráficos Reaviz */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Tarjeta de Reportes con Gráficos Reaviz (IncidentReportCard)
                </h3>
              </div>
              <div className="flex justify-center sm:justify-start">
                <IncidentReportCard />
              </div>
            </div>

            {/* 2. Tarjetas de Asignación y Progreso */}
            <div className="space-y-3 pt-6 border-t border-teal-500/15">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Tarjetas de Asignación y Progreso (course-design-cards)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SAMPLE_ROUTINE_CARDS.map((cardData) => (
                  <AssignmentProgressCard key={cardData.id} data={cardData} />
                ))}
              </div>
            </div>

            {/* 3 & 4. Sistema de Alertas HeroUI y AlertDialog */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 3. Alertas HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    3. Sistema de Alertas de HeroUI (Alert)
                  </h3>
                </div>
                <BasicAlertsDemo />
              </div>

              {/* 4. AlertDialog HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    4. Diálogos de Alerta / Confirmación (AlertDialog)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[calc(100%-2rem)]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Modal de Confirmación Crítica
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                      Sustituye llamadas estándar <code className="text-rose-500 font-mono">window.confirm</code> por un diálogo con backdrop difuminado, spring physics y confirmación accesible.
                    </p>
                  </div>
                  <div>
                    <DeleteProjectDialogDemo />
                  </div>
                </div>
              </div>
            </div>

            {/* 5 & 6. Avatares y Banner Promocional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 5. Avatares HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    5. Avatares de Usuario con Fallback (Avatar)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <AvatarDemo />
                </div>
              </div>

              {/* 6. Promo Card Banner HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    6. Tarjeta Multimedia & Banner (Cards with Images)
                  </h3>
                </div>
                <PromoCardDemo onCtaClick={() => navigate('/ocr-scanner')} />
              </div>
            </div>

            {/* 7 & 8. Checkbox Preferences y Chips de Estado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 7. Checkbox HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    7. Grupos de Casillas de Verificación (CheckboxGroup)
                  </h3>
                </div>
                <CheckboxPreferencesDemo />
              </div>

              {/* 8. Chip HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    8. Etiquetas de Estado (Chip)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Semáforo de estados de pacientes y severidad clínica:
                  </p>
                  <ChipStatusesDemo />
                </div>
              </div>
            </div>

            {/* 9 & 10. Modal Interactivo y Popover Biomecánico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 9. Ventana Modal Interactiva (Modal) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    9. Ventana Modal Interactiva (Modal)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Calibración y Configuración Modal
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Ventana emergente accesible con física de muelle, disparador de cierre automático (slot=&quot;close&quot;), selector de sensibilidad y mallas AR.
                    </p>
                  </div>
                  <CustomModalDemo />
                </div>
              </div>

              {/* 10. Menú Desplegable Contextual (Popover) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    10. Menú Desplegable Contextual (Popover)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Detalle Biomecánico Dinámico
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Cuadro anclado con micro-interacción que muestra el semáforo y rango fisiológico óptimo según la articulación seleccionada (rodilla, hombro, codo).
                    </p>
                  </div>
                  <PopoverMetricDemo />
                </div>
              </div>
            </div>

            {/* 11 & 12. Drawer Clínico y Selector de Rango de Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 11. Panel Lateral Deslizante (Drawer) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    11. Panel Lateral Deslizante (Drawer)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Panel Lateral de Ajustes de Sesión
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Emerge desde el lateral derecho sin desconectar al terapeuta de su pantalla actual, permitiendo ajustar repeticiones y redactar observaciones.
                    </p>
                  </div>
                  <DrawerClinicalDemo />
                </div>
              </div>

              {/* 12. Selector de Rango de Fechas (DateRangePicker) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    12. Selector de Rango de Fechas (DateRangePicker)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Calendario de Intervalo Clínico
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Selecciona fecha inicial y final para filtrar la evolución y adherencia del paciente, con botones rápidos para 7, 14 o 30 días.
                    </p>
                  </div>
                  <DateRangePickerDemo />
                </div>
              </div>
            </div>

            {/* 13, 14 & 15. Calendarios de Rango Avanzados, ScrollShadow, Skeleton y Toast System */}
            <div className="pt-6 border-t border-teal-500/15 space-y-6">
              {/* Calendarios Avanzados: Basic, WeekView y DefaultValue */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Calendarios de Rango Avanzados (RangeCalendar y Vistas Múltiples)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Vista Básica */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        1. Vista Básica
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-1">
                        firstDayOfWeek=&quot;mon&quot;
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Subcomponentes Headings, NavButtons y Grid con selección táctil de inicio y fin.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <BasicRangeCalendar />
                    </div>
                  </div>

                  {/* Vista Dinámica por Semanas */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        2. Vista por Semanas (WeekView)
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-1">
                        visibleDuration Dinámico
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Selector HeroUI Select que amplía o contrae la vista de 1 a 8 semanas según el plan.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <WeekViewRangeCalendar />
                    </div>
                  </div>

                  {/* Vista Predeterminada */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        3. Rango Inicial (DefaultValue)
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 mb-1">
                        parseDate(&quot;2026-02-03&quot;)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Carga directa de intervalo médico pre-seleccionado con colores y contrastes clínicos.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <DefaultValueRangeCalendar />
                    </div>
                  </div>
                </div>
              </div>

              {/* ScrollShadow & Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* ScrollShadow */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Sombras de Desbordamiento de Scroll (ScrollShadow)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        Contenedor con Gradientes Automáticos
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        Haz scroll en la lista de ejercicios de rehabilitación. Las sombras superior e inferior aparecen de forma reactiva avisando que hay más tareas.
                      </p>
                    </div>
                    <ScrollShadow className="h-60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/50" size={36}>
                      <div className="space-y-2.5">
                        {[
                          { name: 'Sentadilla Biomecánica Asistida', reps: '3 series × 12 reps', target: 'Rodilla y Cuádriceps', status: 'Completado' },
                          { name: 'Rotación Externa de Hombro con Banda', reps: '3 series × 15 reps', target: 'Manguito Rotador', status: 'En Progreso' },
                          { name: 'Puente Glúteo con Descompresión Lumbar', reps: '4 series × 10 reps', target: 'Core & Espina', status: 'Pendiente' },
                          { name: 'Flexión Plantar en Borde de Escalón', reps: '3 series × 15 reps', target: 'Tendón de Aquiles', status: 'Pendiente' },
                          { name: 'Elevación Lateral de Escápula', reps: '3 series × 12 reps', target: 'Trapecio Medio', status: 'Pendiente' },
                          { name: 'Estiramiento Dinámico Isquiotibial', reps: '2 series × 30 seg', target: 'Cadena Posterior', status: 'Completado' },
                          { name: 'Equilibrio Monopodal en Disco de Aire', reps: '3 series × 45 seg', target: 'Propiocepción', status: 'Pendiente' }
                        ].map((ex, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between shadow-xs">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{ex.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{ex.target} • {ex.reps}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                              {ex.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollShadow>
                  </div>
                </div>

                {/* Skeleton y Toast */}
                <div className="space-y-6">
                  {/* Skeleton */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Placeholders de Carga Progresiva (Skeleton)
                      </h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          Animación Shimmer / Wave sin parpadeos
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                          Permite mantener la estructura del layout mientras se sincronizan las métricas del sensor LiDAR o cámara.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton variant="circle" width={44} height={44} />
                          <div className="flex-1 space-y-2">
                            <Skeleton variant="text" width="65%" height={14} />
                            <Skeleton variant="text" width="45%" height={11} />
                          </div>
                        </div>
                        <Skeleton variant="text" width="100%" height={12} />
                        <Skeleton variant="text" width="80%" height={12} />
                        <div className="flex gap-2 pt-1">
                          <Skeleton variant="rect" width={90} height={28} className="rounded-xl" />
                          <Skeleton variant="rect" width={90} height={28} className="rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toast Interactivo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Notificaciones Toast HeroUI / Sonner (toast)
                      </h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dispara notificaciones ergonómicas directas con feedback háptico y física suave:
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => toast("Sesión de fisioterapia iniciada correctamente")}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
                        >
                          Toast Default
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success("Ángulo articular validado a 135°", { description: "Registrado en el historial del paciente Carlos Ramos." })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                        >
                          Éxito Clínico
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.warning("Compensación postural detectada", { description: "La cadera izquierda sobrepasa el límite de 12°." })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                        >
                          Alerta Biomecánica
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.error("Error al conectar sensor de cámara", {
                            action: { label: "Reintentar", onClick: () => toast.info("Reintentando conexión...") }
                          })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
                        >
                          Error con Acción
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN INVENTARIO & COMPARATIVA
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'comparativa') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Inventario Completo: Componentes Originales vs. Versiones Evolved
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mapeo directo de componentes de FisioMirror con sus reemplazos de Magic UI, Aceternity UI, 21st, HeroUI y Reaviz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INVENTORY_COMPARISONS.map((item, index) => (
                <Card key={index} variant="glass" hoverEffect animated className="relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Fuente: {item.librarySource}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="p-2 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Componente Original en FisioMirror:</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.originalComponent}</p>
                      <code className="text-[10px] text-slate-400 font-mono">{item.originalFile}</code>
                    </div>

                    <div className="p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/20">
                      <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">Versión Evolved Integrada:</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.evolvedComponent}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">Ventajas y Características Superiores:</p>
                    <ul className="space-y-1">
                      {item.keyImprovements.map((improvement, i) => (
                        <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN BOTONES EVOLVED (Magic UI, 21st.dev, Shadcn CVA)
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'botones') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Botones Evolved (ShimmerButton, Glow, Kinetic & CVA)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sustituye botones planos por microinteracciones de muelle y rayos lumínicos giratorios.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setButtonLoading(!buttonLoading)}
                className="text-xs"
              >
                Alternar Carga: {buttonLoading ? 'Activada' : 'Desactivada'}
              </Button>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <span>Variantes Premium Evolved</span>
                  <span className="text-[10px] text-teal-500 lowercase">(framer-motion + cva + magic-ui)</span>
                </h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <ShimmerButton>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Shimmer Button (Magic UI)</span>
                  </ShimmerButton>

                  <Button variant="glow" glowEffect icon={<Sparkles className="w-4 h-4" />}>
                    Button Glow (Infinito)
                  </Button>

                  <Button variant="kinetic" glowEffect icon={<Activity className="w-4 h-4" />}>
                    Button Kinetic (Alta Frecuencia)
                  </Button>

                  <Button variant="glass">Button Glass Effect</Button>
                  <Button variant="gradient" icon={<Zap className="w-4 h-4" />}>Gradient</Button>
                  <Button variant="default" loading={buttonLoading}>Default CVA</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive" icon={<Trash2 className="w-4 h-4" />}>Destructive</Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Escalas & Botones de Utilidad</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm" variant="glow">Pequeño (sm)</Button>
                  <Button size="default" variant="glow">Normal (default)</Button>
                  <Button size="lg" variant="glow" icon={<Send className="w-5 h-5" />} iconPosition="right">
                    Grande Táctil (lg)
                  </Button>
                  <Tooltip content="IconButton accesible para navegación">
                    <IconButton icon={<Heart className="w-4 h-4 text-rose-500" />} />
                  </Tooltip>
                  <BackButton onClick={() => {}}>BackButton Atrás</BackButton>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN TARJETAS, SPOTLIGHT & BENTO (Aceternity UI & Magic UI)
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'tarjetas') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Tarjetas Activas: CardSpotlight (Aceternity) & Bento con BorderBeam (Magic UI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mueve el mouse sobre las tarjetas para apreciar el haz de luz radial matemático y el haz orbital en el borde.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <CardSpotlight className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <MousePointer className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                    Aceternity Spotlight
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  CardSpotlight Reactivo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Proyecta un gradiente radial matemático dinámico que persigue al cursor exactamente sin forzar re-renderizados del DOM.
                </p>
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Efecto Biomecánico</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">60 FPS Suave</span>
                </div>
              </CardSpotlight>

              <div className="relative p-6 rounded-2xl border border-outline/15 bg-surface-container-low/70 overflow-hidden group shadow-sm flex flex-col justify-between">
                <BorderBeam size={90} duration={6} colorFrom="#14b8a6" colorTo="#C1FF72" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-lime-600 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20">
                      Magic UI BorderBeam
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Borde Orbital Cinético
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Un rayo lumínico SVG recorre el perímetro de la tarjeta constantemente para destacar elementos de alta prioridad clínica.
                  </p>
                </div>
                <Button size="sm" variant="kinetic" className="w-full">
                  Ver Módulo Activo
                </Button>
              </div>

              <StatCard 
                icon={
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Activity className="w-6 h-6" />
                  </div>
                }
                value={
                  <div className="flex items-center justify-center gap-1">
                    <NumberTicker value={89} key={tickerTrigger} />
                    <span>%</span>
                  </div>
                }
                label="Adherencia Media Semanal"
                trend={
                  <span 
                    onClick={() => setTickerTrigger((prev) => prev + 1)}
                    className="cursor-pointer underline decoration-dotted hover:opacity-80"
                  >
                    +14% vs mes previo (Clic para re-animar)
                  </span>
                }
              />
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN MODALES & DIÁLOGOS GLASS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'modales') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Modales & Diálogos Evolved (Física Spring & Liquid Glass)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sustituye ventanas rígidas por transiciones fluidas con resorte y desenfoque óptico de cristal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
              <Button 
                variant="outline" 
                onClick={() => { setDialogSize('sm'); setDialogOpen(true); }}
              >
                Abrir Modal Pequeño (sm)
              </Button>
              <Button 
                variant="glass" 
                onClick={() => { setDialogSize('md'); setDialogOpen(true); }}
              >
                Abrir Modal Glass Mediano (md)
              </Button>
              <Button 
                variant="glow" 
                onClick={() => { setDialogSize('lg'); setDialogOpen(true); }}
              >
                Abrir Modal Clínico Grande (lg)
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setConfirmOpen(true)}
              >
                Probar ConfirmDialog Destructivo
              </Button>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN INPUTS & OTP
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'entradas') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Inputs Clínicos & OtpInput (Origin UI + 21st.dev)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formularios con micro-escalado en foco y entrada segmentada de 6 casillas para vinculación de pacientes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Campo Clínico con Micro-Zoom (Input)
                </h3>
                <Input 
                  label="Nombre del Paciente o Diagnóstico" 
                  placeholder="Ej. María Fernández — Tendinopatía" 
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.length > 0 && e.target.value.length < 3) {
                      setInputError('El campo debe tener al menos 3 caracteres');
                    } else {
                      setInputError('');
                    }
                  }}
                  error={inputError}
                  hint="Foco suave con resalte en verde azulado médico"
                  glassEffect={inputGlass}
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setInputGlass(!inputGlass)}
                  >
                    Efecto Cristal: {inputGlass ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Entrada OTP de 6 Casillas (OtpInput)
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setOtpValue('492815');
                        setOtpCompletedCode('492815');
                      }}
                      className="text-[11px]"
                    >
                      Probar Pegado Demo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setOtpError(!otpError)}
                      className="text-[11px]"
                    >
                      Error: {otpError ? 'Sí' : 'No'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pega o escribe un token. Salta de casilla automáticamente con compatibilidad teclado numérico móvil.
                </p>
                
                <div className="flex justify-center sm:justify-start">
                  <OtpInput 
                    length={6}
                    value={otpValue}
                    onChange={setOtpValue}
                    onComplete={(code) => setOtpCompletedCode(code)}
                    error={otpError}
                  />
                </div>

                {otpCompletedCode && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Código detectado y validado en tiempo real: <strong>{otpCompletedCode}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN CONTROLES CLÍNICOS HÁPTICOS (ROM & DOLOR)
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'clinicos') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Controles Clínicos Hápticos: Deslizador de ROM Articular & Dolor (Origin UI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Diseñado para calibración de ángulos biomecánicos con marcas visuales de 0° a 180°.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <ClinicalSlider 
                value={clinicalRom}
                onChange={setClinicalRom}
                min={0}
                max={180}
                label="Flexión de Rodilla / Codo (ROM)"
                unit="°"
                icon={<Activity className="w-5 h-5" />}
                ticks={[0, 45, 90, 135, 180]}
                helperText="Mueve el deslizador para calibrar el ángulo umbral de la sesión guiada."
              />

              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>
                    Ángulo seleccionado actual: <strong className="text-sm font-bold text-teal-700 dark:text-teal-300">{clinicalRom}°</strong>
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setClinicalRom(90)}>Preset 90° (Funcional)</Button>
                  <Button size="sm" variant="glow" onClick={() => setClinicalRom(135)}>Preset 135° (Avanzado)</Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN TIPOGRAFÍA LUMÍNICA & TOOLTIPS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'luces') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Tipografía Lumínica en Movimiento & Tooltips con Flecha (Magic UI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Textos con flujo de gradiente orgánico vivo y tooltips en 4 orientaciones con desenfoque de cristal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tipografía Dinámica</span>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Efecto Aurora Text:</p>
                  <h3 className="text-2xl font-black">
                    Rehabilitación con <AuroraText>Inteligencia Artificial</AuroraText>
                  </h3>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Efecto Shimmer Text (Barrido):</p>
                  <ShimmerText text="Análisis Biomecánico a 30 FPS en Tiempo Real" className="text-lg font-bold" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                    Tooltips con Flecha Geométrica
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Pasa el cursor para ver el posicionamiento y la micro-flecha alineada:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Tooltip content="Tooltip superior con efecto glass" side="top">
                    <Button variant="outline" size="sm" className="w-full">Arriba (Top)</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip derecho con flecha integrada" side="right">
                    <Button variant="glass" size="sm" className="w-full">Derecha (Right)</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip inferior con retardo suave" side="bottom">
                    <Button variant="glow" size="sm" className="w-full">Abajo (Bottom)</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip lateral izquierdo" side="left">
                    <Button variant="kinetic" size="sm" className="w-full">Izquierda (Left)</Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── MODALES INTERACTIVOS ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size={dialogSize} glassEffect>
        <DialogHeader>
          <DialogTitle>Modal Interactivo Glass ({dialogSize.toUpperCase()})</DialogTitle>
          <DialogDescription>
            Este diálogo cuenta con desenfoque óptico de alta fidelidad, botón de cierre y animación Framer Motion tipo spring.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Inspirado en la ergonomía de HeroUI y modales de tele-rehabilitación con accesibilidad completa.
            </p>
            <Input 
              label="Comentario clínico de prueba" 
              placeholder="Escribe una observación para el paciente..." 
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
          <Button variant="glow" glowEffect onClick={() => setDialogOpen(false)}>
            Aceptar Cambios
          </Button>
        </DialogFooter>
      </Dialog>

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Confirmar acción destructiva?"
        description="Esta es una demostración de ConfirmDialog con variantes estilizadas y cierre con un solo toque."
        confirmText="Sí, continuar"
        cancelText="Regresar"
        confirmVariant="destructive"
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
export default UIShowcasePage;
