import { createClient } from '@supabase/supabase-js';

const FALLBACK_VERSICULOS = [
  { cita: '3 Juan 1:2', texto: 'Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas salud, así como prospera tu alma.', categoria: 'sanidad' },
  { cita: 'Jeremías 17:14', texto: 'Sáname, oh Jehová, y seré sano; sálvame, y seré salvo; porque tú eres mi alabanza.', categoria: 'sanidad' },
  { cita: 'Filipenses 4:13', texto: 'Todo lo puedo en Cristo que me fortalece.', categoria: 'fortaleza' },
  { cita: 'Isaías 40:31', texto: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.', categoria: 'fortaleza' },
  { cita: 'Gálatas 6:9', texto: 'No nos cansemos, pues, de hacer el bien; porque a su tiempo segaremos, si no desmayamos.', categoria: 'racha' },
  { cita: 'Deuteronomio 31:6', texto: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo.', categoria: 'racha' },
  { cita: 'Mateo 11:28', texto: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.', categoria: 'dolor' },
  { cita: 'Habacuc 2:3', texto: 'Aunque la visión tardará aún por un tiempo, mas se apresura hacia el fin, y no mentirá; aunque tardare, espéralo, porque sin duda vendrá, no tardará.', categoria: 'esperanza' },
  { cita: 'Salmos 139:14', texto: 'Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.', categoria: 'general' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const categoria = req.body?.categoria || req.query?.categoria || 'general';

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        let query = supabase.from('versiculos').select('id, cita, texto, categoria').limit(25);
        if (categoria && categoria !== 'general') {
          query = query.eq('categoria', categoria);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const item = data[Math.floor(Math.random() * data.length)];
          return res.status(200).json(item);
        }
      } catch (dbErr) {
        // fallback
      }
    }

    // Fallback local
    const filtered = FALLBACK_VERSICULOS.filter(
      (v) => (categoria === 'general' ? true : v.categoria === categoria)
    );
    const pool = filtered.length > 0 ? filtered : FALLBACK_VERSICULOS;
    const item = pool[Math.floor(Math.random() * pool.length)];

    return res.status(200).json(item);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error al obtener versículo' });
  }
}
