import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icon } from './ui/Icon';
import MascotAnimation from './ui/MascotAnimation';
import type { CharacterRole } from '../types/character.types';
import { hasCompletedOnboarding, markOnboardingComplete } from '../hooks/useGamification';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const getFisioSteps = (t: (key: string) => string): OnboardingStep[] => [
  { title: t('onboarding.fisioStep1Title') || 'Bienvenido a FisioMirror', description: t('onboarding.fisioStep1Desc') || 'Tu plataforma de gestión clínica de alto rendimiento. Te guiamos por las funciones principales.', icon: 'medical_services' },
  { title: t('onboarding.fisioStep2Title') || 'Panel Principal', description: t('onboarding.fisioStep2Desc') || 'Desde el dashboard verás tus pacientes activos, sesiones recientes y estadísticas clave de tu práctica.', icon: 'dashboard' },
  { title: t('onboarding.fisioStep3Title') || 'Directorio de Pacientes', description: t('onboarding.fisioStep3Desc') || 'Gestiona todos tus pacientes en un solo lugar. Carga nuevos expedientes y revisa historiales clínicos completos.', icon: 'people' },
  { title: t('onboarding.fisioStep4Title') || 'Espejo AR', description: t('onboarding.fisioStep4Desc') || 'Inicia sesiones de rehabilitación con seguimiento de movimiento en tiempo real. Calibra la postura del paciente antes de comenzar.', icon: 'visibility' },
  { title: t('onboarding.fisioStep5Title') || 'Caja de Herramientas de IA', description: t('onboarding.fisioStep5Desc') || 'Asistente de IA, escáner de prescripciones y transcripción de audio para agilizar tu trabajo clínico.', icon: 'auto_awesome' },
  { title: t('onboarding.fisioStep6Title') || 'Estadísticas y Progreso', description: t('onboarding.fisioStep6Desc') || 'Visualiza el progreso de tus pacientes con gráficos detallados y reportes exportables en PDF.', icon: 'analytics' },
];

const getPatientSteps = (t: (key: string) => string): OnboardingStep[] => [
  { title: t('onboarding.patientStep1Title') || '¡Hola, Campeón!', description: t('onboarding.patientStep1Desc') || 'Bienvenido a FisioMirror. Tu recuperación empieza aquí. Te mostramos cómo usar la app.', icon: 'waving_hand' },
  { title: t('onboarding.patientStep2Title') || 'Tu Panel', description: t('onboarding.patientStep2Desc') || 'En tu dashboard verás tu progreso, racha de días consecutivos y próximos ejercicios asignados por tu fisioterapeuta.', icon: 'dashboard' },
  { title: t('onboarding.patientStep3Title') || 'Mis Ejercicios', description: t('onboarding.patientStep3Desc') || 'Aquí encontrarás tu rutina personalizada. Toca "Ver descripción" para ver cómo realizar cada ejercicio correctamente.', icon: 'self_improvement' },
  { title: t('onboarding.patientStep4Title') || 'Espejo AR', description: t('onboarding.patientStep4Desc') || 'Inicia tu sesión de rehabilitación con seguimiento de movimiento. El sistema te guía y corrige tu postura en tiempo real.', icon: 'visibility' },
  { title: t('onboarding.patientStep5Title') || 'Logros y Progreso', description: t('onboarding.patientStep5Desc') || 'Completa sesiones para desbloquear logros. Cada paso te acerca a tu recuperación total. ¡Tú puedes!', icon: 'emoji_events' },
];

interface OnboardingTourProps {
  role: CharacterRole;
  onComplete: () => void;
}

export function OnboardingTour({ role, onComplete }: OnboardingTourProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const steps = useMemo(() => (role === 'physio' ? getFisioSteps(t) : getPatientSteps(t)), [role, t]);

  const handleWelcomeNext = () => {
    setShowWelcome(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      markOnboardingComplete();
      onComplete();
    }
  };

  const handleSkip = () => {
    markOnboardingComplete();
    onComplete();
  };

  const currentStep = steps[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="glass-panel rounded-[2rem] w-full max-w-[min(42rem,calc(100vw-2rem))] overflow-hidden overflow-y-auto overflow-x-hidden max-h-[calc(100vh-2rem)] shadow-2xl break-words"
      >
        {showWelcome ? (
          <div className="flex flex-col items-center p-8 md:p-12 text-center">
            <div className="w-40 h-56 md:w-48 md:h-64 mb-4 flex items-center justify-center">
              <MascotAnimation type="greeting" size="md" className="!w-40 !h-40 md:!w-48 md:!h-48" />
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg gradient-text-editorial mb-3 break-words whitespace-normal overflow-hidden">
              {role === 'physio'
                ? (t('onboarding.welcomePhysio') || '¡Bienvenido, Especialista!')
                : (t('onboarding.welcomePatient') || '¡Bienvenido, Campeón!')}
            </h2>
            <p className="text-on-surface-variant font-body-lg max-w-md mb-8 break-words whitespace-normal overflow-hidden">
              {role === 'physio'
                ? (t('onboarding.physioDesc') || 'Estamos emocionados de tenerte. Te haremos un recorrido rápido por las funciones principales.')
                : (t('onboarding.patientDesc') || 'Tu recuperación empieza aquí. Te mostraremos cómo usar FisioMirror en unos simples pasos.')}
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={handleSkip} className="flex-1 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">
                {t('onboarding.skip') || 'Saltar'}
              </button>
              <button onClick={handleWelcomeNext} className="flex-1 premium-btn py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                {t('onboarding.startTour') || 'Comenzar Tour'} <Icon name="arrow_forward" size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
            <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/8 to-primary/15 dark:from-primary/12 dark:to-primary/20 p-8 relative overflow-hidden">
              <div className="w-40 h-64 flex items-center justify-center">
                <MascotAnimation type="achievement" size="md" className="!w-40 !h-40" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="inline-flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-1.5 bg-on-surface/20'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center text-primary">
                    <Icon name={currentStep.icon} filled size={26} />
                  </div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                    {t('onboarding.stepCount', { current: step + 1, total: steps.length }) || `Paso ${step + 1} de ${steps.length}`}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-headline-md text-headline-md-mobile lg:text-headline-md text-on-surface mb-3 break-words whitespace-normal overflow-hidden">
                      {currentStep.title}
                    </h3>
                    <p className="text-on-surface-variant font-body-lg leading-relaxed break-words whitespace-normal overflow-hidden">
                      {currentStep.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-1.5 md:hidden">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-1.5 bg-on-surface/20'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-3 ml-auto">
                  <button onClick={handleSkip} className="px-4 py-2.5 rounded-xl text-on-surface-variant font-label-sm hover:bg-surface-variant/20 transition-all">
                    {t('onboarding.skip') || 'Saltar'}
                  </button>
                  <button onClick={handleNext} className="premium-btn px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                    {step === steps.length - 1 ? (t('onboarding.finish') || 'Finalizar') : (t('onboarding.next') || 'Siguiente')}
                    <Icon name={step === steps.length - 1 ? 'check' : 'arrow_forward'} size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export { hasCompletedOnboarding };
