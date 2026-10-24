import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/ToastProvider';
import { Icon } from './ui/Icon';

import { Spinner } from './ui/Loader';
import { cn } from '../lib/utils';


/**
 * Biblioteca de ejercicios disponibles para asignar.
 * Cada entrada describe un ejercicio reutilizable con su articulación principal
 * y un rango de series/repeticiones por defecto razonable.
 */
interface ExerciseLibraryItem {
  id: string;
  nombre: string;
  articulacion: 'hombro' | 'codo' | 'rodilla' | 'cadera' | 'tobillo' | 'cervical';
  descripcion: string;
  nombreKey: string;
  descKey: string;
  seriesDefault: number;
  repsDefault: number;
  lado: 'bilateral' | 'derecho' | 'izquierdo';
}

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  { id: 'flx-hombro', nombreKey: 'rrm.exFlexShoulder', nombre: 'Flexión de hombro', articulacion: 'hombro', seriesDefault: 3, repsDefault: 12, lado: 'bilateral', descKey: 'rrm.exFlexShoulderDesc', descripcion: 'Elevación del brazo hacia adelante hasta 120°.' },
  { id: 'abd-hombro', nombreKey: 'rrm.exAbdShoulder', nombre: 'Abducción de hombro', articulacion: 'hombro', seriesDefault: 3, repsDefault: 12, lado: 'bilateral', descKey: 'rrm.exAbdShoulderDesc', descripcion: 'Apertura del brazo hacia el lado hasta 90°.' },
  { id: 'rot-ext-hombro', nombreKey: 'rrm.exExtRotShoulder', nombre: 'Rotación externa de hombro', articulacion: 'hombro', seriesDefault: 3, repsDefault: 15, lado: 'bilateral', descKey: 'rrm.exExtRotShoulderDesc', descripcion: 'Rotación externa con codo fijo a 90°.' },
  { id: 'circ-hombro', nombreKey: 'rrm.exCircumduction', nombre: 'Circunducción de hombro', articulacion: 'hombro', seriesDefault: 2, repsDefault: 10, lado: 'bilateral', descKey: 'rrm.exCircumductionDesc', descripcion: 'Círculos completos del brazo con codo extendido.' },
  { id: 'flx-codo', nombreKey: 'rrm.exElbowFlex', nombre: 'Flexión de codo', articulacion: 'codo', seriesDefault: 3, repsDefault: 12, lado: 'bilateral', descKey: 'rrm.exElbowFlexDesc', descripcion: 'Curl de bíceps llevando la mano al hombro.' },
  { id: 'ext-rodilla', nombreKey: 'rrm.exKneeExt', nombre: 'Extensión de rodilla', articulacion: 'rodilla', seriesDefault: 3, repsDefault: 10, lado: 'bilateral', descKey: 'rrm.exKneeExtDesc', descripcion: 'Extensión completa de rodilla sentado.' },
  { id: 'flx-rodilla-pie', nombreKey: 'rrm.exKneeFlexStand', nombre: 'Flexión de rodilla en pie', articulacion: 'rodilla', seriesDefault: 3, repsDefault: 12, lado: 'bilateral', descKey: 'rrm.exKneeFlexStandDesc', descripcion: 'Lleva el talón al glúteo de pie.' },
  { id: 'sentadilla', nombreKey: 'rrm.exPartialSquat', nombre: 'Sentadilla parcial', articulacion: 'rodilla', seriesDefault: 3, repsDefault: 10, lado: 'bilateral', descKey: 'rrm.exPartialSquatDesc', descripcion: 'Sentadilla a 45° de flexión de rodilla.' },
  { id: 'puente', nombreKey: 'rrm.exGluteBridge', nombre: 'Puente de glúteos', articulacion: 'cadera', seriesDefault: 3, repsDefault: 12, lado: 'bilateral', descKey: 'rrm.exGluteBridgeDesc', descripcion: 'Elevación de cadera desde supino.' },
  { id: 'abd-cadera', nombreKey: 'rrm.exHipAbd', nombre: 'Abducción de cadera', articulacion: 'cadera', seriesDefault: 3, repsDefault: 12, lado: 'bilateral', descKey: 'rrm.exHipAbdDesc', descripcion: 'Separa la pierna hacia el lado con control.' },
  { id: 'dorsiflex-tobillo', nombreKey: 'rrm.exAnkleMob', nombre: 'Movilidad de tobillo', articulacion: 'tobillo', seriesDefault: 3, repsDefault: 15, lado: 'bilateral', descKey: 'rrm.exAnkleMobDesc', descripcion: 'Dorsiflexión y flexión plantar alternantes.' },
  { id: 'trap-estiramiento', nombreKey: 'rrm.exTrapStretch', nombre: 'Estiramiento de trapecio', articulacion: 'cervical', seriesDefault: 2, repsDefault: 4, lado: 'bilateral', descKey: 'rrm.exTrapStretchDesc', descripcion: 'Inclinación cervical con tracción suave.' },
  { id: 'mov-cervical', nombreKey: 'rrm.exCervMob', nombre: 'Movilidad cervical', articulacion: 'cervical', seriesDefault: 2, repsDefault: 10, lado: 'bilateral', descKey: 'rrm.exCervMobDesc', descripcion: 'Rotación cervical suave hacia ambos lados.' },
  { id: 'equilibrio', nombreKey: 'rrm.exBalance', nombre: 'Equilibrio sobre una pierna', articulacion: 'rodilla', seriesDefault: 3, repsDefault: 3, lado: 'derecho', descKey: 'rrm.exBalanceDesc', descripcion: 'Apoyo unipodal con leve flexión de rodilla.' },
];



const SIDE_KEYS: Record<ExerciseLibraryItem['lado'], string> = {
  bilateral: 'rrm.sideBilateral',
  derecho: 'rrm.sideRight',
  izquierdo: 'rrm.sideLeft',
};

/** Maps each articulation to a distinct Material Symbol glyph for visual variety. */
const ARTICULACION_ICON: Record<ExerciseLibraryItem['articulacion'], string> = {
  hombro: 'accessibility',
  codo: 'back_hand',
  rodilla: 'directions_walk',
  cadera: 'rotate_right',
  tobillo: 'footprint',
  cervical: 'psychology',
};

/** Ejercicio seleccionado con configuración de series/repeticiones. */
interface SelectedExercise {
  libraryId: string;
  nombre: string;
  nombreKey: string;
  articulacion: ExerciseLibraryItem['articulacion'];
  lado: ExerciseLibraryItem['lado'];
  series: number;
  repeticiones: number;
}

type Step = 0 | 1 | 2;

interface ReassignRoutineModalProps {
  open: boolean;
  onClose: () => void;
  /** ID del paciente whose routine is being reassigned. */
  pacienteId: string;
  /** ID del fisioterapeuta que reasigna (auth user id). */
  fisioterapeutaId: string;
  /** Nombre del paciente para mostrar en el resumen. */
  pacienteNombre: string;
  /** Callback tras guardar exitosamente (para recargar la página). */
  onSaved: () => void;
}

export function ReassignRoutineModal({
  open,
  onClose,
  pacienteId,
  fisioterapeutaId,
  pacienteNombre,
  onSaved,
}: ReassignRoutineModalProps) {
  const toast = useToast();
  const { t } = useTranslation();
  const artLabel = (a: ExerciseLibraryItem['articulacion']) => t('joints.' + a);
  const sideLabel = (l: ExerciseLibraryItem['lado']) => t(SIDE_KEYS[l]);
  const [step, setStep] = useState<Step>(0);
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [search, setSearch] = useState('');
  const [filtroArt, setFiltroArt] = useState<ExerciseLibraryItem['articulacion'] | 'todas'>('todas');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const todayISO = () => new Date().toISOString().split('T')[0];
  const plusDaysISO = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const [fechaInicio, setFechaInicio] = useState<string>(todayISO);
  const [fechaFin, setFechaFin] = useState<string>(() => plusDaysISO(28));

  const filteredLibrary = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchSearch = !q || ex.nombre.toLowerCase().includes(q) || ex.descripcion.toLowerCase().includes(q) || t(ex.nombreKey).toLowerCase().includes(q) || t(ex.descKey).toLowerCase().includes(q);
      const matchArt = filtroArt === 'todas' || ex.articulacion === filtroArt;
      return matchSearch && matchArt;
    });
  }, [search, filtroArt, t]);

  const toggleExercise = (item: ExerciseLibraryItem) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.libraryId === item.id);
      if (exists) return prev.filter((p) => p.libraryId !== item.id);
      return [
        ...prev,
        {
          libraryId: item.id,
          nombre: item.nombre,
          nombreKey: item.nombreKey,
          articulacion: item.articulacion,
          lado: item.lado,
          series: item.seriesDefault,
          repeticiones: item.repsDefault,
        },
      ];
    });
  };

  const updateConfig = (libraryId: string, field: 'series' | 'repeticiones', value: number) => {
    setSelected((prev) =>
      prev.map((p) =>
        p.libraryId === libraryId ? { ...p, [field]: Math.max(1, Math.min(99, value || 1)) } : p,
      ),
    );
  };

  const removeSelected = (libraryId: string) => {
    setSelected((prev) => prev.filter((p) => p.libraryId !== libraryId));
  };

  const canNextFromStep0 = selected.length > 0;
  const canConfirm = selected.length > 0 && !saving;

  const reset = () => {
    setStep(0);
    setSelected([]);
    setSearch('');
    setFiltroArt('todas');
    setSaving(false);
    setError(null);
    setFechaInicio(todayISO());
    setFechaFin(plusDaysISO(28));
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    if (!canConfirm || !pacienteId || !fisioterapeutaId) return;
    if (fechaFin && fechaInicio && fechaFin < fechaInicio) {
      setError(t('rrm.dateRangeError', 'La fecha de fin no puede ser anterior a la de inicio.'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // 1) Obtener la rutina activa actual (para rollback si algo falla).
      const { data: activeRoutines } = await supabase
        .from('rutinas')
        .select('id, nombre, ejercicios, fecha_inicio')
        .eq('paciente_id', pacienteId)
        .eq('activa', true);
      const activeRoutine = activeRoutines?.[0] ?? null;

      // 2) Archivar la rutina activa actual (NO eliminar).
      if (activeRoutine) {
        const { error: archiveErr } = await supabase
          .from('rutinas')
          .update({ status: 'archivada', activa: false, updated_at: new Date().toISOString() })
          .eq('id', activeRoutine.id);
        if (archiveErr) throw new Error(archiveErr.message);
      }

      // 3) Insertar la nueva rutina como activa.
      const now = new Date();
      const newRoutineName = t('rrm.reassignedRoutineName', { date: now.toLocaleDateString(), time: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) });
      const ejerciciosJson = selected.map((ex) => ({
        nombre: ex.nombre,
        series: ex.series,
        repeticiones: ex.repeticiones,
        articulacion: ex.articulacion,
        lado: ex.lado,
      }));

      const { data: newRoutine, error: rutinaErr } = await supabase
        .from('rutinas')
        .insert({
          paciente_id: pacienteId,
          fisioterapeuta_id: fisioterapeutaId,
          nombre: newRoutineName,
          descripcion: t('rrm.reassignedDesc'),
          ejercicios: ejerciciosJson,
          activa: true,
          status: 'activa',
          fecha_inicio: fechaInicio || todayISO(),
          fecha_fin: fechaFin || null,
        })
        .select('id')
        .single();

      if (rutinaErr) {
        // Rollback: reactivar la rutina anterior si falló la inserción.
        if (activeRoutine) {
          await supabase.from('rutinas').update({ status: 'activa', activa: true }).eq('id', activeRoutine.id);
        }
        throw new Error(rutinaErr.message);
      }
      if (!newRoutine?.id) throw new Error(t('rrm.noRoutineId'));

      // 4) Reemplazar los ejercicios individuales del paciente.
      const { error: delErr } = await supabase.from('patient_exercises').delete().eq('paciente_id', pacienteId);
      if (delErr) {
        // Rollback: eliminar la rutina nueva y reactivar la anterior.
        await supabase.from('rutinas').delete().eq('id', newRoutine.id);
        if (activeRoutine) {
          await supabase.from('rutinas').update({ status: 'activa', activa: true }).eq('id', activeRoutine.id);
        }
        throw new Error(delErr.message);
      }

      const rows = selected.map((ex) => ({
        paciente_id: pacienteId,
        ejercicio_nombre: ex.nombre,
        series: ex.series,
        repeticiones: ex.repeticiones,
      }));

      if (rows.length > 0) {
        const { error: exErr } = await supabase.from('patient_exercises').insert(rows);
        if (exErr) {
          // Rollback parcial: reactivar rutina anterior y archivar la nueva.
          await supabase.from('rutinas').update({ status: 'archivada', activa: false }).eq('id', newRoutine.id);
          if (activeRoutine) {
            await supabase.from('rutinas').update({ status: 'activa', activa: true }).eq('id', activeRoutine.id);
          }
          throw new Error(exErr.message);
        }
      }

      toast.success(t('rrm.savedToast'));
      reset();
      onSaved();
    } catch (e) {
      const msg = (e as Error).message || t('common.unknownError');
      setError(msg);
      toast.error(t('rrm.reassignError', { msg }));
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 0, label: t('rrm.stepSelect') },
    { num: 1, label: t('rrm.stepConfig') },
    { num: 2, label: t('common.confirm') },
  ] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-background overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-outline-variant/20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="autorenew" size={24} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="fm-section-title truncate">{t('rrm.title')}</h2>
                  <p className="text-xs text-on-surface-variant truncate">
                    {t('common.patient')}: <span className="font-semibold">{pacienteNombre}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={saving}
                aria-label={t('common.close')}
                className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center justify-center disabled:opacity-50"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            {/* Stepper */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
              <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex items-center gap-2 flex-1 last:flex-none">
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                        step === s.num
                          ? 'bg-primary text-on-primary'
                          : step > s.num
                            ? 'bg-primary/15 text-primary'
                            : 'bg-surface-container text-on-surface-variant',
                      )}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-2xs',
                          step === s.num ? 'bg-on-primary text-primary' : step > s.num ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant',
                        )}
                      >
                        {step > s.num ? <Icon name="check" size={12} filled /> : i + 1}
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={cn('h-0.5 flex-1 rounded-full', step > s.num ? 'bg-primary/40' : 'bg-outline-variant/30')} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-32">
            {/* STEP 0 — Selección de ejercicios */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('rrm.searchPlaceholder')}
                      className="input-base w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 bg-surface-container border border-outline-variant/20"
                    />
                  </div>
                  <select
                    value={filtroArt}
                    onChange={(e) => setFiltroArt(e.target.value as typeof filtroArt)}
                    className="input-base px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="todas">{t('rrm.allJoints')}</option>
                    {((['hombro', 'codo', 'rodilla', 'tobillo', 'cadera', 'cervical'] as ExerciseLibraryItem['articulacion'][])).map((a) => (
                      <option key={a} value={a}>{artLabel(a)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredLibrary.map((ex) => {
                    const isSelected = selected.some((p) => p.libraryId === ex.id);
                    return (
                      <motion.button
                        type="button"
                        key={ex.id}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleExercise(ex)}
                        className={cn(
                          'text-left p-4 rounded-2xl border transition-all relative overflow-hidden',
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : 'bg-surface-container border-outline-variant/20 hover:border-primary/40',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', isSelected ? 'bg-primary text-on-primary' : 'bg-secondary-container text-primary')}>
                            <Icon name={ARTICULACION_ICON[ex.articulacion]} size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-on-surface text-sm leading-tight">{t(ex.nombreKey)}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{t(ex.descKey)}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-2xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                                {artLabel(ex.articulacion)}
                              </span>
                              <span className="text-2xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                                {sideLabel(ex.lado)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow">
                            <Icon name="check" size={14} filled />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {filteredLibrary.length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="search_off" size={48} className="mx-auto text-outline opacity-30 mb-2" />
                    <p className="text-on-surface-variant text-sm">{t('rrm.noResults')}</p>
                  </div>
                )}

                {selected.length > 0 && (
                  <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2 text-sm">
                    <Icon name="check_circle" size={18} className="text-primary" />
                    <span className="text-on-surface font-semibold">{t('rrm.selectedCount', { count: selected.length })}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 1 — Configuración de series y repeticiones */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {selected.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-on-surface-variant">{t('rrm.noSelection')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.map((ex) => (
                      <div key={ex.libraryId} className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-secondary-container text-primary flex items-center justify-center shrink-0">
                              <Icon name={ARTICULACION_ICON[ex.articulacion]} size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-on-surface text-sm truncate">{t(ex.nombreKey)}</p>
                              <p className="text-xs text-on-surface-variant">
                                {artLabel(ex.articulacion)} · {sideLabel(ex.lado)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSelected(ex.libraryId)}
                            aria-label={t('rrm.removeExercise')}
                            className="w-8 h-8 rounded-lg bg-error-container/50 text-error hover:bg-error-container transition-all flex items-center justify-center shrink-0"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t('rrm.seriesLabel')}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => updateConfig(ex.libraryId, 'series', ex.series - 1)}
                                className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface hover:bg-outline-variant/30 transition-all flex items-center justify-center"
                                aria-label={t('rrm.reduceSets')}
                              >
                                <Icon name="remove" size={18} />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={ex.series}
                                onChange={(e) => updateConfig(ex.libraryId, 'series', parseInt(e.target.value, 10))}
                                className="input-base w-full text-center px-2 py-2 rounded-lg bg-surface border border-outline-variant/20 font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => updateConfig(ex.libraryId, 'series', ex.series + 1)}
                                className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface hover:bg-outline-variant/30 transition-all flex items-center justify-center"
                                aria-label={t('rrm.increaseSets')}
                              >
                                <Icon name="add" size={18} />
                              </button>
                            </div>
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t('rrm.repsLabel')}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => updateConfig(ex.libraryId, 'repeticiones', ex.repeticiones - 1)}
                                className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface hover:bg-outline-variant/30 transition-all flex items-center justify-center"
                                aria-label={t('rrm.reduceReps')}
                              >
                                <Icon name="remove" size={18} />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={ex.repeticiones}
                                onChange={(e) => updateConfig(ex.libraryId, 'repeticiones', parseInt(e.target.value, 10))}
                                className="input-base w-full text-center px-2 py-2 rounded-lg bg-surface border border-outline-variant/20 font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => updateConfig(ex.libraryId, 'repeticiones', ex.repeticiones + 1)}
                                className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface hover:bg-outline-variant/30 transition-all flex items-center justify-center"
                                aria-label={t('rrm.increaseReps')}
                              >
                                <Icon name="add" size={18} />
                              </button>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2 — Confirmación */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/20">
                  <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                    <Icon name="date_range" size={20} className="text-primary" />
                    {t('rrm.periodTitle', 'Vigencia de la rutina')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-2xs uppercase font-bold text-outline tracking-wider block mb-1.5">
                        {t('rrm.startDate', 'Desde')}
                      </span>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block">
                      <span className="text-2xs uppercase font-bold text-outline tracking-wider block mb-1.5">
                        {t('rrm.endDate', 'Hasta')}
                      </span>
                      <input
                        type="date"
                        value={fechaFin}
                        min={fechaInicio || undefined}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {t('rrm.periodHint', 'La rutina queda activa dentro de este rango; al vencer se marca como finalizada.')}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-warning/10 border border-warning/20 flex items-start gap-3">
                  <Icon name="archive" size={24} className="text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface text-sm">{t('rrm.archiveWarning')}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {t('rrm.archiveDesc1')} <span className="font-semibold">{t('rrm.archivedState')}</span> {t('rrm.archiveDesc2')} <span className="font-semibold">{t('rrm.activeState')}</span>.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/20">
                  <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                    <Icon name="list_alt" size={20} className="text-primary" />
                    {t('rrm.summaryTitle')}
                  </h3>
                  <div className="space-y-2">
                    {selected.map((ex) => (
                      <div key={ex.libraryId} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-secondary-container text-primary flex items-center justify-center shrink-0">
                            <Icon name={ARTICULACION_ICON[ex.articulacion]} size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">{t(ex.nombreKey)}</p>
                            <p className="text-xs text-on-surface-variant">
                              {artLabel(ex.articulacion)} · {sideLabel(ex.lado)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                          <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary">{t('rrm.seriesBadge', { count: ex.series })}</span>
                          <span className="px-2 py-1 rounded-lg bg-secondary/15 text-secondary">{t('rrm.repsBadge', { count: ex.repeticiones })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">{t('rrm.totalExercises')}</span>
                    <span className="font-bold text-on-surface">{selected.length}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-error-container/50 border border-error/20 flex items-center gap-2 text-sm text-error">
                    <Icon name="error" size={18} />
                    <span>{error}</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer — acciones */}
          <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
              <button
                onClick={step === 0 ? handleClose : () => setStep((s) => (s - 1) as Step)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold hover:bg-surface-container-high transition-all disabled:opacity-50"
              >
                <Icon name="arrow_back" size={18} />
                {step === 0 ? t('common.cancel') : t('common.back')}
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={(step === 0 && !canNextFromStep0) || saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-card shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {t('rrm.continueBtn')}
                  <Icon name="arrow_forward" size={18} />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-card shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <Spinner size={18} className="text-on-primary" />
                      {t('rrm.saving')}
                    </>
                  ) : (
                    <>
                      <Icon name="save" size={18} />
                      {t('rrm.confirmSave')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReassignRoutineModal;
