import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Languages,
  Sparkles,
  Terminal,
  Eye,
  Check,
  Copy,
  Download,
  X,
  Search,
  CheckCircle2,
  Code2,
  RefreshCw,
  FolderOpen,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  scanScreenForUntranslatedTexts,
  highlightElementInDom,
  type UntranslatedItem,
} from './translatorHelper';
import {
  addCustomTranslation,
  getCustomTranslations,
  clearCustomTranslations,
  changeAppLanguage,
  type AppLanguage,
} from '../../i18n';
import { useToast } from '../ui/ToastProvider';

const AVAILABLE_NAMESPACES = [
  'common',
  'dashboard',
  'exercises',
  'patients',
  'stats',
  'clinical',
  'auth',
  'navigation',
  'arMirror',
  'calibration',
  'tools',
  'profile',
  'ocr',
  'tokens',
  'legal',
  'tokenModal',
  'reassign',
  'iosInstall',
  'comingSoon',
  'pdf',
  'achievements',
  'onboarding',
  'spiritual',
  'toolbar',
  'installModal',
];

export function DevConsole() {
  const { t, i18n } = useTranslation();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'export' | 'customStore'>('editor');

  const [untranslatedItems, setUntranslatedItems] = useState<UntranslatedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<UntranslatedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Form values for selected item
  const [namespace, setNamespace] = useState('common');
  const [transKey, setTransKey] = useState('');
  const [valEs, setValEs] = useState('');
  const [valEn, setValEn] = useState('');
  const [valPt, setValPt] = useState('');

  const [customStoreCount, setCustomStoreCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Refresh count of custom translations
  const refreshCustomCount = useCallback(() => {
    const store = getCustomTranslations();
    let total = 0;
    for (const ns of Object.keys(store)) {
      total += Object.keys(store[ns] || {}).length;
    }
    setCustomStoreCount(total);
  }, []);

  useEffect(() => {
    refreshCustomCount();
    const handleCustomAdded = () => refreshCustomCount();
    window.addEventListener('fisio_custom_translation_added', handleCustomAdded);
    window.addEventListener('fisio_custom_translation_cleared', handleCustomAdded);
    return () => {
      window.removeEventListener('fisio_custom_translation_added', handleCustomAdded);
      window.removeEventListener('fisio_custom_translation_cleared', handleCustomAdded);
    };
  }, [refreshCustomCount]);

  // Keyboard shortcut listener (Ctrl+Shift+D or Alt+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleTriggerTranslateNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync form when an item is selected
  useEffect(() => {
    if (selectedItem) {
      setNamespace(selectedItem.suggestedNamespace || 'common');
      setTransKey(selectedItem.suggestedKey || '');
      setValEs(selectedItem.suggestedTranslations.es || selectedItem.text);
      setValEn(selectedItem.suggestedTranslations.en || '');
      setValPt(selectedItem.suggestedTranslations.pt || '');
    }
  }, [selectedItem]);

  // Scan current screen
  const handleTriggerTranslateNow = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      const items = scanScreenForUntranslatedTexts();
      setUntranslatedItems(items);
      setIsScanning(false);
      setModalOpen(true);
      setActiveTab('editor');

      if (items.length > 0) {
        setSelectedItem(items[0]);
        toast.info(
          `🔍 ${items.length} ${items.length === 1 ? 'texto sin traducir detectado' : 'textos sin traducir detectados'}`
        );
      } else {
        toast.success('✨ ¡Pantalla 100% traducida! No se detectaron textos pendientes.');
      }
    }, 250);
  }, [toast]);

  // Highlight item in page
  const handleInspect = (item: UntranslatedItem) => {
    highlightElementInDom(item.element);
    toast.info(`Elemento <${item.tagName}> resaltado en pantalla`);
  };

  // Save single translation
  const handleSaveToStore = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedItem || !transKey.trim()) {
      toast.error('Por favor especifica una clave válida');
      return;
    }

    const cleanNs = namespace.trim() || 'common';
    const cleanKey = transKey.trim();

    addCustomTranslation(cleanNs, cleanKey, {
      es: valEs.trim() || selectedItem.text,
      en: valEn.trim() || valEs.trim() || selectedItem.text,
      pt: valPt.trim() || valEs.trim() || selectedItem.text,
    });

    // Attempt live DOM update on current language
    const currentLang = (i18n.language || 'es') as AppLanguage;
    const replacement = currentLang === 'en' ? valEn : currentLang === 'pt' ? valPt : valEs;
    if (selectedItem.element && replacement) {
      try {
        if (selectedItem.element.childNodes.length === 1 && selectedItem.element.firstChild?.nodeType === Node.TEXT_NODE) {
          selectedItem.element.firstChild.nodeValue = replacement;
        }
      } catch {
        // non-blocking
      }
    }

    // Mark item as saved in list
    setUntranslatedItems((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, status: 'saved' } : item))
    );

    toast.success(`Guardado en i18n: ${cleanNs}.${cleanKey}`);
    refreshCustomCount();

    // Select next pending item if available
    const nextPending = untranslatedItems.find(
      (item) => item.id !== selectedItem.id && item.status !== 'saved'
    );
    if (nextPending) {
      setSelectedItem(nextPending);
    }
  };

  // Batch translate and save all detected items
  const handleTranslateAllAndSave = () => {
    let savedCount = 0;
    untranslatedItems.forEach((item) => {
      if (item.status !== 'saved') {
        const cleanNs = item.suggestedNamespace || 'common';
        const cleanKey = item.suggestedKey || 'textKey';
        addCustomTranslation(cleanNs, cleanKey, {
          es: item.suggestedTranslations.es || item.text,
          en: item.suggestedTranslations.en || item.text,
          pt: item.suggestedTranslations.pt || item.text,
        });
        savedCount++;
      }
    });

    setUntranslatedItems((prev) => prev.map((item) => ({ ...item, status: 'saved' })));
    refreshCustomCount();
    toast.success(`¡${savedCount} traducciones agregadas automáticamente al i18n store!`);
  };

  // Filter items in list
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return untranslatedItems;
    const q = searchQuery.toLowerCase();
    return untranslatedItems.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.suggestedKey.toLowerCase().includes(q) ||
        item.suggestedNamespace.toLowerCase().includes(q)
    );
  }, [untranslatedItems, searchQuery]);

  // Generate exported code for TypeScript
  const generatedCode = useMemo(() => {
    const store = getCustomTranslations();
    const namespaces = Object.keys(store);
    if (namespaces.length === 0) {
      return '// No hay traducciones personalizadas guardadas aún.\n// Usa "Translate Now" para identificar y agregar textos.';
    }

    let code = '// === FRAGMENTOS PARA es.ts, en.ts y pt.ts ===\n\n';
    code += '// --- ESPAÑOL (src/i18n/es.ts) ---\n';
    for (const ns of namespaces) {
      code += `  ${ns}: {\n`;
      for (const [k, v] of Object.entries(store[ns])) {
        code += `    ${k}: '${v.es.replace(/'/g, "\\'")}',\n`;
      }
      code += `  },\n`;
    }

    code += '\n// --- ENGLISH (src/i18n/en.ts) ---\n';
    for (const ns of namespaces) {
      code += `  ${ns}: {\n`;
      for (const [k, v] of Object.entries(store[ns])) {
        code += `    ${k}: '${v.en.replace(/'/g, "\\'")}',\n`;
      }
      code += `  },\n`;
    }

    code += '\n// --- PORTUGUÊS (src/i18n/pt.ts) ---\n';
    for (const ns of namespaces) {
      code += `  ${ns}: {\n`;
      for (const [k, v] of Object.entries(store[ns])) {
        code += `    ${k}: '${v.pt.replace(/'/g, "\\'")}',\n`;
      }
      code += `  },\n`;
    }

    return code;
  }, [customStoreCount]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadJson = () => {
    const data = getCustomTranslations();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fisiomirror-custom-i18n-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo JSON descargado');
  };

  const currentLang = (i18n.language || 'es').slice(0, 2) as AppLanguage;

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-[9990] flex items-center gap-2 dev-console font-sans">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 shadow-xl backdrop-blur-md border border-teal-500/30 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
          title="Consola de Desarrollo (Ctrl+Shift+D)"
        >
          <Terminal size={15} className="text-teal-400 dark:text-teal-600" />
          <span>Dev Console</span>
          {customStoreCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-black">
              +{customStoreCount}
            </span>
          )}
        </button>

        <button
          onClick={handleTriggerTranslateNow}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xl hover:from-teal-500 hover:to-cyan-500 active:scale-95 transition-all text-xs font-bold"
          title="Escanear y Traducir Pantalla Actual (Alt+T)"
        >
          <Sparkles size={14} className={isScanning ? 'animate-spin' : ''} />
          <span>Translate Now</span>
        </button>
      </div>

      {/* Expanded Dev Console Drawer/Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-16 right-4 z-[9990] w-80 rounded-3xl bg-slate-900/95 text-white p-4 shadow-2xl border border-teal-500/40 backdrop-blur-xl dev-console"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <Terminal size={15} />
                <span>Dev Console FisioMirror</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              {/* Language Switcher */}
              <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Languages size={13} /> Idioma Activo:
                </span>
                <div className="flex gap-1">
                  {(['es', 'en', 'pt'] as AppLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeAppLanguage(lang)}
                      className={`px-2 py-1 rounded-lg font-bold uppercase text-[10px] transition-all ${
                        currentLang === lang
                          ? 'bg-teal-500 text-white shadow-xs'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-slate-400 px-1">
                <span>Traducciones en almacén:</span>
                <span className="font-bold text-teal-400">
                  {customStoreCount > 0 ? `${customStoreCount} dinámicas` : 'Nativo'}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleTriggerTranslateNow}
                disabled={isScanning}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Sparkles size={14} className={isScanning ? 'animate-spin' : ''} />
                <span>{isScanning ? 'Escaneando pantalla...' : 'Translate Now (Escanear)'}</span>
              </button>

              {customStoreCount > 0 && (
                <button
                  onClick={() => {
                    clearCustomTranslations();
                    refreshCustomCount();
                    toast.info('Traducciones personalizadas limpiadas');
                  }}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-[11px] font-semibold transition-colors"
                >
                  Restablecer almacén local
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
              <span>Atajo: Alt + T</span>
              <span>v1.2 i18n Studio</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Translate Now Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            id="dev-console-modal"
            className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md font-sans"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              className="relative w-full max-w-5xl h-[85vh] max-h-[760px] bg-slate-900 text-slate-100 rounded-3xl border border-teal-500/40 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-white">Translate Now — i18n Studio</h2>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
                        {untranslatedItems.length} detectados
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Identificador y editor en vivo de textos no traducidos en la pantalla actual
                    </p>
                  </div>
                </div>

                {/* Tabs & Close */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setActiveTab('editor')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        activeTab === 'editor' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Editor en Vivo
                    </button>
                    <button
                      onClick={() => setActiveTab('export')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        activeTab === 'export' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Exportar TS
                    </button>
                  </div>

                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              {activeTab === 'editor' ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
                  {/* Left Column: List of detected items (5 cols) */}
                  <div className="md:col-span-5 border-r border-slate-800 flex flex-col min-h-0 bg-slate-900/60">
                    <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filtrar textos detectados..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-500"
                        />
                      </div>
                      <button
                        onClick={handleTriggerTranslateNow}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Re-escanear pantalla"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {filteredItems.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs">
                          {searchQuery ? 'No se encontraron coincidencias' : 'No se detectaron textos pendientes en esta pantalla.'}
                        </div>
                      ) : (
                        filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                              selectedItem?.id === item.id
                                ? 'bg-teal-950/40 border-teal-500/60 shadow-md'
                                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                                &lt;{item.tagName}&gt;
                              </span>
                              <div className="flex items-center gap-1.5">
                                {item.status === 'saved' ? (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Guardado
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-400 font-bold">Pendiente</span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInspect(item);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-teal-300"
                                  title="Ver en pantalla"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                              {item.text}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-mono truncate">
                              <span>{item.suggestedNamespace}.</span>
                              <span className="text-teal-400">{item.suggestedKey}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Batch Action Footer */}
                    {untranslatedItems.some((i) => i.status !== 'saved') && (
                      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
                        <button
                          onClick={handleTranslateAllAndSave}
                          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all"
                        >
                          <Sparkles size={14} />
                          <span>Traducir y Guardar Todo ({untranslatedItems.filter((i) => i.status !== 'saved').length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Editor for selected item (7 cols) */}
                  <div className="md:col-span-7 flex flex-col min-h-0 bg-slate-900/40">
                    {selectedItem ? (
                      <form onSubmit={handleSaveToStore} className="flex-1 flex flex-col min-h-0 p-5 overflow-y-auto space-y-4">
                        {/* Target Context */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                              <FolderOpen size={13} className="text-teal-400" />
                              <span>Namespace</span>
                            </label>
                            <select
                              value={namespace}
                              onChange={(e) => setNamespace(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-teal-500"
                            >
                              {AVAILABLE_NAMESPACES.map((ns) => (
                                <option key={ns} value={ns}>
                                  {ns}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                              <KeyRound size={13} className="text-teal-400" />
                              <span>Clave (Key)</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={transKey}
                              onChange={(e) => setTransKey(e.target.value)}
                              placeholder="e.g. routineTitle"
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-teal-300 outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>

                        {/* Code invocation preview */}
                        <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>
                            Uso en JSX:{' '}
                            <strong className="text-teal-400">
                              t('{namespace}.{transKey || 'key'}')
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`t('${namespace}.${transKey}')`);
                              toast.info('Copiado al portapapeles');
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy size={13} />
                          </button>
                        </div>

                        {/* Spanish (es) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                            <span>Español (es)</span>
                            <span className="text-[10px] text-slate-500">Detectado en pantalla</span>
                          </label>
                          <textarea
                            rows={2}
                            value={valEs}
                            onChange={(e) => setValEs(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-teal-500 resize-none"
                          />
                        </div>

                        {/* English (en) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                            <span>Inglés (en)</span>
                            <span className="text-[10px] text-teal-400 font-normal">Sugerido para i18n</span>
                          </label>
                          <textarea
                            rows={2}
                            value={valEn}
                            onChange={(e) => setValEn(e.target.value)}
                            placeholder="English translation..."
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-teal-500 resize-none"
                          />
                        </div>

                        {/* Portuguese (pt) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                            <span>Português (pt)</span>
                            <span className="text-[10px] text-teal-400 font-normal">Sugerido para i18n</span>
                          </label>
                          <textarea
                            rows={2}
                            value={valPt}
                            onChange={(e) => setValPt(e.target.value)}
                            placeholder="Tradução em português..."
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-teal-500 resize-none"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex items-center gap-3">
                          <button
                            type="submit"
                            className="flex-1 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-98 transition-all"
                          >
                            <Check size={16} />
                            <span>Guardar en Almacén i18n (Persistente)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleInspect(selectedItem)}
                            className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Eye size={15} />
                            <span>Localizar</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                        <Sparkles size={36} className="text-slate-700" />
                        <p className="text-sm">Selecciona un elemento de la columna izquierda para editar y almacenar su traducción.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Export Code Tab */
                <div className="flex-1 flex flex-col min-h-0 p-6 bg-slate-950">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white">Código TypeScript Sincronizado</h3>
                      <p className="text-xs text-slate-400">
                        Copia y pega estas definiciones directamente en tus archivos de diccionario
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyCode}
                        className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCode ? 'Copiado' : 'Copiar Código'}</span>
                      </button>

                      <button
                        onClick={handleDownloadJson}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Download size={14} />
                        <span>Descargar JSON</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-teal-300 overflow-y-auto whitespace-pre leading-relaxed select-all">
                    {generatedCode}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default DevConsole;
