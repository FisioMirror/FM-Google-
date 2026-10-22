import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { GlassPanel } from '../components/ui/Glass';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastProvider';
import { runAIJob, fileToBase64, transcribeAudio } from '../lib/ai';
import { Spinner } from '../components/ui/Loader';
import { LoadingText } from '../components/ui/LoadingText';
import { PremiumSkeleton, KpiCardSkeleton, PatientListSkeleton } from '../components/ui/PremiumSkeleton';
import { WaveformVisualizer } from '../components/ui/WaveformVisualizer';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { EmailFeatureModal } from '../components/ui/EmailFeatureModal';
import { notifyTokenCreated } from '../lib/notificationService';

type Step = 1 | 2 | 3 | 4;

interface ExtractedData {
  nombre_completo: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  tipo_sangre: string;
  ocupacion: string;
  nivel_actividad: string;
  es_menor_edad: boolean;
  patologia: string;
  diagnostico_secundario: string;
  medicamentos_actuales: string;
  alergias: string;
  enfermedades_cronicas: string;
  lesiones_previas: string;
  estatura_cm: string;
  peso_kg: string;
  extremidad_afectada: string;
  rom_objetivo: string;
  frecuencia_sesiones: string;
  medico_remitente: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  tutor_nombre: string;
  tutor_telefono: string;
  tutor_email: string;
}

const emptyData: ExtractedData = {
  nombre_completo: '', documento_identidad: '', fecha_nacimiento: '', telefono: '',
  email: '', tipo_sangre: '', ocupacion: '', nivel_actividad: '', es_menor_edad: false,
  patologia: '', diagnostico_secundario: '', medicamentos_actuales: '', alergias: '',
  enfermedades_cronicas: '', lesiones_previas: '', estatura_cm: '', peso_kg: '',
  extremidad_afectada: '', rom_objetivo: '', frecuencia_sesiones: '', medico_remitente: '',
  contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
  tutor_nombre: '', tutor_telefono: '', tutor_email: '',
};

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const ACTIVITY_LEVEL_KEYS = ['ocr.actSedentary', 'ocr.actModerate', 'ocr.actActive'];

interface ExerciseItem {
  name: string;
  sets: number;
  reps: number;
  freq: number;
}

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string | null;
  grupo_muscular: string | null;
  fase_recuperacion: string | null;
}

const defaultExercises: Exercise[] = [];

export function OCRScannerPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [step, setStep] = useState<Step>(1);
  const [processing, setProcessing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData>({ ...emptyData });
  const [audioTranscription, setAudioTranscription] = useState('');
  const [prescription, setPrescription] = useState<ExerciseItem[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [prescriptionFilter, setPrescriptionFilter] = useState('ocrf.All');
  const [entryMode, setEntryMode] = useState<'ia' | 'manual'>('ia');

  useEffect(() => {
    loadExercises();
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const loadExercises = async () => {
    try {
      const { data } = await supabase
        .from('exercises')
        .select('id, nombre, descripcion, grupo_muscular, fase_recuperacion')
        .order('nombre', { ascending: true })
        .limit(20);
      if (data && data.length > 0) setExercises(data as unknown as Exercise[]);
    } catch {
      // keep empty list
    }
  };

  const handleFile = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).slice(0, 10);
    setFiles((prev) => [...prev, ...arr].slice(0, 10));
    toast.success(t('ocr.filesLoaded', { n: arr.length }));
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.error(t('ocr.micDenied'));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const deleteRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setRecordSeconds(0);
    setAudioTranscription('');
    toast.success(t('ocr.voiceNoteDeleted'));
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const transcribeAudioNote = async () => {
    if (!audioBlob) return '';
    try {
      setTranscribing(true);
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(audioBlob);
      });
      const result = await transcribeAudio(audioBase64, audioBlob.type);
      if (result.success && result.transcription) {
        setAudioTranscription(result.transcription);
        toast.success(t('ocr.transcriptionDone'));
        return result.transcription;
      } else {
        toast.error(t('ocr.transcribeFail'));
        return '';
      }
    } catch {
      toast.error(t('ocr.transcribeError'));
      return '';
    } finally {
      setTranscribing(false);
    }
  };

  const processWithAI = async () => {
    setProcessing(true);
    try {
      let transcription = '';
      if (audioBlob) {
        transcription = await transcribeAudioNote();
      }

      let imageBase64 = '';
      let imageMimeType = 'image/jpeg';
      if (files.length > 0) {
        const imageData = await fileToBase64(files[0]);
        imageBase64 = imageData.base64;
        imageMimeType = imageData.mimeType;
      }

      const result = await runAIJob('image_analysis', {
        imageBase64,
        mimeType: imageMimeType,
        prompt: `IMPORTANTE: Responde SIEMPRE en el idioma ${i18n.language}. Analiza este documento clínico y extrae toda la información visible del paciente, incluyendo email si aparece.`,
        audioTranscription: transcription || undefined,
      }, 120000);

      if (!result.success || !result.result) {
        setProcessing(false);
        toast.error(result.error || 'Error procesando el documento. Intenta de nuevo.');
        return;
      }

      try {
        const cleaned = result.result
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const parsed = JSON.parse(cleaned);
        setExtractedData((prev) => ({
          ...prev,
          nombre_completo: parsed.nombre_completo ?? prev.nombre_completo,
          documento_identidad: parsed.documento_identidad ?? prev.documento_identidad,
          fecha_nacimiento: parsed.fecha_nacimiento ?? prev.fecha_nacimiento,
          telefono: parsed.telefono ?? prev.telefono,
          email: parsed.email ?? prev.email,
          tipo_sangre: parsed.tipo_sangre ?? prev.tipo_sangre,
          ocupacion: parsed.ocupacion ?? prev.ocupacion,
          nivel_actividad: parsed.nivel_actividad ?? prev.nivel_actividad,
          es_menor_edad: parsed.es_menor_edad ?? prev.es_menor_edad,
          patologia: parsed.patologia ?? parsed.diagnostico ?? prev.patologia,
          diagnostico_secundario: parsed.diagnostico_secundario ?? prev.diagnostico_secundario,
          medicamentos_actuales: parsed.medicamentos_actuales ?? parsed.medicamentos ?? prev.medicamentos_actuales,
          alergias: parsed.alergias ?? prev.alergias,
          enfermedades_cronicas: parsed.enfermedades_cronicas ?? parsed.antecedentes ?? prev.enfermedades_cronicas,
          lesiones_previas: parsed.lesiones_previas ?? parsed.cirugias ?? prev.lesiones_previas,
          estatura_cm: parsed.estatura_cm != null ? String(parsed.estatura_cm) : prev.estatura_cm,
          peso_kg: parsed.peso_kg != null ? String(parsed.peso_kg) : prev.peso_kg,
          extremidad_afectada: parsed.extremidad_afectada ?? parsed.extremidad ?? prev.extremidad_afectada,
          rom_objetivo: parsed.rom_objetivo ?? prev.rom_objetivo,
          frecuencia_sesiones: parsed.frecuencia_sesiones ?? parsed.frecuencia ?? prev.frecuencia_sesiones,
          medico_remitente: parsed.medico_remitente ?? parsed.medico ?? parsed.medico_tratante ?? prev.medico_remitente,
          contacto_emergencia_nombre: parsed.contacto_emergencia_nombre ?? prev.contacto_emergencia_nombre,
          contacto_emergencia_telefono: parsed.contacto_emergencia_telefono ?? parsed.contacto ?? prev.contacto_emergencia_telefono,
        }));
        setProcessing(false);
        setStep(2);
        toast.success(t('ocr.analysisDone'));
      } catch {
        setProcessing(false);
        toast.error(t('ocr.ocrUnreadable'));
      }
    } catch {
      setProcessing(false);
      toast.error(t('ocr.processFail'));
    }
  };

  const startManualEntry = () => {
    setExtractedData({ ...emptyData });
    setFiles([]);
    setAudioBlob(null);
    setAudioURL(null);
    setAudioTranscription('');
    setPrescription([]);
    setStep(2);
  };

  const addToPrescription = (name: string) => {
    if (prescription.find((p) => p.name === name)) return;
    setPrescription([...prescription, { name, sets: 2, reps: 10, freq: 1 }]);
    toast.success(`${name} añadido a la rutina`);
  };

  const updatePrescription = (index: number, field: keyof ExerciseItem, delta: number) => {
    const next = [...prescription];
    const item = next[index];
    if (item) {
      next[index] = { ...item, [field]: Math.max(1, (item[field] as number) + delta) };
      setPrescription(next);
    }
  };

  const removeFromPrescription = (index: number) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  const generateToken = async () => {
    if (!user?.id) return;
    const fullName = extractedData.nombre_completo.trim();
    if (!fullName) {
      toast.error(t('ocr.nameRequired'));
      return;
    }

    try {
      const rawEmail = extractedData.email ? extractedData.email.trim().toLowerCase() : '';
      const patologiaVal = extractedData.patologia?.trim() || 'En evaluación clínica';
      let patientId: string | null = null;

      // 1. Si se proveyó un email, comprobar si ya existe un perfil con ese correo
      if (rawEmail) {
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('email', rawEmail)
          .maybeSingle();

        if (existingProf) {
          patientId = existingProf.id;
          // Actualizar datos clínicos del paciente existente sin provocar error de clave duplicada
          await supabase
            .from('profiles')
            .update({
              full_name: fullName || existingProf.full_name,
              diagnostico: patologiaVal,
              patologia: patologiaVal,
              telefono: extractedData.telefono?.trim() || null,
              documento_identidad: extractedData.documento_identidad?.trim() || null,
            })
            .eq('id', patientId);
        }
      }

      // 2. Si no existía o no se especificó email, insertar nuevo perfil
      // Si el email no fue suministrado, generamos un identificador clínico interno seguro
      // para cumplir con la restricción técnica NOT NULL / UNIQUE de la base de datos
      if (!patientId) {
        const safeEmail = rawEmail || `paciente_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}@fisiomirror.paciente`;
        const { data: newPatient, error: patientErr } = await supabase
          .from('profiles')
          .insert({
            full_name: fullName,
            email: safeEmail,
            role: 'paciente',
            is_active: true,
            diagnostico: patologiaVal,
            fecha_nacimiento: extractedData.fecha_nacimiento && /^\d{4}-\d{2}-\d{2}$/.test(extractedData.fecha_nacimiento) ? extractedData.fecha_nacimiento : null,
            documento_identidad: extractedData.documento_identidad?.trim() || null,
            telefono: extractedData.telefono?.trim() || null,
            tipo_sangre: extractedData.tipo_sangre || null,
            ocupacion: extractedData.ocupacion || null,
            nivel_actividad: extractedData.nivel_actividad || null,
            es_menor_edad: Boolean(extractedData.es_menor_edad),
            patologia: patologiaVal,
            diagnostico_secundario: extractedData.diagnostico_secundario || null,
            medicamentos_actuales: extractedData.medicamentos_actuales || null,
            alergias: extractedData.alergias || null,
            enfermedades_cronicas: extractedData.enfermedades_cronicas || null,
            lesiones_previas: extractedData.lesiones_previas || null,
            estatura_cm: extractedData.estatura_cm ? parseInt(extractedData.estatura_cm) : null,
            peso_kg: extractedData.peso_kg ? parseFloat(extractedData.peso_kg) : null,
            extremidad_afectada: extractedData.extremidad_afectada || null,
            rom_objetivo: extractedData.rom_objetivo || null,
            frecuencia_sesiones: extractedData.frecuencia_sesiones || null,
            medico_remitente: extractedData.medico_remitente || null,
            contacto_emergencia_nombre: extractedData.contacto_emergencia_nombre || null,
            contacto_emergencia_telefono: extractedData.contacto_emergencia_telefono || null,
            tutor_nombre: extractedData.es_menor_edad ? (extractedData.tutor_nombre || null) : null,
            tutor_telefono: extractedData.es_menor_edad ? (extractedData.tutor_telefono || null) : null,
            tutor_email: extractedData.es_menor_edad ? (extractedData.tutor_email || null) : null,
          })
          .select('id')
          .single();

        if (patientErr) {
          // Si hubo choque de clave única en email, recuperamos el id existente
          if (patientErr.code === '23505' && rawEmail) {
            const { data: fallbackProf } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', rawEmail)
              .maybeSingle();
            if (fallbackProf) {
              patientId = fallbackProf.id;
            } else {
              throw patientErr;
            }
          } else {
            throw patientErr;
          }
        } else if (newPatient) {
          patientId = newPatient.id;
        }
      }

      if (!patientId) {
        throw new Error(t('ocr.couldNotRecord'));
      }

      // 3. Vincular paciente con el fisioterapeuta actual
      const { data: existingLink } = await supabase
        .from('pacientes_terapeutas')
        .select('id')
        .eq('paciente_id', patientId)
        .eq('terapeuta_id', user.id)
        .maybeSingle();

      if (!existingLink) {
        const { error: linkErr } = await supabase.from('pacientes_terapeutas').insert({
          paciente_id: patientId,
          terapeuta_id: user.id,
        });
        if (linkErr) {
          console.warn('Advertencia al vincular paciente y terapeuta:', linkErr);
        }
      }

      // 4. Generar y registrar token de activación para el paciente
      const token = String(Math.floor(100000 + Math.random() * 900000));
      const { error: tokenErr } = await supabase.from('activation_tokens').insert({
        token,
        terapeuta_id: user.id,
        paciente_id: patientId,
        diagnostico: patologiaVal,
      });
      if (tokenErr) {
        console.warn('Advertencia registrando token:', tokenErr);
      }

      // 5. Guardar prescripción de ejercicios (incluyendo fisio_id para satisfacer la restricción NOT NULL)
      if (prescription.length > 0) {
        const { error: exErr } = await supabase.from('patient_exercises').insert(
          prescription.map((p) => ({
            paciente_id: patientId,
            fisio_id: user.id,
            ejercicio_nombre: p.name,
            series: p.sets || 3,
            repeticiones: p.reps || 10,
            activo: true,
          })),
        );
        if (exErr) {
          console.warn('Aviso al guardar ejercicios (no bloqueante):', exErr);
        }
      }

      // 6. Subir nota de voz u observaciones si existen
      if (audioBlob) {
        try {
          const audioExt = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
          const audioPath = `${patientId}/voice-note-${Date.now()}.${audioExt}`;
          const { error: uploadErr } = await supabase.storage
            .from('documentos')
            .upload(audioPath, audioBlob, { contentType: audioBlob.type, upsert: false });
          if (!uploadErr) {
            const { data: pubUrl } = supabase.storage.from('documentos').getPublicUrl(audioPath);
            await supabase.from('documentos_clinicos').insert({
              paciente_id: patientId,
              fisioterapeuta_id: user.id,
              imagen_url: pubUrl.publicUrl,
              diagnostico_extraido: patologiaVal,
              diagnostico_secundario: extractedData.diagnostico_secundario || null,
              extremidad: extractedData.extremidad_afectada || null,
              rom_objetivo: extractedData.rom_objetivo || null,
              frecuencia_sesiones: extractedData.frecuencia_sesiones || null,
              medicamentos_actuales: extractedData.medicamentos_actuales || null,
              alergias: extractedData.alergias || null,
              antecedentes_medicos: extractedData.enfermedades_cronicas || null,
              cirugias_previas: extractedData.lesiones_previas || null,
              medico_tratante: extractedData.medico_remitente || null,
              telefono_paciente: extractedData.telefono || null,
              observaciones: audioTranscription || null,
              ocr_status: 'completed',
            });
          }
        } catch {
          console.warn('[ocr] warn saving voice note');
        }
      }

      setGeneratedToken(token);
      setStep(4);
      if (user?.id) {
        notifyTokenCreated({
          therapistId: user.id,
          patientName: extractedData.nombre_completo || t('ocr.newPatient'),
          token,
        }).catch(() => {});
      }
      toast.success(t('ocr.registeredOk'));
    } catch (e) {
      toast.error(t('ocr.registerError') + ': ' + (e as Error).message);
    }
  };

  const copyToken = () => {
    if (generatedToken) {
      try {
        navigator.clipboard?.writeText(generatedToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t('tok.copyError'));
      }
    }
  };

  const steps = [
    { num: 1, labelKey: 'ocrf.Load' },
    { num: 2, labelKey: 'ocrf.Validate' },
    { num: 3, labelKey: 'ocrf.Prescribe' },
    { num: 4, labelKey: 'ocrf.Finish' },
  ];

  const inputClass = 'w-full glass-teal border border-outline-variant/20 rounded-xl px-4 py-3 font-title-md text-on-surface focus:ring-2 focus:ring-primary/20 outline-none';
  const labelClass = 'font-label-sm text-xs text-on-surface-variant/70 block ml-2 mb-1';
  const textareaClass = 'w-full glass-teal border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none';

  return (
    <div className="fm-page-narrow">
      <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm">
        <Icon name="person_add" size={18} /> {t('ocr.newPatient')}
      </div>
      <div>
        <h2 className="fm-title gradient-text-living">{t('ocr.loadPrescription')}</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">{t('ocr.startIntake')}</p>
      </div>

      <div className="flex justify-between items-center px-3 sm:px-6 py-4 glass-panel rounded-2xl card-glow-hover gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                step === s.num ? 'bg-primary text-on-primary ring-4 ring-primary/10' :
                step > s.num ? 'bg-primary-fixed-dim text-on-primary-fixed' :
                'bg-surface-container-highest text-outline'
              }`}>
                {step > s.num ? <Icon name="check" size={14} /> : s.num}
              </div>
              <span className={`font-label-sm text-label-sm truncate ${step === s.num ? 'text-primary font-bold' : step > s.num ? 'text-primary' : 'text-outline'}`}>{t(s.labelKey)}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 mx-2 sm:mx-4 ${step > s.num ? 'bg-primary' : 'bg-outline-variant/30'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassPanel className="p-8 rounded-3xl space-y-6 border border-white/50 shadow-elevated card-glow-hover">
              {/* Entry mode selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setEntryMode('ia')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${entryMode === 'ia' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/40'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-2xl ${entryMode === 'ia' ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'}`}>
                      <Icon name="psychology" size={24} />
                    </div>
                    <div>
                      <h3 className="fm-section-title">{t('ocr.aiLoad')}</h3>
                      <p className="text-xs text-on-surface-variant">{t('ocr.aiLoadSub')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant">{t('ocr.aiLoadDesc')}</p>
                </button>
                <button
                  onClick={() => setEntryMode('manual')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${entryMode === 'manual' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/40'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-2xl ${entryMode === 'manual' ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'}`}>
                      <Icon name="edit_note" size={24} />
                    </div>
                    <div>
                      <h3 className="fm-section-title">{t('ocr.manualLoad')}</h3>
                      <p className="text-xs text-on-surface-variant">{t('ocr.manualLoadSub')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant">{t('ocr.manualLoadDesc')}</p>
                </button>
              </div>

              {entryMode === 'ia' && (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300 hover:border-primary/50 flex flex-col items-center text-center gap-4 bg-white/10 hover:bg-white/30 ${dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-outline-variant/40'}`}>
                    {files.length > 0 && (
                      <div className="absolute top-4 right-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">{files.length}/10</div>
                    )}
                    <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-2 shadow-sm group-hover:scale-110 transition-transform animate-breathe-icon">
                      <Icon name="cloud_upload" size={40} />
                    </div>
                    <h3 className="fm-section-title">{t('ocr.dragPrescription')}</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-sm">{t('ocr.dropDesc')}</p>
                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files)} />
                  </div>

                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 glass-teal border border-outline-variant/20 rounded-xl px-3 py-2">
                          <Icon name="description" size={16} className="text-primary" />
                          <span className="text-xs font-medium text-on-surface max-w-[120px] truncate">{f.name}</span>
                          <button onClick={() => removeFile(i)} className="text-outline hover:text-error transition-colors">
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-primary/5 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                      <div className="flex items-center gap-2 text-primary">
                        <Icon name="mic" size={18} />
                        <span className="font-label-sm text-label-sm font-bold">{t('ocr.voiceNote')}</span>
                        <span className="ml-auto text-2xs font-bold text-outline uppercase">{t('ocr.voiceAi')}</span>
                      </div>
                      <div className="flex items-center gap-6 py-4">
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          aria-label={isRecording ? t('ocr.stopRec') : t('ocr.startRec')}
                          className={`w-14 h-14 ${isRecording ? 'bg-danger' : 'bg-primary'} text-on-primary rounded-full flex items-center justify-center shadow-card active:scale-90 transition-transform`}
                        >
                          <Icon name={isRecording ? 'stop' : 'mic'} size={28} />
                        </button>
                        <WaveformVisualizer isActive={isRecording} onToggle={(active) => active ? startRecording() : stopRecording()} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isRecording && (
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
                              </span>
                            )}
                            <span className="text-2xs font-bold text-outline">
                              {audioURL ? t('ocr.recReady') : isRecording ? t('ocr.recording') : t('ocr.recIdle')}
                            </span>
                            <span className="ml-auto text-2xs font-bold text-outline tabular-nums">
                              {formatTime(recordSeconds)}
                            </span>
                          </div>
                          <div className="h-1 bg-outline-variant/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isRecording ? 'bg-danger' : 'bg-primary'}`}
                              style={{ width: isRecording ? `${(recordSeconds % 60) / 60 * 100}%` : audioURL ? '100%' : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                      {audioURL && (
                        <div className="flex flex-col gap-3 p-4 glass-teal border border-outline-variant/30">
                          <audio src={audioURL} controls className="w-full" />
                          <button
                            onClick={transcribeAudioNote}
                            disabled={transcribing}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all disabled:opacity-50"
                          >
                            {transcribing ? <><Spinner size={16} className="text-primary" /> {t('ocr.transcribing')}</> : <><Icon name="translate" size={16} /> {t('ocr.transcribeAi')}</>}
                          </button>
                          {audioTranscription && (
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                              <p className="text-2xs font-bold text-primary uppercase mb-1">{t('ocr.transcription')}</p>
                              <textarea
                                value={audioTranscription}
                                onChange={(e) => setAudioTranscription(e.target.value)}
                                rows={3}
                                className="w-full bg-transparent text-sm text-on-surface outline-none resize-none"
                              />
                            </div>
                          )}
                          <button
                            onClick={deleteRecording}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-error/10 text-error font-bold text-xs hover:bg-error/20 transition-all"
                          >
                            <Icon name="delete" size={16} /> {t('ocr.deleteRecording')}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-6 rounded-2xl border border-outline-variant/10 flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-secondary">
                        <Icon name="auto_awesome" size={20} />
                        <p className="font-label-sm text-label-sm font-bold">{t('ocr.tipTitle')}</p>
                      </div>
                      <p className="text-sm text-on-surface-variant">{t('ocr.tipDesc')}</p>
                    </div>
                  </div>

                  {processing && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-primary">
                        <Spinner size={20} className="text-primary" />
                        <LoadingText context="ocr" className="font-label-sm text-label-sm font-bold text-primary" />
                      </div>
                      <PremiumSkeleton className="w-full h-32 rounded-2xl" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                      </div>
                      <PatientListSkeleton items={3} />
                    </div>
                  )}

                  <div className="pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                    <button onClick={() => navigate('/patients')} className="px-8 py-3 text-on-surface-variant font-bold font-label-sm text-label-sm hover:bg-surface-variant/30 rounded-xl transition-all">{t('common.cancel')}</button>
                    <button
                      onClick={processWithAI}
                      disabled={processing || files.length === 0}
                      className="premium-btn relative overflow-hidden px-10 py-4 bg-primary text-on-primary rounded-xl font-bold font-label-sm text-label-sm shadow-elevated shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 flex items-center gap-3 disabled:opacity-50 transition-all"
                    >
                      {processing ? <><Spinner size={20} className="text-white" /> <LoadingText context="ocr" /></> : <><Icon name="psychology" size={20} /> {t('ocr.processAi')}</>}
                    </button>
                  </div>
                </>
              )}

              {entryMode === 'manual' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mx-auto animate-breathe-icon">
                    <Icon name="edit_note" size={40} />
                  </div>
                  <div>
                    <h3 className="fm-section-title">{t('ocr.manualLoad')}</h3>
                    <p className="text-sm text-on-surface-variant max-w-md mx-auto mt-2">Completa todos los campos del formulario manualmente. No se requiere documento ni audio.</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/patients')} className="px-8 py-3 text-on-surface-variant font-bold font-label-sm text-label-sm hover:bg-surface-variant/30 rounded-xl transition-all">{t('common.cancel')}</button>
                    <button
                      onClick={startManualEntry}
                      className="premium-btn px-10 py-4 bg-primary text-on-primary rounded-xl font-bold font-label-sm text-label-sm shadow-elevated shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 flex items-center gap-3 transition-all"
                    >
                      <Icon name="arrow_forward" size={20} /> {t('ocr.goToForm')}
                    </button>
                  </div>
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h2 className="fm-title gradient-text-living">{t('ocr.validateData')}</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">
                {entryMode === 'ia' ? t('ocr.validatedHint') : t('ocr.manualHint')}
              </p>
            </div>

            {/* Datos Personales */}
            <div className="glass-panel rounded-3xl p-6 card-glow-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Icon name="person" size={24} className="animate-breathe-icon" /></div>
                <div>
                  <h3 className="fm-section-title">{t('ocr.personalData')}</h3>
                  <p className="text-xs text-on-surface-variant">{t('ocr.personalDataSub')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.fFullName')} *</label>
                  <input value={extractedData.nombre_completo} onChange={(e) => setExtractedData({ ...extractedData, nombre_completo: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fDocId')}</label>
                  <input value={extractedData.documento_identidad} onChange={(e) => setExtractedData({ ...extractedData, documento_identidad: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fBirthDate')} *</label>
                  <input type="date" value={extractedData.fecha_nacimiento} onChange={(e) => setExtractedData({ ...extractedData, fecha_nacimiento: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('patientDetail.tutorPhone')}</label>
                  <input value={extractedData.telefono} onChange={(e) => setExtractedData({ ...extractedData, telefono: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={extractedData.email} onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fBloodType')}</label>
                  <select value={extractedData.tipo_sangre} onChange={(e) => setExtractedData({ ...extractedData, tipo_sangre: e.target.value })} className={inputClass}>
                    <option value="">{t('ocr.notDetected')}</option>
                    {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fOccupation')}</label>
                  <input value={extractedData.ocupacion} onChange={(e) => setExtractedData({ ...extractedData, ocupacion: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fActivityLevel')}</label>
                  <select value={extractedData.nivel_actividad} onChange={(e) => setExtractedData({ ...extractedData, nivel_actividad: e.target.value })} className={inputClass}>
                    <option value="">{t('ocr.notDetected')}</option>
                    {ACTIVITY_LEVEL_KEYS.map((k) => <option key={k} value={k}>{t(k)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fHeight')}</label>
                  <input type="number" value={extractedData.estatura_cm} onChange={(e) => setExtractedData({ ...extractedData, estatura_cm: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fWeight')}</label>
                  <input type="number" step="0.01" value={extractedData.peso_kg} onChange={(e) => setExtractedData({ ...extractedData, peso_kg: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <input type="checkbox" id="es_menor" checked={extractedData.es_menor_edad} onChange={(e) => setExtractedData({ ...extractedData, es_menor_edad: e.target.checked })} className="w-5 h-5 rounded accent-primary" />
                <label htmlFor="es_menor" className="text-sm font-bold text-on-surface cursor-pointer">El paciente es menor de edad</label>
              </div>
              {extractedData.es_menor_edad && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-tertiary-fixed/10 border border-tertiary-fixed/20">
                  <div>
                    <label className={labelClass}>{t('patientDetail.tutorName')}</label>
                    <input value={extractedData.tutor_nombre} onChange={(e) => setExtractedData({ ...extractedData, tutor_nombre: e.target.value })} placeholder={t('patientDetail.tutorName')} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('patientDetail.tutorPhone')}</label>
                    <input value={extractedData.tutor_telefono} onChange={(e) => setExtractedData({ ...extractedData, tutor_telefono: e.target.value })} placeholder={t('patientDetail.tutorPhone')} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input value={extractedData.tutor_email} onChange={(e) => setExtractedData({ ...extractedData, tutor_email: e.target.value })} placeholder={t('common.email')} className={inputClass} />
                  </div>
                </div>
              )}
            </div>

            {/* Datos Clínicos */}
            <div className="glass-panel rounded-3xl p-6 card-glow-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-tertiary-fixed rounded-2xl text-on-tertiary-fixed-variant"><MedicalIcon name="activity" size={24} className="animate-breathe-icon" /></div>
                <div>
                  <h3 className="fm-section-title">{t('ocr.clinicalData')}</h3>
                  <p className="text-xs text-on-surface-variant">{t('ocr.clinicalDataSub')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.fPathology')} *</label>
                  <textarea value={extractedData.patologia} onChange={(e) => setExtractedData({ ...extractedData, patologia: e.target.value })} rows={2} placeholder={t('ocr.mainDx')} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fSecondaryDx')}</label>
                  <textarea value={extractedData.diagnostico_secundario} onChange={(e) => setExtractedData({ ...extractedData, diagnostico_secundario: e.target.value })} rows={2} placeholder={t('ocr.notDetected')} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fMeds')}</label>
                  <textarea value={extractedData.medicamentos_actuales} onChange={(e) => setExtractedData({ ...extractedData, medicamentos_actuales: e.target.value })} rows={2} placeholder={t('ocr.notDetected')} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fAllergies')}</label>
                  <textarea value={extractedData.alergias} onChange={(e) => setExtractedData({ ...extractedData, alergias: e.target.value })} rows={2} placeholder={t('ocr.notDetected')} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fChronic')}</label>
                  <textarea value={extractedData.enfermedades_cronicas} onChange={(e) => setExtractedData({ ...extractedData, enfermedades_cronicas: e.target.value })} rows={2} placeholder={t('ocr.notDetected')} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fPrevInjuries')}</label>
                  <textarea value={extractedData.lesiones_previas} onChange={(e) => setExtractedData({ ...extractedData, lesiones_previas: e.target.value })} rows={2} placeholder={t('ocr.notDetected')} className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fAffectedLimb')}</label>
                  <input value={extractedData.extremidad_afectada} onChange={(e) => setExtractedData({ ...extractedData, extremidad_afectada: e.target.value })} placeholder={t('ocr.egRightKnee')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fTargetRom')}</label>
                  <input value={extractedData.rom_objetivo} onChange={(e) => setExtractedData({ ...extractedData, rom_objetivo: e.target.value })} placeholder={t('ocr.egFlexion')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fSessionFreq')}</label>
                  <input value={extractedData.frecuencia_sesiones} onChange={(e) => setExtractedData({ ...extractedData, frecuencia_sesiones: e.target.value })} placeholder={t('ocr.egPerWeek')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fPhysician')}</label>
                  <input value={extractedData.medico_remitente} onChange={(e) => setExtractedData({ ...extractedData, medico_remitente: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div className="glass-panel rounded-3xl p-6 card-glow-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-error/10 rounded-2xl text-error"><Icon name="emergency" size={24} className="animate-breathe-icon" /></div>
                <div>
                  <h3 className="fm-section-title">Contacto de Emergencia</h3>
                  <p className="text-xs text-on-surface-variant">Persona a contactar en caso de emergencia</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('tools.fEmergencyName')}</label>
                  <input value={extractedData.contacto_emergencia_nombre} onChange={(e) => setExtractedData({ ...extractedData, contacto_emergencia_nombre: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('tools.fEmergencyPhone')}</label>
                  <input value={extractedData.contacto_emergencia_telefono} onChange={(e) => setExtractedData({ ...extractedData, contacto_emergencia_telefono: e.target.value })} placeholder={t('ocr.notDetected')} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">
                <Icon name="arrow_back" size={20} /> {t('common.back')}
              </button>
              <button onClick={() => setStep(3)} className="premium-btn flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-elevated shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                {t('ocr.confirmContinue')} <Icon name="arrow_forward" size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4 min-w-0">
                <div>
                  <span className="text-primary font-semibold text-label-sm uppercase tracking-wider">{t('ocr.onboardingStep3')}</span>
                  <h1 className="fm-title text-primary">{t('ocr.routineSetup')}</h1>
                  <p className="text-body-lg text-secondary">{t('ocr.routineSetupDesc')}</p>
                </div>
                <div className="glass-panel p-4 rounded-2xl card-glow-hover">
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                      <input value={prescriptionSearch} onChange={(e) => setPrescriptionSearch(e.target.value)} placeholder={t('exs.searchPlaceholder')} className="w-full pl-10 pr-4 py-3 rounded-xl border-none glass-teal border border-outline-variant/20 outline-none" />
                    </div>
                    <div className="flex gap-2">
                      {['ocrf.All', 'ocrf.Mobility', 'ocrf.Strength'].map((f) => (
                        <button key={f} onClick={() => setPrescriptionFilter(f)} className={`px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${prescriptionFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50'}`}>{t(f)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercises.length === 0 ? (
                      <div className="col-span-full empty-state-premium">
                        <MedicalIcon name="exercise" size={48} className="opacity-30 mb-3" />
                        <p className="text-sm text-on-surface-variant">{t('ocr.emptyLibrary')}</p>
                      </div>
                    ) : (
                      exercises
                        .filter((ex) => ex.nombre.toLowerCase().includes(prescriptionSearch.toLowerCase()))
                        .map((ex, i) => (
                      <div key={ex.id || i} className={`glass-panel rounded-3xl overflow-hidden group transition-all card-glow-hover ${i < 2 ? 'border-2 border-primary/20 relative' : ''}`}>
                        {i < 2 && <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-primary text-on-primary text-2xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-card"><Icon name="lightbulb" size={12} /> Sugerido</div>}
                        <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <MedicalIcon name="gymnastics" size={48} className="text-primary/30 animate-breathe-icon" />
                          {ex.fase_recuperacion && <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-on-primary text-2xs font-bold uppercase tracking-widest">{ex.fase_recuperacion}</div>}
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <h3 className="fm-section-title text-primary">{ex.nombre}</h3>
                          <p className="text-label-sm text-secondary">{ex.descripcion || ex.grupo_muscular || 'Sin descripción'}</p>
                          <button
                            onClick={() => addToPrescription(ex.nombre)}
                            className="premium-btn w-full py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container active:scale-95 flex items-center justify-center gap-2 transition-all"
                          >
                            <Icon name="add_circle" size={20} /> Añadir a Rutina
                          </button>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col bg-surface-container-low p-4 gap-4 overflow-y-auto rounded-3xl card-glow-hover w-full lg:w-80 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="list_alt" filled size={24} className="text-primary animate-breathe-icon" />
                    <h2 className="fm-section-title text-primary">{t('ocr.currentPrescription')}</h2>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-label-sm font-bold rounded-full">{prescription.length} Ejercicios</span>
                </div>
                <div className="flex flex-col gap-4">
                  {prescription.map((item, i) => (
                    <div key={i} className="glass-panel p-4 rounded-2xl flex flex-col gap-4 border-l-4 border-l-primary card-glow-hover">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-primary">{item.name}</h4>
                        </div>
                        <button onClick={() => removeFromPrescription(i)} aria-label="Eliminar ejercicio" className="text-outline hover:text-error transition-colors">
                          <Icon name="delete" size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['sets', 'reps', 'freq'] as const).map((field) => (
                          <div key={field}>
                            <label className="text-2xs font-bold text-outline uppercase block">{field === 'sets' ? 'Series' : field === 'reps' ? 'Repet.' : 'Frec.'}</label>
                            <div className="flex items-center justify-between glass-teal px-3 py-2 rounded-lg">
                              <button onClick={() => updatePrescription(i, field, -1)} aria-label={`Reducir ${field}`} className="text-sm text-primary">−</button>
                              <span className="font-bold text-primary">{item[field]}</span>
                              <button onClick={() => updatePrescription(i, field, 1)} aria-label={`Aumentar ${field}`} className="text-sm text-primary">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {prescription.length === 0 && (
                    <div className="empty-state-premium border-2 border-dashed border-outline-variant rounded-2xl">
                      <Icon name="add_circle" size={32} className="opacity-50 mb-2" />
                      <p className="text-sm font-semibold text-on-surface-variant">{t('ocr.routineEmpty')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pb-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-surface-container transition-all text-secondary font-semibold">
                <Icon name="arrow_back" size={20} /> {t('ocr.backToValidate')}
              </button>
              <button onClick={generateToken} className="premium-btn px-8 py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-card hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 transition-all">
                {t('ocr.generateToken')} <Icon name="bolt" filled size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-panel rounded-3xl p-10 text-center relative overflow-hidden card-glow-hover">
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
                  <Icon name="verified_user" filled size={48} className="text-primary animate-breathe-icon" />
                </div>
                <h1 className="font-display-lg text-3xl lg:text-display-lg mb-2 shimmer-text">{t('ocr.patientReady')}</h1>
                <p className="font-body-lg text-body-lg text-secondary mb-10 max-w-md mx-auto">{t('ocr.registrationDone', { name: extractedData.nombre_completo })}</p>

                <div className="glass-teal rounded-2xl p-4 sm:p-6 border border-outline-variant/40 mb-10 w-full max-w-[320px] mx-auto">
                  <span className="block font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3">{t('ocr.activationToken')}</span>
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    <span className="font-display-lg text-2xl sm:text-display-lg text-primary tracking-[0.15em] sm:tracking-[0.2em] break-all">{generatedToken}</span>
                    <button onClick={copyToken} aria-label={t('tok.copy')} className={`flex items-center justify-center w-12 h-12 rounded-xl ${copied ? 'bg-tertiary-container' : 'bg-primary'} text-on-primary hover:bg-primary-container active:scale-95 shadow-sm transition-all`}>
                      <Icon name={copied ? 'check' : 'content_copy'} size={24} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10 max-w-2xl mx-auto">
                  <div className="glass-teal rounded-2xl p-4 border border-outline-variant/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container border border-outline-variant flex items-center justify-center"><Icon name="person" size={24} /></div>
                    <div>
                      <p className="text-2xs text-secondary uppercase">{t('common.patient')}</p>
                      <p className="fm-section-title">{extractedData.nombre_completo}</p>
                    </div>
                  </div>
                  <div className="glass-teal rounded-2xl p-4 border border-outline-variant/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center"><Icon name="document_scanner" size={24} /></div>
                    <div>
                      <p className="text-2xs text-secondary uppercase">{t('ocr.routineSummary')}</p>
                      <p className="fm-section-title">{prescription.length} Ejercicios</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  <button onClick={() => setShowEmailModal(true)} className="bg-primary text-on-primary font-bold hover:bg-teal-700 shadow-sm shadow-teal-600/20 rounded-full px-7 py-3 flex items-center gap-2 transition-all">
                    <Icon name="send" size={20} /> {t('ocr.sendTokenAny')}
                  </button>
                  <button onClick={() => { try { window.print(); } catch { toast.error(t('ocr.printError')); } }} className="bg-secondary-container/50 text-secondary font-semibold hover:bg-secondary-container border border-white/20 rounded-full px-6 py-3 flex items-center gap-2">
                    <Icon name="print" size={20} /> {t('ocr.printRx')}
                  </button>
                </div>

                <button onClick={() => navigate('/patients')} className="premium-btn bg-primary text-on-primary py-5 px-10 rounded-2xl fm-section-title shadow-elevated hover:shadow-elevated hover:-translate-y-1 flex items-center justify-center gap-3 transition-all">
                  Finalizar y volver al Directorio <Icon name="arrow_forward" size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailFeatureModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        token={generatedToken}
        recipientName={extractedData.nombre_completo || undefined}
        recipientEmail={extractedData.email || undefined}
        recipientPhone={extractedData.telefono || undefined}
      />
    </div>
  );
}
