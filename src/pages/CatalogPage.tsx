import React, { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  Layers,
  Activity,
  Heart,
  Zap,
  Sliders,
  Shield,
  Compass,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { ChatMessages } from '../components/ui/ChatMessages';
import { AILoader } from '../components/ui/AILoader';
import { AnimatedThemeToggler } from '../components/ui/AnimatedThemeToggler';
import { AuroraText } from '../components/ui/AuroraText';
import { BorderBeam } from '../components/ui/BorderBeam';
import { ConfettiButton } from '../components/ui/ConfettiButton';
import { DiaTextReveal } from '../components/ui/DiaTextReveal';
import { HyperText } from '../components/ui/HyperText';
import { LightRays } from '../components/ui/LightRays';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Marquee } from '../components/ui/Marquee';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { Dock, DockIcon } from '../components/ui/Dock';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { ClinicalSlider } from '../components/ui/ClinicalSlider';
import { StatCard } from '../components/ui/StatCard';
import { ActionButton } from '../components/ui/ActionButton';
import { Toggle } from '../components/ui/Toggle';
import { Tooltip } from '../components/ui/Tooltip';
import * as MegaSuite from '../components/ui/megaSuite';
import { BiomechanicalAngleGauge } from '../components/ui/BiomechanicalAngleGauge';
import { ARFloatingDock } from '../components/ui/ARFloatingDock';
import { RehabEnergyBar } from '../components/ui/RehabEnergyBar';
import { GamifiedBadgeCard } from '../components/ui/GamifiedBadgeCard';
import { CompensationAlertBanner } from '../components/ui/CompensationAlertBanner';
import { RepetitionCounterSpring } from '../components/ui/RepetitionCounterSpring';
import { JointDetailPopover } from '../components/ui/JointDetailPopover';
import { TherapistQuickToolbar } from '../components/ui/TherapistQuickToolbar';
import { MobileBottomSheet } from '../components/ui/MobileBottomSheet';
import { CompactJointSelector, CompactRomStepper, CompactToleranceDropdown } from '../components/ui/CompactQuickSelector';
import { HarmonizedSurface } from '../components/ui/HarmonizedSurface';
import {
  CustomAccordion,
  BasicAlert,
  CustomAlert,
  DeleteDialog,
  BasicAvatar,
  AvatarWithBadge,
  CustomBreadcrumbs,
  IconButtons,
  IconOnlyButtons,
  ButtonGroupDropdown,
  CardWithAvatar,
  CardWithImage,
  PremiumCard,
  StatusChips,
  ChipVariants,
  ChipStatuses,
  DisclosureConfig,
  Placements,
  Navigation,
  PopoverInteractive,
  ProgressSizes,
  DateRange,
  ScrollableList,
  ToastVariants,
  PatientsTable,
} from '../components/heroui';
import { cn } from '../lib/utils';

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'megasuite' | 'estelar' | 'magic' | 'aceternity' | 'heroui' | 'shadcn' | '21st'>('all');
  const [sliderAngle, setSliderAngle] = useState(120);
  const [toggleState, setToggleState] = useState(true);
  const [gaugeAngle, setGaugeAngle] = useState(95);
  const [springReps, setSpringReps] = useState(8);
  const [energyLevel, setEnergyLevel] = useState(85);
  const [selectedJoint, setSelectedJoint] = useState('rodilla');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  return (
    <div className="fm-page">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-outline/15 bg-gradient-to-br from-surface-container-low via-surface to-surface-container shadow-elevated">
        <BorderBeam size={130} duration={8} colorFrom="#14b8a6" colorTo="#0ea5e9" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>Suite de Componentes Next-Gen FisioMirror</span>
            </div>
            <h1 className="fm-title text-on-surface">
              Design System &amp; <AuroraText>FisioMirror UI</AuroraText>
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Catálogo maestro y de alto rendimiento que integra los componentes más votados y utilizados de{' '}
              <strong className="text-on-surface font-semibold">Macro Suite (50)</strong>,{' '}
              <strong className="text-on-surface font-semibold">Suite Estelar Biomecánica</strong>,{' '}
              <strong className="text-on-surface font-semibold">HeroUI</strong>,{' '}
              <strong className="text-on-surface font-semibold">Magic UI</strong>,{' '}
              <strong className="text-on-surface font-semibold">Aceternity UI</strong> y{' '}
              <strong className="text-on-surface font-semibold">Shadcn UI</strong> adaptados exclusivamente a la tele-rehabilitación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <ShimmerButton className="text-xs px-4 py-2.5">
              Botón Shimmer Pro
            </ShimmerButton>
            <ConfettiButton className="rounded-2xl px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold shadow-md shadow-teal-500/20 text-xs">
              Probar Confeti
            </ConfettiButton>
            <div className="p-1 rounded-2xl bg-surface-container-high border border-outline/15 flex items-center">
              <AnimatedThemeToggler variant="circle" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 pt-6 border-t border-outline/10 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos los Componentes' },
            { id: 'megasuite', label: 'Macro Suite (50 Componentes)' },
            { id: 'estelar', label: 'Suite Estelar Biomecánica' },
            { id: 'heroui', label: 'HeroUI (28 Suite)' },
            { id: 'magic', label: 'Magic UI' },
            { id: 'aceternity', label: 'Aceternity UI' },
            { id: 'shadcn', label: 'Shadcn UI' },
            { id: '21st', label: '21st.dev' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-md shadow-teal-600/20'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE ACETERNITY UI */}
      {(activeTab === 'all' || activeTab === 'aceternity') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
              <Zap className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Aceternity UI — Tactile Cards &amp; Tracing Beam</h2>
              <p className="text-xs text-on-surface-variant">Spotlights reactivos al cursor del mouse, bordes animados y seguimiento de líneas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SpotlightCard 1 */}
            <SpotlightCard className="p-6 space-y-4">
              <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                <Activity className="size-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Card Spotlight con Sensor de Cursor</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pasa el mouse sobre esta tarjeta para ver cómo el halo de luz radial sigue de forma interactiva la posición de tu cursor.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>Reflejo Activo</span>
                <ArrowRight className="size-4" />
              </div>
            </SpotlightCard>

            {/* SpotlightCard 2: Biomechanical ROM */}
            <SpotlightCard className="p-6 space-y-4">
              <div className="size-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                <Compass className="size-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Calibración Goniométrica</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Ángulo objetivo de flexión evaluado en 165° con compensación escapular mitigada mediante IA.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                <span>ROM: 165°</span>
                <span className="text-2xs bg-cyan-500/10 px-2 py-0.5 rounded-full">Óptimo</span>
              </div>
            </SpotlightCard>

            {/* SpotlightCard 3: Token Security */}
            <SpotlightCard className="p-6 space-y-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Shield className="size-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface">Criptografía Clínica</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tokens de activación de un solo uso vinculados a registros de pacientes en Supabase y cumplimiento de privacidad médica.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Activo y Encriptado</span>
                <CheckCircle className="size-4" />
              </div>
            </SpotlightCard>
          </div>
        </section>
      )}

      {/* BLOQUE MAGIC UI */}
      {(activeTab === 'all' || activeTab === 'magic') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Magic UI — Number Ticker, Bento Grid, Dock &amp; Marquee</h2>
              <p className="text-xs text-on-surface-variant">Componentes interactivos de alta demanda con física de resorte y movimiento fluido.</p>
            </div>
          </div>

          {/* Marquee */}
          <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">Marquee de Recomendaciones Clínicas y Logros</h3>
              <span className="text-2xs font-bold text-outline uppercase tracking-wider">Auto-Scroll Infinito</span>
            </div>
            <Marquee speed={30} pauseOnHover={true} className="py-2">
              {[
                { title: 'Flexión de Rodilla', metric: '135° alcanzados', badge: 'Carlos M.' },
                { title: 'Adherencia Semanal', metric: '100% de cumplimiento', badge: 'María F.' },
                { title: 'Corrección Postural', metric: 'Alineación de columna 98%', badge: 'Lucía R.' },
                { title: 'Extensión Lumbar', metric: '5 reps sin compensación', badge: 'Jorge T.' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-outline/15 bg-surface-container p-3.5 shadow-sm min-w-[240px]">
                  <div className="size-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{item.title}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{item.metric}</p>
                  </div>
                  <span className="ml-auto text-2xs text-outline font-mono bg-surface px-2 py-0.5 rounded-lg border border-outline/10">
                    {item.badge}
                  </span>
                </div>
              ))}
            </Marquee>
          </div>

          {/* StatCards with NumberTicker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Pacientes Activos"
              value={48}
              icon={<Activity className="size-5" />}
              trend={{ value: 12, positive: true }}
            />
            <StatCard
              label="Sesiones Completadas"
              value={192}
              icon={<CheckCircle className="size-5" />}
              trend={{ value: 24, positive: true }}
            />
            <StatCard
              label="Adherencia Clínica"
              value={88}
              suffix="%"
              icon={<Heart className="size-5" />}
              trend={{ value: 4, positive: true }}
            />
            <StatCard
              label="Ángulo Máximo ROM"
              value={160}
              suffix="°"
              icon={<Compass className="size-5" />}
              badge="Registro"
            />
          </div>

          {/* Bento Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-on-surface">Bento Grid Multifuncional</h3>
            <BentoGrid>
              <BentoCard
                name="Tele-Rehabilitación con Espejo AR"
                description="Detección en tiempo real de 33 puntos óseos con feedback auditivo y visual para pacientes."
                Icon={Activity}
                badge="Tiempo Real"
                cta="Ver demostración"
              />
              <BentoCard
                name="Asistente Clínico Physi IA"
                description="Generador inteligente de resúmenes de evolución y rutinas personalizadas según el diagnóstico."
                Icon={Sparkles}
                badge="Inteligencia Artificial"
                cta="Consultar IA"
              />
              <BentoCard
                name="Informes Biomecánicos en PDF"
                description="Exportación de reportes clínicos completos con gráficos de adherencia y firma profesional."
                Icon={Award}
                badge="Clínico"
                cta="Exportar PDF"
              />
            </BentoGrid>
          </div>

          {/* Dock */}
          <div className="space-y-3 pt-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-on-surface">Dock Magnético de Acciones Terapéuticas</h3>
              <p className="text-xs text-on-surface-variant">Efecto magnificación fluida al acercar el cursor.</p>
            </div>
            <Dock>
              <DockIcon tooltip="Goniómetro"><Compass className="size-5" /></DockIcon>
              <DockIcon tooltip="Cronómetro"><Calendar className="size-5" /></DockIcon>
              <DockIcon tooltip="Physi IA"><Sparkles className="size-5" /></DockIcon>
              <DockIcon tooltip="Ejercicios"><Activity className="size-5" /></DockIcon>
              <DockIcon tooltip="Pacientes"><Heart className="size-5" /></DockIcon>
            </Dock>
          </div>
        </section>
      )}

      {/* BLOQUE SHADCN UI */}
      {(activeTab === 'all' || activeTab === 'shadcn') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
              <Sliders className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Shadcn UI — Clinical Sliders, Toggles &amp; Action Buttons</h2>
              <p className="text-xs text-on-surface-variant">Componentes accesibles, tipografía balanceada y retroalimentación táctil de precisión.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ClinicalSlider */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-on-surface">1. Slider de Rango Articular (ROM)</h3>
              <p className="text-xs text-on-surface-variant">Calibración precisa del límite de movimiento para ejercicios de hombro y rodilla.</p>
              <ClinicalSlider
                value={sliderAngle}
                onChange={setSliderAngle}
                min={0}
                max={180}
                step={1}
                label="Ángulo Objetivo (Hombro)"
                unit="°"
                ticks={[0, 45, 90, 135, 180]}
                helperText="El espejo AR marcará como repetición válida cuando el paciente alcance o supere este ángulo."
              />
            </div>

            {/* Toggle & Tooltips */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-on-surface">2. Toggle iOS / Shadcn &amp; Tooltips</h3>
                <p className="text-xs text-on-surface-variant">Interruptores táctiles con física de resorte y tooltips con puntero.</p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container space-y-3">
                <Toggle
                  checked={toggleState}
                  onChange={setToggleState}
                  label="Bio-feedback por Voz Activo"
                  description="Physi indicará correcciones verbales si detecta inclinación de tronco."
                />
              </div>

              <div className="flex items-center gap-4">
                <Tooltip content="Muestra líneas de cuadrícula para verificar alineación">
                  <span className="text-xs font-bold text-teal-600 hover:underline cursor-help">
                    Pasa el mouse sobre este Tooltip Top
                  </span>
                </Tooltip>
                <Tooltip content="Guarda el registro en el almacenamiento sin conexión" side="bottom">
                  <span className="text-xs font-bold text-teal-600 hover:underline cursor-help">
                    Tooltip Bottom
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* ActionButton variants */}
          <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-on-surface">3. Variantes de ActionButton (Táctil con Shimmer)</h3>
            <div className="flex flex-wrap gap-3">
              <ActionButton variant="primary">Botón Primario</ActionButton>
              <ActionButton variant="shimmer">Botón Shimmer</ActionButton>
              <ActionButton variant="secondary">Botón Secundario</ActionButton>
              <ActionButton variant="outline">Botón Outline</ActionButton>
              <ActionButton variant="danger">Botón Peligro</ActionButton>
              <ActionButton variant="ghost">Botón Ghost</ActionButton>
            </div>
          </div>
        </section>
      )}

      {/* BLOQUE HEROUI (28 SUITE) */}
      {(activeTab === 'all' || activeTab === 'heroui') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <LayoutGrid className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Bloque C — Suite Completa HeroUI (28 Componentes)</h2>
              <p className="text-xs text-on-surface-variant">La biblioteca completa de HeroUI con diseño clínico, glassmorfismo y alto contraste.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Accordion */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">1. CustomAccordion</h3>
              <p className="text-xs text-on-surface-variant mb-2">Acordeón fluido de preguntas frecuentes clínicas.</p>
              <CustomAccordion />
            </div>

            {/* 2. Alert */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">2 &amp; 23. Alerts (Basic &amp; Custom)</h3>
              <p className="text-xs text-on-surface-variant mb-2">Mensajes de estado, advertencia y éxito.</p>
              <div className="space-y-3">
                <BasicAlert />
                <CustomAlert />
              </div>
            </div>

            {/* 3. AlertDialog */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">3. AlertDialog (DeleteDialog)</h3>
              <p className="text-xs text-on-surface-variant mb-2">Confirmación destructiva con desenfoque de fondo.</p>
              <DeleteDialog onConfirm={() => alert('Paciente archivado')} />
            </div>

            {/* 4 & 5. Avatars */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">4 &amp; 5. Avatars &amp; Badge</h3>
              <p className="text-xs text-on-surface-variant mb-2">Avatares con indicador de presencia en tiempo real.</p>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container">
                <BasicAvatar fallback="CR" size="lg" />
                <AvatarWithBadge fallback="MD" status="online" />
                <AvatarWithBadge fallback="LF" status="warning" />
                <PopoverInteractive />
              </div>
            </div>

            {/* 6. Breadcrumbs */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">6. CustomBreadcrumbs</h3>
              <p className="text-xs text-on-surface-variant mb-2">Ruta de navegación con resaltado activo.</p>
              <div className="p-4 rounded-2xl bg-surface-container">
                <CustomBreadcrumbs />
              </div>
            </div>

            {/* 7, 8 & 9. Buttons & Groups */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">7, 8 &amp; 9. IconButtons &amp; SplitDropdown</h3>
              <p className="text-xs text-on-surface-variant mb-2">Botones interactivos con desplegable filtrador.</p>
              <div className="space-y-3">
                <IconButtons />
                <div className="flex items-center justify-between pt-2">
                  <IconOnlyButtons />
                  <ButtonGroupDropdown />
                </div>
              </div>
            </div>

            {/* 10 & 11. Cards */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">10 &amp; 11. Cards con Avatar &amp; Multimedia</h3>
              <p className="text-xs text-on-surface-variant mb-2">Tarjetas de seguimiento y ejercicio.</p>
              <div className="space-y-3">
                <CardWithAvatar />
                <CardWithImage />
              </div>
            </div>

            {/* 12. PremiumCard */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">12. PremiumCard (Plan Clínico Pro)</h3>
              <p className="text-xs text-on-surface-variant mb-2">Tarjeta de suscripción y nivel hospitalario.</p>
              <PremiumCard />
            </div>

            {/* 13, 14 & 15. Chips */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">13, 14 &amp; 15. Chips de Estado &amp; Variantes</h3>
              <p className="text-xs text-on-surface-variant mb-2">Etiquetas de severidad y estado clínico.</p>
              <div className="space-y-3 p-4 rounded-2xl bg-surface-container">
                <StatusChips />
                <ChipVariants />
                <ChipStatuses />
              </div>
            </div>

            {/* 16 & 17. Disclosure & Drawer */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">16, 17 &amp; 18. Disclosures &amp; Menú Lateral</h3>
              <p className="text-xs text-on-surface-variant mb-2">Paneles colapsables y drawer de navegación.</p>
              <div className="space-y-3">
                <DisclosureConfig />
                <div className="flex items-center gap-3 pt-2">
                  <Placements />
                  <Navigation />
                </div>
              </div>
            </div>

            {/* 22. ProgressBar Sizes */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">22. Barras de Progreso (sm, md, lg)</h3>
              <p className="text-xs text-on-surface-variant mb-2">Indicadores de avance y calidad de sesión.</p>
              <div className="p-4 rounded-2xl bg-surface-container">
                <ProgressSizes value={82} />
              </div>
            </div>

            {/* 23. DateRange */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">23, 24 &amp; 25. RangeCalendar</h3>
              <p className="text-xs text-on-surface-variant mb-2">Selección de rango para informes de rehabilitación.</p>
              <DateRange />
            </div>

            {/* 20 & 21. ScrollShadow & Toasts */}
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface">20 &amp; 21. ScrollShadow &amp; Toasts</h3>
              <p className="text-xs text-on-surface-variant mb-2">Listas con sombras de borde y notificaciones.</p>
              <div className="space-y-3">
                <ToastVariants />
                <ScrollableList itemsCount={6} />
              </div>
            </div>
          </div>

          {/* 26. PatientsTable */}
          <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">26. PatientsTable (HeroUI Interactive Table)</h3>
                <p className="text-xs text-on-surface-variant">Tabla clínica con barras de adherencia, etiquetas dinámicas y vista detallada.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold">
                Datos Clínicos
              </span>
            </div>
            <PatientsTable />
          </div>
        </section>
      )}

      {/* BLOQUE 21ST DEV */}
      {(activeTab === 'all' || activeTab === '21st') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
              <Layers className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Bloque A — 21st.dev</h2>
              <p className="text-xs text-on-surface-variant">Widgets cinéticos de chat interactivo, loaders con físicas y tipografía scrambler.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-on-surface">ChatMessages (21st.dev)</h3>
                  <p className="text-xs text-on-surface-variant">Chat clínico animado con respuestas automáticas.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 text-2xs font-bold uppercase">
                  Interactivo
                </span>
              </div>
              <div className="h-[360px] w-full">
                <ChatMessages interactive={true} autoPlay={true} className="h-full" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-4 shadow-sm relative overflow-hidden">
                <LightRays count={5} speed={12} color="rgba(20, 184, 166, 0.25)" />
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-on-surface">AI Loader &amp; LightRays</h3>
                  <p className="text-xs text-on-surface-variant mb-6">Loader cinético con rayos de luz ambientales.</p>
                  <div className="p-8 rounded-2xl bg-surface/70 border border-outline/15 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                    <AILoader label="Analizando Biomecánica" textSize={20} />
                    <span className="text-xs text-on-surface-variant">Extrayendo ángulos articulares en tiempo real</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-outline/15 bg-surface/80 p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-on-surface">HyperText &amp; DiaTextReveal</h3>
                <p className="text-xs text-on-surface-variant">Animación tipográfica con efecto scramble y gradiente.</p>
                <div className="flex flex-col gap-4 p-4 rounded-2xl bg-surface/70 border border-outline/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-on-surface-variant">Hover sobre el texto:</span>
                    <HyperText className="text-lg font-bold text-teal-600 dark:text-teal-400">FISIOMIRROR</HyperText>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-outline/10">
                    <span className="text-xs font-medium text-on-surface-variant">Barrido de gradiente:</span>
                    <DiaTextReveal text="Rehabilitación Inteligente" className="text-lg font-bold" repeat={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BLOQUE MACRO SUITE (50 COMPONENTES DE ÉLITE) */}
      {(activeTab === 'all' || activeTab === 'megasuite') && (
        <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-cyan-500/10 via-surface/60 to-surface border border-cyan-500/25 shadow-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h2 className="fm-title text-on-surface">
                  Macro Suite FisioMirror (50 Componentes Modulares)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                Catálogo masivo de 50 componentes modulares creados con HeroUI, Magic UI y DaisyUI para telemetría MediaPipe, diagnóstico clínico, microinteracciones, gamificación y docks AR.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0">
              50 / 50 Activos
            </span>
          </div>

          {/* Categoría 1: Diagnóstico (10) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
              <span className="size-2 rounded-full bg-cyan-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                Categoría 1: Tarjetas de Actividad y Diagnóstico Clínico (1 - 10)
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

          {/* Categoría 2: Paneles en Tiempo Real (11 - 20) */}
          <div className="space-y-4 pt-6 border-t border-cyan-500/15">
            <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
              <span className="size-2 rounded-full bg-teal-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                Categoría 2: Paneles y Métricas en Tiempo Real (MediaPipe / IA) (11 - 20)
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

          {/* Categoría 3: Microinteracciones Flotantes (21 - 30) */}
          <div className="space-y-4 pt-6 border-t border-cyan-500/15">
            <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
              <span className="size-2 rounded-full bg-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                Categoría 3: Microinteracciones y Controles Flotantes Contextuales (21 - 30)
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

          {/* Categoría 4: Gamificación (31 - 40) */}
          <div className="space-y-4 pt-6 border-t border-cyan-500/15">
            <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
              <span className="size-2 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                Categoría 4: Gamificación, Rachas y Motivación de Pacientes (31 - 40)
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

          {/* Categoría 5: Docks y Navegación Ergonómica (41 - 50) */}
          <div className="space-y-4 pt-6 border-t border-cyan-500/15">
            <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
              <span className="size-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                Categoría 5: Docks, Barras de Herramientas y Navegación Ergonómica (41 - 50)
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
        </section>
      )}

      {/* BLOQUE SUITE ESTELAR BIOMECÁNICA & HERRAMIENTAS CLÍNICAS */}
      {(activeTab === 'all' || activeTab === 'estelar') && (
        <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-teal-500/10 via-surface/60 to-surface border border-teal-500/30 shadow-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-teal-500/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
                  <Activity className="w-5 h-5" />
                </span>
                <h2 className="fm-title text-on-surface">
                  Suite Estelar de Innovación Biomecánica FisioMirror
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                8 componentes estelares para tele-rehabilitación con IA: goniómetro digital, contador con física de resortes, barra de fatiga, dock AR flotante y badges gamificados.
              </p>
            </div>
            <button
              onClick={() => setIsBottomSheetOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <Sliders className="size-4" />
              <span>Abrir Bottom Sheet Demo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. BiomechanicalAngleGauge */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                1. Goniómetro Dinámico Circular (BiomechanicalAngleGauge)
              </h3>
              <BiomechanicalAngleGauge
                currentAngle={gaugeAngle}
                targetAngle={90}
                jointName="Rodilla Derecha"
                safeTolerance={10}
                size={220}
              />
              <div className="flex items-center gap-2 w-full max-w-xs pt-2">
                <span className="text-xs text-on-surface-variant font-mono">0°</span>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={gaugeAngle}
                  onChange={(e) => setGaugeAngle(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <span className="text-xs text-on-surface-variant font-mono">180°</span>
              </div>
            </div>

            {/* 2. RepetitionCounterSpring */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                2. Contador con Resortes Elásticos (RepetitionCounterSpring)
              </h3>
              <RepetitionCounterSpring
                currentReps={springReps}
                targetReps={15}
                cadenceSeconds={3.0}
                onIncrement={() => setSpringReps((r) => r + 1)}
                onReset={() => setSpringReps(0)}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpringReps((r) => r + 1)}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/20 hover:bg-teal-500/20"
                >
                  +1 Repetición
                </button>
                <button
                  onClick={() => setSpringReps(0)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-on-surface-variant text-xs font-bold hover:bg-slate-200"
                >
                  Reiniciar
                </button>
              </div>
            </div>

            {/* 3. RehabEnergyBar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                3. Barra de Energía y Fatiga Muscular (RehabEnergyBar)
              </h3>
              <RehabEnergyBar
                currentEnergy={energyLevel}
                fatigueScore={Number(((100 - energyLevel) / 10).toFixed(1))}
                repsCompleted={springReps}
                totalTargetReps={15}
              />
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-on-surface-variant">Simular Energía:</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="flex-1 accent-teal-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-teal-600">{energyLevel}%</span>
              </div>
            </div>

            {/* 4. GamifiedBadgeCard */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                4. Medalla 3D Gamificada (GamifiedBadgeCard)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <GamifiedBadgeCard
                  title="Constancia de Hierro"
                  description="5 días seguidos completando rutina"
                  tier="gold"
                  xpPoints={250}
                  progressPct={100}
                />
                <GamifiedBadgeCard
                  title="Precisión Articular"
                  description="ROM > 95% sin compensaciones"
                  tier="diamond"
                  xpPoints={500}
                  progressPct={78}
                />
              </div>
            </div>

            {/* 5. CompensationAlertBanner */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                5. Banner de Compensación Postural (CompensationAlertBanner)
              </h3>
              <CompensationAlertBanner
                deviationJoint="Hombro Izquierdo"
                detectedIssue="Elevación escapular asimétrica de +14°"
                severity="moderate"
                onDismiss={() => {}}
              />
            </div>

            {/* 6 & 7. ARFloatingDock & TherapistQuickToolbar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                6. Dock Flotante AR (ARFloatingDock)
              </h3>
              <ARFloatingDock
                currentJoint={selectedJoint}
                onSelectJoint={(j) => setSelectedJoint(j)}
              />
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                7. Barra Rápida de Terapeuta (TherapistQuickToolbar)
              </h3>
              <TherapistQuickToolbar />
            </div>
          </div>
        </section>
      )}

      {/* Modal BottomSheet interactivo de demostración */}
      <MobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Inspección Biomecánica Móvil"
        subtitle="Cajón con niveles de altura y física de resortes"
        icon={<Sliders className="size-5 text-teal-600" />}
        variant="pastel-mint"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-on-surface-variant">
            Este bottom sheet deslizable erradica el scroll infinito en pantallas móviles, ofreciendo snap points interactivos y selectores de 1 toque.
          </p>
          <HarmonizedSurface variant="mint" className="p-3.5 rounded-2xl space-y-3">
            <CompactJointSelector selectedJoint={selectedJoint} onSelectJoint={setSelectedJoint} />
            <CompactRomStepper value={gaugeAngle} onChange={setGaugeAngle} min={30} max={170} label="Meta ROM" />
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-teal-200/40 dark:border-slate-700/60">
              <CompactToleranceDropdown toleranceDegrees={10} onSelectTolerance={() => {}} />
              <JointDetailPopover jointName={selectedJoint} currentAngle={gaugeAngle} targetAngle={120} />
            </div>
          </HarmonizedSurface>
        </div>
      </MobileBottomSheet>
    </div>
  );
}

export default CatalogPage;
