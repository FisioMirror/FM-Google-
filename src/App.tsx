import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { AuthUnifiedPage } from './pages/AuthUnifiedPage';
import { RegistroPacientePage } from './pages/RegistroPacientePage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { SplashScreen } from './components/SplashScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { GlassToastProvider } from './components/ui/GlassToast';
import { InstallProvider } from './lib/installContext';
import { InstallModal } from './components/ui/InstallPrompt';
import { ScrollToTop } from './components/ScrollToTop';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FisioLayout } from './components/FisioLayout';
import { PatientLayout } from './components/PatientLayout';
import { useAuthStore } from './stores/authStore';
import { OnboardingTour } from './components/OnboardingTour';
import { hasCompletedOnboarding } from './hooks/useGamification';
import type { CharacterRole } from './types/character.types';

function lazyPage<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  exportName?: string
) {
  return lazy(async () => {
    try {
      const module = await factory();
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      if (module.default) {
        return { default: module.default };
      }
      const candidate = Object.values(module).find((v) => typeof v === 'function');
      if (candidate) return { default: candidate as T };
      return { default: (() => null) as unknown as T };
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      const retryModule = await factory();
      if (exportName && retryModule[exportName]) {
        return { default: retryModule[exportName] };
      }
      if (retryModule.default) {
        return { default: retryModule.default };
      }
      const candidate = Object.values(retryModule).find((v) => typeof v === 'function');
      return { default: (candidate || (() => null)) as unknown as T };
    }
  });
}

const DashboardFisio = lazyPage(() => import('./pages/DashboardFisio'), 'DashboardFisio');
const PatientDashboard = lazyPage(() => import('./pages/PatientDashboard'), 'PatientDashboard');
const PatientsPage = lazyPage(() => import('./pages/PatientsPage'), 'PatientsPage');
const PatientDetailPage = lazyPage(() => import('./pages/PatientDetailPage'), 'PatientDetailPage');
const OCRScannerPage = lazyPage(() => import('./pages/OCRScannerPage'), 'OCRScannerPage');
const TokenGeneratorPage = lazyPage(() => import('./pages/TokenGeneratorPage'), 'TokenGeneratorPage');
const ExercisesPage = lazyPage(() => import('./pages/ExercisesPage'), 'ExercisesPage');
const StatsPage = lazyPage(() => import('./pages/StatsPage'), 'StatsPage');
const ToolsPage = lazyPage(() => import('./pages/ToolsPage'), 'ToolsPage');
const ProfilePage = lazyPage(() => import('./pages/ProfilePage'), 'ProfilePage');
const ARMirrorPage = lazyPage(() => import('./pages/ARMirrorPage'), 'ARMirrorPage');
const CalibrationPage = lazyPage(() => import('./pages/CalibrationPage'), 'CalibrationPage');
const AIAssistantPage = lazyPage(() => import('./pages/AIAssistantPage'), 'AIAssistantPage');
const PatientExercisesPage = lazyPage(() => import('./pages/PatientExercisesPage'), 'PatientExercisesPage');
const SettingsPage = lazyPage(() => import('./pages/SettingsPage'), 'SettingsPage');
const CatalogPage = lazyPage(() => import('./pages/CatalogPage'), 'CatalogPage');
const NotFound = lazyPage(() => import('./pages/NotFound'), 'NotFound');

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-6" role="status" aria-label="Cargando aplicación">
      {/* Halo and App Logo without confining square box */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-50 pointer-events-none scale-150"
          style={{
            background: 'radial-gradient(circle, rgba(21,105,102,0.35) 0%, rgba(34,211,238,0.2) 60%, transparent 80%)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            filter: [
              'drop-shadow(0 4px 12px rgba(21,105,102,0.2))',
              'drop-shadow(0 8px 24px rgba(21,105,102,0.4))',
              'drop-shadow(0 4px 12px rgba(21,105,102,0.2))',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
        >
          <img
            src="/logo.png"
            alt="FisioMirror"
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* 3 Animated Breathing Dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
            className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}

function AppRoutes() {
  const user = useAuthStore((s) => s.user);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user]);

  const onboardingRole: CharacterRole = user?.role === 'fisioterapeuta' ? 'physio' : 'patient';

  return (
    <>
    {showOnboarding && user && (
      <OnboardingTour
        role={onboardingRole}
        onComplete={() => setShowOnboarding(false)}
      />
    )}
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<AuthUnifiedPage />} />
      <Route path="/registro-paciente" element={<RegistroPacientePage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Fisioterapeuta routes */}
      <Route path="/dashboard-fisio" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><DashboardFisio /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><PatientsPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/paciente/:id" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><PatientDetailPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/patient/:id" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><PatientDetailPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/ocr-scanner" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><OCRScannerPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/tokens" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><TokenGeneratorPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/fisio-exercises" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><ExercisesPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/fisio-stats" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><StatsPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><ToolsPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/fisio-profile" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/fisio-settings" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><SettingsPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/catalogo" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><CatalogPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/ui-catalog" element={<ProtectedRoute role="fisioterapeuta"><FisioLayout><Suspense fallback={<PageLoader />}><CatalogPage /></Suspense></FisioLayout></ProtectedRoute>} />
      <Route path="/ar-mirror" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><ARMirrorPage /></Suspense></PatientLayout></ProtectedRoute>} />

      {/* Paciente routes */}
      <Route path="/dashboard-paciente" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><PatientDashboard /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/calibration" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><CalibrationPage /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><PatientExercisesPage /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><StatsPage /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><ProfilePage /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><SettingsPage /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><CatalogPage /></Suspense></PatientLayout></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute role="paciente"><PatientLayout><Suspense fallback={<PageLoader />}><AIAssistantPage /></Suspense></PatientLayout></ProtectedRoute>} />

      {/* Role-aware redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
    </>
  );
}

function RoleRedirect() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'fisioterapeuta' ? '/dashboard-fisio' : '/dashboard-paciente'} replace />;
}

function Router() {
  const initialized = useAuthStore((s) => s.initialized);

  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // Hard fallback: if initialized is still false after 4s, force splash away
  const [forceHideSplash, setForceHideSplash] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceHideSplash(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const splashVisible = (!splashDone || !initialized) && !forceHideSplash;

  return (
    <>
      <BrowserRouter>
        <div id="app-root" className="min-h-screen">
          <AppRoutes />
          <ScrollToTop />
          <OfflineIndicator />
          <InstallModal />
        </div>
      </BrowserRouter>
      <AnimatePresence>
        {splashVisible && <SplashScreen key="splash" />}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <InstallProvider>
          <ToastProvider>
            <GlassToastProvider>
              <NotificationProvider>
                <Router />
              </NotificationProvider>
            </GlassToastProvider>
          </ToastProvider>
        </InstallProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
