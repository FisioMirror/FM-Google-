import { useState, useEffect, type ReactNode, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { User, Search } from 'lucide-react';

export interface CommandItem {
  id?: string;
  label: string;
  subtitle?: string;
  category?: 'Pacientes' | 'Acciones' | 'Ejercicios' | string;
  icon?: ReactNode;
  badge?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
  placeholder?: string;
  className?: string;
  onEnterFallback?: (query: string) => void;
}

export function CommandPalette({
  items,
  placeholder = 'Buscar pacientes por nombre, condición o ejercicios... (⌘K)',
  className,
  onEnterFallback,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dbItems, setDbItems] = useState<CommandItem[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Async search to Supabase profiles when user types
  useEffect(() => {
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 2) {
      setDbItems([]);
      setIsSearchingDb(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const safeTerm = cleanQ.replace(/[%,"']/g, '');
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, diagnostico, patologia, documento_identidad, role')
          .or(`full_name.ilike."%${safeTerm}%",email.ilike."%${safeTerm}%",diagnostico.ilike."%${safeTerm}%",patologia.ilike."%${safeTerm}%"`)
          .limit(8);

        if (!error && data && data.length > 0) {
          const results: CommandItem[] = data.map((p) => ({
            id: `db-pat-${p.id}`,
            label: p.full_name || 'Paciente',
            subtitle: `${p.diagnostico || p.patologia || 'Expediente clínico'}${p.email && !p.email.includes('@fisiomirror.paciente') ? ` • ${p.email}` : ''}`,
            category: 'Pacientes',
            icon: <User className="size-4 text-teal-600 dark:text-teal-400" />,
            badge: 'Base de Datos',
            onSelect: () => navigate(`/paciente/${p.id}`),
          }));
          setDbItems(results);
        } else {
          setDbItems([]);
        }
      } catch (err) {
        console.warn('Live search error:', err);
        setDbItems([]);
      } finally {
        setIsSearchingDb(false);
      }
    }, 200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, navigate]);

  // Combine static items with live DB items, removing duplicates by label/id
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const localMatches = items.filter((item) => {
      return (
        item.label.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });

    const combined = [...dbItems];
    localMatches.forEach((loc) => {
      const already = combined.some(
        (c) =>
          c.id === loc.id ||
          c.label.toLowerCase() === loc.label.toLowerCase() ||
          (loc.id && c.id && c.id.replace('db-pat-', '') === loc.id.replace('pat-', ''))
      );
      if (!already) combined.push(loc);
    });

    return combined;
  }, [items, dbItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'Enter' && query.trim() && onEnterFallback) {
        e.preventDefault();
        onEnterFallback(query.trim());
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = filtered[selectedIndex] || filtered[0];
      if (selectedItem) {
        selectedItem.onSelect();
        setIsOpen(false);
        setQuery('');
      } else if (onEnterFallback && query.trim()) {
        onEnterFallback(query.trim());
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // slight delay so onMouseDown on items fires reliably
            setTimeout(() => setIsOpen(false), 240);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pl-12 pr-12 py-3 rounded-2xl glass-input font-body-lg text-sm',
            'bg-white/50 dark:bg-slate-900/50 border border-teal-500/20 text-on-surface',
            'placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs',
          )}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isSearchingDb && (
            <div className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="text-on-surface-variant/60 hover:text-on-surface p-1 rounded-full text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full mt-2 w-full rounded-2xl glass-panel shadow-2xl border border-white/40 dark:border-slate-800/80 overflow-hidden z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md max-h-80 overflow-y-auto"
          >
            {filtered.length === 0 && !isSearchingDb ? (
              <div className="px-5 py-4 text-center">
                <p className="text-xs font-medium text-on-surface-variant">Sin resultados inmediatos para "{query}"</p>
                {onEnterFallback && (
                  <button
                    type="button"
                    onMouseDown={() => {
                      onEnterFallback(query);
                      setIsOpen(false);
                    }}
                    className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Search className="size-3" />
                    Buscar "{query}" en el Directorio Completo →
                  </button>
                )}
              </div>
            ) : (
              <div className="py-2">
                {filtered.slice(0, 10).map((item, i) => {
                  const isSelected = i === selectedIndex;
                  return (
                    <div
                      key={item.id || i}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        item.onSelect();
                        setIsOpen(false);
                        setQuery('');
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors text-sm',
                        isSelected
                          ? 'bg-teal-500/10 text-teal-900 dark:text-teal-200'
                          : 'hover:bg-primary/5 text-on-surface',
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.icon && (
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-primary">
                            {item.icon}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate">{item.label}</p>
                          {item.subtitle && (
                            <p className="text-[11px] text-on-surface-variant truncate opacity-80">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.category && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.category}
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
