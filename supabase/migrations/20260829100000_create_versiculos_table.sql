-- ==============================================================================
-- Migration: 20260829100000_create_versiculos_table.sql
-- Description: Tabla de versículos bíblicos de fortaleza, sanidad y constancia
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.versiculos (
  id SERIAL PRIMARY KEY,
  cita TEXT NOT NULL,
  texto TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('fortaleza', 'sanidad', 'racha', 'dolor', 'esperanza', 'general')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.versiculos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'versiculos' AND policyname = 'Versiculos publicos'
  ) THEN
    CREATE POLICY "Versiculos publicos" ON public.versiculos FOR SELECT USING (true);
  END IF;
END $$;

-- Inserción de versículos base y contextuales
INSERT INTO public.versiculos (cita, texto, categoria) VALUES
  ('3 Juan 1:2', 'Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas salud, así como prospera tu alma.', 'sanidad'),
  ('Jeremías 17:14', 'Sáname, oh Jehová, y seré sano; sálvame, y seré salvo; porque tú eres mi alabanza.', 'sanidad'),
  ('Salmos 103:2-3', 'Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios. Él es quien perdona todas tus iniquidades, el que sana todas tus dolencias.', 'sanidad'),
  ('Éxodo 15:26', 'Porque yo soy Jehová tu sanador.', 'sanidad'),
  ('Salmos 147:3', 'Él sana a los quebrantados de corazón, y venda sus heridas.', 'sanidad'),
  ('Proverbios 17:22', 'El corazón alegre constituye buen remedio; mas el espíritu triste seca los huesos.', 'sanidad'),
  ('Filipenses 4:13', 'Todo lo puedo en Cristo que me fortalece.', 'fortaleza'),
  ('Isaías 40:31', 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.', 'fortaleza'),
  ('Josué 1:9', 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo dondequiera que vayas.', 'fortaleza'),
  ('Salmos 28:7', 'Jehová es mi fortaleza y mi escudo; en él confió mi corazón, y fui ayudado.', 'fortaleza'),
  ('2 Corintios 12:9', 'Bástate mi gracia; porque mi poder se perfecciona en la debilidad.', 'fortaleza'),
  ('Salmos 46:1', 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.', 'fortaleza'),
  ('Gálatas 6:9', 'No nos cansemos, pues, de hacer el bien; porque a su tiempo segaremos, si no desmayamos.', 'racha'),
  ('Deuteronomio 31:6', 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará.', 'racha'),
  ('1 Corintios 9:24', '¿No sabéis que los que corren en el estadio, todos a la verdad corren, pero uno solo se lleva el premio? Corred de tal manera que lo obtengáis.', 'racha'),
  ('Hebreos 12:1-2', 'Corramos con paciencia la carrera que tenemos por delante, puestos los ojos en Jesús, el autor y consumador de la fe.', 'racha'),
  ('Proverbios 16:3', 'Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.', 'racha'),
  ('Mateo 11:28', 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.', 'dolor'),
  ('Salmos 34:18-19', 'Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.', 'dolor'),
  ('2 Corintios 1:3-4', 'Bendito sea el Dios y Padre de nuestro Señor Jesucristo, Padre de misericordias y Dios de toda consolación.', 'dolor'),
  ('Salmos 23:4', 'Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo.', 'dolor'),
  ('Habacuc 2:3', 'Aunque la visión tardará aún por un tiempo, mas se apresura hacia el fin, y no mentirá; aunque tardare, espéralo, porque sin duda vendrá, no tardará.', 'esperanza'),
  ('Jeremías 29:11', 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.', 'esperanza'),
  ('Romanos 15:13', 'Y el Dios de esperanza os llene de todo gozo y paz en el creer, para que abundéis en esperanza por el poder del Espíritu Santo.', 'esperanza'),
  ('Salmos 30:5', 'Por la noche durará el lloro, y a la mañana vendrá la alegría.', 'esperanza'),
  ('Lamentaciones 3:22-23', 'Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.', 'esperanza'),
  ('Salmos 139:14', 'Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.', 'general'),
  ('Salmos 118:24', 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.', 'general'),
  ('Proverbios 3:5-6', 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.', 'general'),
  ('1 Tesalonicenses 5:16-18', 'Estad siempre gozosos. Orad sin cesar. Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.', 'general')
ON CONFLICT DO NOTHING;
