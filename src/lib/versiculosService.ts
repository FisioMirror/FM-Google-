import { supabase } from './supabase';

export type VersiculoCategoria =
  | 'sanidad'
  | 'fortaleza'
  | 'racha'
  | 'dolor'
  | 'esperanza'
  | 'general';

export interface Versiculo {
  id?: number | string;
  cita: string;
  texto: string;
  categoria: VersiculoCategoria;
  tema?: string;
}

export const CATEGORIAS_METADATA: Record<
  VersiculoCategoria,
  { label: string; iconName: string; description: string }
> = {
  sanidad: {
    label: 'Sanidad & Restauración',
    iconName: 'HeartPulse',
    description: 'Promesas de salud física, renovación celular y bienestar.',
  },
  fortaleza: {
    label: 'Fuerza & Resiliencia',
    iconName: 'ShieldCheck',
    description: 'Ánimo para vencer el cansancio y superar límites en terapia.',
  },
  racha: {
    label: 'Constancia & Disciplina',
    iconName: 'Flame',
    description: 'Inspiración para perseverar día tras día sin desmayar.',
  },
  dolor: {
    label: 'Alivio & Descanso',
    iconName: 'HeartHandshake',
    description: 'Paz, serenidad y consuelo durante momentos de dolor o molestia.',
  },
  esperanza: {
    label: 'Paciencia & Fe',
    iconName: 'SunMedium',
    description: 'Confianza en el proceso completo de rehabilitación.',
  },
  general: {
    label: 'Gratitud & Bendición',
    iconName: 'BookOpen',
    description: 'Reflexión diaria sobre la maravilla del cuerpo y la vida.',
  },
};

/**
 * Catálogo offline curado y completo de versículos bíblicos (Reina-Valera 1960 / NVI)
 * Garantiza disponibilidad inmediata sin latencia ni dependencia de conectividad.
 */
export const VERSICULOS_CATALOGO: Versiculo[] = [
  // --- SANIDAD ---
  {
    id: 'san-1',
    cita: '3 Juan 1:2',
    texto: 'Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas salud, así como prospera tu alma.',
    categoria: 'sanidad',
    tema: 'Prosperidad y salud integral',
  },
  {
    id: 'san-2',
    cita: 'Jeremías 17:14',
    texto: 'Sáname, oh Jehová, y seré sano; sálvame, y seré salvo; porque tú eres mi alabanza.',
    categoria: 'sanidad',
    tema: 'Petición y certeza de sanidad',
  },
  {
    id: 'san-3',
    cita: 'Salmos 103:2-3',
    texto: 'Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios. Él es quien perdona todas tus iniquidades, el que sana todas tus dolencias.',
    categoria: 'sanidad',
    tema: 'Renovación y salud',
  },
  {
    id: 'san-4',
    cita: 'Éxodo 15:26',
    texto: 'Porque yo soy Jehová tu sanador.',
    categoria: 'sanidad',
    tema: 'Dios como médico y sanador',
  },
  {
    id: 'san-5',
    cita: 'Salmos 147:3',
    texto: 'Él sana a los quebrantados de corazón, y venda sus heridas.',
    categoria: 'sanidad',
    tema: 'Restauración de heridas',
  },
  {
    id: 'san-6',
    cita: 'Proverbios 17:22',
    texto: 'El corazón alegre constituye buen remedio; mas el espíritu triste seca los huesos.',
    categoria: 'sanidad',
    tema: 'Alegría y medicina del alma',
  },

  // --- FORTALEZA ---
  {
    id: 'fort-1',
    cita: 'Filipenses 4:13',
    texto: 'Todo lo puedo en Cristo que me fortalece.',
    categoria: 'fortaleza',
    tema: 'Capacidad y fortaleza en Cristo',
  },
  {
    id: 'fort-2',
    cita: 'Isaías 40:31',
    texto: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
    categoria: 'fortaleza',
    tema: 'Fuerzas renovadas como el águila',
  },
  {
    id: 'fort-3',
    cita: 'Josué 1:9',
    texto: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo dondequiera que vayas.',
    categoria: 'fortaleza',
    tema: 'Valentía y esfuerzo constante',
  },
  {
    id: 'fort-4',
    cita: 'Salmos 28:7',
    texto: 'Jehová es mi fortaleza y mi escudo; en él confió mi corazón, y fui ayudado, por lo que se gozó mi corazón, y con mi cántico le alabaré.',
    categoria: 'fortaleza',
    tema: 'Escudo y fuerza protectora',
  },
  {
    id: 'fort-5',
    cita: '2 Corintios 12:9',
    texto: 'Bástate mi gracia; porque mi poder se perfecciona en la debilidad.',
    categoria: 'fortaleza',
    tema: 'Poder perfeccionado en la debilidad',
  },
  {
    id: 'fort-6',
    cita: 'Salmos 46:1',
    texto: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.',
    categoria: 'fortaleza',
    tema: 'Amparo y auxilio inmediato',
  },

  // --- RACHA / CONSTANCIA ---
  {
    id: 'rach-1',
    cita: 'Gálatas 6:9',
    texto: 'No nos cansemos, pues, de hacer el bien; porque a su tiempo segaremos, si no desmayamos.',
    categoria: 'racha',
    tema: 'Cosecha de la perseverancia',
  },
  {
    id: 'rach-2',
    cita: 'Deuteronomio 31:6',
    texto: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará.',
    categoria: 'racha',
    tema: 'Fidelidad y presencia continua',
  },
  {
    id: 'rach-3',
    cita: '1 Corintios 9:24',
    texto: '¿No sabéis que los que corren en el estadio, todos a la verdad corren, pero uno solo se lleva el premio? Corred de tal manera que lo obtengáis.',
    categoria: 'racha',
    tema: 'Meta y disciplina atlética',
  },
  {
    id: 'rach-4',
    cita: 'Hebreos 12:1-2',
    texto: 'Corramos con paciencia la carrera que tenemos por delante, puestos los ojos en Jesús, el autor y consumador de la fe.',
    categoria: 'racha',
    tema: 'Paciencia en la carrera',
  },
  {
    id: 'rach-5',
    cita: 'Proverbios 16:3',
    texto: 'Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.',
    categoria: 'racha',
    tema: 'Proyectos afirmados',
  },

  // --- DOLOR / DESCANSO ---
  {
    id: 'dol-1',
    cita: 'Mateo 11:28',
    texto: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
    categoria: 'dolor',
    tema: 'Descanso en la fatiga',
  },
  {
    id: 'dol-2',
    cita: 'Salmos 34:18-19',
    texto: 'Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu. Muchas son las aflicciones del justo, pero de todas ellas le librará Jehová.',
    categoria: 'dolor',
    tema: 'Consuelo en el dolor',
  },
  {
    id: 'dol-3',
    cita: '2 Corintios 1:3-4',
    texto: 'Bendito sea el Dios y Padre de nuestro Señor Jesucristo, Padre de misericordias y Dios de toda consolación, el cual nos consuela en todas nuestras tribulaciones.',
    categoria: 'dolor',
    tema: 'Dios de toda consolación',
  },
  {
    id: 'dol-4',
    cita: 'Salmos 23:4',
    texto: 'Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento.',
    categoria: 'dolor',
    tema: 'Aliento en la dificultad',
  },

  // --- ESPERANZA ---
  {
    id: 'esp-1',
    cita: 'Habacuc 2:3',
    texto: 'Aunque la visión tardará aún por un tiempo, mas se apresura hacia el fin, y no mentirá; aunque tardare, espéralo, porque sin duda vendrá, no tardará.',
    categoria: 'esperanza',
    tema: 'Certeza en la espera',
  },
  {
    id: 'esp-2',
    cita: 'Jeremías 29:11',
    texto: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    categoria: 'esperanza',
    tema: 'Planes de paz y futuro',
  },
  {
    id: 'esp-3',
    cita: 'Romanos 15:13',
    texto: 'Y el Dios de esperanza os llene de todo gozo y paz en el creer, para que abundéis en esperanza por el poder del Espíritu Santo.',
    categoria: 'esperanza',
    tema: 'Abundancia de esperanza',
  },
  {
    id: 'esp-4',
    cita: 'Salmos 30:5',
    texto: 'Por la noche durará el lloro, y a la mañana vendrá la alegría.',
    categoria: 'esperanza',
    tema: 'Amanecer de gozo',
  },
  {
    id: 'esp-5',
    cita: 'Lamentaciones 3:22-23',
    texto: 'Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.',
    categoria: 'esperanza',
    tema: 'Nuevas misericordias cada mañana',
  },

  // --- GENERAL / GRATITUD ---
  {
    id: 'gen-1',
    cita: 'Salmos 139:14',
    texto: 'Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.',
    categoria: 'general',
    tema: 'Diseño asombroso del cuerpo',
  },
  {
    id: 'gen-2',
    cita: 'Salmos 118:24',
    texto: 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.',
    categoria: 'general',
    tema: 'Celebración del nuevo día',
  },
  {
    id: 'gen-3',
    cita: 'Proverbios 3:5-6',
    texto: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
    categoria: 'general',
    tema: 'Confianza y guía divina',
  },
  {
    id: 'gen-4',
    cita: '1 Tesalonicenses 5:16-18',
    texto: 'Estad siempre gozosos. Orad sin cesar. Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.',
    categoria: 'general',
    tema: 'Gratitud constante',
  },
];

export const SPIRITUAL_SETTING_KEY = 'fisio-show-versiculos';

/**
 * Verifica si el usuario tiene activadas las reflexiones y versículos de fe.
 * Activado de forma predeterminada, respetando la opción del usuario.
 */
export function isSpiritualModeEnabled(): boolean {
  try {
    const val = localStorage.getItem(SPIRITUAL_SETTING_KEY);
    if (val === null) return true;
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Guarda la preferencia de reflexiones y versículos espirituales.
 */
export function setSpiritualModeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SPIRITUAL_SETTING_KEY, String(enabled));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch {
    // Ignorar fallo de almacenamiento
  }
}

/**
 * Obtiene un versículo contextual intentando consultar Supabase primero,
 * con fallback instantáneo al catálogo local.
 */
export async function getVersiculoContextual(categoria: VersiculoCategoria = 'general'): Promise<Versiculo> {
  // 1. Intentar obtener desde Supabase
  try {
    let query = supabase.from('versiculos').select('id, cita, texto, categoria');
    if (categoria && categoria !== 'general') {
      query = query.eq('categoria', categoria);
    }
    const { data, error } = await query.limit(25);

    if (!error && data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex] as Versiculo;
    }
  } catch {
    // Continuar al fallback local
  }

  // 2. Intentar endpoint Edge Function si existe
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('obtener-versiculo', {
      body: { categoria },
    });
    if (!edgeError && edgeData && edgeData.texto) {
      return edgeData as Versiculo;
    }
  } catch {
    // Continuar al catálogo local
  }

  // 3. Fallback inteligente desde el catálogo offline
  const filtrados = VERSICULOS_CATALOGO.filter(
    (v) => (categoria === 'general' ? true : v.categoria === categoria)
  );

  const pool = filtrados.length > 0 ? filtrados : VERSICULOS_CATALOGO;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Obtiene el versículo del día fijado matemáticamente según la fecha actual.
 * Proporciona estabilidad durante todo el día pero renueva con cada jornada.
 */
export function getDailyVersiculo(): Versiculo {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = dateSeed % VERSICULOS_CATALOGO.length;
  return VERSICULOS_CATALOGO[index];
}

/**
 * Obtiene versículo específico asignado a un logro de rehabilitación.
 */
export function getVersiculoForLogro(logroId: string): Versiculo {
  const mapping: Record<string, string> = {
    first_session: 'Salmos 139:14',
    three_sessions: 'Gálatas 6:9',
    five_sessions: 'Proverbios 16:3',
    ten_sessions: 'Isaías 40:31',
    streak_3: 'Josué 1:9',
    streak_7: 'Deuteronomio 31:6',
    perfect_form: 'Filipenses 4:13',
    night_owl: 'Salmos 4:8',
    early_bird: 'Salmos 143:8',
    all_exercises: 'Filipenses 4:13',
  };

  const citaBuscada = mapping[logroId];
  if (citaBuscada) {
    const encontrado = VERSICULOS_CATALOGO.find((v) => v.cita === citaBuscada);
    if (encontrado) return encontrado;
  }

  // Si no hay mapeo directo, retornar uno de victoria/fortaleza
  return VERSICULOS_CATALOGO[1]; // Filipenses 4:13
}
