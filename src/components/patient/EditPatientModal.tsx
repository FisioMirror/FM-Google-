import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/toastApi';
const Label = (p: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...p} className="text-xs font-semibold text-on-surface-variant" />;
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/15 text-sm text-on-surface focus:outline-none focus:border-primary" />;
const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline/15 text-sm text-on-surface focus:outline-none focus:border-primary resize-none" />;
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

  useEffect(() => {
    if (open) setForm(patient);
  }, [open, patient]);

  const handleChange = (field: keyof PatientProfile, value: string) => {
    if (field === 'estatura_cm' || field === 'peso_kg') {
      setForm((prev) => ({ ...prev, [field]: value === '' ? null : Number(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value === '' ? null : value }));
  };

  const handleSave = async () => {
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
                <Textarea value={form.patologia || form.diagnostico || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { handleChange('patologia', e.target.value); handleChange('diagnostico', e.target.value); }} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Diagnóstico secundario</Label>
                <Textarea value={form.diagnostico_secundario || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('diagnostico_secundario', e.target.value)} rows={2} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.history') || 'Antecedentes'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Medicamentos actuales</Label>
                <Textarea value={form.medicamentos_actuales || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('medicamentos_actuales', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Textarea value={form.alergias || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('alergias', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Enfermedades crónicas</Label>
                <Textarea value={form.enfermedades_cronicas || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('enfermedades_cronicas', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Lesiones previas</Label>
                <Textarea value={form.lesiones_previas || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('lesiones_previas', e.target.value)} rows={2} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.treatment') || 'Tratamiento'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Extremidad afectada</Label>
                <Input value={form.extremidad_afectada || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('extremidad_afectada', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ROM objetivo</Label>
                <Input value={form.rom_objetivo || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('rom_objetivo', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Frecuencia de sesiones</Label>
                <Input value={form.frecuencia_sesiones || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('frecuencia_sesiones', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Médico remitente</Label>
                <Input value={form.medico_remitente || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('medico_remitente', e.target.value)} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.personalData') || 'Datos personales'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.telefono || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('telefono', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de sangre</Label>
                <Input value={form.tipo_sangre || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tipo_sangre', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ocupación</Label>
                <Input value={form.ocupacion || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('ocupacion', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nivel de actividad</Label>
                <Input value={form.nivel_actividad || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('nivel_actividad', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estatura (cm)</Label>
                <Input type="number" value={form.estatura_cm ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('estatura_cm', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input type="number" value={form.peso_kg ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('peso_kg', e.target.value)} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.emergencyContact') || 'Contacto de emergencia'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={form.contacto_emergencia_nombre || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('contacto_emergencia_nombre', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.contacto_emergencia_telefono || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('contacto_emergencia_telefono', e.target.value)} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">{t('pdp.guardianData') || 'Datos del tutor'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={form.tutor_nombre || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tutor_nombre', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.tutor_telefono || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tutor_telefono', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.tutor_email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tutor_email', e.target.value)} />
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
