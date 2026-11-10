import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '../components/ui/Icon';
import { GlassPanel } from '../components/ui/Glass';
import { useToast } from '../components/ui/toastApi';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { runAIJob, fileToBase64 } from '../lib/ai';
import { exportSimplePDF, exportPremiumPDF, type PDFPatientData } from '../lib/pdfExport';
import { formatAIReport } from '../lib/formatReport';
import { Spinner } from '../components/ui/Loader';
import { LoadingText } from '../components/ui/LoadingText';
import { SkeletonCard, SkeletonReport } from '../components/ui/Skeleton';
import { AuditLogCard } from '../components/ui/AuditLogCard';
import { AnimatedTabs } from '../components/ui/AnimatedTabs';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ClinicalSlider } from '../components/ui/ClinicalSlider';
import {
  BiomechanicalTagSelector,
  PhysioNoteAnnotationBubble,
  FloatingMiniStopwatch,
  QuickPrescriptionModalButton,
} from '../components/ui/FloatingControlsSuite';
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid';
import { Calculator, Camera, FileText, Footprints, RotateCcw, Copy, Send, Bot } from 'lucide-react';
import { GaitCapturePanel } from '../components/patient/GaitCapturePanel';
import { currentLocale } from '../lib/format';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface PatientOption {
  id: string;
  full_name: string;
  diagnostico: string | null;
}

export function ToolsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [bmi, setBmi] = useState(23.5);
  const [bmiStatus, setBmiStatus] = useState('Peso Saludable');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hola. Soy Physi, tu asistente clínico. ¿En qué puedo ayudarte?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [scanProcessing, setScanProcessing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [patientSummaryLoading, setPatientSummaryLoading] = useState(false);
  const [patientSummaryText, setPatientSummaryText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfMode, setPdfMode] = useState<'simple' | 'ai'>('simple');
  const [showUpdatePatientModal, setShowUpdatePatientModal] = useState(false);
  const [updatePatientId, setUpdatePatientId] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updatePreview, setUpdatePreview] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanFileRef = useRef<File | null>(null);

  useEffect(() => {
    const h = height / 100;
    const result = weight / (h * h);
    setBmi(parseFloat(result.toFixed(1)));
    if (result < 18.5) setBmiStatus('Bajo Peso');
    else if (result < 25) setBmiStatus('Peso Saludable');
    else if (result < 30) setBmiStatus('Sobrepeso');
    else setBmiStatus('Obesidad');
  }, [height, weight]);

  const loadPatients = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('pacientes_terapeutas')
        .select('paciente_id')
        .eq('terapeuta_id', user.id);
      if (data && data.length > 0) {
        const ids = data.map((d) => d.paciente_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, diagnostico')
          .in('id', ids)
          .order('full_name', { ascending: true });
        if (profiles) setPatients(profiles as unknown as PatientOption[]);
      }
    } catch {
      // silently fail — patient list stays empty
    }
  }, [user]);


  const loadChatHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('ai_conversations')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);
      if (data && data.length > 0) {
        setChatMessages(data.map((d) => ({
          role: d.role as 'user' | 'assistant',
          text: d.content,
        })));
      }
    } catch {
      // keep default message
    }
  }, [user]);

  useEffect(() => {
    loadPatients();
    loadChatHistory();
  }, [loadPatients, loadChatHistory]);


  const handleScan = async () => {
    if (scanProcessing) return;
    setScanProcessing(true);
    setScanComplete(false);
    setScanResult(null);

    try {
      let imageBase64 = '';
      let imageMimeType = 'image/jpeg';
      if (scanFileRef.current) {
        const imageData = await fileToBase64(scanFileRef.current);
        imageBase64 = imageData.base64;
        imageMimeType = imageData.mimeType;
      }

      const result = await runAIJob('image_analysis', {
        imageBase64,
        mimeType: imageMimeType,
        prompt: `Analiza este documento clínico y extrae TODOS los datos visibles del paciente en formato JSON con exactamente estas claves:
{
  "nombre_completo": "",
  "documento_identidad": "",
  "fecha_nacimiento": "",
  "telefono": "",
  "tipo_sangre": "",
  "ocupacion": "",
  "nivel_actividad": "",
  "es_menor_edad": false,
  "patologia": "",
  "diagnostico_secundario": "",
  "medicamentos_actuales": "",
  "alergias": "",
  "enfermedades_cronicas": "",
  "lesiones_previas": "",
  "estatura_cm": "",
  "peso_kg": "",
  "extremidad_afectada": "",
  "rom_objetivo": "",
  "frecuencia_sesiones": "",
  "medico_remitente": "",
  "contacto_emergencia_nombre": "",
  "contacto_emergencia_telefono": ""
}
Si un campo no es visible en el documento, déjalo como string vacío. Responde SOLO con el JSON, sin markdown ni texto adicional.`,
      });

      if (result.success && result.result) {
        try {
          const cleaned = result.result
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          const parsed = JSON.parse(cleaned);
          setScanResult(parsed);
        } catch {
          setScanResult({ contenido: result.result });
        }
        setScanComplete(true);
        toast.success('Análisis completado');
      } else {
        toast.error(result.error || 'Error en el análisis');
      }
    } catch {
      toast.error('Error procesando el documento');
    } finally {
      setScanProcessing(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = chatInput;
    setChatMessages([...chatMessages, { role: 'user', text: userMsg }]);
    setChatInput('');
    setAiLoading(true);

    try {
      if (user?.id) {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          role: 'user',
          content: userMsg,
        });
      }

      const result = await runAIJob('text_generation', {
        userPrompt: userMsg,
      });

      let text = result.success && result.result ? result.result : 'Lo siento, hubo un error procesando tu consulta.';
      try {
        const parsed = JSON.parse(text);
        if (parsed.hallazgos || parsed.recomendaciones) {
          text = `${parsed.hallazgos || ''}\n\n${parsed.recomendaciones || ''}`;
        }
      } catch { /* not JSON */ }

      setChatMessages((prev) => [...prev, { role: 'assistant', text }]);

      if (user?.id) {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          role: 'assistant',
          content: text,
        });
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Error de conexión con Physi. Intenta de nuevo en unos momentos.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const generateSessionSummary = async () => {
    if (!selectedPatient) {
      toast.error('Selecciona un paciente');
      return;
    }
    setSummaryLoading(true);
    setSummaryText('');

    try {
      const { data: sessions } = await supabase
        .from('sesiones_completadas')
        .select('fecha, duracion_segundos, repeticiones, calidad_ejecucion')
        .eq('paciente_id', selectedPatient)
        .order('fecha', { ascending: false })
        .limit(5);

      const { data: patientProfile } = await supabase
        .from('profiles')
        .select('full_name, diagnostico')
        .eq('id', selectedPatient)
        .maybeSingle();

      const sessionData = {
        patientName: patientProfile?.full_name || 'Paciente',
        diagnosis: patientProfile?.diagnostico || 'No especificado',
        sessions: sessions || [],
      };

      const result = await runAIJob('summaries', {
        userPrompt: `Genera un resumen clínico de la sesión de rehabilitación con los siguientes datos reales del paciente: ${JSON.stringify(sessionData)}`,
      });

      if (result.success && result.result) {
        setSummaryText(result.result);
        toast.success('Resumen generado');
      } else {
        toast.error(result.error || 'Error generando resumen');
      }
    } catch {
      toast.error('Error generando resumen');
    } finally {
      setSummaryLoading(false);
    }
  };

  const generatePatientSummary = async () => {
    setPatientSummaryLoading(true);
    setPatientSummaryText('');

    try {
      const { data: links } = await supabase
        .from('pacientes_terapeutas')
        .select('paciente_id')
        .eq('terapeuta_id', user?.id);

      const patientIds = (links || []).map((l) => l.paciente_id);
      let summaryContext = 'No hay pacientes activos.';

      if (patientIds.length > 0) {
        const { data: patientProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, diagnostico')
          .in('id', patientIds);

        const { data: allSessions } = await supabase
          .from('sesiones_completadas')
          .select('paciente_id, fecha, duracion_segundos, repeticiones, calidad_ejecucion')
          .in('paciente_id', patientIds)
          .order('fecha', { ascending: false })
          .limit(30);

        summaryContext = JSON.stringify({
          patients: patientProfiles || [],
          recentSessions: allSessions || [],
        });
      }

      const result = await runAIJob('summaries', {
        userPrompt: `Genera un resumen general del progreso de todos los pacientes activos basado en los siguientes datos reales: ${summaryContext}`,
      });

      if (result.success && result.result) {
        setPatientSummaryText(result.result);
        toast.success('Resumen generado');
      } else {
        toast.error(result.error || 'Error generando resumen');
      }
    } catch {
      toast.error('Error generando resumen');
    } finally {
      setPatientSummaryLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedPatient) {
      toast.error('Selecciona un paciente primero');
      return;
    }
    setPdfLoading(true);
    try {
      const { data: patientProfile } = await supabase
        .from('profiles')
        .select('full_name, diagnostico')
        .eq('id', selectedPatient)
        .maybeSingle();

      const { data: sessions } = await supabase
        .from('sesiones_completadas')
        .select('fecha, ejercicio_nombre, duracion_segundos, repeticiones, calidad_ejecucion')
        .eq('paciente_id', selectedPatient)
        .order('fecha', { ascending: false })
        .limit(20);

      const { data: allSessions } = await supabase
        .from('sesiones_completadas')
        .select('calidad_ejecucion')
        .eq('paciente_id', selectedPatient);

      const totalSessions = allSessions?.length || 0;
      const avgQuality = allSessions && allSessions.length > 0
        ? allSessions.reduce((sum, s) => sum + (s.calidad_ejecucion || 0), 0) / allSessions.length
        : 0;

      const pdfData: PDFPatientData = {
        patientName: patientProfile?.full_name || 'Paciente',
        diagnosis: patientProfile?.diagnostico,
        sessions: (sessions || []).map((s) => ({
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
      };

      if (pdfMode === 'simple') {
        exportSimplePDF(pdfData, `FisioMirror_${pdfData.patientName}.pdf`);
        toast.success('PDF descargado correctamente');
      } else {
        const result = await runAIJob('pdf_report', {
          data: {
            patientName: pdfData.patientName,
            diagnosis: pdfData.diagnosis || 'No especificado',
            sessions: pdfData.sessions,
            globalMetrics: pdfData.globalMetrics,
          },
        });

        if (result.success && result.result) {
          await exportPremiumPDF(pdfData, `FisioMirror_IA_${pdfData.patientName}.pdf`, result.result);
          toast.success('PDF con IA descargado correctamente');
        } else {
          toast.error(result.error || 'Error generando PDF con IA');
        }
      }
    } catch {
      toast.error('Error al exportar el PDF');
    } finally {
      setPdfLoading(false);
      setPdfModalOpen(false);
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      scanFileRef.current = file;
      handleScan();
    }
  };

  const toolsGrid = (filter: 'todas' | 'ia' | 'ocr') => {
    const isIA = (id: string) => id === 'ocr' || id === 'summary' || id === 'patient-summary' || id === 'pdf-ai' || id === 'chat' || id === 'bmi' || id === 'gait';
    const isOCR = (id: string) => id === 'ocr';
    const showTool = (id: string) => filter === 'todas' || (filter === 'ia' && isIA(id)) || (filter === 'ocr' && isOCR(id));

    return (
    <>
            {showTool('ocr') && (
            <div id="tool-ocr" className="md:col-span-2 lg:col-span-3 p-6 sm:p-8 rounded-3xl relative overflow-hidden ios-glass-heavy refraction-border shadow-sm hover:shadow-xl transition-all duration-300 w-full scroll-mt-24">
            <div className="flex justify-between items-start mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <MedicalIcon name="clipboard" size={24} className="animate-breathe-icon" />
                </div>
                <div>
                  <h3 className="font-title-md text-xl font-bold text-teal-900 dark:text-teal-100">{t('tl.ocrTitle')}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t('tl.ocrDesc')}</p>
                </div>
              </div>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center gap-4 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 hover:border-teal-500/50 transition-all cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 shimmer-wave opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="size-16 bg-teal-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {scanProcessing ? <Spinner size={32} className="text-teal-600 dark:text-teal-400" /> : scanComplete ? <Icon name="check_circle" filled size={32} className="text-teal-600 animate-breathe-icon" /> : <Icon name="upload_file" size={32} className="text-teal-600 dark:text-teal-400" />}
              </div>
              <div>
                <p className="font-bold text-base text-on-surface">{scanProcessing ? <LoadingText context="ocr" /> : scanComplete ? 'Análisis Completado' : 'Arrastra o selecciona un documento clínico'}</p>
                <p className="text-xs text-on-surface-variant mt-1">{t('tl.ocrFormats')}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md shadow-teal-700/20 hover:scale-105 active:scale-95 transition-all">
                Seleccionar Archivo
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={onFileSelected} />
              </div>
            </div>

            {scanResult && (
              <div className="mt-4 p-5 ios-glass-heavy refraction-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-teal-800 dark:text-teal-200">{t('tr.resultado_del_analisis_22_campos')}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = Object.entries(scanResult as Record<string, unknown>)
                          .filter(([, v]) => v != null && v !== '' && v !== false)
                          .map(([k, v]) => `${k}: ${String(v)}`)
                          .join('\n');
                        try { navigator.clipboard?.writeText(text); toast.success('Texto copiado al portapapeles'); } catch { toast.error('No se pudo copiar'); }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors min-h-[36px]"
                    >
                      <Icon name="content_copy" size={16} /> Copiar texto
                    </button>
                    <button
                      onClick={() => { setShowUpdatePatientModal(true); setUpdatePreview({}); setUpdatePatientId(''); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors min-h-[36px] shadow-md"
                    >
                      <Icon name="person_update" size={16} /> Actualizar paciente
                    </button>
                  </div>
                </div>
                {(() => {
                  const r = scanResult as Record<string, unknown>;
                  const fields: { key: string; label: string }[] = [
                    { key: 'nombre_completo', label: 'Nombre Completo' },
                    { key: 'documento_identidad', label: 'Documento' },
                    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento' },
                    { key: 'telefono', label: 'Teléfono' },
                    { key: 'tipo_sangre', label: 'Tipo Sangre' },
                    { key: 'ocupacion', label: 'Ocupación' },
                    { key: 'nivel_actividad', label: 'Nivel Actividad' },
                    { key: 'es_menor_edad', label: 'Menor de Edad' },
                    { key: 'patologia', label: 'Patología' },
                    { key: 'diagnostico_secundario', label: 'Diagnóstico Secundario' },
                    { key: 'medicamentos_actuales', label: 'Medicamentos' },
                    { key: 'alergias', label: 'Alergias' },
                    { key: 'enfermedades_cronicas', label: 'Enf. Crónicas' },
                    { key: 'lesiones_previas', label: 'Lesiones Previas' },
                    { key: 'estatura_cm', label: 'Estatura (cm)' },
                    { key: 'peso_kg', label: 'Peso (kg)' },
                    { key: 'extremidad_afectada', label: 'Extremidad Afectada' },
                    { key: 'rom_objetivo', label: 'ROM Objetivo' },
                    { key: 'frecuencia_sesiones', label: 'Frecuencia Sesiones' },
                    { key: 'medico_remitente', label: 'Médico Tratante' },
                    { key: 'contacto_emergencia_nombre', label: 'Contacto Emergencia' },
                    { key: 'contacto_emergencia_telefono', label: 'Tel. Emergencia' },
                  ];
                  const hasStructured = fields.some(f => r[f.key] != null && r[f.key] !== '');
                  if (hasStructured) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fields.map(f => {
                          const val = r[f.key];
                          if (val == null || val === '' || val === false) return null;
                          return (
                            <div key={f.key} className="flex items-start gap-2 p-2 rounded-xl bg-teal-500/5 border border-teal-500/10">
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase whitespace-nowrap min-w-[80px]">{f.label}</span>
                              <span className="text-xs font-bold text-on-surface break-words">{String(val)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return Object.entries(r).map(([k, v]) => (
                    <p key={k} className="text-sm"><span className="text-on-surface-variant capitalize">{k}: </span><span className="font-bold">{String(v)}</span></p>
                  ));
                })()}
              </div>
            )}
          </div>
          )}

          {/* BMI Calculator with SpotlightCard & ClinicalSliders - Desktop Responsive Split */}
          {showTool('bmi') && (
          <div id="tool-bmi" className="md:col-span-2 lg:col-span-3 scroll-mt-24">
            <SpotlightCard className="p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-full border border-teal-500/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Sliders and numerical inputs */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-3 relative">
                    <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                      <Icon name="calculate" size={24} className="animate-breathe-icon" />
                    </div>
                    <div>
                      <h3 className="font-title-md text-xl font-bold text-teal-950 dark:text-teal-100">{t('tr.calculadora_imc', 'Calculadora de IMC y Composición')}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">{t('tl.ocrClassification', 'Clasificación antropométrica según estándares clínicos de la OMS')}</p>
                    </div>
                  </div>

                  <div className="space-y-5 p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/40 border border-teal-100/60 dark:border-slate-700/60">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">{t('tr.estatura', 'Estatura')}</span>
                        <div className="flex items-center gap-1.5">
                          {[160, 170, 180].map((hPreset) => (
                            <button
                              key={hPreset}
                              onClick={() => setHeight(hPreset)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${height === hPreset ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                              {hPreset} cm
                            </button>
                          ))}
                        </div>
                      </div>
                      <ClinicalSlider
                        value={height}
                        onChange={setHeight}
                        min={100}
                        max={240}
                        step={1}
                        label=""
                        unit=" cm"
                        ticks={[120, 150, 175, 200, 220]}
                      />
                    </div>

                    <div className="pt-2 border-t border-teal-200/40 dark:border-slate-700/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">{t('tr.peso', 'Peso')}</span>
                        <div className="flex items-center gap-1.5">
                          {[60, 72, 85].map((wPreset) => (
                            <button
                              key={wPreset}
                              onClick={() => setWeight(wPreset)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${weight === wPreset ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                              {wPreset} kg
                            </button>
                          ))}
                        </div>
                      </div>
                      <ClinicalSlider
                        value={weight}
                        onChange={setWeight}
                        min={30}
                        max={180}
                        step={1}
                        label=""
                        unit=" kg"
                        ticks={[40, 70, 100, 130, 160]}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Diagnostic Result Card */}
                <div className="lg:col-span-6">
                  <div className="p-6 sm:p-7 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl shadow-xl border border-teal-500/30 relative overflow-hidden">
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300 block mb-1">
                          {t('tr.imc_calculado', 'Índice de Masa Corporal')}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">{bmi}</span>
                          <span className="text-xs font-semibold text-teal-300">kg/m²</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md inline-block ${
                          bmiStatus === 'Peso Saludable' ? 'bg-emerald-500 text-white' :
                          bmiStatus === 'Bajo Peso' ? 'bg-amber-500 text-white' :
                          bmiStatus === 'Sobrepeso' ? 'bg-orange-500 text-white' :
                          'bg-rose-500 text-white'
                        }`}>
                          {bmiStatus}
                        </span>
                        <p className="text-[10px] text-teal-200 font-medium mt-1">Rango normal: 18.5 - 24.9</p>
                      </div>
                    </div>

                    {/* Gradient Scale Spectrum */}
                    <div className="relative my-4">
                      <div className="flex h-2.5 rounded-full overflow-hidden bg-white/20 p-0.5">
                        <div className="bg-amber-400 rounded-l-full" style={{ width: '14%' }} title="Bajo Peso (< 18.5)" />
                        <div className="bg-emerald-400" style={{ width: '26%' }} title="Peso Saludable (18.5 - 24.9)" />
                        <div className="bg-orange-400" style={{ width: '20%' }} title="Sobrepeso (25.0 - 29.9)" />
                        <div className="bg-rose-500 rounded-r-full" style={{ width: '40%' }} title="Obesidad (≥ 30.0)" />
                      </div>
                      {Number.isFinite(Number(bmi)) && (
                        <div
                          className="absolute -top-1.5 transition-all duration-300"
                          style={{ left: `calc(${Math.min(100, Math.max(0, ((Number(bmi) - 15) / 25) * 100))}% - 8px)` }}
                          title={`IMC ${bmi}`}
                        >
                          <div className="w-4 h-5 rounded-md bg-white shadow-lg border-2 border-slate-900 flex items-center justify-center">
                            <div className="w-1 h-2 rounded-full bg-teal-700" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3 Clinical Recommendations Metrics */}
                    <div className="grid grid-cols-3 gap-2.5 pt-4 mt-2 border-t border-teal-700/60 text-center">
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                        <span className="text-[9px] uppercase tracking-wider text-teal-300 block mb-0.5">Peso Óptimo</span>
                        <span className="text-xs font-bold font-mono">
                          {(18.5 * (height / 100) ** 2).toFixed(0)} - {(24.9 * (height / 100) ** 2).toFixed(0)} kg
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                        <span className="text-[9px] uppercase tracking-wider text-teal-300 block mb-0.5">Agua / Día</span>
                        <span className="text-xs font-bold font-mono">
                          {(weight * 0.035).toFixed(1)} L
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                        <span className="text-[9px] uppercase tracking-wider text-teal-300 block mb-0.5">Tasa Basal</span>
                        <span className="text-xs font-bold font-mono">
                          {Math.round(10 * weight + 6.25 * height - 5 * 30 + 5)} kcal
                        </span>
                      </div>
                    </div>

                    {/* Clinical prescription note */}
                    <p className="text-[11px] text-teal-200/90 leading-relaxed mt-3.5 italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                      {bmi < 18.5 ? '💡 Enfoque clínico: Priorizar fortalecimiento neuromuscular progresivo para ganancia de masa magra.' :
                       bmi < 25 ? '💡 Enfoque clínico: Relación peso-potencia óptima. Apto para cargas completas y pliometría funcional.' :
                       bmi < 30 ? '💡 Enfoque clínico: Evitar sobrecarga en articulaciones de choque. Priorizar cadena cinética cerrada y piscina.' :
                       '💡 Enfoque clínico: Protección articular mandatoria: descargar rodillas y tobillos con cicloergómetro o elíptica.'}
                    </p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
          )}

          {/* Gait Capture & Plantar Support Symmetry */}
          {showTool('gait') && (
          <div id="tool-gait" className="md:col-span-2 lg:col-span-3 p-6 sm:p-8 rounded-3xl relative overflow-hidden ios-glass-heavy refraction-border shadow-sm hover:shadow-xl transition-all duration-300 w-full scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Footprints size={24} className="animate-breathe-icon" />
                </div>
                <div>
                  <h3 className="font-title-md text-xl font-bold text-teal-950 dark:text-teal-100">Captura de Marcha y Simetría de Apoyo Plantar</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Telemetría de carga bilateral, baropodometría dinámica y fases de apoyo articular</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Visión MediaPipe &amp; Sensor
              </span>
            </div>

            <GaitCapturePanel />
          </div>
          )}

          {/* Session Summary */}
          {showTool('summary') && (
          <div id="tool-summary" className="md:col-span-2 lg:col-span-3 p-6 sm:p-8 rounded-3xl relative overflow-hidden ios-glass-heavy refraction-border shadow-sm hover:shadow-xl transition-all duration-300 w-full scroll-mt-24">
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Icon name="auto_awesome" size={24} className="animate-breathe-icon" />
              </div>
              <div>
                <h3 className="font-title-md text-xl font-bold text-teal-900 dark:text-teal-100">{t('tl.aiSessionTitle')}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{t('tl.aiSessionDesc')}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-outline-variant/30 outline-none focus:ring-2 focus:ring-teal-500/20 text-on-surface text-sm font-semibold">
                <option value="">{t('tl.selectPatient')}</option>
                {patients.length === 0 && <option value="" disabled>{t('tr.no_hay_pacientes_asignados')}</option>}
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
              <button onClick={generateSessionSummary} disabled={summaryLoading || !selectedPatient} className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-700/20 px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap">
                {summaryLoading ? <Spinner size={16} className="text-white" /> : <Icon name="auto_awesome" size={16} />}
                {summaryLoading ? <LoadingText context="ai" /> : 'Generar Resumen'}
              </button>
            </div>

            {/* Quick Clinical Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-teal-500/5 border border-teal-500/15">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">{t('tl.clinicalCriteria')}</span>
                <BiomechanicalTagSelector tags={['Movilidad', 'Fuerza', 'Propiocepción', 'Sin Dolor', 'Post-Op']} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <QuickPrescriptionModalButton />
                <FloatingMiniStopwatch />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="ios-glass-heavy refraction-border p-5 rounded-2xl space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="sensors" size={18} className="text-teal-600 dark:text-teal-400 animate-breathe-icon" />
                    <span className="font-bold text-sm text-on-surface">{t('tl.clinicalTelemetry')}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{t('tl.aiSessionNote')}</p>
                </div>
                <PhysioNoteAnnotationBubble
                  author="Fisio Supervisor"
                  noteText="Revisar progresión de ROM antes de aumentar repeticiones."
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <div className="ios-glass-heavy refraction-border rounded-2xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-teal-500/10 border-b border-teal-500/15">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-teal-600/15 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                        <MedicalIcon name="clipboard" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-teal-950 dark:text-teal-100">{t('tl.sessionReport')}</h4>
                        <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">{t('tl.aiSummary')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { if (summaryText) { try { navigator.clipboard?.writeText(summaryText); toast.info('Copiado al portapapeles'); } catch { toast.error('No se pudo copiar'); } } else { toast.error('No hay resumen para copiar'); } }} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-colors"><Icon name="content_copy" size={16} /></button>
                      <button onClick={() => { try { window.print(); } catch { toast.error('No se pudo imprimir'); } }} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-colors"><Icon name="print" size={16} /></button>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="px-5 py-5 min-h-[140px]">
                    {summaryText ? (
                      formatAIReport(summaryText)
                    ) : summaryLoading ? (
                      <SkeletonReport />
                    ) : (
                      <div className="empty-state-premium">
                        <Icon name="auto_awesome" size={32} className="opacity-40 mb-2" />
                        <p className="italic text-sm text-on-surface-variant leading-relaxed">Aún no hay un resumen clínico. Selecciona un paciente y pulsa «Generar Resumen» para obtener un análisis narrativo de las últimas sesiones.</p>
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  {summaryText && (
                    <div className="flex items-center justify-between px-5 py-3 bg-surface-variant/10 border-t border-outline-variant/20">
                      <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Icon name="schedule" size={12} className="opacity-60" />
                        {new Date().toLocaleString(currentLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { try { exportPremiumPDF({ patientName: 'Resumen de Sesión', sessions: [], globalMetrics: { totalSessions: 0, avgQuality: 0 } }, `FisioMirror_Informe_Sesion_${Date.now()}.pdf`, summaryText); toast.success('Descargando PDF...'); } catch { toast.error('No se pudo exportar'); } }}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Icon name="download" size={14} />
                          Descargar PDF
                        </button>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          <Icon name="auto_awesome" size={11} className="text-teal-600 dark:text-teal-400" />{t('tl.generatedByAi')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Patient Summary */}
          {showTool('patient-summary') && (
          <GlassPanel className="md:col-span-2 lg:col-span-3 p-6 sm:p-8 rounded-3xl card-glow-hover relative overflow-hidden border-l-4 border-l-teal-400/60 dark:border-l-teal-600/40 shadow-teal-100/50 dark:shadow-none w-full">
            <div className="blob-blue absolute -top-12 -right-12 w-40 h-40 opacity-25 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center"><Icon name="group" size={24} className="text-secondary animate-breathe-icon" /></div>
              <div>
                <h3 className="font-title-md text-title-md gradient-text-blue">{t('tl.patientsSummary')}</h3>
                <p className="text-sm text-on-surface-variant">{t('tl.patientsSummaryDesc')}</p>
              </div>
            </div>
            <button onClick={generatePatientSummary} disabled={patientSummaryLoading} className="premium-btn mb-4 bg-secondary text-on-secondary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {patientSummaryLoading ? <Spinner size={20} className="text-on-secondary-container" /> : <Icon name="summarize" size={20} />}
              {patientSummaryLoading ? <LoadingText context="ai" /> : 'Generar Resumen General'}
            </button>
            {patientSummaryLoading && !patientSummaryText ? (
              <SkeletonCard />
            ) : patientSummaryText ? (
              <GlassPanel className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-secondary/15 via-secondary/5 to-transparent border-b border-secondary/15">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center ring-1 ring-secondary/20">
                      <MedicalIcon name="heart" size={22} className="text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-secondary tracking-wide">{t('tl.patientReport')}</h4>
                      <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">{t('tl.aiGeneralProgress')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { try { navigator.clipboard?.writeText(patientSummaryText); toast.info('Copiado al portapapeles'); } catch { toast.error('No se pudo copiar'); } }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-secondary hover:bg-secondary/10 transition-colors"
                  >
                    <Icon name="content_copy" size={16} />
                  </button>
                </div>
                {/* Body */}
                <div className="px-5 py-5">
                  {formatAIReport(patientSummaryText)}
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 bg-surface-variant/10 border-t border-outline-variant/20">
                  <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Icon name="schedule" size={12} className="opacity-60" />
                    {new Date().toLocaleString(currentLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <Icon name="auto_awesome" size={11} className="text-secondary" />
                    Generado por IA
                  </span>
                </div>
              </GlassPanel>
            ) : (
              <div className="empty-state-premium">
                <Icon name="group" size={32} className="opacity-40 mb-2" />
                <p className="italic text-sm text-on-surface-variant leading-relaxed">Todavía no se ha generado un resumen general. Pulsa «Generar Resumen General» para ver el progreso conjunto de tus pacientes activos.</p>
              </div>
            )}
          </GlassPanel>
          )}

          {/* PDF Export */}
          {showTool('pdf-ai') && (
          <GlassPanel className="md:col-span-2 lg:col-span-3 p-6 sm:p-8 rounded-3xl card-glow-hover relative overflow-hidden w-full">
            <div className="blob-warm absolute -bottom-12 -left-12 w-40 h-40 opacity-20 pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center"><Icon name="picture_as_pdf" size={24} className="text-error animate-breathe-icon" /></div>
              <div>
                <h3 className="font-title-md text-title-md gradient-text-editorial">{t('tr.exportar_reporte_pdf')}</h3>
                <p className="text-sm text-on-surface-variant">{t('tl.pdfDesc')}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-surface-variant/20 border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface">
                <option value="">{t('tr.seleccionar_paciente')}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { setPdfMode('simple'); setPdfModalOpen(true); }}
                disabled={!selectedPatient}
                className="premium-btn flex-1 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                <Icon name="flash_on" size={20} />{t('tl.pdfTitle')}</button>
              <button
                onClick={() => { setPdfMode('ai'); setPdfModalOpen(true); }}
                disabled={!selectedPatient}
                className="premium-btn flex-1 bg-secondary text-on-secondary shadow-glow-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                <Icon name="auto_awesome" size={20} /> PDF Estilizado (IA)
              </button>
            </div>
          </GlassPanel>
          )}
    </>
  );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 overflow-x-hidden">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg gradient-text-editorial">{t('tl.toolsTitle')}</h1>
            <p className="text-on-surface-variant font-body-lg">{t('tl.toolsDesc')}</p>
          </div>

          <AuditLogCard className="order-last" />

          {/* Featured Clinical Bento Showcase */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Icon name="grid_view" size={16} />{t('tl.featuredTools')}</h2>
            <BentoGrid className="auto-rows-[14rem]">
              <BentoCard
                name="Calculadora de IMC y Composición"
                description="Clasificación antropométrica y estimación en tiempo real con validación clínica."
                badge="Biomecánica"
                Icon={Calculator}
                cta="Calcular Parámetros"
                onClick={() => {
                  const el = document.getElementById('tool-bmi');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <BentoCard
                name="Captura de Marcha & Apoyo Plantar"
                description="Simetría de carga bilateral, cadencia en pasos/minuto y fases de apoyo del pie."
                badge="Cinemática"
                Icon={Footprints}
                cta="Analizar Marcha"
                onClick={() => {
                  const el = document.getElementById('tool-gait');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <BentoCard
                name="Digitalizador OCR & Visión Médica"
                description="Extracción instantánea de prescripciones, rangos articulares y antecedentes."
                badge="Visión IA"
                Icon={Camera}
                cta="Escanear Documento"
                onClick={() => {
                  const el = document.getElementById('tool-ocr');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <BentoCard
                name="Generador Narrativo de Sesión"
                description="Síntesis clínica contextual con lenguaje profesional lista para exportar a PDF."
                badge="Gemini AI"
                Icon={FileText}
                cta="Generar Informe"
                onClick={() => {
                  const el = document.getElementById('tool-summary');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </BentoGrid>
          </div>

          <AnimatedTabs
            tabs={[
              { id: 'todas', label: 'Todas', content: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {toolsGrid('todas')}
                </div>
              ) },
              { id: 'ia', label: 'IA Clínica', content: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {toolsGrid('ia')}
                </div>
              ) },
              { id: 'ocr', label: 'OCR', content: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {toolsGrid('ocr')}
                </div>
              ) },
            ]}
            defaultTab="todas"
          />
        </div>

      {/* AI Assistant sidebar - Elevated Clinical UI */}
      <div className="hidden xl:flex flex-col w-[340px] lg:w-[400px] shrink-0 h-[calc(100vh-140px)] sticky top-[100px] rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-teal-500/25 shadow-xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 relative">
              <Bot size={22} className="animate-breathe-icon" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Physi IA</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Clínico
                </span>
              </div>
              <p className="text-[11px] text-teal-100 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Asistente Kinesiológico &amp; ROM
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setChatMessages([{ role: 'assistant', text: 'Conversación reiniciada. ¿En qué protocolo o paciente te ayudo ahora?' }]);
              toast.info('Chat reiniciado');
            }}
            aria-label="Reiniciar chat"
            title="Reiniciar chat"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-teal-50/70 dark:bg-slate-800/60 border-b border-teal-100/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { label: '📊 ROM hombro', query: '¿Cuáles son los criterios de progresión en flexión de hombro de 90° a 120°?' },
            { label: '🩹 Tendinopatía', query: 'Protocolo de ejercicios excéntricos para tendinopatía rotuliana.' },
            { label: '🦶 Simetría', query: '¿Qué valores de asimetría plantar requieren corrección ortésica o propioceptiva?' },
            { label: '📄 Criterios alta', query: 'Criterios clínicos de alta para esguince lateral de tobillo grado II.' },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                setChatInput(chip.query);
              }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/10 transition-colors whitespace-nowrap shadow-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="size-8 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={16} />
                </div>
              )}
              <div className="max-w-[85%] group relative">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(msg.text);
                      toast.success('Mensaje copiado');
                    }}
                    aria-label="Copiar respuesta"
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-[10px] text-slate-400 hover:text-teal-600 flex items-center gap-1"
                  >
                    <Copy size={11} /> Copiar texto
                  </button>
                )}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="size-8 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none">
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] font-semibold ml-2">Analizando criterio clínico...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex gap-2 items-center">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder={t('tl.askPlaceholder', 'Haz una consulta clínica a Physi...')}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            <button
              onClick={sendChat}
              disabled={aiLoading || !chatInput.trim()}
              aria-label={t('tl.sendQuery', 'Enviar consulta')}
              className="size-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0 shadow-md shadow-teal-600/20"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('tr.cumple_hipaa', 'Cifrado seguro & HIPAA compliant')}
            </span>
            <span className="font-mono text-[9px]">Enter ↵</span>
          </div>
        </div>
      </div>

      {/* PDF Confirmation Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setPdfModalOpen(false)}>
          <div className="glass-panel rounded-3xl p-5 sm:p-6 lg:p-8 max-w-full sm:max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Icon name="picture_as_pdf" size={28} className="text-error" />
              <h3 className="font-title-md text-title-md">{t('tr.confirmar_reporte_pdf')}</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">
              {pdfMode === 'simple'
                ? 'Se generará un PDF rápido con los datos de las últimas 20 sesiones del paciente seleccionado.'
                : 'Se generará un PDF estilizado usando IA con los datos del paciente. Esto puede tardar unos segundos.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPdfModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">{t('tr.cancelar')}</button>
              <button onClick={handleExportPDF} disabled={pdfLoading} className="premium-btn flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                {pdfLoading ? <><Spinner size={20} className="text-on-primary" /> <LoadingText context="pdf" /></> : 'Generar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Patient Modal */}
      {showUpdatePatientModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowUpdatePatientModal(false)}>
          <div className="glass-panel rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-on-surface mb-1">{t('tl.updatePatientData')}</h3>
            <p className="text-sm text-on-surface-variant mb-4">{t('tl.updatePatientDataDesc')}</p>

            <label className="block text-sm font-bold text-on-surface-variant mb-2">{t('tl.searchPatient')}</label>
            <select
              value={updatePatientId}
              onChange={(e) => setUpdatePatientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-variant/20 dark:bg-slate-800 text-on-surface border border-divider focus:border-primary focus:outline-none transition-colors mb-4"
            >
              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="">{t('tl.selectPatientPlaceholder')}</option>
              {patients.map((p) => (
                <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>

            {updatePatientId && !updateLoading && Object.keys(updatePreview).length === 0 && (
              <button
                onClick={async () => {
                  setUpdateLoading(true);
                  try {
                    const extracted = scanResult as Record<string, unknown>;
                    const fields: Record<string, string> = {};
                    const fieldMap: Record<string, string> = {
                      diagnostico: 'diagnostico',
                      diagnostico_secundario: 'diagnostico_secundario',
                      rom_objetivo: 'rom_objetivo',
                      medicamentos: 'medicamentos_actuales',
                      alergias: 'alergias',
                      telefono: 'telefono',
                      medico_tratante: 'medico_remitente',
                      observaciones: 'notas',
                    };
                    for (const [scanKey, dbKey] of Object.entries(fieldMap)) {
                      const val = extracted[scanKey];
                      if (val != null && String(val).trim() !== '') fields[dbKey] = String(val);
                    }
                    if (Object.keys(fields).length === 0) {
                      toast.error('No se encontraron campos actualizables en el texto extraido');
                    } else {
                      setUpdatePreview(fields);
                    }
                  } catch (e) {
                    toast.error('Error al analizar cambios: ' + (e as Error).message);
                  } finally {
                    setUpdateLoading(false);
                  }
                }}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Icon name="auto_awesome" size={20} /> Analizar cambios sugeridos
              </button>
            )}

            {updateLoading && (
              <div className="flex items-center justify-center py-6 gap-3">
                <Spinner size={24} className="text-primary" />
                <span className="text-on-surface-variant text-sm">{t('tr.analizando')}</span>
              </div>
            )}

            {Object.keys(updatePreview).length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-bold text-on-surface">{t('tr.campos_a_actualizar')}</p>
                {Object.entries(updatePreview).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-on-surface mt-1">{value}</p>
                  </div>
                ))}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowUpdatePatientModal(false)} className="flex-1 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      setUpdateLoading(true);
                      try {
                        const { error } = await supabase.from('profiles').update(updatePreview).eq('id', updatePatientId);
                        if (error) throw error;
                        toast.success('Datos del paciente actualizados correctamente');
                        setShowUpdatePatientModal(false);
                        setUpdatePreview({});
                      } catch (e) {
                        toast.error('Error al actualizar: ' + (e as Error).message);
                      } finally {
                        setUpdateLoading(false);
                      }
                    }}
                    disabled={updateLoading}
                    className="premium-btn flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    Confirmar actualizacion
                  </button>
                </div>
              </div>
            )}

            <button onClick={() => setShowUpdatePatientModal(false)} className="w-full mt-4 py-2 text-on-surface-variant text-sm hover:text-on-surface transition-colors">{t('tr.cerrar')}</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
