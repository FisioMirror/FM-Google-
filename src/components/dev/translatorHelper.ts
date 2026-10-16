import { getAllTranslationValues } from '../../i18n';

export interface UntranslatedItem {
  id: string;
  text: string;
  tagName: string;
  element: HTMLElement;
  suggestedNamespace: string;
  suggestedKey: string;
  suggestedTranslations: {
    es: string;
    en: string;
    pt: string;
  };
  status?: 'pending' | 'saved';
}

/**
 * Common medical/clinical phrasebook for instant, accurate translation in FisioMirror.
 */
const CLINICAL_DICTIONARY: Record<string, { en: string; pt: string }> = {
  'evaluar ia': { en: 'Evaluate AI', pt: 'Avaliar IA' },
  'palabra de victoria & fortaleza': { en: 'Word of Victory & Strength', pt: 'Palavra de Vitória e Força' },
  'palabra de fortaleza & fe': { en: 'Word of Strength & Faith', pt: 'Palavra de Força e Fé' },
  'buscando palabra de fortaleza...': { en: 'Looking for a word of strength...', pt: 'Buscando palavra de força...' },
  'renovar reflexión': { en: 'Renew reflection', pt: 'Renovar reflexão' },
  'ciclo biomecánico': { en: 'Biomechanical Cycle', pt: 'Ciclo Biomecânico' },
  'mapa de esfuerzo emg': { en: 'EMG Effort Map', pt: 'Mapa de Esforço EMG' },
  'confort': { en: 'Comfort', pt: 'Conforto' },
  'moderado': { en: 'Moderate', pt: 'Moderado' },
  'crítico': { en: 'Critical', pt: 'Crítico' },
  'pie izquierdo': { en: 'Left Foot', pt: 'Pé Esquerdo' },
  'pie derecho': { en: 'Right Foot', pt: 'Pé Direito' },
  'progreso': { en: 'Progress', pt: 'Progresso' },
  'confirmar corrección': { en: 'Confirm Correction', pt: 'Confirmar Correção' },
  'semanas a visualizar': { en: 'Weeks to view', pt: 'Semanas para visualizar' },
  'total sesiones seleccionadas': { en: 'Total selected sessions', pt: 'Total de sessões selecionadas' },
  'ajustes de sesión': { en: 'Session Settings', pt: 'Configurações da Sessão' },
  'repeticiones objetivo por serie': { en: 'Target Reps per Set', pt: 'Repetições Alvo por Série' },
  'músculos agonistas': { en: 'Agonist Muscles', pt: 'Músculos Agonistas' },
  'tolerancia rom': { en: 'ROM Tolerance', pt: 'Tolerância ROM' },
  'prescripción rápida': { en: 'Quick Prescription', pt: 'Prescrição Rápida' },
  'giroscopio sagital ar': { en: 'AR Sagittal Gyroscope', pt: 'Giroscópio Sagital RA' },
  'descanso restante': { en: 'Remaining Rest', pt: 'Descanso Restante' },
  'rango de rehabilitación': { en: 'Rehabilitation Rank', pt: 'Nível de Reabilitação' },
  'vitrina de trofeos clínicos': { en: 'Clinical Trophy Showcase', pt: 'Galeria de Troféus Clínicos' },
  'puntos de salud': { en: 'Health Points', pt: 'Pontos de Saúde' },
  'canjeables por consultas prioritarias': { en: 'Redeemable for priority consultations', pt: 'Resgatáveis por consultas prioritárias' },
  'preguntas frecuentes y soporte contextual': { en: 'FAQ & Contextual Support', pt: 'Perguntas Frequentes e Suporte' },
  'telemetría asistida por mediapipe': { en: 'MediaPipe-Assisted Telemetry', pt: 'Telemetria Assistida por MediaPipe' },
  'control motor suave': { en: 'Smooth Motor Control', pt: 'Controle Motor Suave' },
  'asimetría contralateral': { en: 'Contralateral Asymmetry', pt: 'Assimetria Contralateral' },
  'sensibilidad mediapipe': { en: 'MediaPipe Sensitivity', pt: 'Sensibilidade MediaPipe' },
  'guía clínica asistida': { en: 'Assisted Clinical Guide', pt: 'Guia Clínico Assistido' },
  'ángulo actual': { en: 'Current Angle', pt: 'Ângulo Atual' },
  'rango óptimo': { en: 'Optimal Range', pt: 'Faixa Ótima' },
  'zona de control óptimo': { en: 'Optimal Control Zone', pt: 'Zona de Controle Ideal' },
  'osciloscopio rom': { en: 'ROM Oscilloscope', pt: 'Osciloscópio ROM' },
  'análisis cinemático automático': { en: 'Automatic Kinematic Analysis', pt: 'Análise Cinemática Automática' },
  'índice de fatiga': { en: 'Fatigue Index', pt: 'Índice de Fadiga' },
  'ritmo muscular seguro': { en: 'Safe Muscle Rhythm', pt: 'Ritmo Muscular Seguro' },
  'progreso de la serie': { en: 'Set Progress', pt: 'Progresso da Série' },
  'completado': { en: 'Completed', pt: 'Concluído' },
  'reiniciar': { en: 'Restart', pt: 'Reiniciar' },
  'algo salió mal': { en: 'Something went wrong', pt: 'Algo deu errado' },
  'reintentar': { en: 'Retry', pt: 'Tentar novamente' },
  'notificaciones por correo': { en: 'Email Notifications', pt: 'Notificações por E-mail' },
  'alertas push en navegador': { en: 'Browser Push Alerts', pt: 'Alertas Push no Navegador' },
  'recordatorios sms / whatsapp': { en: 'SMS / WhatsApp Reminders', pt: 'Lembretes por SMS / WhatsApp' },
  'supervisión requerida': { en: 'Supervision Required', pt: 'Supervisão Necessária' },
  'módulo ia activo': { en: 'Active AI Module', pt: 'Módulo de IA Ativo' },
  'alta médica': { en: 'Medical Discharge', pt: 'Alta Médica' },
  'operación irreversible': { en: 'Irreversible Action', pt: 'Operação Irreversível' },
};

/**
 * Word substitution glossary for general phrases.
 */
const GLOSSARY_WORDS: Record<string, { en: string; pt: string }> = {
  'paciente': { en: 'patient', pt: 'paciente' },
  'pacientes': { en: 'patients', pt: 'pacientes' },
  'ejercicio': { en: 'exercise', pt: 'exercício' },
  'ejercicios': { en: 'exercises', pt: 'exercícios' },
  'rutina': { en: 'routine', pt: 'rotina' },
  'rutinas': { en: 'routines', pt: 'rotinas' },
  'sesión': { en: 'session', pt: 'sessão' },
  'sesiones': { en: 'sessions', pt: 'sessões' },
  'hombro': { en: 'shoulder', pt: 'ombro' },
  'rodilla': { en: 'knee', pt: 'joelho' },
  'cadera': { en: 'hip', pt: 'quadril' },
  'codo': { en: 'elbow', pt: 'cotovelo' },
  'tobillo': { en: 'ankle', pt: 'tornozelo' },
  'columna': { en: 'spine', pt: 'coluna' },
  'cervical': { en: 'cervical', pt: 'cervical' },
  'dolor': { en: 'pain', pt: 'dor' },
  'ajustes': { en: 'settings', pt: 'configurações' },
  'configuración': { en: 'configuration', pt: 'configuração' },
  'guardar': { en: 'save', pt: 'salvar' },
  'cancelar': { en: 'cancel', pt: 'cancelar' },
  'cerrar': { en: 'close', pt: 'fechar' },
  'abrir': { en: 'open', pt: 'abrir' },
  'verificar': { en: 'verify', pt: 'verificar' },
  'activo': { en: 'active', pt: 'ativo' },
  'activos': { en: 'active', pt: 'ativos' },
  'pendiente': { en: 'pending', pt: 'pendente' },
  'completado': { en: 'completed', pt: 'concluído' },
  'enviar': { en: 'send', pt: 'enviar' },
  'descargar': { en: 'download', pt: 'baixar' },
  'subir': { en: 'upload', pt: 'enviar' },
  'nuevo': { en: 'new', pt: 'novo' },
  'nueva': { en: 'new', pt: 'nova' },
  'clínico': { en: 'clinical', pt: 'clínico' },
  'clínica': { en: 'clinical', pt: 'clínica' },
  'fisioterapia': { en: 'physical therapy', pt: 'fisioterapia' },
  'fisioterapeuta': { en: 'physical therapist', pt: 'fisioterapeuta' },
  'tiempo': { en: 'time', pt: 'tempo' },
  'historial': { en: 'history', pt: 'histórico' },
  'reporte': { en: 'report', pt: 'relatório' },
  'progreso': { en: 'progress', pt: 'progresso' },
  'precisión': { en: 'precision', pt: 'precisão' },
  'calidad': { en: 'quality', pt: 'qualidade' },
  'adherencia': { en: 'adherence', pt: 'adesão' },
};

/**
 * Intelligent client-side translation suggestions.
 */
export function autoTranslateText(text: string): { es: string; en: string; pt: string } {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Direct dictionary match
  if (CLINICAL_DICTIONARY[lower]) {
    return {
      es: clean,
      en: CLINICAL_DICTIONARY[lower].en,
      pt: CLINICAL_DICTIONARY[lower].pt,
    };
  }

  // 2. Partial prefix / word substitutions
  let enWords = clean.split(' ');
  let ptWords = clean.split(' ');

  enWords = enWords.map((word) => {
    const raw = word.toLowerCase().replace(/[^a-záéíóúñ]/g, '');
    if (GLOSSARY_WORDS[raw]) {
      const repl = GLOSSARY_WORDS[raw].en;
      return word[0] === word[0].toUpperCase()
        ? repl.charAt(0).toUpperCase() + repl.slice(1)
        : repl;
    }
    return word;
  });

  ptWords = ptWords.map((word) => {
    const raw = word.toLowerCase().replace(/[^a-záéíóúñ]/g, '');
    if (GLOSSARY_WORDS[raw]) {
      const repl = GLOSSARY_WORDS[raw].pt;
      return word[0] === word[0].toUpperCase()
        ? repl.charAt(0).toUpperCase() + repl.slice(1)
        : repl;
    }
    return word;
  });

  let en = enWords.join(' ');
  let pt = ptWords.join(' ');

  // If words were replaced, format appropriately
  if (en === clean) {
    // Basic fallback: keep text or translate common phrase patterns
    if (/^iniciar\s+/i.test(clean)) en = clean.replace(/^iniciar\s+/i, 'Start ');
    if (/^ver\s+/i.test(clean)) en = clean.replace(/^ver\s+/i, 'View ');
    if (/^crear\s+/i.test(clean)) en = clean.replace(/^crear\s+/i, 'Create ');
    if (/^editar\s+/i.test(clean)) en = clean.replace(/^editar\s+/i, 'Edit ');
    if (/^eliminar\s+/i.test(clean)) en = clean.replace(/^eliminar\s+/i, 'Delete ');
  }

  if (pt === clean) {
    if (/^iniciar\s+/i.test(clean)) pt = clean.replace(/^iniciar\s+/i, 'Iniciar ');
    if (/^ver\s+/i.test(clean)) pt = clean.replace(/^ver\s+/i, 'Ver ');
    if (/^crear\s+/i.test(clean)) pt = clean.replace(/^crear\s+/i, 'Criar ');
    if (/^editar\s+/i.test(clean)) pt = clean.replace(/^editar\s+/i, 'Editar ');
    if (/^eliminar\s+/i.test(clean)) pt = clean.replace(/^eliminar\s+/i, 'Excluir ');
  }

  return {
    es: clean,
    en: en || clean,
    pt: pt || clean,
  };
}

/**
 * Generate a clean camelCase translation key from string.
 */
export function generateKeyFromText(text: string): string {
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();

  if (!clean) return 'customKey';

  const parts = clean.split(/\s+/).slice(0, 4);
  return parts
    .map((p, idx) => {
      const l = p.toLowerCase();
      return idx === 0 ? l : l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join('');
}

/**
 * Guess the most appropriate namespace based on current route and element.
 */
export function guessNamespace(path: string): string {
  if (path.includes('patient') || path.includes('paciente')) return 'patients';
  if (path.includes('exercise') || path.includes('ejercicio')) return 'exercises';
  if (path.includes('stats') || path.includes('estadistica')) return 'stats';
  if (path.includes('mirror') || path.includes('ar')) return 'arMirror';
  if (path.includes('calibrat')) return 'calibration';
  if (path.includes('setting') || path.includes('config')) return 'settings';
  if (path.includes('login') || path.includes('auth') || path.includes('register') || path.includes('password')) return 'auth';
  if (path.includes('tool')) return 'tools';
  if (path.includes('profile') || path.includes('perfil')) return 'profile';
  if (path.includes('ocr')) return 'ocr';
  return 'common';
}

/**
 * Scans the DOM of the active screen and identifies non-translated visible text nodes.
 */
export function scanScreenForUntranslatedTexts(container?: HTMLElement | null): UntranslatedItem[] {
  if (typeof document === 'undefined') return [];

  const root = container || document.getElementById('app-root') || document.body;
  const knownValues = getAllTranslationValues();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const defaultNs = guessNamespace(currentPath);

  const results: UntranslatedItem[] = [];
  const seenTexts = new Set<string>();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      // Ignore scripts, styles, code blocks, SVGs, inputs, dev console
      const tag = parent.tagName.toLowerCase();
      if (['script', 'style', 'code', 'pre', 'noscript', 'svg', 'path'].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest('.dev-console') || parent.closest('#dev-console-modal')) {
        return NodeFilter.FILTER_REJECT;
      }

      // Check visibility
      const style = window.getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return NodeFilter.FILTER_REJECT;
      }

      const val = node.nodeValue?.trim() || '';
      if (val.length < 2) return NodeFilter.FILTER_REJECT;

      // Ignore pure numbers, timestamps, percentages, URLs, emails, symbols
      if (/^[\d\s.,:;%°/\\+\-–—()#$€¥]+$/.test(val)) return NodeFilter.FILTER_REJECT;
      if (/^[a-f0-9-]{36}$/i.test(val)) return NodeFilter.FILTER_REJECT; // UUID
      if (/@/.test(val) && /\.[a-z]{2,}$/i.test(val)) return NodeFilter.FILTER_REJECT; // Email
      if (/^https?:\/\//i.test(val)) return NodeFilter.FILTER_REJECT; // URL

      // Ignore icon names (Material Icons like "check", "arrow_forward", etc.)
      if (
        (parent.classList.contains('material-symbols-outlined') ||
          parent.classList.contains('material-icons') ||
          style.fontFamily.toLowerCase().includes('material')) &&
        val.length < 25 &&
        !/\s/.test(val)
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      // Check if already in known dictionary values
      if (knownValues.has(val.toLowerCase())) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode();
  let count = 0;

  while (currentNode && count < 60) {
    const raw = currentNode.nodeValue?.trim() || '';
    const parent = currentNode.parentElement;

    if (raw && parent && !seenTexts.has(raw)) {
      seenTexts.add(raw);
      count++;

      const key = generateKeyFromText(raw);
      const translations = autoTranslateText(raw);

      results.push({
        id: `untranslated-${count}-${Date.now()}`,
        text: raw,
        tagName: parent.tagName.toLowerCase(),
        element: parent,
        suggestedNamespace: defaultNs,
        suggestedKey: key,
        suggestedTranslations: translations,
        status: 'pending',
      });
    }

    currentNode = walker.nextNode();
  }

  return results;
}

/**
 * Highlights a DOM element visually with an animated ring and scrolls it into view.
 */
export function highlightElementInDom(el: HTMLElement): void {
  if (!el || typeof el.scrollIntoView !== 'function') return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const prevOutline = el.style.outline;
  const prevOutlineOffset = el.style.outlineOffset;
  const prevTransition = el.style.transition;

  el.style.transition = 'outline 0.3s ease, transform 0.2s ease';
  el.style.outline = '3px solid #14b8a6';
  el.style.outlineOffset = '4px';

  setTimeout(() => {
    el.style.outline = prevOutline;
    el.style.outlineOffset = prevOutlineOffset;
    el.style.transition = prevTransition;
  }, 2400);
}
