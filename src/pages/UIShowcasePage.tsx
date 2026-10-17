import { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Copy, 
  Heart, 
  ArrowLeft, 
  Zap, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  Sliders,
  Eye,
  RefreshCw,
  Search,
  ArrowRight,
  MousePointer,
  CheckCircle2,
  Calendar,
  BarChart3,
  ListTodo,
  Bell,
  AlertTriangle,
  UserCheck,
  Megaphone,
  CheckSquare,
  Tag,
  Radio,
  Home,
  Users,
  Camera,
  Dumbbell
} from 'lucide-react';
import { Button, IconButton, BackButton } from '../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, ConfirmDialog } from '../components/ui/Dialog';
import { Card, StatCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';
import { Tooltip } from '../components/ui/Tooltip';
import { CardSpotlight } from '../components/ui/CardSpotlight';
import { BorderBeam } from '../components/ui/BorderBeam';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { ClinicalSlider } from '../components/ui/ClinicalSlider';
import { AuroraText } from '../components/ui/AuroraText';
import { ShimmerText } from '../components/ui/ShimmerText';

// 8 Componentes Solicitados Previos
import { IncidentReportCard } from '../components/ui/IncidentReportCard';
import { AssignmentProgressCard, type RoutineCardData } from '../components/ui/AssignmentProgressCard';
import { BasicAlertsDemo } from '../components/ui/HeroAlert';
import { DeleteProjectDialogDemo } from '../components/ui/HeroAlertDialog';
import { AvatarDemo } from '../components/ui/HeroAvatar';
import { PromoCardDemo } from '../components/ui/HeroPromoCard';
import { CheckboxPreferencesDemo } from '../components/ui/HeroCheckbox';
import { ChipStatusesDemo } from '../components/ui/HeroChip';

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

// Nuevos componentes estandarizados: ScrollShadow, Skeleton, Toast, AnimatedList, Confetti
import { ScrollShadow } from '../components/ui/ScrollShadow';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { ClinicalActivityFeed } from '../components/ui/ClinicalActivityFeed';
import { ConfettiStars, ConfettiSideCannons } from '../components/ui/ConfettiButton';

// Nuevos 7 Componentes Avanzados
import { Highlighter, ClinicalHighlighter, type AnnotationAction } from '../components/ui/Highlighter';
import { InteractiveHoverButton } from '../components/ui/InteractiveHoverButton';
import { KineticText } from '../components/ui/KineticText';
import { LightRays } from '../components/ui/LightRays';
import { MagicCard } from '../components/ui/MagicCard';
import { PixelImage } from '../components/ui/PixelImage';

// 6 Componentes de Nueva Suite (PulsatingButton, ScrollProgress, ShineBorder, SparklesText, TextAnimate)
import { PulsatingButton } from '../components/ui/PulsatingButton';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { ShineBorder } from '../components/ui/ShineBorder';
import { SparklesText } from '../components/ui/SparklesText';
import { TextAnimate, type AnimationType, type AnimationVariant } from '../components/ui/TextAnimate';

// 8 Nuevos Componentes Estelares Biomecánicos & Gamificación FisioMirror
import { BiomechanicalAngleGauge } from '../components/ui/BiomechanicalAngleGauge';
import { ARFloatingDock } from '../components/ui/ARFloatingDock';
import { RehabEnergyBar } from '../components/ui/RehabEnergyBar';
import { GamifiedBadgeCard } from '../components/ui/GamifiedBadgeCard';
import { CompensationAlertBanner } from '../components/ui/CompensationAlertBanner';
import { RepetitionCounterSpring } from '../components/ui/RepetitionCounterSpring';
import { JointDetailPopover } from '../components/ui/JointDetailPopover';
import { TherapistQuickToolbar } from '../components/ui/TherapistQuickToolbar';

// 50 Componentes Nuevos de la Macro Suite FisioMirror (5 Categorías)
import * as MegaSuite from '../components/ui/megaSuite';

// Armonización y Tokens Pastel Clínicos
import { HarmonizedSurface } from '../components/ui/HarmonizedSurface';
import { CLINICAL_PASTELS } from '../lib/designTokens';

// PWA Móvil & Físicas de Resorte
import { MobileBottomSheet, type BottomSheetSnapPoint } from '../components/ui/MobileBottomSheet';
import { 
  CompactJointSelector, 
  CompactRomStepper, 
  CompactToleranceDropdown 
} from '../components/ui/CompactQuickSelector';
import { MotionBlurFade, TactileFeedback } from '../components/ui/MotionWrappers';

import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

type FilterTab = 'todos' | 'megasuite' | 'mobile' | 'armonizacion' | 'estelar' | 'solicitados' | 'comparativa' | 'botones' | 'tarjetas' | 'modales' | 'entradas' | 'clinicos' | 'luces';

interface InventoryComparison {
  category: string;
  originalComponent: string;
  originalFile: string;
  evolvedComponent: string;
  librarySource: string;
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
  },
  {
    category: '16. Feed de Notificaciones en Vivo',
    originalComponent: 'Listados estáticos de notificaciones o alertas en texto',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'Magic UI AnimatedList (Feed Clínico en Vivo)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Animación de entrada con resortes elásticos (spring physics) y efecto ticker automático',
      'Desplazamiento fluido y apilamiento progresivo con soporte para pausa/reanudación',
      'Tarjetas translúcidas calibradas con tokens de FisioMirror y modo oscuro',
      'Integración con eventos reales de MediaPipe, tokens y análisis Physi IA'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '17. Celebración Festiva de Objetivos',
    originalComponent: 'Botones simples sin feedback visual de logro o avance',
    originalFile: 'src/components/ui/ConfettiButton.tsx',
    evolvedComponent: 'Magic UI / Canvas Confetti (ConfettiSideCannons)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Disparo simultáneo continuo desde ambos bordes de la pantalla (ángulos 60° y 120°)',
      'Paleta corporativa FisioMirror (teal primario, esmeralda, kinetic lime y cian)',
      'Física fluida mediante requestAnimationFrame sin saturar el render loop',
      'Ideal para altas médicas, superación de rangos articulares y rachas semanales'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '18. Resaltador Dinámico de Texto',
    originalComponent: 'Clases estáticas bg-yellow-200 o subrayados planos HTML',
    originalFile: 'src/components/ui/Highlighter.tsx',
    evolvedComponent: 'Magic UI / Rough Notation (Highlighter)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Trazos orgánicos vectoriales simulando marcador manual cuando entra en viewport',
      'Siete modos visuales: highlight, underline, box, circle, bracket, strike-through, crossed-off',
      'Variantes clínicas semánticas (warning, success, accent, info) para diagnósticos',
      'Integración con ResizeObserver para mantener el trazo fiel en cualquier resolución'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '19. Botón de Desplazamiento Interactivo',
    originalComponent: 'Botones tradicionales sin transiciones de cursor dinámicas',
    originalFile: 'src/components/ui/InteractiveHoverButton.tsx',
    evolvedComponent: 'Magic UI (InteractiveHoverButton)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Microinteracción de expansión radial con círculo de acento en hover',
      'Transición deslizante del texto con icono de flecha hacia adelante',
      'Compatibilidad total de foco y accesibilidad para teclado',
      'Ideal para CTAs principales de navegación (Iniciar Espejo AR, Guardar Rutina)'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '20. Tipografía Cinética por Proximidad',
    originalComponent: 'Títulos h1/h2 estáticos sin interactividad tipográfica',
    originalFile: 'src/components/ui/KineticText.tsx',
    evolvedComponent: 'Magic UI (KineticText)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Deformación letra por letra del font-weight (de 300 a 900) por proximidad del cursor',
      'Padding y trazos webkit dinámicos en cascada vecina (has:selector)',
      'Soporte polimórfico (h1, h2, h3, p, span) y accesibilidad para lectores de pantalla',
      'Aporta sensación vanguardista y tecnológica a cabeceras de bienvenida'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '21. Rayos de Luz Atmosféricos',
    originalComponent: 'Fondos planos o degradados estáticos sin vida',
    originalFile: 'src/components/ui/LightRays.tsx',
    evolvedComponent: 'Magic UI (LightRays)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Haces de luz oscilantes con balanceo angular y desvanecimiento progresivo',
      'Luces radiales ambientales superiores combinadas con color-mix srgb',
      'Control de desenfoque, velocidad de ciclo, cantidad de haces y longitud',
      'Crea una atmósfera clínica premium en login y modo espejo'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '22. Contador Numérico con Resortes',
    originalComponent: 'Números estáticos que saltan de golpe sin interpolación',
    originalFile: 'src/components/ui/NumberTicker.tsx',
    evolvedComponent: 'Magic UI (NumberTicker)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Física de resortes (damping & stiffness) para transición numérica fluida',
      'Soporte startValue, prefijos, sufijos, decimales y cuenta regresiva o ascendente',
      'Activación automática al entrar en viewport con useInView',
      'Ideal para ángulos de ROM (articulaciones), adherencia (%) y pacientes activos'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '23. Tarjeta Iluminada MagicCard',
    originalComponent: 'Tarjetas con bordes planos y sin respuesta al cursor',
    originalFile: 'src/components/ui/MagicCard.tsx',
    evolvedComponent: 'Magic UI (MagicCard)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Modo Dual: Brillo dinámico de gradiente radial o efecto Orb luminoso difuminado',
      'Física de seguimiento del cursor suave mediante useSpring sin saltos bruscos',
      'Integración con modo oscuro/claro y borde degradado perimetral',
      'Eleva la jerarquía visual de accesos rápidos y resúmenes clínicos'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '24. Imagen Pixelada con Revelación Gradual',
    originalComponent: 'Imágenes estáticas con carga abrupta sin feedback visual',
    originalFile: 'src/components/ui/PixelImage.tsx',
    evolvedComponent: 'Magic UI (PixelImage)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'División de la imagen en cuadrícula poligonal clip-path (6x4, 8x8, 8x3, etc.)',
      'Aparición escalonada aleatoria de cada fragmento con transición suave',
      'Transición opcional de escala de grises a color vibrante',
      'Ideal para avatares de pacientes, terapeutas o modelos de rehabilitación'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '25. Botón Pulsante Dinámico',
    originalComponent: 'Botones planos sin jerarquía visual en pantallas densas',
    originalFile: 'src/components/ui/Button.tsx',
    evolvedComponent: 'Magic UI (PulsatingButton)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Ondas de pulso concéntricas o efecto ripple expansivo infinito',
      'Cálculo adaptativo de color de fondo mediante MutationObserver reactivo',
      'Atrae inmediatamente la atención hacia la acción principal (Iniciar AR / Calibración)',
      'Diseño táctil calibrado con tokens de FisioMirror y accesibilidad'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '26. Barra de Progreso de Desplazamiento',
    originalComponent: 'Barras estándar del navegador o ausencia total de indicador',
    originalFile: 'src/components/ui/ScrollProgress.tsx',
    evolvedComponent: 'Magic UI / Motion (ScrollProgress)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Rastreo continuo de scrollYProgress mediante aceleración GPU con scaleX',
      'Gradiente canónico FisioMirror (teal-600 a cian y kinetic lime #c1ff72)',
      'Soporte fijo superior global o anclado a un contenedor con scroll local',
      'Ideal para guías clínicas, protocolos de ejercicios y expedientes extensos'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '27. Botón con Brillo Deslizante',
    originalComponent: 'Botones sólidos oscuros sin dinamismo prémium',
    originalFile: 'src/components/ui/ShimmerButton.tsx',
    evolvedComponent: 'Magic UI (ShimmerButton)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Efecto de brillo cónico en rotación continua con conic-gradient a 360°',
      'Profundidad con sombras interiores biseladas y aceleración por GPU',
      'Ideal para acciones de alta prioridad: Generar Informes IA y Exportar PDF',
      'Totalmente responsive y estilizado con la identidad médica de FisioMirror'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '28. Borde Brillante Animado',
    originalComponent: 'Bordes planos estáticos sin realce dinámico',
    originalFile: 'src/components/ui/ShineBorder.tsx',
    evolvedComponent: 'Magic UI (ShineBorder)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Gradiente radial animado que recorre continuamente el perímetro del contenedor',
      'Máscara CSS doble (content-box vs border-box) con exclusión XOR nativa',
      'Soporte para múltiples colores en array (teal, cian, kinetic lime)',
      'Acentúa tarjetas de login, informes de IA y alertas biomecánicas críticas'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '29. Texto con Destellos Mágicos',
    originalComponent: 'Títulos estáticos sin elementos festivos o gamificados',
    originalFile: 'src/components/ui/SparklesText.tsx',
    evolvedComponent: 'Magic UI (SparklesText)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Destellos y estrellas vectoriales que nacen, giran y escalan aleatoriamente',
      'Colores adaptados a la paleta médica (teal #0d9488 y kinetic lime #c1ff72)',
      'Ciclo de vida dinámico optimizado con temporizador no bloqueante',
      'Refuerzo positivo para celebraciones de logros, rachas y objetivos cumplidos'
    ],
    status: 'Activo en Galería'
  },
  {
    category: '30. Texto Animado por Segmentos',
    originalComponent: 'Textos que aparecen de golpe sin transición tipográfica',
    originalFile: 'src/components/ui/TextAnimate.tsx',
    evolvedComponent: 'Magic UI (TextAnimate)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'Segmentación por palabra, carácter, línea o texto completo con retardo escalonado',
      '10 variantes cinematográficas: blurIn, blurInUp, slideUp, scaleUp, fadeIn, etc.',
      'Soporte estricto de accesibilidad con texto oculto sr-only y aria-hidden',
      'Perfecto para saludos de bienvenida, títulos diagnósticos y mensajes de IA'
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

  // Estados interactivos para los 7 Nuevos Componentes
  const [highlighterAction, setHighlighterAction] = useState<AnnotationAction>('highlight');
  const [highlighterKey, setHighlighterKey] = useState(0);
  const [magicCardMode, setMagicCardMode] = useState<'gradient' | 'orb'>('gradient');
  const [pixelGridKey, setPixelGridKey] = useState<'6x4' | '8x8' | '8x3'>('6x4');
  const [pixelReplayKey, setPixelReplayKey] = useState(0);
  const [tickerRomValue, setTickerRomValue] = useState(132);
  const [kineticInputText, setKineticInputText] = useState('FisioMirror');

  // Estados interactivos para la nueva suite de 6 componentes
  const [pulsatingVariant, setPulsatingVariant] = useState<'pulse' | 'ripple'>('pulse');
  const [pulsatingColor, setPulsatingColor] = useState<string>('rgba(13, 148, 136, 0.6)');
  const [textAnimateType, setTextAnimateType] = useState<AnimationType>('word');
  const [textAnimateVariant, setTextAnimateVariant] = useState<AnimationVariant>('blurInUp');
  const [textAnimateKey, setTextAnimateKey] = useState(0);
  const [sparklesWord, setSparklesWord] = useState('¡Rehabilitación Completada!');

  // Estados interactivos para la Suite Estelar Biomecánica & Gamificación (8 Componentes)
  const [gaugeAngle, setGaugeAngle] = useState(128);
  const [gaugeTarget, setGaugeTarget] = useState(135);
  const [gaugeJoint, setGaugeJoint] = useState('Rodilla Derecha');
  const [dockSelectedJoint, setDockSelectedJoint] = useState('Rodilla');
  const [springReps, setSpringReps] = useState(12);
  const [energyLevel, setEnergyLevel] = useState(78);
  const [fatigueLevel, setFatigueLevel] = useState(3.2);
  const [alertSeverity, setAlertSeverity] = useState<'mild' | 'moderate' | 'high'>('moderate');

  // Estado para la Macro Suite de 50 Componentes
  const [megaSuiteCategory, setMegaSuiteCategory] = useState<'all' | 'actividad' | 'realtime' | 'flotantes' | 'gamificacion' | 'navegacion'>('all');

  // Estado para Armonización Pastel Clínica
  const [activePastelDemo, setActivePastelDemo] = useState<'sky' | 'mint' | 'lavender' | 'gradient'>('mint');
  const [pastelFinish, setPastelFinish] = useState<'glass' | 'solid'>('glass');

  // Estado para PWA Móvil & Físicas de Resorte
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetSnap, setBottomSheetSnap] = useState<BottomSheetSnapPoint>('medium');
  const [bottomSheetVariant, setBottomSheetVariant] = useState<'default' | 'pastel-mint' | 'pastel-sky' | 'pastel-lavender'>('pastel-mint');
  const [compactJoint, setCompactJoint] = useState('rodilla');
  const [compactRom, setCompactRom] = useState(125);
  const [compactTolerance, setCompactTolerance] = useState<'strict' | 'standard' | 'relaxed'>('standard');

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'todos', label: 'Todos los Componentes', icon: <Layers className="w-4 h-4" /> },
    { id: 'megasuite', label: 'Macro Suite (50)', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, count: 50 },
    { id: 'mobile', label: 'PWA Móvil & Motion', icon: <Smartphone className="w-4 h-4 text-emerald-400" />, count: 6 },
    { id: 'armonizacion', label: 'Armonización Pastel', icon: <Sparkles className="w-4 h-4 text-sky-400" />, count: 12 },
    { id: 'estelar', label: 'Suite Estelar', icon: <Activity className="w-4 h-4 text-emerald-400" />, count: 8 },
    { id: 'solicitados', label: 'Suite Previa', icon: <Sparkles className="w-4 h-4" />, count: 30 },
    { id: 'comparativa', label: 'Inventario & Mapeo', icon: <Search className="w-4 h-4" />, count: INVENTORY_COMPARISONS.length },
    { id: 'botones', label: 'Botones Evolved', icon: <Zap className="w-4 h-4" /> },
    { id: 'tarjetas', label: 'Tarjetas & Bento', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'modales', label: 'Modales Glass', icon: <Eye className="w-4 h-4" /> },
    { id: 'entradas', label: 'Inputs & OTP', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'clinicos', label: 'Controles Clínicos', icon: <Sliders className="w-4 h-4" /> },
    { id: 'luces', label: 'Tipografía & Luces', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#090d12] text-on-surface p-4 sm:p-6 lg:p-10 transition-colors">
      {/* 26. Barra de Progreso de Desplazamiento Global */}
      <ScrollProgress />

      <div className="fm-page max-w-6xl">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Volver</span>
            </BackButton>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  FisioMirror UI Lab
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
                  Ecosistema CLI / MCP Activo
                </span>
                <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Reaviz · HeroUI · Magic UI · Aceternity
                </span>
              </div>
              <h1 className="fm-title mt-1 flex items-center gap-2">
                Galería de Componentes Evolved
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
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
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">Componentes Usados</span>
            <div className="text-xl sm:text-2xl font-black text-on-surface tabular-nums flex items-baseline gap-1">
              <span>72</span>
              <span className="text-2xs font-medium text-on-surface-variant">en FisioMirror</span>
            </div>
          </div>
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">Nuevos Solicitados</span>
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tabular-nums flex items-baseline gap-1">
              <span>12</span>
              <span className="text-2xs font-medium text-teal-500/80">integrados 100%</span>
            </div>
          </div>
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">Gráficos Vectoriales</span>
            <div className="text-xl sm:text-2xl font-black text-lime-600 dark:text-lime-400 tabular-nums flex items-baseline gap-1">
              <span>Reaviz</span>
              <span className="text-2xs font-medium text-on-surface-variant">Áreas Suaves</span>
            </div>
          </div>
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">Micro-interacción</span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums flex items-baseline gap-1">
              <span>&lt; 300ms</span>
              <span className="text-2xs font-medium text-on-surface-variant">Regla Oro</span>
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
                  ? 'bg-primary text-on-primary shadow-sm shadow-teal-600/30'
                  : 'bg-white/60 dark:bg-slate-800/60 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-2xs bg-white/20 text-white font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MACRO SUITE: 50 NUEVOS COMPONENTES EN 5 CATEGORÍAS MODULARES
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'megasuite') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-cyan-500/10 via-surface/70 to-surface border border-cyan-500/30 shadow-elevated">
            {/* Header de la Macro Suite */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    Macro Suite FisioMirror (50 Componentes)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  Catálogo masivo de 50 componentes modulares creados con HeroUI, Magic UI y DaisyUI para dashboards clínicos, telemetría MediaPipe, microinteracciones táctiles, gamificación y docks AR.
                </p>
              </div>

              {/* Sub-selector de las 5 Macro Categorías */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'Todos (50)' },
                  { id: 'actividad', label: '1. Diagnóstico (10)' },
                  { id: 'realtime', label: '2. En Tiempo Real (10)' },
                  { id: 'flotantes', label: '3. Flotantes & Popovers (10)' },
                  { id: 'gamificacion', label: '4. Gamificación (10)' },
                  { id: 'navegacion', label: '5. Docks & Menús (10)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMegaSuiteCategory(cat.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      megaSuiteCategory === cat.id
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:text-on-surface dark:hover:text-white"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORÍA 1: TARJETAS DE ACTIVIDAD Y DIAGNÓSTICO (1 - 10) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'actividad') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-cyan-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Categoría 1: Tarjetas de Actividad y Diagnóstico Clínico (10 Componentes)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MegaSuite.MuscleTargetRadarCard />
                  <MegaSuite.PainScaleInteractiveCard />
                  <MegaSuite.GaitSymmetryCard />
                  <MegaSuite.TremorFrequencyCard />
                  <MegaSuite.PostureStabilityCard />
                  <MegaSuite.CardioEffortPillCard />
                  <MegaSuite.RehabPhaseStepCard />
                  <MegaSuite.EdemaAssessmentCard />
                  <MegaSuite.StrengthProgressionCard />
                  <MegaSuite.PatientAdherenceHeatmapCard />
                </div>
              </div>
            )}

            {/* CATEGORÍA 2: PANELES Y MÉTRICAS EN TIEMPO REAL (11 - 20) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'realtime') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-teal-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Categoría 2: Paneles y Métricas en Tiempo Real (MediaPipe / IA) (10 Componentes)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MegaSuite.PoseConfidenceLiveIndicator />
                  <MegaSuite.AngularVelocityStreamGauge />
                  <MegaSuite.ROMDeviationLiveChart />
                  <MegaSuite.VoiceFeedbackWaveHUD />
                  <MegaSuite.CameraFramingGuideHUD />
                  <MegaSuite.RepCadenceMetronome />
                  <MegaSuite.AIBiomechanicalSummaryBadge />
                  <MegaSuite.SkeletonJointSelectorHUD />
                  <MegaSuite.HoldDurationTimerRing />
                  <MegaSuite.SessionQualityScoreTile />
                </div>
              </div>
            )}

            {/* CATEGORÍA 3: MICROINTERACCIONES Y CONTROLES FLOTANTES (21 - 30) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'flotantes') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Categoría 3: Microinteracciones y Controles Flotantes Contextuales (10 Componentes)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-container-low/40">
                  <MegaSuite.JointAnatomyTooltip />
                  <MegaSuite.ARCameraFilterDropdown />
                  <MegaSuite.RapidToleranceAdjuster />
                  <MegaSuite.AudioMuteFloatingPill />
                  <MegaSuite.ExerciseSwitchFloatingMenu />
                  <MegaSuite.PhysioNoteAnnotationBubble />
                  <MegaSuite.QuickPrescriptionModalButton />
                  <MegaSuite.BiomechanicalTagSelector />
                  <MegaSuite.CalibrationCompass />
                  <MegaSuite.FloatingMiniStopwatch />
                </div>
              </div>
            )}

            {/* CATEGORÍA 4: GAMIFICACIÓN Y MOTIVACIÓN (31 - 40) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'gamificacion') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Categoría 4: Gamificación, Rachas y Motivación para Pacientes (10 Componentes)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MegaSuite.StreakFlameCounter />
                  <MegaSuite.LevelProgressRibbon />
                  <MegaSuite.MilestoneCelebrationModal />
                  <MegaSuite.MobilityQuestCard />
                  <MegaSuite.VirtualTrophyCabinet />
                  <MegaSuite.DailyHealthPointsWidget />
                  <MegaSuite.RehabHeroAvatarCard />
                  <div className="flex items-center justify-center p-4 rounded-3xl bg-surface-container-low">
                    <MegaSuite.CheerReactionButton />
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-3xl bg-surface-container-low">
                    <MegaSuite.RecoveryRankBadge />
                  </div>
                  <MegaSuite.UnlockableExerciseLocker />
                </div>
              </div>
            )}

            {/* CATEGORÍA 5: DOCKS Y NAVEGACIÓN ERGONÓMICA (41 - 50) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'navegacion') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Categoría 5: Docks, Barras de Herramientas y Navegación Ergonómica (10 Componentes)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-container-low/40">
                  <MegaSuite.CurvedMobileDock />
                  <div className="flex items-center justify-center">
                    <MegaSuite.TherapistSidebarMini />
                  </div>
                  <MegaSuite.QuickPatientSwitcherBar />
                  <div className="flex items-center justify-center">
                    <MegaSuite.SessionStateBreadcrumb />
                  </div>
                  <div className="flex items-center justify-center">
                    <MegaSuite.SplitViewPerspectiveToggle />
                  </div>
                  <div className="flex items-center justify-center">
                    <MegaSuite.FloatingHelpBeacon />
                  </div>
                  <div className="flex items-center justify-center">
                    <MegaSuite.ErgonomicHandModeSwitcher />
                  </div>
                  <MegaSuite.CompactTelehealthBar />
                  <MegaSuite.ExerciseTimelineScrubber />
                  <div className="flex items-center justify-center">
                    <MegaSuite.ContextualActionIsland />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            NUEVA SECCIÓN ESTELAR: 8 COMPONENTES BIOMECÁNICOS, AR & GAMIFICACIÓN
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'estelar') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-teal-500/10 via-surface/60 to-surface border border-teal-500/30 shadow-card">
            {/* Header de la Suite Estelar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-teal-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
                    <Activity className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    Suite Estelar de Innovación FisioMirror
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  8 componentes de vanguardia para rehabilitación física con IA: arcos biomecánicos continuos, dock flotante AR no intrusivo, barras de fatiga muscular, gamificación 3D y herramientas clínicas para fisioterapeutas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  8 / 8 Nuevos y Operativos
                </span>
              </div>
            </div>

            {/* Fila 1: BiomechanicalAngleGauge & RepetitionCounterSpring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. BiomechanicalAngleGauge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-500" />
                    1. Medidor Biomecánico Continuo (BiomechanicalAngleGauge)
                  </h3>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Arco SVG graduado con semáforo biomecánico continuo (verde para rango seguro, amarillo para compensación moderada, rojo para alerta de dolor).
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                    <BiomechanicalAngleGauge
                      currentAngle={gaugeAngle}
                      targetAngle={gaugeTarget}
                      minAngle={0}
                      maxAngle={180}
                      safeTolerance={8}
                      jointName={gaugeJoint}
                    />

                    {/* Interactive Simulator Controls */}
                    <div className="flex-1 w-full space-y-3 p-4 rounded-2xl bg-surface-container-low/60 dark:bg-slate-900/60 border border-outline-variant/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                        Simulador de Ángulo en Vivo:
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-on-surface-variant">Ángulo Actual:</span>
                          <span className="font-bold text-teal-600 dark:text-teal-400">{gaugeAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={170}
                          value={gaugeAngle}
                          onChange={(e) => setGaugeAngle(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-on-surface-variant">Meta Prescrita:</span>
                          <span className="font-bold text-primary">{gaugeTarget}°</span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={160}
                          value={gaugeTarget}
                          onChange={(e) => setGaugeTarget(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 flex gap-1.5">
                        {['Rodilla Derecha', 'Codo Izquierdo', 'Hombro'].map((j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => setGaugeJoint(j)}
                            className={cn(
                              "px-2 py-1 rounded-lg text-2xs font-semibold border transition-all",
                              gaugeJoint === j
                                ? "bg-primary text-on-primary border-primary"
                                : "bg-white/60 dark:bg-slate-800 text-on-surface-variant border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {j}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. RepetitionCounterSpring */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-500" />
                    2. Contador con Físicas de Resorte (RepetitionCounterSpring)
                  </h3>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Contador cinético de alta visibilidad para modo espejo AR con física de rebote elástica en cada repetición válida detectada por IA y control de cadencia.
                  </p>

                  <RepetitionCounterSpring
                    currentReps={springReps}
                    targetReps={15}
                    cadenceSeconds={3.0}
                    onIncrement={() => setSpringReps((r) => r + 1)}
                    onReset={() => setSpringReps(0)}
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: ARFloatingDock & TherapistQuickToolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-teal-500/20">
              {/* 3. ARFloatingDock */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  3. Dock Flotante Contextual AR (ARFloatingDock)
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[190px]">
                  <p className="text-xs text-on-surface-variant text-center max-w-md">
                    Diseñado para la parte inferior del modo espejo AR. Magnifica íconos en hover y permite alternar articulación y audio sin obstruir la vista clínica.
                  </p>
                  
                  <ARFloatingDock
                    currentJoint={dockSelectedJoint}
                    onSelectJoint={(j) => setDockSelectedJoint(j)}
                  />
                </div>
              </div>

              {/* 4. TherapistQuickToolbar */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  4. Barra Rápida de Terapeuta (TherapistQuickToolbar)
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[190px]">
                  <p className="text-xs text-on-surface-variant text-center max-w-md">
                    Panel colapsable con microinteracción elástica para pausar la sesión, tomar capturas de postura, dictar notas de voz y calibrar metas ROM.
                  </p>

                  <TherapistQuickToolbar />
                </div>
              </div>
            </div>

            {/* Fila 3: RehabEnergyBar & CompensationAlertBanner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-teal-500/20">
              {/* 5. RehabEnergyBar */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  5. Barra de Fatiga y Energía Muscular (RehabEnergyBar)
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <RehabEnergyBar
                    currentEnergy={energyLevel}
                    fatigueScore={fatigueLevel}
                    repsCompleted={springReps}
                    totalTargetReps={20}
                  />

                  {/* Energy simulator sliders */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-2xs uppercase font-bold text-on-surface-variant block mb-1">
                        Energía: {energyLevel}%
                      </span>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-2xs uppercase font-bold text-on-surface-variant block mb-1">
                        Fatiga: {fatigueLevel.toFixed(1)}/10
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={fatigueLevel}
                        onChange={(e) => setFatigueLevel(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. CompensationAlertBanner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-500" />
                    6. Monitor de Compensaciones Posturales (CompensationAlertBanner)
                  </h3>
                  <div className="flex gap-1">
                    {(['mild', 'moderate', 'high'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAlertSeverity(s)}
                        className={cn(
                          "px-2 py-0.5 rounded text-2xs font-bold capitalize transition-all",
                          alertSeverity === s ? "bg-primary text-on-primary" : "bg-slate-200 dark:bg-slate-800 text-on-surface-variant"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant">
                    Alerta semántica de biofeedback en tiempo real cuando MediaPipe detecta compensaciones o trampas motoras durante el ejercicio.
                  </p>

                  <CompensationAlertBanner
                    deviationJoint="Escápula & Hombro Izquierdo"
                    detectedIssue="Elevación excesiva de trapecio durante la rotación externa."
                    recommendedCorrection="Desciende el hombro, activa dorsal y mantén el codo adherido al torso antes de iniciar la fase concéntrica."
                    severity={alertSeverity}
                  />
                </div>
              </div>
            </div>

            {/* Fila 4: GamifiedBadgeCard & JointDetailPopover */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-teal-500/20">
              {/* 7. GamifiedBadgeCard */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  7. Tarjeta Holográfica 3D de Logros (GamifiedBadgeCard)
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant">
                    Efecto interactivo de inclinación tridimensional (3D tilt) según la posición del cursor, con emblema holográfico y reclamo de XP para incentivar la adherencia del paciente.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GamifiedBadgeCard
                      title="Maestro de Movilidad"
                      category="Rango Articular"
                      description="Completaste 5 sesiones consecutivas superando los 120° de flexión segura."
                      level={4}
                      xpPoints={300}
                      unlocked={true}
                      iconName="trophy"
                    />

                    <GamifiedBadgeCard
                      title="Postura Impecable"
                      category="Biomecánica"
                      description="0 compensaciones detectadas por MediaPipe en una serie completa de 15 reps."
                      level={2}
                      xpPoints={150}
                      unlocked={true}
                      iconName="sparkles"
                    />
                  </div>
                </div>
              </div>

              {/* 8. JointDetailPopover */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  8. Popover Flotante de Desglose Articular (JointDetailPopover)
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[260px]">
                  <p className="text-xs text-on-surface-variant text-center max-w-sm mb-2">
                    Permite anclar sobre cualquier articulación un panel flotante que expone ROM actual, velocidad angular y asimetría respecto al lado contralateral sin bloquear la cámara.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <JointDetailPopover
                      triggerLabel="Inspeccionar Rodilla Derecha"
                      metrics={{
                        jointName: 'Rodilla Derecha (Flexión)',
                        currentRom: gaugeAngle,
                        maxHistoricalRom: 135,
                        angularVelocity: 48,
                        asymmetryPercentage: 6,
                        status: 'normal',
                      }}
                    />

                    <JointDetailPopover
                      triggerLabel="Inspeccionar Hombro Izquierdo"
                      metrics={{
                        jointName: 'Hombro Izquierdo (Abducción)',
                        currentRom: 112,
                        maxHistoricalRom: 120,
                        angularVelocity: 36,
                        asymmetryPercentage: 14,
                        status: 'warning',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PWA MÓVIL DE ALTA DENSIDAD & MOTOR DE MOTION PRÉMIUM
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'mobile') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-surface border border-emerald-500/25 shadow-elevated">
            {/* Header de la Suite Móvil */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    PWA Móvil de Alta Densidad & Físicas de Resorte (Spring Motion)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  Erradicación del scroll infinito mediante cajones inferiores deslizables (bottom sheets con snap points), barra inferior fija ergonómica para el pulgar, selectores compactos de 1-toque y animaciones orgánicas estilo Magic UI / 21st.dev.
                </p>
              </div>

              {/* Botón de Activación del Bottom Sheet en Vivo */}
              <div className="flex items-center gap-2 flex-wrap">
                <TactileFeedback>
                  <button
                    type="button"
                    onClick={() => setIsBottomSheetOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-card shadow-teal-600/25 border border-teal-400/40"
                  >
                    <Sliders className="size-4" />
                    <span>Abrir Bottom Sheet Móvil</span>
                  </button>
                </TactileFeedback>
              </div>
            </div>

            {/* Demostración 1: Selectores Compactos de Alta Densidad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    1. Selectores Compactos de 1-Toque (Reemplazo de Formularios Largos)
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Diseñados para sustituir inputs pequeños y desplegables torpes en smartphones.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selector Segmentado de Articulación */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <CompactJointSelector
                    selectedJoint={compactJoint}
                    onSelectJoint={(j) => setCompactJoint(j)}
                  />
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Seleccionada:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 uppercase">{compactJoint}</span>
                  </div>
                </div>

                {/* Stepper Táctil de ROM con Físicas */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <CompactRomStepper
                    value={compactRom}
                    onChange={(val) => setCompactRom(val)}
                    min={30}
                    max={170}
                    step={5}
                    label="Meta ROM Articular"
                  />
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Estado Clínico:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Rango Seguro (+12%)</span>
                  </div>
                </div>

                {/* Dropdown Popover de Tolerancia IA */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block px-1">
                      Calibración MediaPipe
                    </span>
                    <CompactToleranceDropdown
                      tolerance={compactTolerance}
                      onChange={(t) => setCompactTolerance(t)}
                    />
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Sensibilidad:</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                      {compactTolerance === 'strict' ? '±3° Exacta' : compactTolerance === 'standard' ? '±7° Estándar' : '±12° Asistida'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demostración 2: Wrappers de Motion & Microinteracciones Táctiles */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                2. Wrappers de Motion: Blur-Fade & Tactile Spring Feedback
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Blur-Fade InView Demo */}
                <MotionBlurFade delay={0.1} className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-surface/90 to-sky-50/40 dark:from-teal-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-teal-200/50 dark:border-teal-500/25 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                      MotionBlurFade Wrapper
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">ease: [0.16, 1, 0.3, 1]</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">
                    Revelación Progresiva con Desenfoque Dinámico
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Las estadísticas y reportes médicos aparecen fluidamente desde un desenfoque sutil (6px blur) con física amortiguada, reduciendo la carga cognitiva en móviles.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-teal-500 to-sky-400 rounded-full" />
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">80%</span>
                  </div>
                </MotionBlurFade>

                {/* TactileFeedback Interactive Demo */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      TactileFeedback Wrapper
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">stiffness: 420 · damping: 18</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">
                    Respuesta Táctil Visual Inmediata
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Toca o haz clic sobre los botones de prueba para sentir la física de resorte optimizada sin retardo de interacción:
                  </p>
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <TactileFeedback>
                      <button
                        type="button"
                        onClick={() => {
                          setCompactRom((r) => Math.min(180, r + 5));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs"
                      >
                        +5° ROM Rápido
                      </button>
                    </TactileFeedback>

                    <TactileFeedback>
                      <button
                        type="button"
                        onClick={() => {
                          setCompactRom((r) => Math.max(30, r - 5));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-on-surface font-bold text-xs border border-slate-200 dark:border-slate-700"
                      >
                        -5° ROM Rápido
                      </button>
                    </TactileFeedback>

                    <TactileFeedback>
                      <button
                        type="button"
                        onClick={() => setIsBottomSheetOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-500/30"
                      >
                        Probar Bottom Sheet
                      </button>
                    </TactileFeedback>
                  </div>
                </div>
              </div>
            </div>

            {/* Demostración 3: Previsualización de la Barra Fija Inferior (MobileFixedDock) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                3. Barra Fija Inferior Ergonómica (MobileFixedDock)
              </h3>
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs text-on-surface-variant">
                  Ubicada rígidamente en la base de la pantalla móvil (debajo de esta vista). Permite cambiar de módulo instantáneamente con el pulgar e iniciar la sesión de Espejo AR con un toque central prominente.
                </p>
                <div className="max-w-md mx-auto p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-around text-center text-2xs font-bold text-on-surface-variant">
                  <div className="py-1 px-3 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300">
                    <Home className="size-4 mx-auto mb-0.5" />
                    <span>Inicio</span>
                  </div>
                  <div className="py-1 px-3">
                    <Users className="size-4 mx-auto mb-0.5" />
                    <span>Pacientes</span>
                  </div>
                  <div className="size-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-400 text-white flex flex-col items-center justify-center -mt-3 shadow-md">
                    <Camera className="size-4" />
                    <span className="text-2xs">AR</span>
                  </div>
                  <div className="py-1 px-3">
                    <Dumbbell className="size-4 mx-auto mb-0.5" />
                    <span>Ejercicios</span>
                  </div>
                  <div className="py-1 px-3">
                    <Sparkles className="size-4 mx-auto mb-0.5" />
                    <span>Physi IA</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Componente Modal Bottom Sheet Renderizado en Vivo para la Demostración */}
        <MobileBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          title="Ficha Rápida & Calibración Móvil"
          subtitle="Ajuste ergonómico sin scroll infinito"
          icon={<Sliders className="size-5" />}
          snapPoint={bottomSheetSnap}
          onSnapPointChange={(snap) => setBottomSheetSnap(snap)}
          variant={bottomSheetVariant}
          footerActions={
            <>
              <button
                type="button"
                onClick={() => setIsBottomSheetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cerrar
              </button>
              <TactileFeedback>
                <button
                  type="button"
                  onClick={() => {
                    setIsBottomSheetOpen(false);
                    navigate('/ar-mirror');
                  }}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30"
                >
                  Iniciar AR Mirror
                </button>
              </TactileFeedback>
            </>
          }
        >
          <div className="space-y-4">
            {/* Controles de snap point dentro del sheet */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-on-surface">
                Nivel de Altura (Snap Point):
              </span>
              <div className="flex items-center gap-1">
                {(['peek', 'medium', 'full'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBottomSheetSnap(s)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all',
                      bottomSheetSnap === s
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {s === 'peek' ? 'Compacto (35%)' : s === 'medium' ? 'Medio (65%)' : 'Completo (92%)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selectores Compactos embebidos */}
            <CompactJointSelector
              selectedJoint={compactJoint}
              onSelectJoint={(j) => setCompactJoint(j)}
            />

            <CompactRomStepper
              value={compactRom}
              onChange={(val) => setCompactRom(val)}
              label="Objetivo ROM en Sesión Móvil"
            />

            <CompactToleranceDropdown
              tolerance={compactTolerance}
              onChange={(t) => setCompactTolerance(t)}
            />

            {/* Resumen clínico en sheet */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-500/25 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Informe Biomecánico
                </span>
                <span className="text-2xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  IA Activa
                </span>
              </div>
              <p className="text-xs text-teal-950 dark:text-teal-100 font-medium">
                Listo para iniciar sesión de {compactJoint} a {compactRom}° con tolerancia {compactTolerance}. Arrastra la barra superior hacia abajo para cerrar o cambiar el nivel de altura.
              </p>
            </div>
          </div>
        </MobileBottomSheet>

        {/* ─────────────────────────────────────────────────────────────
            ARMONIZACIÓN CROMÁTICA PASTEL CLÍNICA: SOFT SKY, MINT & LAVENDER
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'armonizacion') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-sky-500/10 via-teal-500/5 to-surface border border-sky-500/25 shadow-elevated">
            {/* Header de la Armonización */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sky-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    Armonización Cromática Pastel Clínica (FisioMirror Design System)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  Reemplazo de los fondos blancos y grises fríos por una paleta médica cálida y tecnológica: celeste suave (soft sky), menta/turquesa (mint/teal) y azul lavanda sutil. Alternancia entre vidrio translúcido con gradiente y capas sólidas para tarjetas secundarias y badges.
                </p>
              </div>

              {/* Selector interactivo de tono y acabado */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40">
                  {(['sky', 'mint', 'lavender', 'gradient'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setActivePastelDemo(tone)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all",
                        activePastelDemo === tone
                          ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
                      )}
                    >
                      {tone === 'sky' ? 'Celeste' : tone === 'mint' ? 'Menta' : tone === 'lavender' ? 'Lavanda' : 'Gradiente'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40">
                  <button
                    type="button"
                    onClick={() => setPastelFinish('glass')}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
                      pastelFinish === 'glass'
                        ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
                    )}
                  >
                    Translúcido Glass
                  </button>
                  <button
                    type="button"
                    onClick={() => setPastelFinish('solid')}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
                      pastelFinish === 'solid'
                        ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
                    )}
                  >
                    Capa Sólida
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 1: Las 3 Familias Cromáticas Pastel en Vivo (HarmonizedSurface) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Celeste Pastel (Soft Sky) */}
              <HarmonizedSurface
                variant={pastelFinish === 'glass' ? 'pastel-sky' : 'card'}
                className={cn(
                  "p-5 rounded-2xl relative overflow-hidden transition-all duration-300",
                  pastelFinish === 'solid' && CLINICAL_PASTELS.sky.solid,
                  activePastelDemo === 'sky' && "ring-2 ring-sky-400/60 shadow-card"
                )}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold ring-2 ring-sky-400/30">
                    <Activity className="size-5" />
                  </div>
                  <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300">
                    Soft Sky
                  </span>
                </div>
                <h3 className="text-sm font-bold text-sky-950 dark:text-sky-100 mb-1">
                  Celeste Pastel Clínico
                </h3>
                <p className="text-xs text-sky-700/80 dark:text-sky-300/80 mb-4 leading-relaxed">
                  Ideal para telemetría, monitoreo articular en tiempo real y métricas respiratorias/oximetría.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-sky-200/50 dark:border-sky-500/20 text-xs font-semibold">
                  <span className="text-sky-800 dark:text-sky-200">Ángulo ROM</span>
                  <span className="font-mono font-black text-sky-600 dark:text-sky-300">128.4° (+4.2%)</span>
                </div>
              </HarmonizedSurface>

              {/* Menta / Turquesa Suave (Mint/Teal) */}
              <HarmonizedSurface
                variant={pastelFinish === 'glass' ? 'pastel-mint' : 'card'}
                className={cn(
                  "p-5 rounded-2xl relative overflow-hidden transition-all duration-300",
                  pastelFinish === 'solid' && CLINICAL_PASTELS.mint.solid,
                  activePastelDemo === 'mint' && "ring-2 ring-teal-400/60 shadow-card"
                )}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold ring-2 ring-teal-400/30">
                    <Heart className="size-5" />
                  </div>
                  <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300">
                    Mint / Teal
                  </span>
                </div>
                <h3 className="text-sm font-bold text-teal-950 dark:text-teal-100 mb-1">
                  Menta / Turquesa Pastel
                </h3>
                <p className="text-xs text-teal-700/80 dark:text-teal-300/80 mb-4 leading-relaxed">
                  Eje cromático primario de FisioMirror. Comunica recuperación óptima, adherencia y salud articular activa.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-teal-200/50 dark:border-teal-500/20 text-xs font-semibold">
                  <span className="text-teal-800 dark:text-teal-200">Adherencia Semanal</span>
                  <span className="font-mono font-black text-teal-600 dark:text-teal-300">94.8% (Óptima)</span>
                </div>
              </HarmonizedSurface>

              {/* Azul Lavanda Sutil (Lavender Blue) */}
              <HarmonizedSurface
                variant={pastelFinish === 'glass' ? 'pastel-lavender' : 'card'}
                className={cn(
                  "p-5 rounded-2xl relative overflow-hidden transition-all duration-300",
                  pastelFinish === 'solid' && CLINICAL_PASTELS.lavender.solid,
                  activePastelDemo === 'lavender' && "ring-2 ring-indigo-400/60 shadow-card"
                )}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold ring-2 ring-indigo-400/30">
                    <Sparkles className="size-5" />
                  </div>
                  <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                    Lavender Blue
                  </span>
                </div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-100 mb-1">
                  Azul Lavanda Sutil
                </h3>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mb-4 leading-relaxed">
                  Diseñado para tele-rehabilitación, reportes generados con IA y recordatorios de calma postural.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-indigo-200/50 dark:border-indigo-500/20 text-xs font-semibold">
                  <span className="text-indigo-800 dark:text-indigo-200">Sesiones Guiadas</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-300">18 Completadas</span>
                </div>
              </HarmonizedSurface>
            </div>

            {/* Fila 2: Comparativa Visual Directa "Antes vs Ahora" */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Comparativa Visual: Gris/Blanco Plano vs. Harmonized Pastel Clínico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Antes: Blanco plano / gris aburrido */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-on-surface-variant border border-slate-300 dark:border-slate-700">
                      Estilo Previo (Blanco / Gris Plano)
                    </span>
                    <span className="text-xs text-on-surface-variant">Sin matiz</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-1">
                    Evaluación Postural de Hombro
                  </p>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Contenedor frío y genérico que produce fatiga visual y no transmite calidez médica.
                  </p>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="size-2 rounded-full bg-slate-400" />
                    <span>8 repeticiones registradas sin resaltado sensorial</span>
                  </div>
                </div>

                {/* Ahora: Harmonized Pastel con microgradiente y glow */}
                <HarmonizedSurface
                  variant="pastel-gradient"
                  interactive
                  className="p-5 rounded-2xl relative shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-200 border border-teal-500/30 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                      Evolved (Pastel Trilateral + Glass)
                    </span>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Contraste AAA</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-1">
                    Evaluación Postural de Hombro
                  </p>
                  <p className="text-xs text-on-surface mb-4 leading-relaxed">
                    Elegancia clínica, micro-resplandor bio-adaptativo y contraste nítido garantizado para adultos mayores.
                  </p>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-teal-500" />
                      8 reps perfectas (0 compensaciones)
                    </span>
                    <span className="font-mono text-teal-700 dark:text-teal-300 font-black">98.5% SCORE</span>
                  </div>
                </HarmonizedSurface>
              </div>
            </div>

            {/* Fila 3: Semáforos Biomecánicos & Badges Pastel */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Semáforos Biomecánicos & Badges con Acentos Pastel
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-teal-50/90 dark:bg-teal-950/35 border border-teal-200/80 dark:border-teal-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">Biomecánica</span>
                    <p className="text-xs font-bold text-teal-950 dark:text-teal-100">Rango Seguro</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50/90 dark:bg-sky-950/35 border border-sky-200/80 dark:border-sky-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">Telemetría</span>
                    <p className="text-xs font-bold text-sky-950 dark:text-sky-100">Tracking 60 FPS</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/35 border border-amber-200/80 dark:border-amber-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Compensación</span>
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-100">Elevación Hombro</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/35 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Inteligencia IA</span>
                    <p className="text-xs font-bold text-indigo-950 dark:text-indigo-100">Physi Predictivo</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN ESPECIAL: LOS 30 COMPONENTES PREVIOS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'solicitados') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-teal-500/5 border border-teal-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-500/15">
              <div>
                <span className="text-2xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  Suite Integrada
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Los 12 Componentes Solicitados con Temática FisioMirror
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Implementación funcional adaptada a la paleta médica (Teal, Azure, Kinetic Lime) y tipografías oficiales.
                </p>
              </div>
            </div>

            {/* 1. Tarjeta de Reportes con Gráficos Reaviz */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    3. Sistema de Alertas de HeroUI (Alert)
                  </h3>
                </div>
                <BasicAlertsDemo />
              </div>

              {/* 4. AlertDialog HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    4. Diálogos de Alerta / Confirmación (AlertDialog)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[calc(100%-2rem)]">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      Modal de Confirmación Crítica
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    7. Grupos de Casillas de Verificación (CheckboxGroup)
                  </h3>
                </div>
                <CheckboxPreferencesDemo />
              </div>

              {/* 8. Chip HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    8. Etiquetas de Estado (Chip)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    9. Ventana Modal Interactiva (Modal)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      Calibración y Configuración Modal
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    10. Menú Desplegable Contextual (Popover)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      Detalle Biomecánico Dinámico
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    11. Panel Lateral Deslizante (Drawer)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      Panel Lateral de Ajustes de Sesión
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    12. Selector de Rango de Fechas (DateRangePicker)
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      Calendario de Intervalo Clínico
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    Calendarios de Rango Avanzados (RangeCalendar y Vistas Múltiples)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Vista Básica */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        1. Vista Básica
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1 mb-1">
                        firstDayOfWeek=&quot;mon&quot;
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-3">
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
                      <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        2. Vista por Semanas (WeekView)
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1 mb-1">
                        visibleDuration Dinámico
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-3">
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
                      <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        3. Rango Inicial (DefaultValue)
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1 mb-1">
                        parseDate(&quot;2026-02-03&quot;)
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-3">
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
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      Sombras de Desbordamiento de Scroll (ScrollShadow)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Contenedor con Gradientes Automáticos
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
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
                              <p className="text-xs font-bold text-on-surface">{ex.name}</p>
                              <p className="text-xs text-on-surface-variant">{ex.target} • {ex.reps}</p>
                            </div>
                            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
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
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        Placeholders de Carga Progresiva (Skeleton)
                      </h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface mb-1">
                          Animación Shimmer / Wave sin parpadeos
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
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
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        Notificaciones Toast HeroUI / Sonner (toast)
                      </h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                      <p className="text-xs text-on-surface-variant">
                        Dispara notificaciones ergonómicas directas con feedback háptico y física suave:
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => toast("Sesión de fisioterapia iniciada correctamente")}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-on-surface hover:opacity-90 transition-opacity"
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

              {/* 16 & 17. Feed Animado en Vivo (AnimatedList) y Cañones Laterales (ConfettiSideCannons) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-teal-500/15">
                {/* 16. AnimatedList */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      16. Feed de Actividad Clínica en Vivo (AnimatedList)
                    </h3>
                  </div>
                  <ClinicalActivityFeed delay={2800} />
                </div>

                {/* 17. ConfettiSideCannons */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      17. Ráfaga de Cañones Laterales (ConfettiSideCannons)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between h-[calc(100%-2rem)]">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Efecto Festivo Bidireccional Continuo
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        Dispara ráfagas de confeti a 60° y 120° desde los dos extremos de la pantalla durante 2.5 segundos con la paleta turquesa/kinetic de FisioMirror.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <ConfettiSideCannons
                        className="w-full sm:w-auto"
                        onClick={() => toast.success("¡Objetivo Semanal Superado!", { description: "Celebrando progreso biomecánico del paciente." })}
                      >
                        Disparar Celebración (Cañones)
                      </ConfettiSideCannons>
                      <ConfettiStars
                        className="w-full sm:w-auto text-xs"
                        onClick={() => toast.info("¡Estrellas de Logro!", { description: "Recompensa gamificada asignada." })}
                      >
                        Estrellas de Logro
                      </ConfettiStars>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  18 & 19. HIGHLIGHTER & INTERACTIVE HOVER BUTTON
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 18. Highlighter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      18. Resaltador Dinámico de Texto (Highlighter)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-on-surface-variant">
                        Trazos orgánicos tipo rough-notation animados:
                      </p>
                      <button
                        type="button"
                        onClick={() => setHighlighterKey((k) => k + 1)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="size-3" /> Reanimar trazo
                      </button>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex flex-wrap gap-1.5">
                      {(['highlight', 'underline', 'box', 'circle', 'bracket', 'strike-through'] as AnnotationAction[]).map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => {
                            setHighlighterAction(act);
                            setHighlighterKey((k) => k + 1);
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize",
                            highlighterAction === act
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest"
                          )}
                        >
                          {act}
                        </button>
                      ))}
                    </div>

                    {/* Preview Paragraph */}
                    <div className="p-4 rounded-2xl bg-surface-container-low/50 dark:bg-slate-900/50 border border-outline-variant/20 text-sm text-on-surface leading-relaxed">
                      El paciente Carlos presenta{" "}
                      <Highlighter
                        key={`hl-${highlighterKey}-${highlighterAction}`}
                        action={highlighterAction}
                        color="rgba(76, 218, 210, 0.45)"
                        strokeWidth={2}
                      >
                        compensación pélvica a 14°
                      </Highlighter>{" "}
                      durante la fase de flexión, requiriendo{" "}
                      <ClinicalHighlighter variant="warning" action="underline">
                        estabilización activa de core
                      </ClinicalHighlighter>{" "}
                      para evitar recidiva lumbosacra.
                    </div>
                  </div>
                </div>

                {/* 19. InteractiveHoverButton */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      19. Botón Interactivo con Desplazamiento (InteractiveHoverButton)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between h-[calc(100%-2rem)]">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Microinteracción Radial & Slide
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        Al pasar el cursor sobre el botón, el punto central indicador se expande y desliza suavemente el texto junto con la flecha directriz.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                      <InteractiveHoverButton
                        onClick={() => {
                          toast.success("¡Acción Ejecutada!", { description: "Navegando a la sesión de rehabilitación activa." });
                        }}
                      >
                        Iniciar Modo Espejo AR
                      </InteractiveHoverButton>

                      <InteractiveHoverButton
                        onClick={() => {
                          toast.info("Rutina guardada", { description: "Los parámetros clínicos han sido sincronizados." });
                        }}
                        className="border-emerald-500/40"
                      >
                        Guardar Prescripción
                      </InteractiveHoverButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  20 & 21. KINETIC TEXT & LIGHT RAYS
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 20. KineticText */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      20. Tipografía Cinética (KineticText)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Deformación de Peso Tipográfico por Proximidad
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        Pasa el cursor letra por letra para ver cómo el font-weight se altera orgánicamente de 300 a 900.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-surface-container-low/50 dark:bg-slate-900/50 border border-outline-variant/20 flex flex-col justify-center min-h-[90px]">
                      <KineticText
                        text={kineticInputText}
                        as="h2"
                        className="text-2xl sm:text-3xl font-light text-primary dark:text-teal-300"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={kineticInputText}
                        onChange={(e) => setKineticInputText(e.target.value)}
                        placeholder="Escribe un texto..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-outline-variant/30 bg-surface dark:bg-slate-900 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setKineticInputText('FisioMirror Biomecánica')}
                        className="text-xs font-semibold text-primary hover:underline px-2"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* 21. LightRays */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      21. Rayos de Luz Atmosféricos (LightRays)
                    </h3>
                  </div>
                  <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#002724] border border-slate-800 shadow-card p-6 flex flex-col justify-between">
                    <LightRays
                      count={8}
                      color="rgba(76, 218, 210, 0.35)"
                      blur={32}
                      speed={10}
                      length="80%"
                    />
                    <div className="relative z-10">
                      <span className="text-2xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded-md border border-teal-500/30">
                        Ambiente Dinámico
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">
                        Fondo de Iluminación Holográfica
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm mt-1">
                        Haces de luz oscilantes con balanceo angular continuo, diseñados para pantallas de inicio o vistas de calibración AR.
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between text-xs text-teal-200/80">
                      <span>Ciclo: 10s • Desenfoque: 32px</span>
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-teal-400 animate-ping" />
                        Activo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  22 & 23. NUMBER TICKER & MAGIC CARD
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 22. NumberTicker */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      22. Contador Numérico Animado con Resortes (NumberTicker)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Física de Resortes sin Saltos Bruscos
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        Modifica los valores numéricos y observa la transición elástica mediante useSpring:
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
                        <p className="text-2xs uppercase font-semibold text-on-surface-variant">Ángulo ROM</p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          <NumberTicker value={tickerRomValue} suffix="°" />
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
                        <p className="text-2xs uppercase font-semibold text-on-surface-variant">Adherencia</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          <NumberTicker value={Math.min(100, Math.round(tickerRomValue * 0.72))} suffix="%" />
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
                        <p className="text-2xs uppercase font-semibold text-on-surface-variant">Pacientes</p>
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                          <NumberTicker value={Math.round(tickerRomValue / 5)} />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setTickerRomValue((v) => Math.max(45, v - 15))}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        -15° ROM
                      </button>
                      <button
                        type="button"
                        onClick={() => setTickerRomValue(140)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all"
                      >
                        Reset (140°)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTickerRomValue((v) => Math.min(180, v + 15))}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        +15° ROM
                      </button>
                    </div>
                  </div>
                </div>

                {/* 23. MagicCard */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      23. Tarjeta Mágica Interactiva (MagicCard)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-on-surface-variant">
                        Mueve el cursor dentro de la tarjeta:
                      </p>
                      <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setMagicCardMode('gradient')}
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                            magicCardMode === 'gradient' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                          )}
                        >
                          Modo Gradient
                        </button>
                        <button
                          type="button"
                          onClick={() => setMagicCardMode('orb')}
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                            magicCardMode === 'orb' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                          )}
                        >
                          Modo Orb
                        </button>
                      </div>
                    </div>

                    <MagicCard
                      mode={magicCardMode}
                      gradientFrom="#006965"
                      gradientTo="#4cdad2"
                      glowFrom="#006965"
                      glowTo="#c1ff72"
                      className="cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                            Sensor Biomecánico
                          </span>
                          <span className="text-xs font-bold text-emerald-500">Conectado</span>
                        </div>
                        <h4 className="text-base font-bold text-on-surface">
                          Evaluación Lumbar en Tiempo Real
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Seguimiento cinético mediante sensor de profundidad y visión artificial. El degradado responde con suavidad al movimiento del cursor.
                        </p>
                        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-primary">
                          <span>Modo actual: {magicCardMode.toUpperCase()}</span>
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  24. PIXEL IMAGE
                  ───────────────────────────────────────────────────────── */}
              <div className="pt-6 border-t border-teal-500/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      24. Imagen Pixelada con Revelación Gradual (PixelImage)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['6x4', '8x8', '8x3'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setPixelGridKey(g);
                          setPixelReplayKey((k) => k + 1);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                          pixelGridKey === g
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPixelReplayKey((k) => k + 1)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25 transition-colors"
                    >
                      <RefreshCw className="size-3" /> Replay
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-center">
                  <PixelImage
                    key={`pixel-${pixelReplayKey}-${pixelGridKey}`}
                    src="/physi.png"
                    alt="Physi IA Mascot"
                    grid={pixelGridKey}
                    grayscaleAnimation={true}
                    pixelFadeInDuration={800}
                    maxAnimationDelay={1000}
                    colorRevealDelay={1100}
                    className="h-60 w-60 md:h-72 md:w-72 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center p-4"
                  />
                  <div className="max-w-md space-y-3">
                    <span className="text-2xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                      Efecto de Entrada Digital
                    </span>
                    <h4 className="text-lg font-bold text-on-surface">
                      Aparición Escalonada por Polígonos clip-path
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Divide la imagen en una cuadrícula poligonal matemática ({pixelGridKey}) con retardo pseudoaleatorio por pieza y transición fluida de escala de grises a color completo.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20">
                        Cuadrícula: {pixelGridKey}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20">
                        Transición: 800ms
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20">
                        Filtro: Grayscale → Color
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  25 & 26. PULSATING BUTTON & SCROLL PROGRESS
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 25. PulsatingButton */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        25. Botón Pulsante Dinámico (PulsatingButton)
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPulsatingVariant('pulse')}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                          pulsatingVariant === 'pulse' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        Pulse
                      </button>
                      <button
                        type="button"
                        onClick={() => setPulsatingVariant('ripple')}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                          pulsatingVariant === 'ripple' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        Ripple
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Llamada a la Acción Crítica con Ondas de Frecuencia
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        Emite anillos de pulso o expansiones de onda continua. Identifica de inmediato el próximo paso crítico del paciente o fisioterapeuta.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <PulsatingButton
                        variant={pulsatingVariant}
                        pulseColor={pulsatingColor}
                        onClick={() => toast.success("Calibración Iniciada", { description: "Activando modelo MediaPipe para detección ósea." })}
                        className="text-xs"
                      >
                        <Activity className="size-4" />
                        <span>Calibrar Cámara MediaPipe</span>
                      </PulsatingButton>

                      <PulsatingButton
                        variant={pulsatingVariant}
                        pulseColor="#06b6d4"
                        onClick={() => navigate('/ar-mirror')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-xs"
                      >
                        <Zap className="size-4" />
                        <span>Iniciar Espejo AR</span>
                      </PulsatingButton>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs text-on-surface-variant">
                      <span>Color de Pulso:</span>
                      <button
                        type="button"
                        onClick={() => setPulsatingColor('rgba(13, 148, 136, 0.6)')}
                        className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                      >
                        Teal Médico
                      </button>
                      <button
                        type="button"
                        onClick={() => setPulsatingColor('rgba(193, 255, 114, 0.7)')}
                        className="px-2 py-0.5 rounded-md bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-500/20"
                      >
                        Kinetic Lime
                      </button>
                      <button
                        type="button"
                        onClick={() => setPulsatingColor('rgba(59, 130, 246, 0.6)')}
                        className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      >
                        Azure Blue
                      </button>
                    </div>
                  </div>
                </div>

                {/* 26. ScrollProgress */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      26. Barra de Progreso de Desplazamiento (ScrollProgress)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Lectura Dinámica del Scroll con Escala GPU
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        Mira la línea continua en la parte superior fija de esta página: se actualiza en tiempo real con scaleX y el gradiente oficial de FisioMirror.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                        <span>Gradiente:</span>
                        <code className="text-xs text-teal-600 dark:text-teal-400 font-mono">
                          from-teal-600 via-cyan-400 to-[#c1ff72]
                        </code>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-teal-600 via-cyan-400 to-[#c1ff72] shadow-sm shadow-teal-500/20" />
                      <p className="text-xs text-on-surface-variant leading-normal">
                        Activa en todas las pantallas clínicas para que el paciente o terapeuta conozca su progreso en la lectura de expedientes y guías biomecánicas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  27 & 28. SHIMMER BUTTON & SHINE BORDER
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 27. ShimmerButton */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      27. Botón con Brillo Deslizante (ShimmerButton)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Rotación Cónica Continua (Conic Gradient)
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        Brillo periférico que rota continuamente a 360°, ideal para acciones de alta jerarquía médica como generación de informes IA o exportación clínica.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <ShimmerButton
                        shimmerColor="#c1ff72"
                        background="rgba(0, 50, 48, 0.95)"
                        onClick={() => toast.success("Informe de Fisioterapia Generado", { description: "Análisis IA procesado con éxito." })}
                        className="text-xs"
                      >
                        <Sparkles className="size-4 text-kinetic" />
                        <span>Generar Informe IA Physi</span>
                      </ShimmerButton>

                      <ShimmerButton
                        shimmerColor="#38bdf8"
                        background="rgba(15, 23, 42, 0.95)"
                        onClick={() => toast.info("Exportando Historial...", { description: "Preparando documento PDF cifrado." })}
                        className="text-xs border-slate-700"
                      >
                        <Copy className="size-4" />
                        <span>Exportar Historia PDF</span>
                      </ShimmerButton>
                    </div>
                  </div>
                </div>

                {/* 28. ShineBorder */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      28. Borde Brillante Animado (ShineBorder)
                    </h3>
                  </div>
                  <div className="relative p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 overflow-hidden">
                    <ShineBorder
                      borderWidth={2}
                      duration={10}
                      shineColor={["#00504d", "#14b8a6", "#c1ff72"]}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-on-surface">
                          Tarjeta Clínica con Borde Órbita Multicromático
                        </h4>
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Prioridad Alta
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        El gradiente radial animado recorre las 4 esquinas sin alterar el contenido interno gracias a una máscara XOR de doble capa.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Paciente: Roberto Santana</p>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">Tendinopatía Rotuliana • Sesión 6 de 12</p>
                      </div>
                      <span className="text-xs font-black text-on-surface">125° Flexión</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  29 & 30. SPARKLES TEXT & TEXT ANIMATE
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 29. SparklesText */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      29. Texto con Destellos Mágicos (SparklesText)
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Estrellas y Destellos Festivos Vectoriales
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        Ideal para celebraciones de objetivos clínicos cumplidos, rachas de rehabilitación y ascensos de nivel en la recuperación.
                      </p>
                    </div>

                    <div className="py-2">
                      <SparklesText
                        sparklesCount={8}
                        colors={{ first: '#0d9488', second: '#c1ff72' }}
                        className="text-2xl sm:text-3xl text-on-surface"
                      >
                        {sparklesWord}
                      </SparklesText>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={sparklesWord}
                        onChange={(e) => setSparklesWord(e.target.value)}
                        placeholder="Escribe un mensaje de logro..."
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-on-surface focus:outline-hidden focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setSparklesWord('¡100% Rango Articular Superado!')}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25 transition-colors whitespace-nowrap"
                      >
                        Ejemplo Clínico
                      </button>
                    </div>
                  </div>
                </div>

                {/* 30. TextAnimate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        30. Texto Animado por Segmentos (TextAnimate)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTextAnimateKey((k) => k + 1)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="size-3" /> Reanimar
                    </button>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-on-surface-variant">Variante:</span>
                      {(['blurInUp', 'fadeIn', 'slideUp', 'scaleUp', 'blurIn'] as AnimationVariant[]).map((anim) => (
                        <button
                          key={anim}
                          type="button"
                          onClick={() => {
                            setTextAnimateVariant(anim);
                            setTextAnimateKey((k) => k + 1);
                          }}
                          className={cn(
                            "px-2 py-0.5 text-2xs font-bold rounded-md transition-all",
                            textAnimateVariant === anim
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest"
                          )}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span>Segmentación:</span>
                      {(['word', 'character', 'line'] as AnimationType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setTextAnimateType(type);
                            setTextAnimateKey((k) => k + 1);
                          }}
                          className={cn(
                            "px-2 py-0.5 text-2xs font-bold rounded-md transition-all",
                            textAnimateType === type
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-low text-on-surface-variant"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-slate-900/60 border border-teal-500/20 min-h-[90px] flex items-center">
                      <TextAnimate
                        key={`text-anim-${textAnimateKey}-${textAnimateVariant}-${textAnimateType}`}
                        animation={textAnimateVariant}
                        by={textAnimateType}
                        className="text-sm sm:text-base font-bold text-on-surface leading-relaxed"
                      >
                        Evaluación biomecánica asistida por Physi IA: simetría escapular y ángulo articular en rango óptimo.
                      </TextAnimate>
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
                <p className="text-xs text-on-surface-variant">
                  Mapeo directo de componentes de FisioMirror con sus reemplazos de Magic UI, Aceternity UI, 21st, HeroUI y Reaviz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INVENTORY_COMPARISONS.map((item, index) => (
                <Card key={index} variant="glass" hoverEffect animated className="relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      {item.category}
                    </span>
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Fuente: {item.librarySource}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="p-2 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-2xs uppercase font-bold text-on-surface-variant">Componente Original en FisioMirror:</p>
                      <p className="text-xs font-semibold text-on-surface">{item.originalComponent}</p>
                      <code className="text-2xs text-on-surface-variant font-mono">{item.originalFile}</code>
                    </div>

                    <div className="p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/20">
                      <p className="text-2xs uppercase font-bold text-teal-600 dark:text-teal-400">Versión Evolved Integrada:</p>
                      <p className="text-xs font-bold text-on-surface">{item.evolvedComponent}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-on-surface-variant mb-1.5">Ventajas y Características Superiores:</p>
                    <ul className="space-y-1">
                      {item.keyImprovements.map((improvement, i) => (
                        <li key={i} className="text-xs text-on-surface-variant flex items-start gap-1.5">
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
                <p className="text-xs text-on-surface-variant">
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-2">
                  <span>Variantes Premium Evolved</span>
                  <span className="text-2xs text-teal-500 lowercase">(framer-motion + cva + magic-ui)</span>
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Escalas & Botones de Utilidad</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm" variant="glow">Pequeño (sm)</Button>
                  <Button size="default" variant="glow">Normal (default)</Button>
                  <Button size="lg" variant="glow" icon={<Send className="w-5 h-5" />} iconPosition="right">
                    Grande Táctil (lg)
                  </Button>
                  <Tooltip content="IconButton accesible para navegación">
                    <IconButton icon={<Heart className="w-4 h-4 text-rose-500" />} />
                  </Tooltip>
                  <BackButton onClick={() => toast.info('Simulación de navegación: retrocediendo a la pantalla anterior')}>BackButton Atrás</BackButton>
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
              <p className="text-xs text-on-surface-variant">
                Mueve el mouse sobre las tarjetas para apreciar el haz de luz radial matemático y el haz orbital en el borde.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <CardSpotlight className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <MousePointer className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-2xs font-bold text-teal-600 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                    Aceternity Spotlight
                  </span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">
                  CardSpotlight Reactivo
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  Proyecta un gradiente radial matemático dinámico que persigue al cursor exactamente sin forzar re-renderizados del DOM.
                </p>
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Efecto Biomecánico</span>
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
                    <span className="text-2xs font-bold text-lime-600 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20">
                      Magic UI BorderBeam
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-1">
                    Borde Orbital Cinético
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
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
              <p className="text-xs text-on-surface-variant">
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
              <p className="text-xs text-on-surface-variant">
                Formularios con micro-escalado en foco y entrada segmentada de 6 casillas para vinculación de pacientes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-on-surface">
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
                  <h3 className="text-sm font-bold text-on-surface">
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
                      className="text-xs"
                    >
                      Probar Pegado Demo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setOtpError(!otpError)}
                      className="text-xs"
                    >
                      Error: {otpError ? 'Sí' : 'No'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">
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
              <p className="text-xs text-on-surface-variant">
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
              <p className="text-xs text-on-surface-variant">
                Textos con flujo de gradiente orgánico vivo y tooltips en 4 orientaciones con desenfoque de cristal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">Tipografía Dinámica</span>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Efecto Aurora Text:</p>
                  <h3 className="text-2xl font-black">
                    Rehabilitación con <AuroraText>Inteligencia Artificial</AuroraText>
                  </h3>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-on-surface-variant mb-1">Efecto Shimmer Text (Barrido):</p>
                  <ShimmerText text="Análisis Biomecánico a 30 FPS en Tiempo Real" className="text-lg font-bold" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant block mb-2">
                    Tooltips con Flecha Geométrica
                  </span>
                  <p className="text-xs text-on-surface-variant mb-4">
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
            <p className="text-xs text-on-surface-variant">
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
