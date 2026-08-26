import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { GlassModal } from './GlassModal';

const FAQS: Record<string, { q: string; a: string }[]> = {
  '/dashboard-fisio': [
    { q: '¿Cómo veo el detalle de un paciente?', a: 'Ve a la sección "Pacientes" en el menú superior/lateral y haz clic en cualquier paciente para ver su expediente completo.' },
    { q: '¿Cómo genero un token para un paciente?', a: 'En la sección "Pacientes", usa la pestaña "Gestión de Tokens" y haz clic en "Generar Token". Comparte el código de 6 dígitos con tu paciente.' },
    { q: '¿Dónde veo las estadísticas avanzadas?', a: 'En la sección "Estadísticas", consulta el ROM articular, la adherencia ponderada y la correlación dolor-calidad.' },
  ],
  '/patients': [
    { q: '¿Cómo añado un nuevo paciente?', a: 'Genera un token en la pestaña "Gestión de Tokens" o usa el escáner OCR en Herramientas para extraer datos de una receta médica.' },
    { q: '¿Puedo filtrar pacientes por etiqueta?', a: 'Sí, usa los chips de filtro debajo del buscador para filtrar por etiquetas como "Activo", "Nuevo", etc.' },
  ],
  '/tools': [
    { q: '¿Qué hace el OCR Clínico?', a: 'Escanea recetas médicas o documentos clínicos y extrae automáticamente los datos para cargarlos en el formulario del paciente.' },
    { q: '¿Cómo exporto un PDF?', a: 'Abre la ficha del paciente y selecciona "Exportar Reporte PDF" para generar un informe profesional con gráficos y evolución.' },
  ],
  '/dashboard-paciente': [
    { q: '¿Cómo inicio mi rutina de ejercicios?', a: 'Ve a "Mi Rutina" en el menú inferior y selecciona el ejercicio que tu fisioterapeuta te asignó.' },
    { q: '¿Qué es el modo AR?', a: 'Es un espejo aumentado que usa tu cámara para mostrarte en tiempo real mientras haces los ejercicios, con guía visual y conteo de repeticiones.' },
  ],
  '/exercises': [
    { q: '¿Cómo veo la demostración 3D?', a: 'Cada ejercicio cuenta con un botón específico "Demostración 3D" para ver la postura tridimensional animada.' },
    { q: '¿Cuántas repeticiones debo hacer?', a: 'Sigue las indicaciones de tu fisioterapeuta. Cada ejercicio muestra las series y repeticiones recomendadas.' },
  ],
  '/stats': [
    { q: '¿Qué muestra mi progreso?', a: 'Consulta tus sesiones completadas, minutos de práctica, racha y evolución de calidad en esta sección.' },
    { q: '¿Cómo mejoro mi racha?', a: 'Completa al menos una sesión cada día y sigue la rutina asignada por tu fisioterapeuta.' },
  ],
  '/profile': [
    { q: '¿Cómo actualizo mi perfil?', a: 'Edita tus datos personales y guarda los cambios desde el botón de guardar.' },
    { q: '¿Quién puede ver mis datos?', a: 'Solo tú y el fisioterapeuta vinculado a tu cuenta pueden consultar tu información clínica.' },
  ],
  '/settings': [
    { q: '¿Cómo cambio de idioma?', a: 'En Configuración → Idioma, selecciona Español, English o Português.' },
    { q: '¿Cómo activo TalkBack?', a: 'En Configuración → Accesibilidad, activa "Lectura en Voz Alta (TalkBack)".' },
  ],
};

const DEFAULT_FAQS = [
  { q: '¿Cómo contacto a mi fisioterapeuta?', a: 'Usa el botón flotante de contacto en tu dashboard para llamar o enviar un mensaje de WhatsApp directo.' },
  { q: '¿Qué hago si tengo dolor?', a: 'Detén el ejercicio inmediatamente y repórtalo en la evaluación final de la sesión o contacta a tu fisioterapeuta.' },
  { q: '¿Mis datos están seguros?', a: 'Sí, FisioMirror protege tu información clínica con cifrado y control de accesos por rol.' },
];

interface HelpGuideButtonProps {
  onStartTour?: () => void;
}

export function HelpGuideButton({ onStartTour }: HelpGuideButtonProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const faqs = FAQS[location.pathname] || DEFAULT_FAQS;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full glass-panel text-primary hover:text-primary-600 transition-colors shadow-xs"
        aria-label="Preguntas Frecuentes y Ayuda"
      >
        <Icon name="help" size={20} />
      </motion.button>

      <GlassModal isOpen={open} onClose={() => setOpen(false)} size="md">
        <div className="w-full max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <Icon name="help" size={20} className="text-primary" />
              Preguntas Frecuentes
            </h3>
          </div>

          {onStartTour && (
            <button
              onClick={() => {
                setOpen(false);
                onStartTour();
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.01]"
            >
              <Icon name="tour" size={16} />
              Iniciar Recorrido Guiado
            </button>
          )}

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <p className="font-semibold text-on-surface text-xs mb-1">{faq.q}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassModal>
    </>
  );
}
