import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { GlassModal } from './GlassModal';
import { cn } from '../../lib/utils';

type FaqSection =
  | 'fisioDashboard'
  | 'patients'
  | 'patientDetail'
  | 'tokens'
  | 'fisioExercises'
  | 'fisioStats'
  | 'tools'
  | 'profile'
  | 'settings'
  | 'patientDashboard'
  | 'patientExercises'
  | 'patientStats'
  | 'ar'
  | 'calibration'
  | 'ocr'
  | 'catalog'
  | 'ai'
  | 'general';

function resolveSection(pathname: string): FaqSection {
  if (pathname.startsWith('/paciente/') || pathname.startsWith('/patient/')) return 'patientDetail';
  if (pathname.startsWith('/dashboard-fisio')) return 'fisioDashboard';
  if (pathname.startsWith('/patients')) return 'patients';
  if (pathname.startsWith('/tokens')) return 'tokens';
  if (pathname.startsWith('/fisio-exercises')) return 'fisioExercises';
  if (pathname.startsWith('/fisio-stats')) return 'fisioStats';
  if (pathname.startsWith('/tools')) return 'tools';
  if (pathname.startsWith('/fisio-profile') || pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/fisio-settings') || pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/dashboard-paciente')) return 'patientDashboard';
  if (pathname.startsWith('/exercises')) return 'patientExercises';
  if (pathname.startsWith('/stats')) return 'patientStats';
  if (pathname.startsWith('/ar-mirror')) return 'ar';
  if (pathname.startsWith('/calibration')) return 'calibration';
  if (pathname.startsWith('/ocr-scanner')) return 'ocr';
  if (pathname.startsWith('/ui-catalog') || pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/ai-assistant')) return 'ai';
  return 'general';
}

/** Preguntas contextuales por módulo. Se muestran como tarjeta sólida clínica. */
export function ContextualFAQCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const section = resolveSection(location.pathname);
  const items: { q: string; a: string }[] = [];

  for (let i = 1; i <= 3; i += 1) {
    const q = t(`faqctx.${section}.q${i}`, { defaultValue: '' });
    const a = t(`faqctx.${section}.a${i}`, { defaultValue: '' });
    if (q && a && q !== `faqctx.${section}.q${i}`) items.push({ q, a });
  }

  if (items.length === 0) return null;

  return (
    <section className={cn('w-full', className)}>
      <div className="w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon name="help" size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t('faqctx.title')}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Orientación clínica y respuestas rápidas para esta pantalla
              </p>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
            {t('faqctx.thisSection')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((faq, index) => {
            const id = `${section}-${index}`;
            const isOpen = openId === id;
            return (
              <div
                key={id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between transition-all hover:border-teal-500/40"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : id)}
                    className="w-full text-left flex items-start justify-between gap-2 mb-2 group"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {faq.q}
                    </span>
                    <Icon
                      name={isOpen ? 'expand_less' : 'expand_more'}
                      size={18}
                      className="text-slate-400 shrink-0 md:hidden"
                    />
                  </button>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface HelpGuideButtonProps {
  onStartTour?: () => void;
}

export function HelpGuideButton({ onStartTour }: HelpGuideButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const currentSection = resolveSection(location.pathname);
  const [selectedSection, setSelectedSection] = useState<FaqSection>(currentSection);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sync selected section when opened
  const handleOpen = () => {
    setSelectedSection(resolveSection(location.pathname));
    setSearch('');
    setOpen(true);
  };

  const sectionsList: { id: FaqSection; label: string; icon: string }[] = [
    { id: currentSection, label: 'Módulo Actual', icon: 'location_on' },
    { id: 'fisioDashboard', label: 'Dashboard Fisio', icon: 'dashboard' },
    { id: 'patients', label: 'Expediente Pacientes', icon: 'group' },
    { id: 'fisioExercises', label: 'Catálogo Ejercicios', icon: 'fitness_center' },
    { id: 'ar', label: 'Espejo AR & Visión', icon: 'view_in_ar' },
    { id: 'calibration', label: 'Calibración Articular', icon: 'straighten' },
    { id: 'tools', label: 'Herramientas Clínicas', icon: 'handyman' },
    { id: 'fisioStats', label: 'Estadísticas & ROM', icon: 'monitoring' },
  ];

  // Recopilar FAQs de la sección seleccionada o filtradas por búsqueda
  const allSectionsToSearch: FaqSection[] = search.trim()
    ? ['fisioDashboard', 'patients', 'fisioExercises', 'ar', 'calibration', 'tools', 'fisioStats', 'ocr', 'general']
    : [selectedSection];

  const displayedFaqs: { id: string; q: string; a: string; sectionName: string }[] = [];

  allSectionsToSearch.forEach((sec) => {
    for (let i = 1; i <= 4; i += 1) {
      const q = t(`faqctx.${sec}.q${i}`, { defaultValue: '' });
      const a = t(`faqctx.${sec}.a${i}`, { defaultValue: '' });
      if (q && a && q !== `faqctx.${sec}.q${i}`) {
        if (!search.trim() || q.toLowerCase().includes(search.toLowerCase()) || a.toLowerCase().includes(search.toLowerCase())) {
          displayedFaqs.push({
            id: `${sec}-${i}`,
            q,
            a,
            sectionName: sec === currentSection ? 'Esta Pantalla' : sec,
          });
        }
      }
    }
  });

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 hover:border-teal-400 transition-colors shadow-sm cursor-pointer"
        aria-label={t('faqctx.openAria', 'Abrir guía interactiva de Physi')}
        title={t('faqctx.openAria', 'Abrir guía interactiva de Physi')}
      >
        <Icon name="help" size={20} />
      </motion.button>

      <GlassModal isOpen={open} onClose={() => setOpen(false)} size="xl" variant="solid">
        <div className="w-full max-h-[82vh] flex flex-col pr-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Icon name="menu_book" size={22} className="animate-breathe-icon" />
              </div>
              <div>
                <h3 className="font-title-md text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Physi Guía Clínica
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                    Asistencia Instantánea
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Protocolos, calibración goniométrica, visión por computadora y flujo clínico.
                </p>
              </div>
            </div>

            {onStartTour && (
              <button
                onClick={() => {
                  setOpen(false);
                  onStartTour();
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm shrink-0"
              >
                <Icon name="tour" size={16} />
                {t('faqctx.startTour', 'Iniciar Tour Guiado')}
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative my-4">
            <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por pregunta, articulación, goniometría o proceso clínico..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-teal-500/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Desktop Two-Column Layout */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[360px]">
            {/* Category Navigation (Left 4 cols) */}
            <div className="lg:col-span-4 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 pr-1 scrollbar-none border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 shrink-0">
              <span className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Categorías de Soporte
              </span>
              {sectionsList.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setSelectedSection(sec.id);
                    setSearch('');
                  }}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all whitespace-nowrap lg:whitespace-normal',
                    selectedSection === sec.id && !search
                      ? 'bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  <Icon name={sec.icon} size={16} className={selectedSection === sec.id && !search ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                  <span>{sec.label}</span>
                </button>
              ))}

              {/* Quick Clinical Tip Card */}
              <div className="hidden lg:block mt-auto p-3.5 rounded-2xl bg-teal-50 dark:bg-slate-800/80 border border-teal-200/50 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300">
                  <Icon name="lightbulb" size={16} />
                  <span>Tip de Biofeedback</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Para máxima precisión goniométrica, sitúa la cámara a la altura del tórax con luz frontal libre de contraluz.
                </p>
              </div>
            </div>

            {/* Questions & Content (Right 8 cols) */}
            <div className="lg:col-span-8 overflow-y-auto space-y-3 pr-1">
              {displayedFaqs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <Icon name="search_off" size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold">No se encontraron guías para tu búsqueda</p>
                  <p className="text-xs mt-1">Prueba con palabras clave como &quot;ROM&quot;, &quot;cámara&quot;, &quot;sesión&quot; o &quot;PDF&quot;.</p>
                </div>
              ) : (
                displayedFaqs.map((faq) => {
                  const isOpen = expandedId === faq.id || displayedFaqs.length === 1;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 overflow-hidden transition-all duration-200 hover:border-teal-500/30"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : faq.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {faq.q}
                          </h4>
                        </div>
                        <Icon
                          name={isOpen ? 'expand_less' : 'expand_more'}
                          size={18}
                          className="text-slate-400 shrink-0 transition-transform"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </GlassModal>
    </>
  );
}
