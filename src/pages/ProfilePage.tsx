import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../components/ui/Icon';
import { GlassPanel } from '../components/ui/Glass';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/toastApi';
import { useTheme } from '../context/themeApi';
import { MedicalIcon } from '../components/ui/MedicalIcon';
import { AnimatedTabs } from '../components/ui/AnimatedTabs';
import { AnimatedLink } from '../components/ui/AnimatedLink';
import { GlassModal } from '../components/ui/GlassModal';
import { LegalModal, type LegalDocType } from '../components/ui/LegalModal';
import { compressImage } from '../lib/utils';
import {
  RehabHeroAvatarCard,
  RecoveryRankBadge,
  VirtualTrophyCabinet,
} from '../components/ui/GamificationSuite';
import { AchievementShowcase } from '../components/AchievementShowcase';
import { GamifiedBadgeCard } from '../components/ui/GamifiedBadgeCard';
import { useGamification } from '../hooks/useGamification';
import { currentLocale } from '../lib/format';
import { useTranslation } from 'react-i18next';
import {
  fisioProfileSchema,
  patientProfileSchema,
  formatZodError,
  PLACEHOLDERS,
  SELECT_OPTIONS,
} from '../lib/validation';

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useTheme();
  const gamification = useGamification();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    especialidad: '',
    universidad: '',
    cedula: '',
    colegiado_id: '',
    anio_egreso: '',
    // Patient fields
    fecha_nacimiento: '',
    diagnostico: '',
    patologia: '',
    diagnostico_secundario: '',
    medicamentos_actuales: '',
    alergias: '',
    enfermedades_cronicas: '',
    lesiones_previas: '',
    extremidad_afectada: '',
    rom_objetivo: '',
    frecuencia_sesiones: '',
    medico_remitente: '',
    telefono: '',
    tipo_sangre: '',
    ocupacion: '',
    nivel_actividad: '',
    estatura_cm: '',
    peso_kg: '',
    es_menor_edad: false,
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    tutor_nombre: '',
    tutor_telefono: '',
    tutor_email: '',
    consentimiento: false,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // ---- Avatar upload (vista previa antes de guardar) ----
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | Blob | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [legalModal, setLegalModal] = useState<LegalDocType | null>(null);
  const [clinicNameEditing, setClinicNameEditing] = useState(false);
  const [clinicNameValue, setClinicNameValue] = useState('');
  const [clinicNameSaving, setClinicNameSaving] = useState(false);
  const [clinicNameHover, setClinicNameHover] = useState(false);
  const clinicNameRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Pacientes activos hoy / sesiones programadas (fisio only)
  const [activeToday, setActiveToday] = useState<{ name: string; sessionTime: string; diagnosis: string }[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const isFisio = user?.role === 'fisioterapeuta';

  useEffect(() => {
    if (user && !editing) {
      setForm({
        full_name: user.full_name || '',
        especialidad: user.especialidad || '',
        universidad: user.universidad || '',
        cedula: user.cedula || '',
        colegiado_id: user.colegiado_id || '',
        anio_egreso: user.anio_egreso?.toString() || '',
        fecha_nacimiento: user.fecha_nacimiento || '',
        diagnostico: user.diagnostico || '',
        patologia: user.patologia || '',
        diagnostico_secundario: user.diagnostico_secundario || '',
        medicamentos_actuales: user.medicamentos_actuales || '',
        alergias: user.alergias || '',
        enfermedades_cronicas: user.enfermedades_cronicas || '',
        lesiones_previas: user.lesiones_previas || '',
        extremidad_afectada: user.extremidad_afectada || '',
        rom_objetivo: user.rom_objetivo || '',
        frecuencia_sesiones: user.frecuencia_sesiones || '',
        medico_remitente: user.medico_remitente || '',
        telefono: user.telefono || '',
        tipo_sangre: user.tipo_sangre || '',
        ocupacion: user.ocupacion || '',
        nivel_actividad: user.nivel_actividad || '',
        estatura_cm: user.estatura_cm?.toString() || '',
        peso_kg: user.peso_kg?.toString() || '',
        es_menor_edad: user.es_menor_edad || false,
        contacto_emergencia_nombre: user.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: user.contacto_emergencia_telefono || '',
        tutor_nombre: user.tutor_nombre || '',
        tutor_telefono: user.tutor_telefono || '',
        tutor_email: user.tutor_email || '',
        consentimiento: user.consentimiento || false,
      });
      setAvatarUrl(user.avatar_url ?? null);
    }
  }, [user, editing]);

  const clearFieldError = (field: string) => {
    setValidationErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // ---- Clinic name inline editing ----
  const startClinicEdit = () => {
    setClinicNameValue(user?.clinic_name || '');
    setClinicNameEditing(true);
    requestAnimationFrame(() => clinicNameRef.current?.focus());
  };

  const saveClinicName = async () => {
    if (!user?.id) return;
    const trimmed = clinicNameValue.trim();
    if (!trimmed) {
      setClinicNameEditing(false);
      return;
    }
    if (trimmed === (user?.clinic_name || '')) {
      setClinicNameEditing(false);
      return;
    }
    setClinicNameSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ clinic_name: trimmed, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      useAuthStore.setState({ user: { ...user, clinic_name: trimmed } });
      toast.success('Nombre de clínica actualizado');
    } catch {
      toast.error('Error al guardar el nombre de la clínica');
    } finally {
      setClinicNameSaving(false);
      setClinicNameEditing(false);
    }
  };

  const cancelClinicEdit = () => {
    setClinicNameEditing(false);
    setClinicNameValue(user?.clinic_name || '');
  };

  // ---- Pacientes activos hoy / sesiones programadas (fisio) ----
  useEffect(() => {
    if (!isFisio || !user?.id) return;
    let cancelled = false;
    (async () => {
      setLoadingActivity(true);
      try {
        const { data: links } = await supabase
          .from('pacientes_terapeutas')
          .select('paciente_id')
          .eq('terapeuta_id', user.id);
        if (!links || links.length === 0) {
          if (!cancelled) setActiveToday([]);
          return;
        }
        const ids = links.map((l) => l.paciente_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, diagnostico')
          .in('id', ids);
        const today = new Date().toISOString().split('T')[0];
        const { data: sessions } = await supabase
          .from('sesiones_completadas')
          .select('paciente_id, fecha, calidad_ejecucion')
          .in('paciente_id', ids)
          .gte('fecha', today)
          .order('fecha', { ascending: true })
          .limit(10);
        if (cancelled) return;
        const todayList = (profiles || []).map((p) => {
          const s = sessions?.find((x) => x.paciente_id === p.id);
          return {
            name: p.full_name,
            sessionTime: s ? new Date(s.fecha).toLocaleTimeString(currentLocale(), { hour: '2-digit', minute: '2-digit' }) : 'Pendiente',
            diagnosis: p.diagnostico || t('profile.noDiagnosis'),
          };
        });
        setActiveToday(todayList.slice(0, 6));
      } catch {
        if (!cancelled) setActiveToday([]);
      } finally {
        if (!cancelled) setLoadingActivity(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, isFisio]);

  const saveProfile = async () => {
    if (!user?.id) return;

    // Validate with Zod
    const schema = isFisio ? fisioProfileSchema : patientProfileSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      setValidationErrors(formatZodError(result.error));
      return;
    }

    try {
      const updateData: Record<string, unknown> = {
        full_name: form.full_name,
        updated_at: new Date().toISOString(),
      };

      if (isFisio) {
        updateData.especialidad = form.especialidad || null;
        updateData.universidad = form.universidad || null;
        updateData.cedula = form.cedula || null;
        updateData.colegiado_id = form.colegiado_id || null;
        updateData.anio_egreso = form.anio_egreso ? parseInt(form.anio_egreso, 10) : null;
        updateData.telefono = form.telefono || null;
      } else {
        updateData.fecha_nacimiento = form.fecha_nacimiento || null;
        updateData.diagnostico = form.diagnostico || null;
        updateData.patologia = form.patologia || null;
        updateData.diagnostico_secundario = form.diagnostico_secundario || null;
        updateData.medicamentos_actuales = form.medicamentos_actuales || null;
        updateData.alergias = form.alergias || null;
        updateData.enfermedades_cronicas = form.enfermedades_cronicas || null;
        updateData.lesiones_previas = form.lesiones_previas || null;
        updateData.extremidad_afectada = form.extremidad_afectada || null;
        updateData.rom_objetivo = form.rom_objetivo || null;
        updateData.frecuencia_sesiones = form.frecuencia_sesiones || null;
        updateData.medico_remitente = form.medico_remitente || null;
        updateData.telefono = form.telefono || null;
        updateData.tipo_sangre = form.tipo_sangre || null;
        updateData.ocupacion = form.ocupacion || null;
        updateData.nivel_actividad = form.nivel_actividad || null;
        updateData.estatura_cm = form.estatura_cm ? parseInt(form.estatura_cm, 10) : null;
        updateData.peso_kg = form.peso_kg ? parseFloat(form.peso_kg) : null;
        updateData.es_menor_edad = form.es_menor_edad;
        updateData.contacto_emergencia_nombre = form.contacto_emergencia_nombre || null;
        updateData.contacto_emergencia_telefono = form.contacto_emergencia_telefono || null;
        updateData.tutor_nombre = form.tutor_nombre || null;
        updateData.tutor_telefono = form.tutor_telefono || null;
        updateData.tutor_email = form.tutor_email || null;
        updateData.consentimiento = form.consentimiento;
      }

      const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);
      if (error) throw error;

      useAuthStore.setState({ user: { ...user, ...updateData } });
      toast.success('Perfil actualizado');
      setEditing(false);
    } catch {
      toast.error('Error actualizando perfil');
    }
  };

  // Selecciona una imagen, la comprime y muestra una vista previa sin subirla todavía.
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Limpiar el input para permitir volver a seleccionar el mismo archivo.
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file || !user?.id) return;

    // 1. Validar formato
    if (!file.type.startsWith('image/')) {
      toast.error('Formato no válido', { description: 'Selecciona un archivo de imagen (JPG, PNG, WebP…).' });
      return;
    }
    // 2. Validar tamaño en disco (rechazar archivos absurdamente grandes antes de procesar).
    const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB tope absoluto de entrada
    if (file.size > MAX_INPUT_BYTES) {
      toast.error('Imagen demasiado grande', { description: 'El archivo supera los 10MB. Usa una imagen más pequeña.' });
      return;
    }

    try {
      // 3. Comprimir: máximo 300x300 y 1MB.
      const compressed = await compressImage(file, 300, 0.85, 1024 * 1024);
      if (compressed.size > 1024 * 1024) {
        toast.warning('Imagen muy pesada', { description: 'No se pudo comprimir por debajo de 1MB. Prueba con otra imagen.' });
        return;
      }
      // 4. Generar vista previa local (sin subir).
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(compressed);
      setAvatarPreview(URL.createObjectURL(compressed));
    } catch (err) {
      const msg = (err as Error)?.message || '';
      if (/corrupta|no se puede cargar/i.test(msg)) {
        toast.error('Imagen corrupta', { description: 'No se pudo leer la imagen. Vuelve a intentarlo.' });
      } else if (/No se pudo leer|FileReader/i.test(msg)) {
        toast.error('Error de lectura', { description: 'No se pudo acceder al archivo seleccionado.' });
      } else {
        toast.error('Error al procesar la imagen', { description: msg || 'Inténtalo de nuevo.' });
      }
    }
  };

  // Sube la imagen previamente seleccionada al bucket 'avatars' y guarda la URL.
  const handleAvatarSave = async () => {
    if (!user?.id || !avatarFile) return;
    setAvatarUploading(true);
    try {
      const path = `${user.id}/avatar.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, {
        upsert: true,
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });
      if (upErr) throw upErr;

      // cache-bust para que PWA/navegador no siga mostrando la versión vieja.
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (updateErr) throw new Error(updateErr.message);

      setAvatarUrl(publicUrl);
      useAuthStore.setState({ user: { ...user, avatar_url: publicUrl } });
      toast.success('Foto de perfil actualizada', { description: 'Tu nueva foto se ha guardado correctamente.' });
      cancelAvatarPreview();
    } catch (err) {
      const msg = (err as Error)?.message || '';
      if (/Failed to fetch|NetworkError|network/i.test(msg)) {
        toast.error('Error de conexión', { description: 'No se pudo conectar con el servidor. Revisa tu red e inténtalo de nuevo.' });
      } else if (/policy|row-level security|RLS|403|unauthorized|401/i.test(msg)) {
        toast.error('Permiso denegado', { description: 'No tienes permiso para subir esta imagen. Vuelve a iniciar sesión.' });
      } else if (/bucket|not found|404/i.test(msg)) {
        toast.error('Almacén no disponible', { description: 'El espacio de almacenamiento no está configurado. Contacta con soporte.' });
      } else {
        toast.error('Error al subir la foto', { description: msg || 'Inténtalo de nuevo en unos segundos.' });
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  // Cancela la vista previa sin subir.
  const cancelAvatarPreview = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  // Limpieza de la object URL si el componente se desmonta.
  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  return (
    <div className="space-y-6 overflow-x-hidden max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-4 glass-card vibrant-hover rounded-[32px] p-6 flex flex-col items-center text-center hover-lift accent-teal relative overflow-hidden">
          <div className="blob-teal w-32 h-32 -top-6 -right-6 opacity-40" />
          <div className="relative">
            <div className="avatar-ring w-32 h-32">
              <div className="w-full h-full rounded-[inherit] bg-primary-container flex items-center justify-center text-on-primary-container text-4xl font-bold overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (user?.full_name?.charAt(0) || 'F')}
              </div>
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-on-primary rounded-full border-4 border-surface flex items-center justify-center cursor-pointer hover:scale-105 transition-transform breathe-badge glow-teal">
              <Icon name="photo_camera" size={18} />
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarSelect} />
            </label>
            {/* Vista previa + confirmación antes de guardar */}
            <AnimatePresence>
              {avatarPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 -bottom-2 flex flex-col items-center justify-center gap-2 bg-surface/95 backdrop-blur-sm rounded-[inherit] p-3 z-20"
                >
                  <img src={avatarPreview} alt="Vista previa" className="w-24 h-24 rounded-full object-cover ring-4 ring-cyan-400/60" />
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={cancelAvatarPreview}
                      disabled={avatarUploading}
                      className="px-3 py-1.5 rounded-lg bg-surface-variant/40 text-on-surface-variant text-xs font-bold hover:bg-surface-variant/60 transition-colors disabled:opacity-50"
                    >{t('common.cancel')}</button>
                    <button
                      type="button"
                      onClick={handleAvatarSave}
                      disabled={avatarUploading}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-1 glow-teal"
                    >
                      {avatarUploading ? (
                        <span className="w-3 h-3 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                      ) : (
                        <Icon name="check" size={14} />
                      )}
                      Guardar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <h2 className="font-display font-headline-lg text-headline-lg-mobile lg:text-headline-lg gradient-text-living mt-4 relative">{user?.full_name || t('profile.userFallback')}</h2>
          <div className="font-title-md text-primary bg-primary-container/10 px-4 py-1 rounded-full mt-2 flex items-center gap-2 breathe-badge glow-teal relative">
            <MedicalIcon name="clipboard" size={16} className="text-primary animate-breathe-icon" />
            {isFisio ? t('roles.physiotherapist') : t('roles.patient')}
          </div>
          <div className="w-full space-y-2 mt-6">
            {user?.email && (
              <div className="p-3 bg-surface-container-low/60 rounded-2xl border divider-teal flex items-center gap-2 relative">
                <Icon name="mail" size={18} className="text-outline" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            {user?.cedula && (
              <div className="p-3 bg-surface-container-low/60 rounded-2xl border divider-teal flex items-center gap-2 relative">
                <Icon name="badge" size={18} className="text-outline" />
                <span className="text-sm">{user.cedula}</span>
              </div>
            )}
          </div>
          <div className="w-full mt-4 space-y-3">
            <RecoveryRankBadge rank={isFisio ? t('profile.rankExpert') : t('profile.rankElite')} className="w-full justify-center" />
            <RehabHeroAvatarCard
              patientName={user?.full_name?.split(' ')[0] || t('profile.userFallback')}
              rankTitle={isFisio ? t('profile.rankTitlePhysio') : t('profile.rankTitlePatient')}
            />
          </div>
        </motion.div>

        {/* Settings bento */}
        <div className="lg:col-span-8 space-y-6 w-full min-w-0">
          <AnimatedTabs
            tabs={[
              { id: 'personal', label: t('profile.tabPersonal'), content: (
                <GlassPanel className="p-6 rounded-[32px] card-glow-hover hover-lift accent-teal">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-lg-mobile gradient-text-living font-bold">{t('profile.personalInfo')}</h3>
                    <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 text-primary font-bold text-sm hover-lift badge-teal px-3 py-1 rounded-full breathe-badge">
                      <Icon name="edit" size={16} /> {editing ? t('common.cancel') : t('common.edit')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isFisio ? (
                      <>
                        <div key="full_name" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.fullName')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => { setForm({ ...form, full_name: e.target.value }); clearFieldError('full_name'); }}
                                className={`input-base ${validationErrors.full_name ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.fullName}
                              />
                              {validationErrors.full_name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.full_name}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.full_name || '—'}</span>
                          )}
                        </div>
                        <div key="especialidad" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.specialty')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.especialidad}
                                onChange={(e) => { setForm({ ...form, especialidad: e.target.value }); clearFieldError('especialidad'); }}
                                className={`input-base ${validationErrors.especialidad ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.especialidad}
                              />
                              {validationErrors.especialidad && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.especialidad}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.especialidad || '—'}</span>
                          )}
                        </div>
                        <div key="universidad" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.university')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.universidad}
                                onChange={(e) => { setForm({ ...form, universidad: e.target.value }); clearFieldError('universidad'); }}
                                className={`input-base ${validationErrors.universidad ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.universidad}
                              />
                              {validationErrors.universidad && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.universidad}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.universidad || '—'}</span>
                          )}
                        </div>
                        <div key="cedula" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.license')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.cedula}
                                onChange={(e) => { setForm({ ...form, cedula: e.target.value }); clearFieldError('cedula'); }}
                                className={`input-base ${validationErrors.cedula ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.cedula}
                              />
                              {validationErrors.cedula && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.cedula}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.cedula || '—'}</span>
                          )}
                        </div>
                        <div key="colegiado_id" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.billId')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.colegiado_id}
                                onChange={(e) => { setForm({ ...form, colegiado_id: e.target.value }); clearFieldError('colegiado_id'); }}
                                className={`input-base ${validationErrors.colegiado_id ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.colegiadoId}
                              />
                              {validationErrors.colegiado_id && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.colegiado_id}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.colegiado_id || '—'}</span>
                          )}
                        </div>
                        <div key="anio_egreso" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.gradYear')}</label>
                          {editing ? (
                            <>
                              <input
                                type="number"
                                value={form.anio_egreso}
                                onChange={(e) => { setForm({ ...form, anio_egreso: e.target.value }); clearFieldError('anio_egreso'); }}
                                min={1950}
                                max={new Date().getFullYear()}
                                className={`input-base ${validationErrors.anio_egreso ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.anioEgreso}
                              />
                              {validationErrors.anio_egreso && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.anio_egreso}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.anio_egreso || '—'}</span>
                          )}
                        </div>
                        <div key="telefono" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.phone')}</label>
                          {editing ? (
                            <>
                              <input
                                type="tel"
                                value={form.telefono}
                                onChange={(e) => { setForm({ ...form, telefono: e.target.value }); clearFieldError('telefono'); }}
                                className={`input-base ${validationErrors.telefono ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.telefono}
                              />
                              {validationErrors.telefono && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.telefono}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.telefono || '—'}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div key="full_name" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.fullName')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => { setForm({ ...form, full_name: e.target.value }); clearFieldError('full_name'); }}
                                className={`input-base ${validationErrors.full_name ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.fullName}
                              />
                              {validationErrors.full_name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.full_name}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.full_name || '—'}</span>
                          )}
                        </div>
                        <div key="fecha_nacimiento" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.birthDate')}</label>
                          {editing ? (
                            <>
                              <input
                                type="date"
                                value={form.fecha_nacimiento}
                                onChange={(e) => { setForm({ ...form, fecha_nacimiento: e.target.value }); clearFieldError('fecha_nacimiento'); }}
                                max={new Date().toISOString().split('T')[0]}
                                className={`input-base ${validationErrors.fecha_nacimiento ? 'border-red-500 focus:border-red-500' : ''}`}
                              />
                              {validationErrors.fecha_nacimiento && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.fecha_nacimiento}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.fecha_nacimiento ? new Date(form.fecha_nacimiento).toLocaleDateString() : '—'}</span>
                          )}
                        </div>
                        <div key="diagnostico" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.conditionDx')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.diagnostico}
                                onChange={(e) => { setForm({ ...form, diagnostico: e.target.value }); clearFieldError('diagnostico'); }}
                                className={`input-base ${validationErrors.diagnostico ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.diagnostico}
                              />
                              {validationErrors.diagnostico && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.diagnostico}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.diagnostico || '—'}</span>
                          )}
                        </div>
                        <div key="patologia" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.pathology')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.patologia}
                                onChange={(e) => { setForm({ ...form, patologia: e.target.value }); clearFieldError('patologia'); }}
                                className={`input-base ${validationErrors.patologia ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.patologia}
                              />
                              {validationErrors.patologia && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.patologia}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.patologia || '—'}</span>
                          )}
                        </div>
                        <div key="telefono" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.phone')}</label>
                          {editing ? (
                            <>
                              <input
                                type="tel"
                                value={form.telefono}
                                onChange={(e) => { setForm({ ...form, telefono: e.target.value }); clearFieldError('telefono'); }}
                                className={`input-base ${validationErrors.telefono ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.telefono}
                              />
                              {validationErrors.telefono && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.telefono}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.telefono || '—'}</span>
                          )}
                        </div>
                        <div key="tipo_sangre" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.bloodType')}</label>
                          {editing ? (
                            <>
                              <select
                                value={form.tipo_sangre}
                                onChange={(e) => { setForm({ ...form, tipo_sangre: e.target.value }); clearFieldError('tipo_sangre'); }}
                                className={`input-base ${validationErrors.tipo_sangre ? 'border-red-500 focus:border-red-500' : ''}`}
                              >
                                <option value="">{t('profile.selectBloodType')}</option>
                                {SELECT_OPTIONS.bloodType.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {validationErrors.tipo_sangre && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.tipo_sangre}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.tipo_sangre || '—'}</span>
                          )}
                        </div>
                        <div key="ocupacion" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.occupation')}</label>
                          {editing ? (
                            <>
                              <input
                                type="text"
                                value={form.ocupacion}
                                onChange={(e) => { setForm({ ...form, ocupacion: e.target.value }); clearFieldError('ocupacion'); }}
                                className={`input-base ${validationErrors.ocupacion ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.ocupacion}
                              />
                              {validationErrors.ocupacion && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.ocupacion}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.ocupacion || '—'}</span>
                          )}
                        </div>
                        <div key="nivel_actividad" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.activityLevel')}</label>
                          {editing ? (
                            <>
                              <select
                                value={form.nivel_actividad}
                                onChange={(e) => { setForm({ ...form, nivel_actividad: e.target.value }); clearFieldError('nivel_actividad'); }}
                                className={`input-base ${validationErrors.nivel_actividad ? 'border-red-500 focus:border-red-500' : ''}`}
                              >
                                <option value="">{t('profile.selectActivityLevel')}</option>
                                {SELECT_OPTIONS.activityLevel.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {validationErrors.nivel_actividad && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.nivel_actividad}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.nivel_actividad || '—'}</span>
                          )}
                        </div>
                        <div key="estatura_cm" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.height')}</label>
                          {editing ? (
                            <>
                              <input
                                type="number"
                                value={form.estatura_cm}
                                onChange={(e) => { setForm({ ...form, estatura_cm: e.target.value }); clearFieldError('estatura_cm'); }}
                                min={50}
                                max={250}
                                className={`input-base ${validationErrors.estatura_cm ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.estaturaCm}
                              />
                              {validationErrors.estatura_cm && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.estatura_cm}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.estatura_cm ? `${form.estatura_cm} cm` : '—'}</span>
                          )}
                        </div>
                        <div key="peso_kg" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.weight')}</label>
                          {editing ? (
                            <>
                              <input
                                type="number"
                                step="0.1"
                                value={form.peso_kg}
                                onChange={(e) => { setForm({ ...form, peso_kg: e.target.value }); clearFieldError('peso_kg'); }}
                                min={2}
                                max={300}
                                className={`input-base ${validationErrors.peso_kg ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder={PLACEHOLDERS.pesoKg}
                              />
                              {validationErrors.peso_kg && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.peso_kg}</p>}
                            </>
                          ) : (
                            <span className="font-medium text-on-surface">{form.peso_kg ? `${form.peso_kg} kg` : '—'}</span>
                          )}
                        </div>
                        <div key="es_menor_edad" className="p-4 rounded-2xl bg-surface-container-low/60 border divider-teal">
                          <label className="text-[10px] uppercase text-outline font-bold block mb-1">{t('profile.isMinor')}</label>
                          {editing ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={form.es_menor_edad}
                                onChange={(e) => setForm({ ...form, es_menor_edad: e.target.checked })}
                                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm text-on-surface">{t('profile.minorLabel')}</span>
                            </label>
                          ) : (
                            <span className="font-medium text-on-surface">{form.es_menor_edad ? t('common.yes') : t('common.no')}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {editing && (
                    <button onClick={saveProfile} className="premium-btn mt-4 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all glow-teal breathe-teal">{t('profile.saveChanges')}</button>
                  )}
                </GlassPanel>
              ) },
              { id: 'preferences', label: t('profile.tabPreferences'), content: (
                <>
                <GlassPanel className="p-6 rounded-[32px] card-glow-hover hover-lift">
                  <h3 className="font-headline-lg-mobile gradient-text-living font-bold mb-6">{t('profile.systemPrefs')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 hover:bg-surface-variant/20 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Icon name="dark_mode" size={24} className="text-outline animate-breathe-icon" />
                        <div><p className="font-medium">{t('profile.darkMode')}</p><p className="text-xs text-outline">{t('profile.darkModeSub')}</p></div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-outline-variant'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 hover:bg-surface-variant/20 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Icon name="notifications_active" size={24} className="text-outline animate-breathe-icon" />
                        <div><p className="font-medium">{t('profile.pushNotifications')}</p><p className="text-xs text-outline">{t('profile.notifSub')}</p></div>
                      </div>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`w-14 h-8 rounded-full transition-colors ${pushNotifications ? 'bg-primary' : 'bg-outline-variant'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${pushNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </GlassPanel>
                {isFisio && (
                  <GlassPanel className="p-6 rounded-[32px] card-glow-hover hover-lift mt-6 shimmer-border relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/15 to-teal-500/10 blur-2xl pointer-events-none" />
                    <h3 className="font-headline-lg-mobile gradient-text-living font-bold mb-6 relative">{t('profile.clinicSettings')}</h3>
                    <div className="relative">
                      <label className="text-[10px] uppercase text-outline font-bold block mb-2">{t('profile.clinicName')}</label>
                      <div
                        className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low/60 border divider-teal transition-all"
                        onMouseEnter={() => setClinicNameHover(true)}
                        onMouseLeave={() => setClinicNameHover(false)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-400/10 flex items-center justify-center ring-1 ring-cyan-500/20 breathe-teal flex-shrink-0">
                          <Icon name="medical_services" size={24} className="icon-accent-cyan animate-breathe-icon" />
                        </div>
                        {clinicNameEditing ? (
                          <input
                            ref={clinicNameRef}
                            type="text"
                            value={clinicNameValue}
                            disabled={clinicNameSaving}
                            onChange={(e) => setClinicNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); saveClinicName(); }
                              if (e.key === 'Escape') { e.preventDefault(); cancelClinicEdit(); }
                            }}
                            onBlur={saveClinicName}
                            placeholder={t('profile.clinicNamePlaceholder')}
                            className="flex-1 bg-transparent border-b-2 border-cyan-500/40 focus:border-cyan-500 outline-none text-on-surface font-medium text-lg py-1"
                          />
                        ) : (
                          <button
                            onClick={startClinicEdit}
                            className="flex-1 flex items-center justify-between text-left group"
                          >
                            <span className="font-medium text-on-surface text-lg">
                              {user?.clinic_name || t('profile.clinicNoName')}
                            </span>
                            <AnimatePresence>
                              {(clinicNameHover || !user?.clinic_name) && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="flex items-center gap-1 text-xs font-bold text-cyan-600 bg-cyan-500/10 px-3 py-1.5 rounded-full ring-1 ring-cyan-500/20"
                                >
                                  <Icon name="edit" size={14} />
                                  {user?.clinic_name ? t('common.edit') : t('profile.add')}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-outline mt-2 ml-1">
                        {clinicNameEditing
                          ? t('profile.enterToSave')
                          : t('profile.clickToEdit')}
                      </p>
                    </div>
                  </GlassPanel>
                )}
                </>
              ) },
              { id: 'activity', label: isFisio ? t('profile.tabActivity') : t('profile.tabSessions'), content: (
                <>
                <GlassPanel className="p-6 rounded-[32px] card-glow-hover hover-lift shimmer-border relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/15 to-teal-500/10 blur-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/15 to-cyan-400/10 flex items-center justify-center ring-1 ring-cyan-500/20 breathe-teal">
                          <Icon name="groups" size={24} className="icon-accent-cyan animate-breathe-icon" />
                        </div>
                        <div>
                          <h3 className="font-headline-lg-mobile gradient-text-living font-bold">{isFisio ? t('profile.activeToday') : t('profile.sessionsScheduled')}</h3>
                          <p className="text-xs text-outline mt-0.5">
                            {isFisio ? t('profile.activeCount', { n: activeToday.length }) : t('profile.nextSessions')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {loadingActivity ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low/40 border divider-teal animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-surface-variant/30" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-surface-variant/30 rounded-full w-2/3" />
                              <div className="h-2 bg-surface-variant/20 rounded-full w-1/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isFisio ? (
                      activeToday.length === 0 ? (
                        <p className="text-sm text-on-surface-variant text-center py-8">{t('profile.noActivePatients')}</p>
                      ) : (
                        <div className="space-y-3">
                          {activeToday.map((p, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.07 }}
                              className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low/60 border divider-teal hover-lift"
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-teal-500/10 flex items-center justify-center ring-1 ring-cyan-500/20 flex-shrink-0">
                                <span className="font-bold text-sm icon-accent-cyan">{p.name.charAt(0)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-on-surface truncate">{p.name}</p>
                                <p className="text-xs text-outline truncate">{p.diagnosis}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 pulse-ring" />
                                <span className="text-xs font-bold text-cyan-600">{p.sessionTime}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/15 to-cyan-400/10 flex items-center justify-center ring-1 ring-cyan-500/20 mx-auto mb-3 breathe-teal">
                          <Icon name="event_available" size={28} className="icon-accent-cyan animate-breathe-icon" />
                        </div>
                        <p className="text-sm text-on-surface-variant">{t('profile.patientNoSessions')}</p>
                      </div>
                    )}
                  </div>
                </GlassPanel>
                <div className="flex flex-wrap justify-between items-center gap-4 pt-6">
                  <div className="flex gap-4 text-sm">
                    <AnimatedLink onClick={() => setLegalModal('privacy')} className="text-on-surface-variant">{t('profile.privacy')}</AnimatedLink>
                    <AnimatedLink onClick={() => setLegalModal('terms')} className="text-on-surface-variant">{t('profile.terms')}</AnimatedLink>
                    <AnimatedLink onClick={() => setLegalModal('consent')} className="text-on-surface-variant">{t('profile.consent')}</AnimatedLink>
                  </div>
                  <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-error/10 text-error font-bold hover:bg-error/20 transition-all breathe-badge hover-lift-warm">
                    <Icon name="logout" size={20} />{t('profile.signOut')}</button>
                </div>
                </>
              ) },
              { id: 'trophies', label: t('profile.tabTrophies'), content: (
                <div className="space-y-4">
                  <GlassPanel className="p-5 sm:p-6 rounded-3xl">
                    <div className="flex justify-between items-center text-xs mb-4">
                      <span className="text-on-surface-variant">{gamification.unlockedCount} de {gamification.achievements.length} medallas</span>
                      <span className="font-bold text-primary">{Math.round(gamification.totalProgress * 100)}% desbloqueado</span>
                    </div>
                    <AchievementShowcase achievements={gamification.achievements} compact={false} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-outline-variant/20">
                      <GamifiedBadgeCard
                        title="Constancia"
                        category="adherencia"
                        description={`Nivel ${gamification.currentLevel.level} · ${Math.round(gamification.levelProgressPercent)}% hacia el siguiente nivel`}
                        level={gamification.currentLevel.level}
                        xpPoints={gamification.points}
                        unlocked={gamification.points > 0}
                        iconName="trophy"
                      />
                      <GamifiedBadgeCard
                        title={t('profile.overallProgress')}
                        category="progreso"
                        description={`${Math.round(gamification.totalProgress * 100)}% de los objetivos de la rutina actual`}
                        xpPoints={gamification.points}
                        unlocked={gamification.totalProgress > 0}
                        iconName="award"
                      />
                    </div>
                  </GlassPanel>
                  <VirtualTrophyCabinet />
                </div>
              ) },
            ]}
          />
        </div>
      </div>

      <GlassModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto breathe-warm">
            <Icon name="logout" size={28} className="text-error animate-breathe-icon" />
          </div>
          <h3 className="font-headline-lg-mobile text-on-surface font-bold">{t('profile.signOutConfirm')}</h3>
          <p className="text-sm text-on-surface-variant">{t('profile.signOutConfirmBody')}</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-6 py-3 rounded-xl bg-surface-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/50 transition-all">{t('common.cancel')}</button>
            <button onClick={() => { setShowLogoutModal(false); supabase.auth.signOut(); }} className="flex-1 px-6 py-3 rounded-xl bg-error text-on-error font-bold hover:bg-error/90 transition-all">{t('profile.signOut2')}</button>
          </div>
        </div>
      </GlassModal>

      <LegalModal isOpen={legalModal !== null} onClose={() => setLegalModal(null)} type={legalModal ?? 'privacy'} />
    </div>
  );
}