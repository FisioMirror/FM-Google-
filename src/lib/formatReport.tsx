import { type ReactNode, Fragment } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Target,
  Stethoscope,
  Info,
  TrendingUp,
} from 'lucide-react';

/**
 * Transforms clinical JSON objects into clean markdown representation.
 */
function parseJSONToStructuredMarkdown(obj: Record<string, any>): string {
  const parts: string[] = [];

  // Attention level banner
  const nivel = obj.nivel_atencion || obj.atencion || obj.prioridad || obj.nivel_riesgo;
  if (nivel && typeof nivel === 'string') {
    const nLow = nivel.toLowerCase();
    if (nLow.includes('alta') || nLow.includes('critica') || nLow.includes('urgente')) {
      parts.push(`ALERTA: Nivel de atención requerido: **${nivel.toUpperCase()}**`);
    } else if (nLow.includes('media') || nLow.includes('moderada')) {
      parts.push(`ATENCIÓN: Nivel de atención clínica: **${nivel.toUpperCase()}**`);
    } else {
      parts.push(`**Nivel de Atención Clínico**: ${nivel.toUpperCase()} (Evolución favorable)`);
    }
  }

  // Clinical evaluation / analysis
  const evaluacion =
    obj.evaluacion_clinica ||
    obj.evaluacion ||
    obj.analisis ||
    obj.diagnostico ||
    obj.resumen ||
    obj.resumen_clinico;
  if (evaluacion) {
    parts.push('### Evaluación Clínica y Biomecánica');
    if (typeof evaluacion === 'string') {
      parts.push(evaluacion);
    } else if (Array.isArray(evaluacion)) {
      evaluacion.forEach((item) => parts.push(`- ${item}`));
    } else if (typeof evaluacion === 'object') {
      Object.entries(evaluacion).forEach(([k, v]) => parts.push(`- **${k.replace(/_/g, ' ')}**: ${v}`));
    }
  }

  // Recommendations / Action plan
  const recomendaciones =
    obj.recomendaciones ||
    obj.recomendacion ||
    obj.plan_terapeutico ||
    obj.sugerencias ||
    obj.ejercicios_sugeridos;
  if (recomendaciones) {
    parts.push('### Recomendaciones Terapéuticas');
    if (typeof recomendaciones === 'string') {
      if (recomendaciones.includes('\n')) {
        parts.push(recomendaciones);
      } else if (recomendaciones.includes('. ') && recomendaciones.length > 80) {
        const sentences = recomendaciones.split('. ').filter(Boolean);
        sentences.forEach((s) => parts.push(`- ${s.trim()}${s.endsWith('.') ? '' : '.'}`));
      } else {
        parts.push(recomendaciones);
      }
    } else if (Array.isArray(recomendaciones)) {
      recomendaciones.forEach((item) => parts.push(`- ${typeof item === 'object' ? JSON.stringify(item) : item}`));
    } else if (typeof recomendaciones === 'object') {
      Object.entries(recomendaciones).forEach(([k, v]) => parts.push(`- **${k.replace(/_/g, ' ')}**: ${v}`));
    }
  }

  // Other fields
  const handledKeys = new Set([
    'nivel_atencion',
    'atencion',
    'prioridad',
    'nivel_riesgo',
    'evaluacion_clinica',
    'evaluacion',
    'analisis',
    'diagnostico',
    'resumen',
    'resumen_clinico',
    'recomendaciones',
    'recomendacion',
    'plan_terapeutico',
    'sugerencias',
    'ejercicios_sugeridos',
  ]);

  Object.entries(obj).forEach(([key, val]) => {
    if (handledKeys.has(key) || !val) return;
    const readableTitle = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    parts.push(`### ${readableTitle}`);
    if (typeof val === 'string') {
      parts.push(val);
    } else if (Array.isArray(val)) {
      val.forEach((item) => parts.push(`- ${typeof item === 'object' ? JSON.stringify(item) : item}`));
    } else if (typeof val === 'object') {
      Object.entries(val).forEach(([k, v]) => parts.push(`- **${k.replace(/_/g, ' ')}**: ${v}`));
    } else {
      parts.push(String(val));
    }
  });

  return parts.join('\n\n');
}

/**
 * Parses markdown-like formatting, clinical prompts, AI outputs, and structured JSON
 * into elegant, stylized clinical report cards and insights.
 */
export function formatAIReport(text: string): ReactNode {
  if (!text || !text.trim()) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/15 text-xs text-on-surface-variant italic">
        <Info className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>No hay información o recomendaciones disponibles en este momento.</span>
      </div>
    );
  }

  // Clean raw JSON or markdown codeblocks containing JSON
  let cleaned = text.trim();

  // Strip code fences if wrapped like ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // Check if string contains or is JSON
  if (cleaned.startsWith('{') || cleaned.startsWith('[') || (cleaned.includes('{"') && cleaned.includes('"}'))) {
    try {
      // Find JSON bounds if embedded
      let jsonToParse = cleaned;
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonToParse = cleaned.substring(startIdx, endIdx + 1);
      }
      const parsed = JSON.parse(jsonToParse);
      if (parsed && typeof parsed === 'object') {
        cleaned = parseJSONToStructuredMarkdown(parsed);
      }
    } catch {
      // If parsing failed, clean up quotes and colons
      if (cleaned.includes('"') && cleaned.includes(':')) {
        cleaned = cleaned
          .replace(/[{}"]/g, '')
          .replace(/\\n/g, '\n')
          .replace(/\b\w+\b:/g, (match) => `\n### ${match.replace(':', '')}\n`)
          .replace(/^\s+/gm, '')
          .trim();
      }
    }
  }

  // Normalize line endings
  const lines = cleaned.replace(/\r\n/g, '\n').split('\n');

  type Block =
    | { kind: 'header'; level: number; text: string }
    | { kind: 'bullets'; items: string[] }
    | { kind: 'alert'; text: string; type: 'warning' | 'info' | 'success' }
    | { kind: 'metric_badge'; label: string; value: string; detail?: string }
    | { kind: 'paragraph'; text: string };

  const blocks: Block[] = [];
  let currentBullets: string[] | null = null;

  const flushBullets = () => {
    if (currentBullets && currentBullets.length > 0) {
      blocks.push({ kind: 'bullets', items: currentBullets });
    }
    currentBullets = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushBullets();
      continue;
    }

    // Headers: ## or ###
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushBullets();
      blocks.push({
        kind: 'header',
        level: headerMatch[1].length,
        text: headerMatch[2].trim(),
      });
      continue;
    }

    // Alerts / Notes
    if (
      line.toLowerCase().startsWith('alerta:') ||
      line.toLowerCase().startsWith('atención:') ||
      line.toLowerCase().startsWith('precaución:') ||
      line.toLowerCase().startsWith('warning:') ||
      line.toLowerCase().startsWith('urgent:')
    ) {
      flushBullets();
      blocks.push({
        kind: 'alert',
        text: line.replace(/^(alerta|atención|precaución|warning|urgent):\s*/i, '').trim(),
        type: 'warning',
      });
      continue;
    }

    // Bullet items
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentBullets) currentBullets = [];
      currentBullets.push(bulletMatch[1].trim());
      continue;
    }

    // Numbered items
    const numMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numMatch) {
      if (!currentBullets) currentBullets = [];
      currentBullets.push(numMatch[1].trim());
      continue;
    }

    // Regular paragraph
    flushBullets();
    blocks.push({ kind: 'paragraph', text: line.trim() });
  }

  flushBullets();

  const getHeaderIcon = (headerText: string) => {
    const lower = headerText.toLowerCase();
    if (lower.includes('recomenda') || lower.includes('plan') || lower.includes('acción') || lower.includes('terapéut')) {
      return <Target className="size-4 text-teal-600 dark:text-teal-400" />;
    }
    if (lower.includes('evalua') || lower.includes('biomecán') || lower.includes('rom') || lower.includes('rango')) {
      return <Activity className="size-4 text-cyan-600 dark:text-cyan-400" />;
    }
    if (lower.includes('adher') || lower.includes('progre') || lower.includes('evolu') || lower.includes('resumen')) {
      return <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (lower.includes('alerta') || lower.includes('dolor') || lower.includes('riesgo') || lower.includes('eva')) {
      return <AlertTriangle className="size-4 text-amber-500" />;
    }
    return <Stethoscope className="size-4 text-teal-600 dark:text-teal-400" />;
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        if (block.kind === 'header') {
          return (
            <div key={idx} className="pt-2.5 first:pt-0">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 rounded-xl bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/20 shrink-0">
                  {getHeaderIcon(block.text)}
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900 dark:text-teal-200">
                  {renderInline(block.text)}
                </h4>
              </div>
              <div className="h-px bg-gradient-to-r from-teal-500/30 via-teal-500/10 to-transparent" />
            </div>
          );
        }

        if (block.kind === 'alert') {
          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs leading-relaxed shadow-xs"
            >
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{renderInline(block.text)}</div>
            </div>
          );
        }

        if (block.kind === 'bullets') {
          return (
            <div key={idx} className="grid grid-cols-1 gap-2.5 pl-0.5">
              {block.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-container-low/80 dark:bg-surface-container-low/50 border border-outline/10 text-xs text-on-surface leading-relaxed transition-all hover:border-teal-500/30"
                >
                  <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="flex-1 font-normal">{renderInline(item)}</span>
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={idx} className="text-xs text-on-surface-variant leading-relaxed font-normal">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Renders inline markdown (**bold**, `code`, % percentages, and angle degree tags).
 */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\b\d+(?:\.\d+)?%|\b\d+°)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono text-[11px] font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\d+(?:\.\d+)?%$/.test(part)) {
      return (
        <span key={i} className="inline-block px-1.5 py-0.2 rounded font-bold text-teal-700 dark:text-teal-300 bg-teal-500/15">
          {part}
        </span>
      );
    }
    if (/^\d+°$/.test(part)) {
      return (
        <span key={i} className="inline-block px-1.5 py-0.2 rounded font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/15">
          {part}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
