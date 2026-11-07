import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/toastApi';
import {
  patientProfileSchema,
  formatZodError,
  PLACEHOLDERS,
  SELECT_OPTIONS,
} from '../../lib/validation';

const Label = (p: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...p} className="text-xs font-semibold text-on-surface-variant" />;
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/15 text-sm text-on-surface focus:outline-none focus:border-primary" />;
const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/15 text-sm text-on-surface focus:outline-none focus:border-primary resize-none" />;
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/15 text-sm text-on-surface focus:outline-none focus:border-primary" />;
const Button = ({ variant, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => <button {...p} className={(variant === 'ghost' ? 'px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors ' : 'px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors ') + (className || '')} />;

interface PatientProfile {
  id: string;
  full_name: string;
  diagnostico: string | null;
  patologia: string | null;
  diagnostico_secundario: string | null;
  medicamentos_actuales: string | null;
  alergias: string | null;
  enfermedades_cronicas: string | null;
  lesiones_previas: string | null;
  extremidad_afectada: string | null;
  rom_objetivo: string | null;
  frecuencia_sesiones: string | null;
  medico_remitente: string | null;
  telefono: string | null;
  tipo_sangre: string | null;
  ocupacion: string | null;
  nivel_actividad: string | null;
  estatura_cm: number | null;
  peso_kg: number | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  tutor_nombre: string | null;
  tutor_telefono: string | null;
  tutor_email: string | null;
  es_menor_edad: boolean | null;
}

interface EditPatientModalProps {
  open: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSaved: (updated: PatientProfile) => void;
}

export function EditPatientModal({ open, onClose, patient, onSaved }: EditPatientModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PatientProfile>(patient);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setForm(patient);
  }, [open, patient]);

const handleChange = (field: keyof PatientProfile, value: string | number | boolean) => {
    if (field === 'estatura_cm' || field === 'peso_kg') {
      setForm((prev) => ({ ...prev, [field]: value === '' ? null : Number(value) }));
      return;
    }
    if (field === 'es_menor_edad') {
      setForm((prev) => ({ ...prev, [field]: Boolean(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value === '' ? null : value }));
  };

  const handleSave = async () => {
    // Validate with Zod
    const result = patientProfileSchema.safeParse(form);
    if (!result.success) {
      setValidationErrors(formatZodError(result.error));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          diagnostico: form.diagnostico,
          patologia: form.patologia,
          diagnostico_secundario: form.diagnostico_secundario,
          medicamentos_actuales: form.medicamentos_actuales,
          alergias: form.alergias,
          enfermedades_cronicas: form.enfermedades_cronicas,
          lesiones_previas: form.lesiones_previas,
          extremidad_afectada: form.extremidad_afectada,
          rom_objetivo: form.rom_objetivo,
          frecuencia_sesiones: form.frecuencia_sesiones,
          medico_remitente: form.medico_remitente,
          telefono: form.telefono,
          tipo_sangre: form.tipo_sangre,
          ocupacion: form.ocupacion,
          nivel_actividad: form.nivel_actividad,
          estatura_cm: form.estatura_cm,
          peso_kg: form.peso_kg,
          contacto_emergencia_nombre: form.contacto_emergencia_nombre,
          contacto_emergencia_telefono: form.contacto_emergencia_telefono,
          tutor_nombre: form.tutor_nombre,
          tutor_telefono: form.tutor_telefono,
          tutor_email: form.tutor_email,
          es_menor_edad: form.es_menor_edad,
        })
        .eq('id', patient.id);

      if (error) throw error;

      toast.success(t('pdp.expedienteUpdated') || 'Expediente actualizado correctamente');
      onSaved(form);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || t('pdp.expedienteUpdateError') || 'Error al actualizar el expediente');
    } finally {
      setSaving(false);
    }
  };

  const clearFieldError = (field: string) => {
    setValidationErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-3xl shadow-2xl border border-outline/10">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-surface/95 backdrop-blur border-b border-outline/10">
          <div>
            <h2 className="text-xl font-bold text-on-surface">{t('pdp.editClinicalRecord') || 'Editar expediente clínico'}</h2>
            <p className="text-sm text-on-surface-variant">{patient.full_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-variant/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.diagnosis') || 'Diagnóstico'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patología / Diagnóstico principal</Label>
                <Textarea
                  value={form.patologia || form.diagnostico || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('patologia', e.target.value); handleChange('diagnostico', e.target.value); clearFieldError('patologia'); clearFieldError('diagnostico'); }}
                  rows={2}
                  placeholder={PLACEHOLDERS.patologia}
                />
                {validationErrors.patologia && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.patologia}</p>}
                {validationErrors.diagnostico && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.diagnostico}</p>}
              </div>
              <div className="space-y-2">
                <Label>Diagnóstico secundario</Label>
                <Textarea
                  value={form.diagnostico_secundario || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('diagnostico_secundario', e.target.value); clearFieldError('diagnostico_secundario'); }}
                  rows={2}
                  placeholder={PLACEHOLDERS.diagnosticoSecundario}
                />
                {validationErrors.diagnostico_secundario && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.diagnostico_secundario}</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.history') || 'Antecedentes'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Medicamentos actuales</Label>
                <Textarea
                  value={form.medicamentos_actuales || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('medicamentos_actuales', e.target.value); clearFieldError('medicamentos_actuales'); }}
                  rows={2}
                  placeholder={PLACEHOLDERS.medicamentosActuales}
                />
                {validationErrors.medicamentos_actuales && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.medicamentos_actuales}</p>}
              </div>
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Textarea
                  value={form.alergias || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('alergias', e.target.value); clearFieldError('alergias'); }}
                  rows={2}
                  placeholder={PLACEHOLDERS.alergias}
                />
                {validationErrors.alergias && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.alergias}</p>}
              </div>
              <div className="space-y-2">
                <Label>Enfermedades crónicas</Label>
                <Textarea
                  value={form.enfermedades_cronicas || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('enfermedades_cronicas', e.target.value); clearFieldError('enfermedades_cronicas'); }}
                  rows={2}
                  placeholder={PLACEHOLDERS.enfermedadesCronicas}
                />
                {validationErrors.enfermedades_cronicas && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.enfermedades_cronicas}</p>}
              </div>
              <div className="space-y-2">
                <Label>Lesiones previas</Label>
                <Textarea
                  value={form.lesiones_previas || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('lesiones_previas', e.target.value); clearFieldError('lesiones_previas'); }}
                  rows={2}
                  placeholder={PLACEHOLDERS.lesionesPrevias}
                />
                {validationErrors.lesiones_previas && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.lesiones_previas}</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.treatment') || 'Tratamiento'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Extremidad afectada</Label>
                <Select
                  value={form.extremidad_afectada || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { handleChange('extremidad_afectada', e.target.value); clearFieldError('extremidad_afectada'); }}
                >
                  <option value="">{t('profile.selectAffectedLimb')}</option>
                  {SELECT_OPTIONS.affectedLimb.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
                {validationErrors.extremidad_afectada && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.extremidad_afectada}</p>}
              </div>
              <div className="space-y-2">
                <Label>ROM objetivo</Label>
                <Input
                  type="number"
                  value={form.rom_objetivo || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('rom_objetivo', e.target.value); clearFieldError('rom_objetivo'); }}
                  placeholder={PLACEHOLDERS.romObjetivo}
                  min={0}
                  max={180}
                />
                {validationErrors.rom_objetivo && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.rom_objetivo}</p>}
              </div>
              <div className="space-y-2">
                <Label>Frecuencia de sesiones</Label>
                <Input
                  type="number"
                  value={form.frecuencia_sesiones || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('frecuencia_sesiones', e.target.value); clearFieldError('frecuencia_sesiones'); }}
                  placeholder={PLACEHOLDERS.frecuenciaSesiones}
                  min={1}
                  max={7}
                />
                {validationErrors.frecuencia_sesiones && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.frecuencia_sesiones}</p>}
              </div>
              <div className="space-y-2">
                <Label>Médico remitente</Label>
                <Input
                  value={form.medico_remitente || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('medico_remitente', e.target.value); clearFieldError('medico_remitente'); }}
                  placeholder={PLACEHOLDERS.medicoRemitente}
                />
                {validationErrors.medico_remitente && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.medico_remitente}</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.personalData') || 'Datos personales'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  value={form.telefono || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('telefono', e.target.value); clearFieldError('telefono'); }}
                  placeholder={PLACEHOLDERS.telefono}
                />
                {validationErrors.telefono && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.telefono}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo de sangre</Label>
                <Select
                  value={form.tipo_sangre || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { handleChange('tipo_sangre', e.target.value); clearFieldError('tipo_sangre'); }}
                >
                  <option value="">{t('profile.selectBloodType')}</option>
                  {SELECT_OPTIONS.bloodType.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
                {validationErrors.tipo_sangre && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.tipo_sangre}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ocupación</Label>
                <Input
                  value={form.ocupacion || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('ocupacion', e.target.value); clearFieldError('ocupacion'); }}
                  placeholder={PLACEHOLDERS.ocupacion}
                />
                {validationErrors.ocupacion && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.ocupacion}</p>}
              </div>
              <div className="space-y-2">
                <Label>Nivel de actividad</Label>
                <Select
                  value={form.nivel_actividad || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { handleChange('nivel_actividad', e.target.value); clearFieldError('nivel_actividad'); }}
                >
                  <option value="">{t('profile.selectActivityLevel')}</option>
                  {SELECT_OPTIONS.activityLevel.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
                {validationErrors.nivel_actividad && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.nivel_actividad}</p>}
              </div>
              <div className="space-y-2">
                <Label>Estatura (cm)</Label>
                <Input
                  type="number"
                  value={form.estatura_cm ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('estatura_cm', e.target.value); clearFieldError('estatura_cm'); }}
                  min={50}
                  max={250}
                  placeholder={PLACEHOLDERS.estaturaCm}
                />
                {validationErrors.estatura_cm && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.estatura_cm}</p>}
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.peso_kg ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('peso_kg', e.target.value); clearFieldError('peso_kg'); }}
                  min={2}
                  max={300}
                  placeholder={PLACEHOLDERS.pesoKg}
                />
                {validationErrors.peso_kg && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.peso_kg}</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.emergencyContact') || 'Contacto de emergencia'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.contacto_emergencia_nombre || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('contacto_emergencia_nombre', e.target.value); clearFieldError('contacto_emergencia_nombre'); }}
                  placeholder={PLACEHOLDERS.contactoEmergenciaNombre}
                />
                {validationErrors.contacto_emergencia_nombre && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.contacto_emergencia_nombre}</p>}
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  value={form.contacto_emergencia_telefono || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('contacto_emergencia_telefono', e.target.value); clearFieldError('contacto_emergencia_telefono'); }}
                  placeholder={PLACEHOLDERS.contactoEmergenciaTelefono}
                />
                {validationErrors.contacto_emergencia_telefono && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.contacto_emergencia_telefono}</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.guardianData') || 'Datos del tutor'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.tutor_nombre || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('tutor_nombre', e.target.value); clearFieldError('tutor_nombre'); }}
                  placeholder={PLACEHOLDERS.tutorNombre}
                />
                {validationErrors.tutor_nombre && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.tutor_nombre}</p>}
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  value={form.tutor_telefono || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('tutor_telefono', e.target.value); clearFieldError('tutor_telefono'); }}
                  placeholder={PLACEHOLDERS.tutorTelefono}
                />
                {validationErrors.tutor_telefono && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.tutor_telefono}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.tutor_email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleChange('tutor_email', e.target.value); clearFieldError('tutor_email'); }}
                  placeholder={PLACEHOLDERS.tutorEmail}
                />
                {validationErrors.tutor_email && <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.tutor_email}</p>}
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 bg-surface/95 backdrop-blur border-t border-outline/10">
          <Button variant="ghost" onClick={onClose} disabled={saving}>{t('common.cancel') || 'Cancelar'}</Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save size={16} />
            {saving ? (t('common.saving') || 'Guardando...') : (t('common.save') || 'Guardar')}
          </Button>
        </div>
      </div>
    </div>
  );
}