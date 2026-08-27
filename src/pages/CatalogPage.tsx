import React, { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  Layers,
  Activity,
  Heart,
  Flame,
} from 'lucide-react';
import { ChatMessages } from '../components/ui/ChatMessages';
import { AILoader } from '../components/ui/AILoader';
import { AnimatedCircularProgressBar } from '../components/ui/AnimatedCircularProgressBar';
import { AnimatedList } from '../components/ui/AnimatedList';
import { AnimatedThemeToggler } from '../components/ui/AnimatedThemeToggler';
import { AuroraText } from '../components/ui/AuroraText';
import { BorderBeam } from '../components/ui/BorderBeam';
import { ConfettiButton, ConfettiStars } from '../components/ui/ConfettiButton';
import { DiaTextReveal } from '../components/ui/DiaTextReveal';
import { HyperText } from '../components/ui/HyperText';
import { LightRays } from '../components/ui/LightRays';
import { ShineBorder } from '../components/ui/ShineBorder';
import { TypingAnimation } from '../components/ui/TypingAnimation';
import { TextAnimate } from '../components/ui/TextAnimate';
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
  ChipStatuses,
  DisclosureConfig,
  Placements,
  Navigation,
  ActionDropdown,
  SimplePopover,
  PopoverInteractive,
  ProgressSizes,
  DateRange,
  ScrollableList,
  ToastVariants,
  PatientsTable,
} from '../components/heroui';
import { cn } from '../lib/utils';

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'all' | '21st' | 'magic' | 'heroui'>('all');
  const [progressVal, setProgressVal] = useState(84);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-outline/15 bg-gradient-to-br from-surface-container-low via-surface to-surface-container shadow-2xl">
        <BorderBeam size={120} duration={8} colorFrom="#14b8a6" colorTo="#0ea5e9" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              <span>Catálogo Maestro de Componentes UI</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
              Design System &amp; <AuroraText>FisioMirror UI</AuroraText>
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Catálogo completo e interactivo que integra la suite de <strong className="text-on-surface font-semibold">21st Dev</strong>, <strong className="text-on-surface font-semibold">Magic UI</strong> y los <strong className="text-on-surface font-semibold">28 componentes de HeroUI</strong> diseñados para la experiencia clínica y de tele-rehabilitación.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <ConfettiButton className="rounded-xl px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium shadow-md shadow-teal-500/20 text-xs">
              Probar Confeti
            </ConfettiButton>
            <div className="p-1 rounded-xl bg-surface-container-high border border-outline/15 flex items-center">
              <AnimatedThemeToggler variant="circle" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 pt-6 border-t border-outline/10 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos los Componentes (40+)' },
            { id: '21st', label: 'Bloque A: 21st Dev' },
            { id: 'magic', label: 'Bloque B: Magic UI' },
            { id: 'heroui', label: 'Bloque C: HeroUI (28)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE A: 21ST DEV */}
      {(activeTab === 'all' || activeTab === '21st') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <Layers className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Bloque A — 21st Dev</h2>
              <p className="text-xs text-on-surface-variant">Componentes interactivos de chat inteligente y cargador cinético.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. ChatMessages */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-on-surface">1. ChatMessages (21st Dev)</h3>
                  <p className="text-xs text-on-surface-variant">Chat animado con burbujas, typing indicator, auto-play y modo interactivo.</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 text-[10px] font-bold uppercase">Interactivo</span>
              </div>
              <div className="h-[380px] w-full">
                <ChatMessages interactive={true} autoPlay={true} className="h-full" />
              </div>
            </div>

            {/* 2. AILoader & Ambient Lights */}
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4 shadow-sm relative overflow-hidden">
                <LightRays count={5} speed={12} color="rgba(20, 184, 166, 0.25)" />
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-on-surface">2. AI Loader &amp; LightRays</h3>
                  <p className="text-xs text-on-surface-variant mb-6">Loader CSS puro con letras rebotando y rayos de luz ambientales.</p>
                  <div className="p-8 rounded-2xl bg-surface/70 border border-outline/15 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                    <AILoader label="Analizando Biomecánica" textSize={20} />
                    <span className="text-xs text-on-surface-variant">Simulando extracción de ángulos articulares con IA</span>
                  </div>
                </div>
              </div>

              {/* Extra micro visual demo */}
              <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-on-surface">HyperText &amp; DiaTextReveal</h3>
                <p className="text-xs text-on-surface-variant">Tipografía con efecto scramble y barrido de colores.</p>
                <div className="flex flex-col gap-4 p-4 rounded-2xl bg-surface/70 border border-outline/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-on-surface-variant">Hover sobre el texto:</span>
                    <HyperText className="text-lg text-teal-600 dark:text-teal-400">FISIOMIRROR</HyperText>
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

      {/* BLOQUE B: MAGIC UI */}
      {(activeTab === 'all' || activeTab === 'magic') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Bloque B — Magic UI</h2>
              <p className="text-xs text-on-surface-variant">Efectos visuales fluidos, progreso circular, listas animadas y text animations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AnimatedCircularProgressBar */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4 flex flex-col items-center justify-between text-center">
              <div>
                <h3 className="text-sm font-bold text-on-surface">AnimatedCircularProgressBar</h3>
                <p className="text-xs text-on-surface-variant">Indicador circular de adherencia y ROM</p>
              </div>
              <AnimatedCircularProgressBar
                value={progressVal}
                gaugePrimaryColor="#14b8a6"
                gaugeSecondaryColor="rgba(20, 184, 166, 0.15)"
                className="size-36"
              />
              <div className="w-full flex items-center justify-between gap-3 text-xs text-on-surface-variant">
                <span>0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <span>100%</span>
              </div>
            </div>

            {/* AnimatedList */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface">AnimatedList (Secuencial)</h3>
                <p className="text-xs text-on-surface-variant">Notificaciones entrantes en tiempo real</p>
              </div>
              <div className="h-56 overflow-hidden rounded-2xl bg-surface/60 p-3 border border-outline/10">
                <AnimatedList delay={1500} className="w-full">
                  {[
                    { id: '1', title: 'Sesión completada', desc: 'Carlos Mendoza — Calidad 94%', icon: Activity, color: 'text-emerald-600 bg-emerald-500/10' },
                    { id: '2', title: 'Nuevo logro desbloqueado', desc: 'Constancia de Acero (7 días)', icon: Flame, color: 'text-amber-600 bg-amber-500/10' },
                    { id: '3', title: 'Rutina actualizada', desc: 'Flexión de hombro a 160°', icon: Heart, color: 'text-rose-600 bg-rose-500/10' },
                  ].map((item) => (
                    <div key={item.id} className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline/15 shadow-sm">
                      <div className={cn('p-2 rounded-lg shrink-0', item.color)}>
                        <item.icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-on-surface truncate">{item.title}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </AnimatedList>
              </div>
            </div>

            {/* ShineBorder & ConfettiStars */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
              <ShineBorder shineColor={['#14b8a6', '#0ea5e9', '#10b981']} borderWidth={2} duration={10} />
              <div>
                <h3 className="text-sm font-bold text-on-surface">ShineBorder &amp; ConfettiStars</h3>
                <p className="text-xs text-on-surface-variant">Resaltado de tarjetas prémium y celebración</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface/80 border border-outline/10 text-center space-y-3">
                <TypingAnimation words={['¡Récord alcanzado!', '¡Excelente simetría!', '¡160° de ROM!']} loop={true} className="text-base font-extrabold text-teal-600 dark:text-teal-400" />
                <p className="text-xs text-on-surface-variant">Dispara una ráfaga estelar al paciente:</p>
                <ConfettiStars />
              </div>
            </div>
          </div>

          {/* Text Animations Row */}
          <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-on-surface">TextAnimate (Palabra / Carácter con Stagger)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface/70 border border-outline/10 text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-2">Efecto Fade In</span>
                <TextAnimate animation="fadeIn" by="word" className="text-base font-bold text-on-surface">
                  Precisión Biomecánica en Cada Repetición
                </TextAnimate>
              </div>
              <div className="p-4 rounded-2xl bg-surface/70 border border-outline/10 text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-2">Efecto Blur In</span>
                <TextAnimate animation="blurIn" by="word" className="text-base font-bold text-teal-600 dark:text-teal-400">
                  IA Especializada en Fisioterapia
                </TextAnimate>
              </div>
              <div className="p-4 rounded-2xl bg-surface/70 border border-outline/10 text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-2">Efecto Slide Up</span>
                <TextAnimate animation="slideUp" by="word" className="text-base font-bold text-on-surface">
                  Seguimiento de Adherencia en Tiempo Real
                </TextAnimate>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BLOQUE C: HEROUI (28 COMPONENTES) */}
      {(activeTab === 'all' || activeTab === 'heroui') && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-outline/15 pb-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <LayoutGrid className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Bloque C — HeroUI (Suite de 28 Componentes)</h2>
              <p className="text-xs text-on-surface-variant">Componentes accesibles y estilizados para el flujo clínico integral.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Accordion */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">1. Accordion</h3>
              <p className="text-xs text-on-surface-variant mb-2">Guías y preguntas frecuentes colapsables.</p>
              <CustomAccordion />
            </div>

            {/* 2 & 3. Alerts */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">2 &amp; 3. Basic &amp; Custom Alert</h3>
              <p className="text-xs text-on-surface-variant mb-2">Alertas de éxito, error y avisos clínicos.</p>
              <BasicAlert />
              <div className="pt-2">
                <CustomAlert />
              </div>
            </div>

            {/* 4. AlertDialog & Popover */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-on-surface">4. AlertDialog &amp; SimplePopover</h3>
              <p className="text-xs text-on-surface-variant">Acciones críticas y popovers con flecha.</p>
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface/70 border border-outline/10">
                <DeleteDialog />
                <SimplePopover />
                <ActionDropdown />
              </div>
            </div>

            {/* 5 & 6. Avatars */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">5 &amp; 6. Avatar + Badges</h3>
              <p className="text-xs text-on-surface-variant mb-2">Perfiles de pacientes y badges de notificaciones.</p>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface/70 border border-outline/10">
                <BasicAvatar />
                <AvatarWithBadge />
                <PopoverInteractive />
              </div>
            </div>

            {/* 7 & 8. Breadcrumbs & Buttons */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">7, 8 &amp; 9. Breadcrumbs &amp; Icon Buttons</h3>
              <p className="text-xs text-on-surface-variant mb-2">Navegación y botones con variantes.</p>
              <div className="space-y-3">
                <CustomBreadcrumbs />
                <IconButtons />
                <div className="flex items-center justify-between pt-2">
                  <IconOnlyButtons />
                  <ButtonGroupDropdown />
                </div>
              </div>
            </div>

            {/* 10 & 11. Cards */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">10 &amp; 11. Card with Avatar &amp; Image</h3>
              <p className="text-xs text-on-surface-variant mb-2">Tarjetas de ejercicio y paciente.</p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <CardWithAvatar />
                <div className="w-full">
                  <CardWithImage />
                </div>
              </div>
            </div>

            {/* 12. PremiumCard */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">12. PremiumCard (Plan Pro)</h3>
              <p className="text-xs text-on-surface-variant mb-2">Características y suscripción de clínica.</p>
              <PremiumCard />
            </div>

            {/* 13, 14 & 15. Chips */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">13, 14 &amp; 15. Chip Statuses &amp; Variants</h3>
              <p className="text-xs text-on-surface-variant mb-2">Etiquetas de estado clínico y filtros.</p>
              <div className="space-y-4 p-4 rounded-2xl bg-surface/70 border border-outline/10">
                <StatusChips />
                <ChipStatuses />
              </div>
            </div>

            {/* 16 & 17. Disclosure & Drawers */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">16, 17 &amp; 18. Disclosure &amp; Drawers</h3>
              <p className="text-xs text-on-surface-variant mb-2">Paneles deslizantes y acordeón de ajustes.</p>
              <div className="space-y-3">
                <DisclosureConfig />
                <div className="flex items-center gap-3 pt-2">
                  <Placements />
                  <Navigation />
                </div>
              </div>
            </div>

            {/* 22. ProgressBar Sizes */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">22. ProgressBar Sizes</h3>
              <p className="text-xs text-on-surface-variant mb-2">Barras de progreso en sm, md y lg.</p>
              <div className="p-4 rounded-2xl bg-surface/70 border border-outline/10">
                <ProgressSizes value={75} />
              </div>
            </div>

            {/* 23. DateRange / RangeCalendar */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">23, 24 &amp; 25. RangeCalendar</h3>
              <p className="text-xs text-on-surface-variant mb-2">Programación de rutinas y rango de sesiones.</p>
              <DateRange />
            </div>

            {/* 20 & 21. ScrollShadow & Toasts */}
            <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">20 &amp; 21. ScrollShadow &amp; Toasts</h3>
              <p className="text-xs text-on-surface-variant mb-2">Lista con desvanecimiento de scroll y alertas.</p>
              <div className="space-y-4">
                <ToastVariants />
                <ScrollableList itemsCount={8} />
              </div>
            </div>
          </div>

          {/* 26. PatientsTable */}
          <div className="rounded-3xl border border-outline/15 bg-surface-container-low/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">26. PatientsTable (HeroUI)</h3>
                <p className="text-xs text-on-surface-variant">Tabla clínica con avatares, chips de estado dinámicos y acciones integradas.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 text-xs font-semibold">Live Data</span>
            </div>
            <PatientsTable />
          </div>
        </section>
      )}
    </div>
  );
}

export default CatalogPage;
