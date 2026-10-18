import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { Spinner } from '../components/ui/Loader';
import { SkeletonCard } from '../components/ui/Skeleton';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { GlassPanel } from '../components/ui/Glass';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';
import { PDFExportModal } from '../components/ui/PDFExportModal';
import { ReassignRoutineModal } from '../components/ReassignRoutineModal';
import { runAIJob, ocrUpdatePatient, fileToBase64 } from '../lib/ai';
import { formatAIReport } from '../lib/formatReport';
import { formatLongDate } from '../lib/format';
import { useAuthStore } from '../stores/authStore';
import { logPatientRecordAccess } from '../lib/auditService';
import { getUnifiedPatientById } from '../data/unifiedDemoData';
import { cn, isValidUUID } from '../lib/utils';
import { PatientStatisticsView } from '../components/patient/PatientStatisticsView';
import { JointDetailPopover } from '../components/ui/JointDetailPopover';
import { TherapistQuickToolbar } from '../components/ui/TherapistQuickToolbar';
import {
  StrengthProgressionCard,
  RehabPhaseStepCard,
  PatientAdherenceHeatmapCard,
  PostureStabilityCard,
  EdemaAssessmentCard,
  TremorFrequencyCard,
} from '../components/ui/ActivityCardsSuite';
import { AIBiomechanicalSummaryBadge } from '../components/ui/RealTimeMetricsSuite';
import { CompactTelehealthBar } from '../components/ui/NavigationDocksSuite';
import { ScrollProgress } from '../components/ui/ScrollProgress';

interface SessionRow {
  id: string;
  fecha: string;
  ejercicio_nombre: string | null;
  duracion_segundos: number | null;
  repeticiones: number | null;
  calidad_ejecucion: number | null;
  notas: string | null;
  compensaciones_detectadas: unknown;
  adherencia: number | null;
}

interface ExerciseRow {
  id: string;
  ejercicio_nombre: string | null;
  series: number | null;
  repeticiones: number | null;
}

interface RoutineRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  ejercicios: unknown;
  activa: boolean | null;
  status: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  updated_at: string | null;
}

interface PatientProfile {
  id: string;
  full_name: string;
  diagnostico: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  documento_identidad: string | null;
  telefono: string | null;
  tipo_sangre: string | null;
  ocupacion: string | null;
  nivel_actividad: string | null;
  es_menor_edad: boolean | null;
  patologia: string | null;
  diagnostico_secundario: string | null;
  medicamentos_actuales: string | null;
  alergias: string | null;
  enfermedades_cronicas: string | null;
  lesiones_previas: string | null;
  estatura_cm: number | null;
  peso_kg: number | null;
  extremidad_afectada: string | null;
  rom_objetivo: string | null;
  frecuencia_sesiones: string | null;
  medico_remitente: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  tutor_nombre: string | null;
  tutor_telefono: string | null;
  tutor_email: string | null;
}

type Tab = 'overview' | 'history' | 'routine' | 'statistics';

export function PatientDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [routineAdjusting, setRoutineAdjusting] = useState(false);
  const [routineNote, setRoutineNote] = useState('');
  const [showOcrUpdateModal, setShowOcrUpdateModal] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrUpdateFile, setOcrUpdateFile] = useState<File | null>(null);
  const [ocrSuggestedChanges, setOcrSuggestedChanges] = useState<Record<string, string> | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [routineHistory, setRoutineHistory] = useState<RoutineRow[]>([]);
  const [showRoutineHistory, setShowRoutineHistory] = useState(false);

  useEffect(() => {
    if (id) {
      loadPatient(id);
      logPatientRecordAccess(user?.id, user?.email, id).catch(() => {});
    }
  }, [id, user?.id, user?.email]);

  const loadPatient = async (patientId: string) => {
    setLoading(true);
    const demoPatient = getUnifiedPatientById(patientId);
    const isRealUUID = isValidUUID(patientId);

    try {
      if (!isRealUUID) {
        if (demoPatient) {
          setPatient({
            id: demoPatient.id,
            full_name: demoPatient.name,
            email: demoPatient.email,
            diagnostico: demoPatient.diagnosis,
            patologia: demoPatient.patologia,
            telefono: demoPatient.phone,
            tipo_sangre: demoPatient.bloodType,
            ocupacion: demoPatient.occupation,
            nivel_actividad: demoPatient.activityLevel,
            estatura_cm: demoPatient.heightCm,
            peso_kg: demoPatient.weightKg,
            extremidad_afectada: demoPatient.affectedLimb,
            rom_objetivo: demoPatient.targetRom,
            frecuencia_sesiones: demoPatient.frequency,
            medico_remitente: demoPatient.referringDoctor,
            contacto_emergencia_nombre: demoPatient.emergencyContact.name,
            contacto_emergencia_telefono: demoPatient.emergencyContact.phone,
            fecha_nacimiento: '1990-05-14',
            documento_identidad: demoPatient.fmId,
            es_menor_edad: false,
            diagnostico_secundario: null,
            medicamentos_actuales: null,
            alergias: null,
            enfermedades_cronicas: null,
            lesiones_previas: null,
            tutor_nombre: null,
            tutor_telefono: null,
            tutor_email: null,
          } as unknown as PatientProfile);
          setSessions(demoPatient.sessions as unknown as SessionRow[]);
          setExercises(demoPatient.exercises as unknown as ExerciseRow[]);
        }
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id, full_name, diagnostico, email,
          fecha_nacimiento, documento_identidad, telefono, tipo_sangre,
          ocupacion, nivel_actividad, es_menor_edad,
          patologia, diagnostico_secundario, medicamentos_actuales, alergias,
          enfermedades_cronicas, lesiones_previas, estatura_cm, peso_kg,
          extremidad_afectada, rom_objetivo, frecuencia_sesiones, medico_remitente,
          contacto_emergencia_nombre, contacto_emergencia_telefono,
          tutor_nombre, tutor_telefono, tutor_email
        `)
        .eq('id', patientId)
        .maybeSingle();

      if (profile) {
        setPatient(profile as unknown as PatientProfile);
      } else if (demoPatient) {
        setPatient({
          id: demoPatient.id,
          full_name: demoPatient.name,
          email: demoPatient.email,
          diagnostico: demoPatient.diagnosis,
          patologia: demoPatient.patologia,
          telefono: demoPatient.phone,
          tipo_sangre: demoPatient.bloodType,
          ocupacion: demoPatient.occupation,
          nivel_actividad: demoPatient.activityLevel,
          estatura_cm: demoPatient.heightCm,
          peso_kg: demoPatient.weightKg,
          extremidad_afectada: demoPatient.affectedLimb,
          rom_objetivo: demoPatient.targetRom,
          frecuencia_sesiones: demoPatient.frequency,
          medico_remitente: demoPatient.referringDoctor,
          contacto_emergencia_nombre: demoPatient.emergencyContact.name,
          contacto_emergencia_telefono: demoPatient.emergencyContact.phone,
          fecha_nacimiento: '1990-05-14',
          documento_identidad: demoPatient.fmId,
          es_menor_edad: false,
          diagnostico_secundario: null,
          medicamentos_actuales: null,
          alergias: null,
          enfermedades_cronicas: null,
          lesiones_previas: null,
          tutor_nombre: null,
          tutor_telefono: null,
          tutor_email: null,
        } as unknown as PatientProfile);
      }

      const { data: sessionData } = await supabase
        .from('sesiones_completadas')
        .select('id, fecha, ejercicio_nombre, duracion_segundos, repeticiones, calidad_ejecucion, notas, compensaciones_detectadas, adherencia')
        .eq('paciente_id', patientId)
        .order('fecha', { ascending: false });

      if (sessionData && sessionData.length > 0) {
        setSessions(sessionData as unknown as SessionRow[]);
      } else if (demoPatient) {
        setSessions(demoPatient.sessions as unknown as SessionRow[]);
      }

      const { data: exerciseData } = await supabase
        .from('patient_exercises')
        .select('id, ejercicio_nombre, series, repeticiones')
        .eq('paciente_id', patientId);

      if (exerciseData && exerciseData.length > 0) {
        setExercises(exerciseData as unknown as ExerciseRow[]);
      } else if (demoPatient) {
        setExercises(demoPatient.exercises as unknown as ExerciseRow[]);
      }
    } catch {
      if (demoPatient) {
        setPatient({
          id: demoPatient.id,
          full_name: demoPatient.name,
          email: demoPatient.email,
          diagnostico: demoPatient.diagnosis,
          patologia: demoPatient.patologia,
          telefono: demoPatient.phone,
          tipo_sangre: demoPatient.bloodType,
          ocupacion: demoPatient.occupation,
          nivel_actividad: demoPatient.activityLevel,
          estatura_cm: demoPatient.heightCm,
          peso_kg: demoPatient.weightKg,
          extremidad_afectada: demoPatient.affectedLimb,
          rom_objetivo: demoPatient.targetRom,
          frecuencia_sesiones: demoPatient.frequency,
          medico_remitente: demoPatient.referringDoctor,
          contacto_emergencia_nombre: demoPatient.emergencyContact.name,
          contacto_emergencia_telefono: demoPatient.emergencyContact.phone,
          fecha_nacimiento: '1990-05-14',
          documento_identidad: demoPatient.fmId,
          es_menor_edad: false,
          diagnostico_secundario: null,
          medicamentos_actuales: null,
          alergias: null,
          enfermedades_cronicas: null,
          lesiones_previas: null,
          tutor_nombre: null,
          tutor_telefono: null,
          tutor_email: null,
        } as unknown as PatientProfile);
        setSessions(demoPatient.sessions as unknown as SessionRow[]);
        setExercises(demoPatient.exercises as unknown as ExerciseRow[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSessions = sessions.length;
  const _totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duracion_segundos || 0), 0) / 60);
  const avgQuality = sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.calidad_ejecucion || 0), 0) / sessions.length) : 0;
  const lastSession = sessions[0];
  const daysSinceLast = lastSession ? Math.floor((Date.now() - new Date(lastSession.fecha).getTime()) / 86400000) : null;
  const recoveryProgress = avgQuality;
  const adherenceLevelKey = avgQuality >= 80 ? 'patientDetail.highAdherence' : avgQuality >= 50 ? 'patientDetail.mediumAdherence' : 'patientDetail.lowAdherence';
  const adherenceLevel = t(adherenceLevelKey);

  const weekLabels = Array.from({ length: 8 }, (_, i) => i === 7 ? t('patients.current') : `${i + 1}`);
  const weekBuckets = Array(8).fill(0);
  sessions.forEach(s => {
    const weeksAgo = Math.floor((Date.now() - new Date(s.fecha).getTime()) / (7 * 86400000));
    if (weeksAgo >= 0 && weeksAgo < 8) weekBuckets[7 - weeksAgo] += s.calidad_ejecucion || 0;
  });
  const maxWeekVal = Math.max(...weekBuckets, 1);

  const generateInsight = async () => {
    setAiLoading(true);
    setAiInsight('');
    try {
      const dataContext = JSON.stringify({
        patient: patient?.full_name,
        diagnosis: patient?.diagnostico,
        totalSessions,
        avgQuality,
        sessions: sessions.slice(0, 10),
      });
      const result = await runAIJob('insights', {
        userPrompt: `Basado en este insight clínico: "${aiInsight}", genera una recomendación de ajuste de rutina concisa. Responde en ${i18n.language}.`,
      });
      if (result.success && result.result) setAiInsight(result.result);
      else setAiInsight(t('dashboard.noInsightNow'));
    } catch {
      setAiInsight(t('patientDetail.physiConnectError'));
    } finally {
      setAiLoading(false);
    }
  };

  const applyRecommendations = async () => {
    if (!patient || !aiInsight) return;
    setRoutineAdjusting(true);
    try {
      const result = await runAIJob('text_generation', {
        userPrompt: `Basado en este insight clínico: "${aiInsight}", genera una recomendación de ajuste de rutina concisa para el paciente ${patient.full_name} con diagnóstico ${patient.diagnostico || 'no especificado'}. Incluye cambios sugeridos en series, repeticiones o frecuencia.`,
      });
      const recommendation = result.success && result.result ? result.result : t('patientDetail.keepRoutineRecommendation');
      setRoutineNote(recommendation);
      setShowRoutineModal(true);
    } catch {
      setRoutineNote('No se pudo generar la recomendación en este momento. Por favor, ajusta la rutina manualmente desde la pestaña Rutina Asignada.');
      setShowRoutineModal(true);
    } finally {
      setRoutineAdjusting(false);
    }
  };

  const loadRoutineHistory = async () => {
    if (!id) return;
    if (!isValidUUID(id)) {
      setRoutineHistory([
        {
          id: 'demo-routine-1',
          nombre: 'patientDetail.demoRoutinePhase1',
          descripcion: 'patientDetail.demoRoutinePhase1Desc',
          ejercicios: exercises,
        },
      ]);
      setShowRoutineHistory(true);
      return;
    }
    try {
      const { data } = await supabase
        .from('rutinas')
        .select('id, nombre, descripcion, ejercicios, activa, status, fecha_inicio, fecha_fin, updated_at')
        .eq('paciente_id', id)
        .order('updated_at', { ascending: false, nullsFirst: false } as { ascending: boolean });
      setRoutineHistory((data || []) as unknown as RoutineRow[]);
      setShowRoutineHistory(true);
    } catch {
      toast.error(t('patientDetail.routineLoadError'));
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Resumen', icon: 'dashboard' },
    { id: 'history', label: 'Historial Clínico', icon: 'history' },
    { id: 'routine', label: 'Rutina Asignada', icon: 'assignment' },
    { id: 'statistics', label: 'Estadísticas', icon: 'bar_chart' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="empty-state-premium text-center py-20">
        <Icon name="person_off" size={64} className="mx-auto text-outline mb-4 opacity-30" />
        <p className="text-on-surface-variant">No encontramos el paciente que buscas. Es posible que el registro haya sido removido o el enlace sea incorrecto.</p>
        <button onClick={() => navigate('/patients')} className="premium-btn mt-4 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">
          Volver al Directorio
        </button>
      </div>
    );
  }

  return (
    <div className="fm-page pb-12">
      <ScrollProgress className="top-0 fixed z-50 h-1 bg-gradient-to-r from-teal-500 to-info" />

      {/* Patient Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-surface/85 dark:bg-surface-container-low/70 border border-outline/15 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-sm shadow-teal-500/20">
            {patient.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="fm-title text-on-surface">
                {patient.full_name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                {adherenceLevel}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              {patient.diagnostico || patient.patologia || t('patientDetail.noDiagnosisRecorded')}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-outline">
              <span className="font-bold">ID: #{patient.id.slice(0, 8)}</span>
              <span>•</span>
              {daysSinceLast !== null ? (
                <span className={daysSinceLast > 7 ? 'text-warning font-bold' : 'text-emerald-600 font-bold'}>
                  {daysSinceLast > 7 ? t('patientDetail.inactiveDays', { d: daysSinceLast }) : t('patientDetail.recentSession')}
                </span>
              ) : (
                <span>{t('patients.newEntry')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons & Therapist Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <TherapistQuickToolbar
            onVoiceNote={() => toast.success(t('patientDetail.voiceNoteSaved'))}
            onSnapshot={() => toast.success(t('patientDetail.biomechCaptureSaved'))}
            onAdjustTargetAngle={() => toast.info(`Ajustando objetivo angular (${patient.rom_objetivo || '135°'})`)}
          />

          <button
            onClick={() => setShowOcrUpdateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline/15 text-on-surface text-xs font-bold transition-all flex items-center gap-2"
          >
            <Icon name="upload_file" size={16} className="text-primary" />
            <span>{t('patients.updateWithOCR')}</span>
          </button>

          <button
            onClick={() => setShowPDFModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline/15 text-on-surface text-xs font-bold transition-all flex items-center gap-2"
          >
            <Icon name="picture_as_pdf" size={16} />
            <span>{t('patients.exportPDF')}</span>
          </button>

          <button
            onClick={() => navigate(`/ar-mirror?patientId=${patient.id}`)}
            className="px-5 py-2.5 rounded-2xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all shadow-sm shadow-primary/20 flex items-center gap-2"
          >
            <Icon name="videocam" size={16} />
            <span>{t('navigation.arMirror')}</span>
          </button>
        </div>
      </div>

      {/* Telehealth & AI Biomechanical Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIBiomechanicalSummaryBadge
          qualityScore={Math.min(98, Math.max(70, Math.round(75 + recoveryProgress * 0.25)))}
          postureState={recoveryProgress > 60 ? t('patientDetail.optimalSymmetry') : t('patientDetail.mildDeviation')}
          lastUpdated={t('patientDetail.evaluatedLastSession')}
        />
        <CompactTelehealthBar
          therapistName={patient.full_name}
          status={t('patientDetail.activeTeleconsult')}
          onQuickCall={() => {
            if (patient.telefono) window.location.href = `tel:${patient.telefono}`;
            else toast.info(t('patientDetail.noPhoneRegistered'));
          }}
          onQuickMessage={() => navigate('/ai-assistant')}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-surface-container/60 border border-outline/15 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clinical data card */}
          <GlassPanel className="card-glow-hover lg:col-span-3 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><MedicalIcon name="activity" size={24} /></div>
              <div>
                <h3 className="fm-section-title">{t('patientDetail.clinicalData')}</h3>
                <p className="text-xs text-on-surface-variant">Información extraída del expediente y documentos médicos</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: t('patients.pathology'), value: patient.patologia || patient.diagnostico, icon: 'medical_information' },
                { label: t('patientDetail.secondaryDiagnosis'), value: patient.diagnostico_secundario, icon: 'medical_information' },
                { label: t('patientDetail.currentMedications'), value: patient.medicamentos_actuales, icon: 'medication' },
                { label: t('patientDetail.allergies'), value: patient.alergias, icon: 'warning' },
                { label: t('patientDetail.chronicConditions'), value: patient.enfermedades_cronicas, icon: 'coronavirus' },
                { label: t('patientDetail.previousInjuries'), value: patient.lesiones_previas, icon: 'healing' },
                { label: t('patientDetail.affectedLimb'), value: patient.extremidad_afectada, icon: 'accessibility' },
                { label: t('patientDetail.targetRom'), value: patient.rom_objetivo, icon: 'straighten' },
                { label: t('patientDetail.sessionFrequency'), value: patient.frecuencia_sesiones, icon: 'event_repeat' },
                { label: t('patientDetail.attendingPhysician'), value: patient.medico_remitente, icon: 'person' },
                { label: t('patientDetail.bloodType'), value: patient.tipo_sangre, icon: 'bloodtype' },
                { label: t('patientDetail.occupation'), value: patient.ocupacion, icon: 'work' },
                { label: t('patientDetail.activityLevel'), value: patient.nivel_actividad, icon: 'directions_run' },
                { label: t('patientDetail.height'), value: patient.estatura_cm != null ? `${patient.estatura_cm} cm` : null, icon: 'height' },
                { label: t('patientDetail.weight'), value: patient.peso_kg != null ? `${patient.peso_kg} kg` : null, icon: 'monitor_weight' },
                { label: t('patientDetail.idDocument'), value: patient.documento_identidad, icon: 'badge' },
                { label: t('profile.phone'), value: patient.telefono, icon: 'phone' },
                { label: t('patientDetail.birthDate'), value: patient.fecha_nacimiento, icon: 'cake' },
              ].map((field) => (
                <div key={field.label} className="p-4 rounded-xl bg-surface-variant/10 border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={field.icon} size={14} className="text-outline" />
                    <span className="text-2xs font-bold uppercase tracking-wider text-outline">{field.label}</span>
                  </div>
                  <p className="text-sm text-on-surface font-medium">{field.value || t('patientDetail.notRegistered')}</p>
                </div>
              ))}
            </div>
            {(patient.contacto_emergencia_nombre || patient.contacto_emergencia_telefono) && (
              <div className="mt-4 p-4 rounded-xl bg-error/5 border border-error/10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="emergency" size={16} className="text-error" />
                  <span className="text-xs font-bold uppercase tracking-wider text-error">{t('patientDetail.emergencyContact')}</span>
                </div>
                <p className="text-sm text-on-surface">{patient.contacto_emergencia_nombre || t('patientDetail.noName')} - {patient.contacto_emergencia_telefono || t('patientDetail.noPhone')}</p>
              </div>
            )}
            {patient.es_menor_edad && (patient.tutor_nombre || patient.tutor_telefono || patient.tutor_email) && (
              <div className="mt-4 p-4 rounded-xl bg-warning/10 dark:bg-warning/15 border border-warning/25">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="guardian" size={16} className="text-warning dark:text-warning" />
                  <span className="text-xs font-bold uppercase tracking-wider text-warning dark:text-warning">{t('patientDetail.tutorData')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-on-surface">
                  <span>{patient.tutor_nombre || t('patientDetail.noName')}</span>
                  <span>{patient.tutor_telefono || t('patientDetail.noPhone')}</span>
                  <span>{patient.tutor_email || t('patientDetail.noEmail')}</span>
                </div>
              </div>
            )}
          </GlassPanel>
          <GlassPanel className="card-glow-hover lg:col-span-2 p-8 rounded-3xl">
            <h3 className="fm-section-title mb-2 flex items-center gap-2">
              <MedicalIcon name="activity" size={20} className="text-primary" /> Progreso Biomecánico
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">Evolución del Rango de Movimiento (ROM)</p>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-5xl font-extrabold text-primary">{recoveryProgress > 0 ? `${recoveryProgress}%` : '—'}</span>
              <span className="text-sm text-on-surface-variant mb-2">{t('patientDetail.globalRecovery')}</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2">
              {weekBuckets.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-t-xl relative group cursor-pointer transition-all",
                      i === 7
                        ? "bg-gradient-to-t from-teal-600 to-teal-400 shadow-sm shadow-teal-500/30"
                        : "bg-teal-500/20 hover:bg-teal-500/35 dark:bg-teal-400/20 dark:hover:bg-teal-400/35"
                    )}
                    style={{ height: `${Math.max((v / maxWeekVal) * 100, 8)}%` }}
                  >
                    {i === 7 && recoveryProgress > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xs font-bold bg-primary text-on-primary px-2 py-1 rounded-full shadow-card whitespace-nowrap">ACT: {recoveryProgress}%</div>
                    )}
                  </div>
                  <span className="text-2xs text-outline font-medium">{weekLabels[i]}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline/15 mt-4">
              <JointDetailPopover
                triggerLabel={t('patientDetail.detailedJointInspection')}
                metrics={{
                  jointName: patient.extremidad_afectada || t('patientDetail.jointInTreatment'),
                  currentRom: Math.round(80 + recoveryProgress * 0.5),
                  maxHistoricalRom: 140,
                  angularVelocity: 42,
                  asymmetryPercentage: Math.max(4, Math.round(20 - recoveryProgress * 0.15)),
                  status: recoveryProgress > 70 ? 'normal' : 'warning',
                }}
              />
              <span className="text-xs font-semibold text-outline">
                Objetivo Prescrito: {patient.rom_objetivo || '135°'}
              </span>
            </div>
          </GlassPanel>

          <div className="space-y-4">
            <RehabPhaseStepCard initialStep={recoveryProgress > 70 ? 2 : recoveryProgress > 30 ? 1 : 0} />
            <StrengthProgressionCard currentMaxKg={18} baselineKg={8} targetKg={25} />
            <GlassPanel className="card-glow-hover p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="check_circle" size={20} className="text-primary" />
                <span className="text-sm text-on-surface-variant font-semibold">{t('patientDetail.completedSessions')}</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{totalSessions}</p>
              {sessions.length > 1 && (
                <p className="text-xs text-outline">{daysSinceLast !== null ? `Última: hace ${daysSinceLast} día(s)` : ''}</p>
              )}
            </GlassPanel>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PatientAdherenceHeatmapCard />
            <PostureStabilityCard balanceScore={Math.min(99, Math.max(70, Math.round(75 + recoveryProgress * 0.25)))} />
            <TremorFrequencyCard frequencyHz={2.4} amplitudeMm={1.8} status={t('patientDetail.physiologicalRange')} />
            <EdemaAssessmentCard grade={recoveryProgress > 75 ? 1 : 2} circumDeltaMm={recoveryProgress > 75 ? 3 : 8} />
          </div>

          <GlassPanel className="card-glow-hover lg:col-span-3 p-8 rounded-3xl bg-primary-container border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Icon name="psychology" filled size={24} className="text-on-primary-container" />
              </div>
              <div>
                <p className="font-bold text-on-primary-container text-lg">{t('patientDetail.aiInsight')}</p>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-on-primary-container/80">
                    <Spinner size={16} className="text-on-primary-container" /> Analizando datos del paciente...
                  </div>
                ) : aiInsight ? (
                  <div className="text-sm text-on-primary-container/90 leading-relaxed mt-2 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    {formatAIReport(aiInsight)}
                  </div>
                ) : (
                  <p className="text-sm text-on-primary-container/80">{t('patientDetail.generateInsightFor', { name: patient.full_name })}</p>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="auto_awesome" size={14} className="text-on-primary-container" />
                <p className="text-2xs font-bold uppercase tracking-widest text-on-primary-container/80">{t('patientDetail.physiSuggestion')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={generateInsight} disabled={aiLoading} className="flex-1 py-2.5 bg-on-primary-container text-primary font-bold text-xs rounded-xl transition-all hover:bg-on-primary-container/90 active:scale-95 shadow-sm disabled:opacity-50">
                  {aiInsight ? t('patientDetail.regenerateInsight') : t('common.consult')}
                </button>
                {aiInsight && (
                  <button onClick={applyRecommendations} disabled={routineAdjusting} className="flex-1 py-2.5 bg-white/20 text-on-primary-container font-bold text-xs rounded-xl transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1">
                    {routineAdjusting ? <><Spinner size={14} className="text-current" /> Analizando...</> : <><Icon name="tune" size={14} /> Aplicar Recomendaciones</>}
                  </button>
                )}
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel className="card-glow-hover p-8 rounded-3xl">
            <h3 className="fm-section-title mb-6">{t('navigation.history')}{' '}{t('patientDetail.clinical')}</h3>
            {sessions.length === 0 ? (
              <div className="empty-state-premium text-center py-12">
                <Icon name="history" size={48} className="mx-auto text-outline opacity-30 mb-3" />
                <p className="text-on-surface-variant">Aún no hay sesiones registradas. Inicia la primera sesión AR para comenzar el seguimiento del progreso.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((s, i) => (
                  <div key={s.id || i} className="flex gap-4 pb-4 border-b border-outline-variant/10 last:border-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon name="event" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-on-surface">{s.ejercicio_nombre || t('patients.sessionDefault')}</p>
                          <p className="text-sm text-on-surface-variant">{formatLongDate(s.fecha)}</p>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${(s.calidad_ejecucion || 0) >= 80 ? 'bg-success/15 text-success' : (s.calidad_ejecucion || 0) >= 50 ? 'bg-secondary/15 text-secondary' : 'bg-error-container text-on-error-container'}`}>
                          {s.calidad_ejecucion != null && s.calidad_ejecucion > 0 ? `${s.calidad_ejecucion}%` : '—'}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-on-surface-variant">
                        {s.duracion_segundos && <span>{Math.round(s.duracion_segundos / 60)} min</span>}
                        {s.repeticiones && <span>{s.repeticiones} reps</span>}
                        {s.adherencia != null && <span className="text-primary font-bold">{s.adherencia}% adherencia</span>}
                      </div>
                      {s.notas && (
                        <div className="mt-2 p-3 rounded-xl bg-surface-container text-sm text-on-surface-variant">
                          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">{t('patientDetail.sessionNotes')}</p>
                          {s.notas}
                        </div>
                      )}
                      {Boolean(s.compensaciones_detectadas) && typeof s.compensaciones_detectadas === 'object' && String(s.compensaciones_detectadas) !== '[object Object]' && (
                        <div className="mt-2 p-3 rounded-xl bg-warning/10 text-sm text-warning">
                          <p className="text-xs font-bold uppercase tracking-wider mb-1">{t('patientDetail.detectedCompensations')}</p>
                          {String((s.compensaciones_detectadas as Record<string, unknown>).tipo || t('patientDetail.compensationDetected'))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </motion.div>
      )}

      {activeTab === 'routine' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <GlassPanel className="card-glow-hover p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h3 className="fm-section-title">{t('patientDetail.assignedRoutine')}</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => loadRoutineHistory()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all text-sm font-bold"
                  aria-label={t('patientDetail.viewRoutineHistory')}
                >
                  <Icon name="history" size={18} /> {t('navigation.help' )==='x'? '':t('common.history')}
                </button>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:scale-[1.02] active:scale-95 transition-all text-sm font-bold shadow-card shadow-primary/20"
                  aria-label={t('patientDetail.assignNewRoutine')}
                >
                  <Icon name="autorenew" size={18} /> {t('patientDetail.reassignRoutine')}
                </button>
              </div>
            </div>
            {exercises.length === 0 ? (
              <div className="empty-state-premium text-center py-12">
                <MedicalIcon name="exercise" size={48} className="mx-auto text-outline opacity-30 mb-3" />
                <p className="text-on-surface-variant">No hay ejercicios asignados todavía. Diseña una rutina personalizada para impulsar la recuperación.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((ex, i) => (
                  <div key={ex.id || i} className="glass-panel card-glow-hover p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
                      <MedicalIcon name="walk" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface">{ex.ejercicio_nombre || 'Ejercicio'}</p>
                      <p className="text-sm text-on-surface-variant">
                        {ex.series || 0} series • {ex.repeticiones || 0} repeticiones
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </motion.div>
      )}

      {activeTab === 'statistics' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <PatientStatisticsView
            patientName={patient.full_name}
            targetRom={patient.rom_objetivo}
            affectedLimb={patient.extremidad_afectada}
            sessions={sessions}
            exercises={exercises}
          />
        </motion.div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
          <Icon name="arrow_back" size={18} /> {t('common.back')}
        </button>
        <button onClick={() => setShowPDFModal(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
          <Icon name="picture_as_pdf" size={18} /> {t('patientDetail.exportReport')}
        </button>
      </div>

      {/* Routine adjustment modal */}
      {showRoutineModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowRoutineModal(false)}>
          <div className="glass-panel rounded-3xl p-5 sm:p-6 lg:p-8 max-w-full sm:max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="tune" size={24} className="text-primary" />
              </div>
              <h3 className="fm-section-title">{t('patientDetail.routineAdjustRec')}</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{routineNote}</p>
            <div className="bg-surface-variant/10 rounded-2xl p-4 mb-4">
              <p className="text-xs text-on-surface-variant mb-2 font-semibold uppercase tracking-wider">{t('patientDetail.suggestedActions')}</p>
              <ul className="text-sm text-on-surface space-y-1.5">
                <li className="flex items-start gap-2"><Icon name="check_circle" size={16} className="text-success mt-0.5 shrink-0" /> Revisa los ejercicios actuales en la pestaña Rutina Asignada</li>
                <li className="flex items-start gap-2"><Icon name="check_circle" size={16} className="text-success mt-0.5 shrink-0" /> Considera ajustar series o repeticiones según el progreso</li>
                <li className="flex items-start gap-2"><Icon name="check_circle" size={16} className="text-success mt-0.5 shrink-0" /> Programa una sesión de seguimiento para verificar mejoras</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRoutineModal(false)} className="flex-1 px-6 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">{t('common.close')}</button>
              <button onClick={() => { setShowRoutineModal(false); setActiveTab('routine'); }} className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"><Icon name="assignment" size={18} /> Ir a Rutina</button>
            </div>
          </div>
        </div>
      )}

      <PDFExportModal
        open={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        data={{
          patientName: patient.full_name,
          diagnosis: patient.patologia || patient.diagnostico || undefined,
          sessions: sessions.slice(0, 20).map(s => ({
            fecha: s.fecha,
            ejercicio: s.ejercicio_nombre || 'Ejercicio',
            duracion_segundos: s.duracion_segundos || 0,
            repeticiones: s.repeticiones || 0,
            calidad_ejecucion: s.calidad_ejecucion || 0,
          })),
          globalMetrics: {
            totalSessions,
            avgQuality,
          },
          clinicalData: {
            fechaNacimiento: patient.fecha_nacimiento || undefined,
            tipoSangre: patient.tipo_sangre || undefined,
            medicamentos: patient.medicamentos_actuales || undefined,
            alergias: patient.alergias || undefined,
            extremidad: patient.extremidad_afectada || undefined,
            romObjetivo: patient.rom_objetivo || undefined,
            frecuenciaSesiones: patient.frecuencia_sesiones || undefined,
            medicoTratante: patient.medico_remitente || undefined,
            diagnosticoSecundario: patient.diagnostico_secundario || undefined,
            enfermedadesCronicas: patient.enfermedades_cronicas || undefined,
            lesionesPrevias: patient.lesiones_previas || undefined,
            estatura: patient.estatura_cm || undefined,
            peso: patient.peso_kg || undefined,
            contactoEmergencia: patient.contacto_emergencia_nombre || undefined,
            contactoEmergenciaTelefono: patient.contacto_emergencia_telefono || undefined,
          },
        }}
        filename={`reporte_${patient.full_name}.pdf`}
      />

      {/* OCR Update Modal */}
      {showOcrUpdateModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => !ocrProcessing && setShowOcrUpdateModal(false)}>
          <div className="glass-panel rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="document_scanner" size={24} className="text-primary" />
              </div>
              <h3 className="fm-section-title">{t('patientDetail.updateRecordDoc')}</h3>
            </div>

            {!ocrSuggestedChanges ? (
              <>
                <p className="text-sm text-on-surface-variant mb-4">Sube una nueva receta, informe o documento médico. La IA detectará automáticamente los campos que cambiaron y te sugerirá actualizaciones.</p>
                <div
                  onClick={() => !ocrProcessing && document.getElementById('ocr-update-file')?.click()}
                  className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                >
                  {ocrUpdateFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Icon name="description" size={24} />
                      <span className="text-sm font-bold">{ocrUpdateFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="cloud_upload" size={32} className="text-outline mx-auto mb-2" />
                      <p className="text-sm text-on-surface-variant">{t('patientDetail.clickToUpload')}</p>
                    </>
                  )}
                  <input id="ocr-update-file" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setOcrUpdateFile(e.target.files[0])} />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setShowOcrUpdateModal(false); setOcrUpdateFile(null); }} disabled={ocrProcessing} className="flex-1 px-6 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all disabled:opacity-50">{t('common.cancel')}</button>
                  <button onClick={async () => {
                    if (!ocrUpdateFile) return;
                    setOcrProcessing(true);
                    try {
                      const imageData = await fileToBase64(ocrUpdateFile);
                      const result = await ocrUpdatePatient(imageData.base64, patient.id, imageData.mimeType);
                      if (result.success && result.data) {
                        const changes: Record<string, string> = {};
                        const fieldMap: Record<string, string> = {
                          patologia: 'Patología',
                          diagnostico_secundario: 'Diagnóstico Secundario',
                          medicamentos_actuales: 'Medicamentos Actuales',
                          alergias: 'Alergias',
                          enfermedades_cronicas: 'Enfermedades Crónicas',
                          lesiones_previas: 'Lesiones Previas',
                          rom_objetivo: 'ROM Objetivo',
                          frecuencia_sesiones: 'Frecuencia de Sesiones',
                          extremidad_afectada: 'Extremidad Afectada',
                          estatura_cm: 'Estatura (cm)',
                          peso_kg: 'Peso (kg)',
                          medico_remitente: 'Médico Tratante',
                        };
                        for (const [key, label] of Object.entries(fieldMap)) {
                          if (result.data[key] != null && result.data[key] !== '') {
                            changes[label] = String(result.data[key]);
                          }
                        }
                        if (Object.keys(changes).length === 0) {
                          toast.info(t('patientDetail.noNewChanges'));
                          setShowOcrUpdateModal(false);
                        } else {
                          setOcrSuggestedChanges(changes);
                        }
                      } else {
                        toast.error(result.error || t('patientDetail.docAnalyzeError'));
                      }
                    } catch {
                      toast.error(t('patientDetail.docProcessError'));
                    } finally {
                      setOcrProcessing(false);
                    }
                  }} disabled={!ocrUpdateFile || ocrProcessing} className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {ocrProcessing ? <><Spinner size={18} className="text-white" /> Analizando...</> : <><Icon name="psychology" size={18} /> Analizar con IA</>}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant mb-4">La IA detectó los siguientes cambios. Revisa y confirma para actualizar el expediente:</p>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {Object.entries(ocrSuggestedChanges).map(([label, newValue]) => {
                    const dbField = label === 'Patología' ? 'patologia' : label === 'Diagnóstico Secundario' ? 'diagnostico_secundario' : label === 'Medicamentos Actuales' ? 'medicamentos_actuales' : label === 'Alergias' ? 'alergias' : label === 'Enfermedades Crónicas' ? 'enfermedades_cronicas' : label === 'Lesiones Previas' ? 'lesiones_previas' : label === 'ROM Objetivo' ? 'rom_objetivo' : label === 'Frecuencia de Sesiones' ? 'frecuencia_sesiones' : label === 'Extremidad Afectada' ? 'extremidad_afectada' : label === 'Estatura (cm)' ? 'estatura_cm' : label === 'Peso (kg)' ? 'peso_kg' : label === 'Médico Tratante' ? 'medico_remitente' : label;
                    const oldValue = (patient as unknown as Record<string, unknown>)[dbField];
                    return (
                      <div key={label} className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{label}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-on-surface-variant line-through opacity-60">{String(oldValue || 'Vacío')}</span>
                          <Icon name="arrow_forward" size={14} className="text-primary" />
                          <span className="text-on-surface font-bold">{newValue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setOcrSuggestedChanges(null); setOcrUpdateFile(null); }} className="flex-1 px-6 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">{t('common.cancel')}</button>
                  <button onClick={async () => {
                    if (!ocrSuggestedChanges) return;
                    const updates: Record<string, unknown> = {};
                    const fieldMap: Record<string, string> = {
                      'Patología': 'patologia',
                      'Diagnóstico Secundario': 'diagnostico_secundario',
                      'Medicamentos Actuales': 'medicamentos_actuales',
                      'Alergias': 'alergias',
                      'Enfermedades Crónicas': 'enfermedades_cronicas',
                      'Lesiones Previas': 'lesiones_previas',
                      'ROM Objetivo': 'rom_objetivo',
                      'Frecuencia de Sesiones': 'frecuencia_sesiones',
                      'Extremidad Afectada': 'extremidad_afectada',
                      'Estatura (cm)': 'estatura_cm',
                      'Peso (kg)': 'peso_kg',
                      'Médico Tratante': 'medico_remitente',
                    };
                    for (const [label, newValue] of Object.entries(ocrSuggestedChanges)) {
                      const dbField = fieldMap[label];
                      if (dbField === 'estatura_cm') updates[dbField] = parseInt(newValue);
                      else if (dbField === 'peso_kg') updates[dbField] = parseFloat(newValue);
                      else updates[dbField] = newValue;
                    }
                    updates['updated_at'] = new Date().toISOString();
                    if (!isValidUUID(patient.id)) {
                      setPatient((prev) => prev ? { ...prev, ...updates } : null);
                      toast.success(t('patientDetail.demoUpdated'));
                      setShowOcrUpdateModal(false);
                      setOcrSuggestedChanges(null);
                      setOcrUpdateFile(null);
                      return;
                    }
                    try {
                      const { error } = await supabase.from('profiles').update(updates).eq('id', patient.id);
                      if (error) {
                        toast.error(t('patientDetail.updateError') + ': ' + error.message);
                      } else {
                        toast.success(t('patientDetail.updateSuccess'));
                        setShowOcrUpdateModal(false);
                        setOcrSuggestedChanges(null);
                        setOcrUpdateFile(null);
                        loadPatient(patient.id);
                      }
                    } catch {
                      toast.error(t('patientDetail.updateConnectionError'));
                    }
                  }} className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Icon name="check_circle" size={18} /> {t('patientDetail.confirmChanges')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reassign Routine — Full-screen wizard */}
      <ReassignRoutineModal
        open={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        pacienteId={id || ''}
        fisioterapeutaId={user?.id || ''}
        pacienteNombre={patient.full_name}
        onSaved={() => {
          setShowReassignModal(false);
          if (id) loadPatient(id);
        }}
      />

      {/* Routine History Modal */}
      {showRoutineHistory && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowRoutineHistory(false)}>
          <div className="glass-panel rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
                <Icon name="history" size={24} className="text-primary" />
              </div>
              <h3 className="fm-section-title">{t('patientDetail.routineHistory')}</h3>
            </div>
            {routineHistory.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-8">{t('patientDetail.noRoutines')}</p>
            ) : (
              <div className="space-y-3">
                {routineHistory.map((r) => (
                  <div key={r.id} className={`p-4 rounded-2xl border ${r.activa ? 'bg-primary/5 border-primary/20' : 'bg-surface-container border-outline-variant/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-on-surface text-sm">{r.nombre}</p>
                      <span className={`text-2xs font-bold uppercase px-2 py-1 rounded-full ${r.activa ? 'bg-primary text-on-primary' : r.status === 'archivada' ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-secondary-container text-on-surface'}`}>
                        {r.activa ? 'Activa' : r.status === 'archivada' ? 'Archivada' : r.status || 'Inactiva'}
                      </span>
                    </div>
                    {r.descripcion && <p className="text-xs text-on-surface-variant mb-1">{r.descripcion}</p>}
                    <p className="text-xs text-outline">Inicio: {r.fecha_inicio}{r.updated_at ? ` · Actualizada: ${new Date(r.updated_at).toLocaleDateString('es-ES')}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowRoutineHistory(false)} className="w-full mt-4 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
