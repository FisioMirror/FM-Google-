import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { Spinner } from './Loader';
import { useToast } from './ToastProvider';
import { supabase } from '../../lib/supabase';
import { exportSimplePDF, exportPremiumPDF, type PDFPatientData, type ReportType } from '../../lib/pdfExport';
import { cn } from '../../lib/utils';

interface PDFModalProps {
  open: boolean;
  onClose: () => void;
  data: PDFPatientData;
  filename: string;
}

export function PDFExportModal({ open, onClose, data, filename }: PDFModalProps) {
  const toast = useToast();
  const [selectedType, setSelectedType] = useState<ReportType>('evolution');
  const [formatMode, setFormatMode] = useState<'quick' | 'ai'>('quick');
  const [loading, setLoading] = useState(false);

  const reportTypesConfig: Array<{
    id: ReportType;
    title: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
  }> = [
    {
      id: 'evolution',
      title: 'Informe de Evolución y Sesiones',
      description: 'Progreso biomecánico, adherencia porcentual y tabla cronológica de sesiones completadas.',
      icon: 'insights',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
    },
    {
      id: 'pain',
      title: 'Reporte de Casos de Dolor & Compensaciones',
      description: 'Registro de dolor (escala EVA), incidentes referidos y posturas compensatorias captadas por MediaPipe.',
      icon: 'healing',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'medical',
      title: 'Informe Médico para Especialista Tratante',
      description: 'Resumen clínico formal para interconsulta con traumatólogo o médico tratante.',
      icon: 'medical_services',
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
    },
    {
      id: 'recipe',
      title: 'Récipe & Prescripción Domiciliaria',
      description: 'Prescripción de rutina de ejercicios en casa con series, repeticiones, objetivo ROM y precauciones.',
      icon: 'receipt_long',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    const enrichedData: PDFPatientData = {
      ...data,
      reportType: selectedType,
    };

    const typeSuffix = {
      evolution: 'evolucion',
      pain: 'reporte_dolor',
      medical: 'informe_medico',
      recipe: 'recipe_fisioterapia',
    }[selectedType];

    const safeFilename = filename.replace(/\.pdf$/i, `_${typeSuffix}.pdf`);

    try {
      if (formatMode === 'quick') {
        exportSimplePDF(enrichedData, safeFilename, selectedType);
        toast.success('PDF generado y descargado correctamente');
        onClose();
      } else {
        // Generación asistida por IA
        const { data: jobRow, error: jobError } = await supabase.from('ai_jobs').insert({
          type: 'pdf_report',
          status: 'pending',
          input_data: {
            data: enrichedData,
            reportType: selectedType,
          },
        }).select('id').single();

        if (jobError || !jobRow) {
          // Fallback a generación inmediata si la cola de background está offline
          await exportPremiumPDF(enrichedData, safeFilename);
          toast.success('PDF estilizado generado con éxito');
          onClose();
          return;
        }

        const jobId = jobRow.id;
        let attempts = 0;
        let aiNarrative: string | null = null;

        while (attempts < 15) {
          await new Promise((r) => setTimeout(r, 1500));
          const { data: job } = await supabase.from('ai_jobs').select('status, result').eq('id', jobId).single();
          if (job?.status === 'completed' && job.result) {
            aiNarrative = job.result as string;
            break;
          }
          if (job?.status === 'failed') break;
          attempts++;
        }

        await exportPremiumPDF(enrichedData, safeFilename, aiNarrative || undefined);
        toast.success('Reporte PDF estilizado generado con éxito');
        onClose();
      }
    } catch (err) {
      console.error('[PDF Export Error]:', err);
      toast.error('Error generando el archivo PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-elevated border border-white/20 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-outline-variant/20">
              <div>
                <span className="text-2xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Documentación Médica Oficial
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-on-surface">
                  Exportar Informe Clínico
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Paciente: <span className="font-bold text-on-surface">{data.patientName}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar ventana de exportación"
                className="p-1.5 rounded-xl text-outline hover:text-on-surface hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Paso 1: Selección de Tipo de Reporte */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                1. Tipo de Documento Clínico
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {reportTypesConfig.map((cfg) => {
                  const isSelected = selectedType === cfg.id;
                  return (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => setSelectedType(cfg.id)}
                      className={cn(
                        "w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer",
                        isSelected
                          ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15 shadow-sm ring-1 ring-teal-500"
                          : "border-outline-variant/30 bg-surface/70 hover:border-outline-variant/70 hover:bg-surface-container-low"
                      )}
                    >
                      <div className={cn("p-2.5 rounded-xl border shrink-0", cfg.bg, cfg.color)}>
                        <Icon name={cfg.icon} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-xs text-on-surface">{cfg.title}</p>
                          {isSelected && (
                            <span className="size-2 rounded-full bg-teal-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                          {cfg.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 2: Selección de Motor de Renderizado */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                2. Formato de Generación
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormatMode('quick')}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                    formatMode === 'quick'
                      ? "border-teal-500 bg-teal-500/10 ring-1 ring-teal-500 shadow-sm"
                      : "border-outline-variant/30 hover:bg-surface-container-low"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="bolt" size={16} className="text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold text-on-surface">PDF Rápido</span>
                  </div>
                  <p className="text-2xs text-on-surface-variant leading-tight">
                    jsPDF instantáneo. Ligero e ideal para impresión médica directa.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatMode('ai')}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                    formatMode === 'ai'
                      ? "border-teal-500 bg-teal-500/10 ring-1 ring-teal-500 shadow-sm"
                      : "border-outline-variant/30 hover:bg-surface-container-low"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="auto_awesome" size={16} className="text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold text-on-surface">PDF Estilizado IA</span>
                  </div>
                  <p className="text-2xs text-on-surface-variant leading-tight">
                    Membretado de alta fidelidad con narrativa analítica profunda.
                  </p>
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner size={16} className="text-white" />
                    <span>Generando Documento...</span>
                  </>
                ) : (
                  <>
                    <Icon name="download" size={16} />
                    <span>Descargar PDF</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
