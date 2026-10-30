export interface FollowUp {
  /** Etiqueta corta que se muestra como botón */
  label: string;
  /** Respuesta asociada a esa rama */
  answer: string;
  /** Sub-ramas opcionales (profundidad máxima recomendada: 2) */
  followUps?: FollowUp[];
}

export interface FAQ {
  keywords: string[];
  question: string;
  answer: string;
  category?: string;
  /** Ramas condicionales que se ofrecen después de esta respuesta */
  followUps?: FollowUp[];
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
    followUps: [
      {
        label: 'Generar token de acceso',
        answer:
          'En **Pacientes → Gestión de Tokens** pulsa **"Generar Token de 6 Dígitos"**. Copia el código y entrégaselo al paciente: con él se vincula a tu cuenta en su primer ingreso.',
        followUps: [
          {
            label: 'El token no funciona',
            answer:
              'Verifica que el token no haya sido usado ni haya vencido. Si el paciente ya se registró con ese código, generá uno nuevo: los tokens son de un solo uso.',
          },
          {
            label: '¿Cuánto dura un token?',
            answer:
              'El token permanece válido hasta que el paciente lo canjea o lo revocás manualmente desde la misma pantalla de Gestión de Tokens.',
          },
        ],
      },
      {
        label: 'Cargar datos con OCR',
        answer:
          'Abrí **Herramientas → Escáner OCR**, cargá una foto nítida de la receta o informe y el sistema extraerá diagnóstico, zona anatómica y precauciones para autocompletar la ficha.',
      },
      {
        label: 'Ver la ficha rápida',
        answer:
          'En el directorio de **Pacientes**, tocá directamente la tarjeta de un paciente: se abre la **Ficha Rápida** con estado clínico, progreso, sesiones y última actividad, sin salir de la lista.',
      },
    ],
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
    followUps: [
      {
        label: 'Definir vigencia (desde/hasta)',
        answer:
          'Al asignar la rutina podés fijar un **rango de fechas**: `Desde` y `Hasta`. La rutina queda activa solo dentro de ese período y, al vencer, se marca automáticamente como finalizada.',
        followUps: [
          {
            label: '¿Qué pasa al vencer?',
            answer:
              'La rutina deja de aparecer como activa en el portal del paciente y queda registrada en el historial con su rango de fechas y fase clínica.',
          },
        ],
      },
      {
        label: 'Elegir fase de recuperación',
        answer:
          'Cada asignación se etiqueta con una fase clínica: **Aguda**, **Subaguda**, **Remodelación** o **Funcional**. Esto permite ver la progresión real del plan terapéutico en el expediente.',
        followUps: [
          {
            label: '¿Qué caracteriza cada fase?',
            answer:
              '**Aguda**: control del dolor y movilidad protegida. **Subaguda**: recuperación progresiva de rango y fuerza. **Remodelación**: carga y tejido. **Funcional**: gesto deportivo y retorno a la actividad.',
          },
        ],
      },
      {
        label: 'Ajustar series y repeticiones',
        answer:
          'En el mismo modal de asignación podés editar series, repeticiones, tiempo de sostén y descanso por ejercicio, además de agregar notas clínicas que verá el paciente.',
      },
    ],
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
    followUps: [
      {
        label: 'Índice de adherencia',
        answer:
          'La adherencia ponderada compara sesiones completadas contra las prescritas en el período. Solo cuenta datos reales de sesiones registradas en Supabase.',
        followUps: [
          {
            label: 'Sale vacío, ¿por qué?',
            answer:
              'Si el paciente todavía no registró sesiones reales, el panel muestra un **estado vacío honesto**. No se rellenan gráficas con datos ficticios.',
          },
        ],
      },
      {
        label: 'ROM y simetría',
        answer:
          'El rango articular y la simetría provienen de la captura MediaPipe del **Espejo AR**. Si no hubo capturas, el indicador queda sin datos en lugar de inventar valores.',
      },
      {
        label: 'Dolor EVA vs. calidad',
        answer:
          'Cruza la escala de dolor reportada por el paciente con la calidad de ejecución medida en cada sesión, para detectar sobrecarga antes de que aparezca una lesión.',
      },
    ],
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
  {
    category: 'Ejercicios',
    keywords: ['biblioteca', 'catalogo', 'ejercicio nuevo', 'crear ejercicio', 'personalizado', 'preset'],
    question: '¿Cómo creo un ejercicio personalizado?',
    answer:
      'En **Ejercicios** pulsa **"Nuevo Ejercicio"** y completa nombre, zona anatómica (articulación), grupo muscular, series y repeticiones. El ejercicio queda disponible de inmediato en la biblioteca y en la asignación de rutinas.',
    followUps: [
      {
        label: '¿Se refleja en el 3D?',
        answer:
          'Sí. Al definir la articulación del ejercicio, el avatar 3D (**PhysioModel3D / KidModel3D**) y el Espejo AR toman ese preset para mostrar el movimiento correcto. Si falta la articulación, se usa un preset neutro y se avisa en consola de desarrollo.',
        followUps: [
          {
            label: 'El 3D muestra otro movimiento',
            answer:
              'Revisá que el campo **articulación** del ejercicio esté cargado con un valor válido (hombro, codo, rodilla, cadera, tobillo, columna). Sin ese dato el sistema no adivina: usa el preset neutro.',
          },
        ],
      },
      {
        label: 'Filtrar por zona corporal',
        answer:
          'En la lista de ejercicios del paciente podés filtrar por zona anatómica (codo, hombro, rodilla, cadera, etc.) para ver solo lo asignado a esa región.',
      },
    ],
  },
  {
    category: 'Espejo AR',
    keywords: ['espejo ar', 'camara', 'mediapipe', 'repeticiones', 'conteo', 'calibracion', 'pose'],
    question: '¿Cómo funciona la detección de pose del Espejo AR?',
    answer:
      'El Espejo AR usa **MediaPipe** para detectar articulaciones y contar repeticiones. Aplica suavizado EMA, histéresis y un cooldown entre repeticiones para evitar conteos falsos, y solo cuenta el lado visible de tu cuerpo.',
    followUps: [
      {
        label: 'Cuenta repeticiones de más',
        answer:
          'Verificá iluminación frontal y que el cuerpo completo entre en cuadro a unos 2 metros. Si persiste, ajustá la sensibilidad desde la configuración del Espejo AR.',
        followUps: [
          {
            label: 'Ajustar sensibilidad',
            answer:
              'La sensibilidad controla el umbral de confianza de los landmarks. Subirla exige mejor visibilidad; bajarla tolera más ruido pero puede contar movimientos parciales.',
          },
        ],
      },
      {
        label: 'No detecta mi cuerpo',
        answer:
          'Asegurate de tener buena luz frontal, ropa que contraste con el fondo y la cámara a la altura del torso. Evitá contraluz y fondos con movimiento.',
      },
    ],
  },
  {
    category: 'Voz',
    keywords: ['voz', 'audio', 'fish audio', 'narrador', 'hablar', 'tts', 'silencio'],
    question: '¿Cómo cambio la voz de Physi?',
    answer:
      'En el selector de voz (botón con ícono de volumen) podés elegir voz femenina o masculina, velocidad y proveedor. **Fish Audio** es el proveedor por defecto por su calidad natural.',
    followUps: [
      {
        label: 'No suena / se queda en silencio',
        answer:
          'Si Fish Audio no responde por red, el sistema cae a un modo offline controlado. Revisá tu conexión y volvé a pulsar el botón de reproducir.',
      },
      {
        label: 'Cambiar a voz masculina',
        answer:
          'En el mismo selector elegí **Dr. Physi (Masc.)**. La preferencia se guarda y se aplica a todas las respuestas de voz.',
      },
    ],
  },
  {
    category: 'Interfaz',
    keywords: ['zurdo', 'diestro', 'modo oscuro', 'tema', 'preferencias', 'mano', 'idioma'],
    question: '¿Cómo configuro zurdo/diestro, tema e idioma?',
    answer:
      'En **Configuración** encontrás el selector de **mano dominante** (zurdo/diestro), el tema claro/oscuro y el idioma (ES/EN/PT). La preferencia de mano espeja menús laterales, FABs y menús flotantes.',
    followUps: [
      {
        label: '¿Qué se espeja con zurdo?',
        answer:
          'Se invierten el sidebar, los botones flotantes (FAB), los menús desplegables y la posición de los toasts, para que queden del lado de tu mano dominante. La preferencia persiste entre sesiones.',
      },
      {
        label: 'Cambiar idioma',
        answer:
          'El selector **ES / EN / PT** está en la barra superior y también en Configuración. El cambio se aplica al instante en toda la interfaz.',
      },
    ],
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
    category: 'Asistencia',
    keywords: ['ia', 'asistente', 'pisi', 'physi', 'ayuda', 'clinica'],
    question: '¿Para qué sirve Physi Guía frente al Asistente IA?',
    answer:
      '- **Physi Guía**: Este chatbot te acompaña y te explica dónde está cada sección y cómo usar la app.\n' +
      '- **Asistente Clínico IA**: En el menú "Asistente IA", puedes resolver dudas específicas sobre tu recuperación, estiramientos y subir fotos de tus posturas.',
  },
  {
    category: 'Mi Rutina',
    keywords: ['empezar sesion', 'iniciar sesion', 'comenzar', 'hoy', 'entrenar', 'empezar'],
    question: '¿Cómo empiezo la sesión de hoy?',
    answer:
      'Desde tu **Inicio** pulsa **"Iniciar Sesión de Hoy"**. Se abre la rutina asignada con series, repeticiones y objetivo de cada ejercicio.',
    followUps: [
      {
        label: 'No tengo rutina asignada',
        answer:
          'Si tu fisioterapeuta todavía no te asignó una rutina activa, verás un **estado vacío** con la indicación de contactarlo. No se muestran ejercicios inventados.',
        followUps: [
          {
            label: 'Contactar a mi fisioterapeuta',
            answer:
              'Usá el botón de **Contacto Rápido** en la barra superior para llamar o escribir por WhatsApp a tu fisioterapeuta asignado.',
          },
        ],
      },
      {
        label: '¿Cuánto dura la sesión?',
        answer:
          'La duración depende de los ejercicios prescritos. La app te muestra el progreso por ejercicio y te avisa cuando completás la sesión.',
      },
    ],
  },
  {
    category: 'Progreso',
    keywords: ['racha', 'puntos', 'logros', 'trofeos', 'medallas', 'nivel'],
    question: '¿Dónde veo mis logros y trofeos?',
    answer:
      'Los logros, trofeos y tu nivel de recuperación están en tu **Perfil**. Se desbloquean al completar sesiones y mantener la constancia.',
    followUps: [
      {
        label: '¿Cómo desbloqueo logros?',
        answer:
          'Cada logro tiene una condición: completar sesiones, mantener la racha de días, mejorar tu calidad de ejecución o alcanzar hitos de rango articular.',
      },
      {
        label: '¿Dónde está mi racha?',
        answer:
          'La racha actual aparece en tu **Inicio** y en **Progreso**: son los días consecutivos que entrenaste sin cortar.',
      },
    ],
  },
  {
    category: 'Seguridad',
    keywords: ['dolor', 'molestia', 'lastima', 'parar', 'detener', 'emergencia', 'eva'],
    question: '¿Qué hago si siento dolor durante un ejercicio?',
    answer:
      '**Tu seguridad es lo primero**:\n\n' +
      '1. Detén el ejercicio inmediatamente si experimentas dolor agudo o punzante.\n' +
      '2. Al finalizar la sesión, califica tu nivel de dolor en la escala visual (0 al 10) para que tu fisioterapeuta lo revise.\n' +
      '3. Utiliza el botón de contacto para avisarle a tu fisioterapeuta.',
    followUps: [
      {
        label: 'Dolor leve (1-3/10)',
        answer:
          'Un dolor leve que no aumenta durante el movimiento suele ser aceptable. Bajá la intensidad, reducí el rango y registrá el valor en la escala EVA al terminar.',
      },
      {
        label: 'Dolor moderado o agudo (4+/10)',
        answer:
          'Detené la sesión de inmediato, no fuerces el rango y avisá a tu fisioterapeuta por el botón de contacto. Registrá el dolor en la escala EVA para que quede en tu expediente.',
        followUps: [
          {
            label: '¿Debo ir a una guardia?',
            answer:
              'Si el dolor es intenso, aparece hinchazón repentina, pérdida de fuerza o no podés apoyar el miembro, buscá atención médica. La app no reemplaza una consulta presencial.',
          },
        ],
      },
    ],
  },
  {
    category: 'Cuenta',
    keywords: ['contrasena', 'clave', 'cuenta', 'perfil', 'datos', 'email', 'correo'],
    question: '¿Cómo edito mis datos de perfil?',
    answer:
      'Entrá a **Perfil** desde el menú y edita tus datos personales. Los cambios se guardan en tu cuenta y se reflejan en tu expediente clínico.',
    followUps: [
      {
        label: 'Cambiar contraseña',
        answer:
          'Desde **Configuración → Seguridad** podés actualizar tu contraseña. Si la olvidaste, usá la opción de recuperación en la pantalla de inicio de sesión.',
      },
      {
        label: 'Cambiar idioma o tema',
        answer:
          'El idioma (**ES/EN/PT**) y el tema claro/oscuro se cambian desde la barra superior o desde **Configuración**.',
      },
    ],
  },
];

/**
 * Busca respuestas en la base de datos de FAQs según el rol.
 * Devuelve también las ramas condicionales (árbol de decisiones) cuando existen.
 */
export function matchFAQ(
  query: string,
  isFisio = false
): { answer: string; question: string; followUps?: FollowUp[] } | null {
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
    return {
      question: bestMatch.question,
      answer: bestMatch.answer,
      followUps: bestMatch.followUps,
    };
  }

  return null;
}

/**
 * Resuelve una rama del árbol de decisiones a partir de la etiqueta elegida.
 * Recorre en profundidad hasta 3 niveles.
 */
export function matchFollowUp(label: string, tree: FollowUp[]): FollowUp | null {
  const normalized = label.toLowerCase().trim();
  for (const node of tree) {
    if (node.label.toLowerCase().trim() === normalized) return node;
    if (node.followUps?.length) {
      const nested = matchFollowUp(label, node.followUps);
      if (nested) return nested;
    }
  }
  return null;
}

export const PHYSI_FAQS = PHYSI_FAQS_FISIO;
