import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'patient' | 'fisio' | 'ar' | 'security';
  routes?: string[];
}

const FAQ_DATABASE: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Cómo inicio una sesión en el Espejo AR?',
    answer: 'Dirígete a "Modo AR" o selecciona un ejercicio de tu rutina activa y pulsa "Iniciar con IA". Concede permiso de cámara y colócate a una distancia de 1.5 a 2 metros de modo que tu cuerpo sea visible por completo.',
    category: 'ar',
    routes: ['/paciente', '/paciente/ejercicios', '/ar-mirror'],
  },
  {
    id: 'faq-2',
    question: '¿Cómo creo y asigno una rutina a un paciente?',
    answer: 'Ve a la sección "Pacientes", pulsa sobre el paciente deseado y haz clic en "Reasignar Rutina" o ve a "Biblioteca de Ejercicios" para añadir ejercicios a su plan con series, repeticiones y descansos personalizados.',
    category: 'fisio',
    routes: ['/dashboard', '/pacientes', '/ejercicios'],
  },
  {
    id: 'faq-3',
    question: '¿Cómo funciona la sincronización sin conexión (Offline)?',
    answer: 'FisioMirror guarda tu rutina y ejercicios localmente en IndexedDB. Si pierdes la conexión WiFi, puedes continuar tus sesiones y los progresos se sincronizarán en cuanto vuelvas a tener red.',
    category: 'general',
  },
  {
    id: 'faq-4',
    question: '¿Mis datos y grabaciones de cámara están seguros?',
    answer: 'Totalmente. El procesamiento de visión artificial MediaPipe se ejecuta 100% de forma local en tu navegador. Ningún video ni imagen de tu cámara se envía ni se almacena en servidores externos.',
    category: 'security',
  },
  {
    id: 'faq-5',
    question: '¿Cómo contacto directamente a mi fisioterapeuta?',
    answer: 'En tu barra superior o menú de paciente dispones del botón de llamada, SMS y WhatsApp directo (+58 412 4081077) para consultas clínicas inmediatas.',
    category: 'patient',
    routes: ['/paciente', '/paciente/perfil'],
  },
  {
    id: 'faq-6',
    question: '¿Cómo cambio entre MediaPipe Pose y Holistic?',
    answer: 'En la sección de "Configuración", busca el selector de "Modelo AR". Puedes elegir "Automático" para que el sistema detecte la potencia de tu dispositivo, o forzar Pose para máxima fluidez.',
    category: 'ar',
    routes: ['/configuracion', '/ar-mirror'],
  },
];

export function HelpSection({ className }: { className?: string }) {
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentRoute = location.pathname;

  const filteredFAQs = useMemo(() => {
    return FAQ_DATABASE.filter((item) => {
      const matchSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  const contextualSuggestions = useMemo(() => {
    return FAQ_DATABASE.filter((item) => item.routes && item.routes.some((r) => currentRoute.startsWith(r)));
  }, [currentRoute]);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Cabecera & Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            Centro de Ayuda & FAQ
          </h2>
          <p className="text-xs text-on-surface-variant">Preguntas frecuentes y soporte contextual</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en preguntas frecuentes..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-surface-container-high border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Sugerencias contextuales de la ruta actual */}
      {contextualSuggestions.length > 0 && !search && selectedCategory === 'all' && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" />
            Sugerencias para esta pantalla
          </div>
          <div className="flex flex-wrap gap-2">
            {contextualSuggestions.map((item) => (
              <button
                key={`sugg-${item.id}`}
                onClick={() => setOpenId(item.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-primary/20 text-on-surface hover:border-primary hover:text-primary transition-all text-left"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros de Categoría */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'general', label: 'General' },
          { id: 'ar', label: 'Espejo AR' },
          { id: 'fisio', label: 'Fisioterapeuta' },
          { id: 'patient', label: 'Paciente' },
          { id: 'security', label: 'Seguridad' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lista de Acordeón */}
      <div className="space-y-3">
        {filteredFAQs.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-outline/15 bg-surface overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-surface-container-low transition-colors"
              >
                <span className="font-semibold text-sm text-on-surface">{item.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-outline shrink-0"
                >
                  <ChevronDown className="size-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 text-sm text-on-surface-variant leading-relaxed border-t border-outline/10 bg-surface-container-lowest/50">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8 text-sm text-outline">
            No se encontraron respuestas para tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpSection;
