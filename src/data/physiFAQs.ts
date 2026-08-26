export interface FAQ {
  keywords: string[];
  question: string;
  answer: string;
  category?: string;
}

/**
 * Base de conocimientos para Fisioterapeutas (Guía y Navegación)
 */
export const PHYSI_FAQS_FISIO: FAQ[] = [
  {
    category: 'Pacientes',
    keywords: ['paciente', 'agregar', 'nuevo', 'crear', 'alta', 'registrar', 'cargar'],
    question: '¿Cómo agrego o cargo un nuevo paciente?',
    answer:
      'Para agregar un nuevo paciente:\n\n' +
      '1. Ve a **Pacientes** en el menú superior o lateral.\n' +
      '2. Haz clic en el botón **"+ Nuevo Paciente"** o usa la **Gestión de Tokens**.\n' +
      '3. También puedes usar el **Escáner OCR** en Herramientas para extraer automáticamente los datos desde una receta médica o informe clínico.',
  },
  {
    category: 'Tokens',
    keywords: ['token', 'codigo', 'generar', 'vincular', 'acceso', 'invitar', 'clave'],
    question: '¿Cómo genero y gestiono tokens para mis pacientes?',
    answer:
      'Los tokens permiten que tus pacientes se registren y se vinculen de forma segura a tu cuenta:\n\n' +
      '1. Dirígete a la sección **Pacientes**.\n' +
      '2. En el panel superior encontrarás la pestaña o botón **"Gestión de Tokens"**.\n' +
      '3. Pulsa **"Generar Token de 6 Dígitos"**, asigna el nombre o déjalo disponible y copia el código para entregárselo a tu paciente.',
  },
  {
    category: 'Rutinas',
    keywords: ['rutina', 'ejercicio', 'asignar', 'crear rutina', 'prescribir', 'series', 'repeticiones'],
    question: '¿Cómo creo o asigno una rutina de ejercicios?',
    answer:
      'Para prescribir una rutina:\n\n' +
      '1. Entra al detalle del paciente desde la lista de **Pacientes**.\n' +
      '2. Haz clic en la pestaña **"Rutina / Ejercicios"** o accede a la **Biblioteca de Ejercicios**.\n' +
      '3. Selecciona los ejercicios requeridos, ajusta las **series, repeticiones, descansos y notas clínicas**, y pulsa **Guardar Asignación**.',
  },
  {
    category: 'Estadísticas',
    keywords: ['estadisticas', 'adherencia', 'rom', 'metricas', 'graficos', 'progreso', 'analiticas'],
    question: '¿Dónde consulto los reportes y estadísticas avanzadas?',
    answer:
      'En la sección **Estadísticas** (menú superior) encontrarás:\n\n' +
      '- **Índice de Adherencia Ponderada (%)**: Cumplimiento del plan terapéutico.\n' +
      '- **Amplitud Articular (ROM) y Simetría**: Medición biomecánica en grados capturada por el Espejo AR.\n' +
      '- **Control Motor y Velocidad Angular**: Estabilidad del movimiento.\n' +
      '- **Correlación Dolor EVA vs. Calidad**: Monitoreo de seguridad clínica.',
  },
  {
    category: 'Reportes',
    keywords: ['pdf', 'informe', 'reporte', 'exportar', 'descargar', 'imprimir'],
    question: '¿Cómo genero y exporto un informe clínico en PDF?',
    answer:
      'Para generar un reporte profesional:\n\n' +
      '1. Abre la ficha de cualquier paciente en **Pacientes**.\n' +
      '2. Pulsa en la acción **"Exportar Reporte PDF"**.\n' +
      '3. El sistema compilará automáticamente las sesiones, evolución del dolor, rango articular y notas de evolución en un documento descargable listo para imprimir.',
  },
  {
    category: 'Herramientas',
    keywords: ['ocr', 'escaner', 'receta', 'documento', 'extraer', 'herramientas'],
    question: '¿Cómo funciona el Escáner OCR de Documentos?',
    answer:
      'El OCR Clínico procesa recetas médicas e informes:\n\n' +
      '1. Ve a **Herramientas** y abre **Escáner OCR**.\n' +
      '2. Carga una fotografía nítida o escaneo del informe.\n' +
      '3. El sistema reconocerá automáticamente diagnósticos, zonas anatómicas y precauciones para autocompletar el expediente.',
  },
  {
    category: 'Asistencia',
    keywords: ['ia', 'asistente', 'diferencia', 'pisi', 'physi', 'ayuda'],
    question: '¿Cuál es la diferencia entre Physi Guía y el Asistente Clínico IA?',
    answer:
      'Existen dos herramientas diferenciadas:\n\n' +
      '- **Physi (Guía de la App)**: Este chatbot de navegación que te orienta rápidamente dentro de las funciones y menús de FisioMirror.\n' +
      '- **Physi Asistente Clínico IA**: La herramienta clínica avanzada (en el menú "Asistente IA") que procesa análisis posturales, consultas biomecánicas e interpreta imágenes con modelos de IA médica.',
  },
];

/**
 * Base de conocimientos para Pacientes (Guía y Navegación)
 */
export const PHYSI_FAQS_PATIENT: FAQ[] = [
  {
    category: 'Mi Rutina',
    keywords: ['rutina', 'ejercicios', 'mi rutina', 'donde', 'hacer', 'hoy', 'tarea'],
    question: '¿Dónde está mi rutina de ejercicios de hoy?',
    answer:
      'Puedes encontrar tus ejercicios asignados en:\n\n' +
      '1. En la pestaña **"Mi Rutina"** en el menú inferior o en el botón principal **"Iniciar Sesión de Hoy"** en tu Inicio.\n' +
      '2. Cada tarjeta te indica las series, repeticiones recomendadas y el objetivo asignado por tu fisioterapeuta.',
  },
  {
    category: 'Espejo AR',
    keywords: ['ar', 'espejo', 'camara', 'iniciar', 'empezar', 'sesion', 'espejo ar'],
    question: '¿Cómo inicio una sesión con el Espejo AR?',
    answer:
      'Para entrenar con guía visual en tiempo real:\n\n' +
      '1. Pulsa el botón **"Iniciar Sesión AR"** en tu pantalla principal o selecciona un ejercicio y toca **"Entrenar con AR"**.\n' +
      '2. Permite el acceso a la cámara de tu dispositivo.\n' +
      '3. Colócate a unos 2 metros de distancia donde se vea tu cuerpo completo para que el sensor trace tus articulaciones.',
  },
  {
    category: 'Demostración 3D',
    keywords: ['3d', 'modelo', 'demostracion', 'avatar', 'esqueleto', 'ver como se hace'],
    question: '¿Cómo veo la demostración 3D de un ejercicio?',
    answer:
      'En la lista de ejercicios de **Mi Rutina**, cada ejercicio cuenta con un botón dedicado **"Demostración 3D"**.\n\n' +
      'Al pulsarlo, se abrirá el visor tridimensional interactivo con el avatar anatómico mostrando los ángulos exactos y el movimiento correcto.',
  },
  {
    category: 'Terapeuta',
    keywords: ['contacto', 'terapeuta', 'fisioterapeuta', 'llamar', 'whatsapp', 'telefono', 'hablar'],
    question: '¿Cómo me comunico con mi fisioterapeuta?',
    answer:
      'En tu pantalla de inicio o en la barra superior dispones del botón de **Contacto Rápido** (ícono de teléfono/médico).\n\n' +
      'Desde allí puedes realizar una llamada telefónica directa o iniciar una conversación de WhatsApp con tu fisioterapeuta asignado.',
  },
  {
    category: 'Progreso',
    keywords: ['progreso', 'estadisticas', 'racha', 'puntos', 'dias', 'historial'],
    question: '¿Cómo veo mi racha y mi progreso de recuperación?',
    answer:
      'En tu **Inicio** y en la pestaña **"Progreso"** puedes ver:\n\n' +
      '- **Tu Racha Actual**: Número de días consecutivos que has entrenado.\n' +
      '- **Calidad Media de Ejecución**: Porcentaje de precisión en tus movimientos.\n' +
      '- **Historial de Sesiones**: Fecha, duración y nivel de esfuerzo de cada sesión completada.',
  },
  {
    category: 'Seguridad',
    keywords: ['dolor', 'molestia', 'lastima', 'parar', 'detener', 'emergencia'],
    question: '¿Qué hago si siento dolor durante un ejercicio?',
    answer:
      '**Tu seguridad es lo primero**:\n\n' +
      '1. Detén el ejercicio inmediatamente si experimentas dolor agudo o punzante.\n' +
      '2. Al finalizar la sesión, califica tu nivel de dolor en la escala visual (0 al 10) para que tu fisioterapeuta lo revise.\n' +
      '3. Utiliza el botón de contacto para avisarle a tu fisioterapeuta.',
  },
  {
    category: 'Asistencia',
    keywords: ['ia', 'asistente', 'pisi', 'physi', 'ayuda', 'clinica'],
    question: '¿Para qué sirve Physi Guía frente al Asistente IA?',
    answer:
      '- **Physi Guía**: Este chatbot te acompaña y te explica dónde está cada sección y cómo usar la app.\n' +
      '- **Asistente Clínico IA**: En el menú "Asistente IA", puedes resolver dudas específicas sobre tu recuperación, estiramientos y subir fotos de tus posturas.',
  },
];

/**
 * Busca respuestas en la base de datos de FAQs según el rol
 */
export function matchFAQ(query: string, isFisio = false): { answer: string; question: string } | null {
  const normalizedQuery = query.toLowerCase().trim();
  const faqList = isFisio ? PHYSI_FAQS_FISIO : PHYSI_FAQS_PATIENT;

  let bestMatch: FAQ | null = null;
  let maxScore = 0;

  for (const faq of faqList) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (normalizedQuery.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && maxScore >= 3) {
    return { question: bestMatch.question, answer: bestMatch.answer };
  }

  return null;
}

export const PHYSI_FAQS = PHYSI_FAQS_FISIO;
