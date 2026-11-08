import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Bone,
  Check,
  ClipboardList,
  Dumbbell,
  Footprints,
  HeartPulse,
  Moon,
  Move3d,
  Ruler,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Sun,
  Thermometer,
  Timer,
  UserRound,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/themeApi';
import { Icon } from '../components/ui/Icon';
import '../styles/clinical-lab.css';

/* ── Primitivas de presentación (sólo lab) ───────────────────── */

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6">
        <p className="clinic-label mb-2">{kicker}</p>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({ token, hex, role }: { token: string; hex: string; role: string }) {
  return (
    <div className="clinic-card overflow-hidden">
      <div
        className="h-20 w-full"
        style={{
          background: `var(${token})`,
          boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.12)',
        }}
      />
      <div className="p-4">
        <p className="font-mono text-xs" style={{ color: 'var(--c-on-surface-variant)' }}>
          {token}
        </p>
        <p className="mt-1 font-mono text-xs uppercase">
          {hex} <span className="opacity-50">· light</span>
        </p>
        <p className="mt-2 text-sm leading-snug" style={{ color: 'var(--c-on-surface-variant)' }}>
          {role}
        </p>
      </div>
    </div>
  );
}

function VitalTile({
  label,
  value,
  unit,
  delta,
  tone = 'ok',
  bars,
}: {
  label: string;
  value: string;
  unit: string;
  delta: string;
  tone?: 'ok' | 'warn' | 'risk';
  bars: number[];
}) {
  return (
    <div className="clinic-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="clinic-label">{label}</p>
        <span className={`clinic-chip clinic-chip--${tone}`}>{delta}</span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="clinic-num text-4xl font-bold">{value}</span>
        <span className="pb-1 text-sm font-medium" style={{ color: 'var(--c-on-surface-variant)' }}>
          {unit}
        </span>
      </div>
      <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === bars.length - 1 ? 'var(--c-primary)' : 'rgba(21, 105, 102, 0.22)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--c-primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="clinic-num text-2xl font-bold">{value}</span>
        <span className="clinic-label">%</span>
      </div>
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────── */

export default function UILabPage() {
  const { theme, toggleTheme } = useTheme();
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reduce ? 0 : i * 0.06, duration: reduce ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] },
    }),
  } as const;

  return (
    <div className="clinic-page">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6 md:py-14">
        {/* Header */}
        <header className="mb-14 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="clinic-chip clinic-chip--ok">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Laboratorio
              </span>
              <span className="clinic-chip clinic-chip--warn">rama pruebas-ui</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Interfaz clínica FisioMirror
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--c-on-surface-variant)' }}>
              Sistema visual para rehabilitación: teal profundo como instrumento, el dato como héroe y
              movimiento con propósito. Cada bloque de acá es un componente real, no una maqueta.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="clinic-focus clinic-card inline-flex h-11 items-center gap-2 px-4 text-sm font-semibold"
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
            <Link
              to="/login"
              className="clinic-focus clinic-card inline-flex h-11 items-center gap-2 px-4 text-sm font-semibold"
            >
              <ArrowLeft size={18} />
              Volver
            </Link>
          </div>
        </header>

        <div className="space-y-16">
          {/* 1. Identidad */}
          <Section id="identidad" kicker="01 · Principios" title="Identidad clínica">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <Stethoscope size={22} />,
                  title: 'Instrumento, no bienestar',
                  body: 'La app se usa entre pacientes, con apuro y con datos sensibles. Sobriedad antes que espectáculo.',
                },
                {
                  icon: <Activity size={22} />,
                  title: 'El dato es el héroe',
                  body: 'Números tabulares, unidad siempre visible y contexto en la etiqueta. Nunca un KPI decorativo.',
                },
                {
                  icon: <ShieldCheck size={22} />,
                  title: 'Rojo sólo para riesgo',
                  body: 'Dolor alto, alertas y acciones destructivas. El resto se resuelve con teal, azure y terracota.',
                },
              ].map((item, i) => (
                <motion.article
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.5 }}
                  className="clinic-card p-6"
                >
                  <div
                    className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(21,105,102,0.10)', color: 'var(--c-primary)' }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--c-on-surface-variant)' }}>
                    {item.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </Section>

          {/* 2. Paleta */}
          <Section id="paleta" kicker="02 · Color" title="Paleta con jerarquía">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Swatch token="--c-primary" hex="#00504d" role="Acción, navegación activa, énfasis clínico." />
              <Swatch token="--c-primary-600" hex="#156966" role="Hover y gradientes de superficie." />
              <Swatch token="--c-primary-fixed-dim" hex="#8ad3cf" role="Acento y data-viz. Nunca texto encima." />
              <Swatch token="--c-secondary" hex="#3a5f94" role="Información y enlaces secundarios." />
              <Swatch token="--c-tertiary" hex="#e2725b" role="Calidez humana y recuperación del paciente." />
              <Swatch token="--c-background" hex="#f8fafc" role="Fondo de app, sin sombra." />
              <Swatch token="--c-surface" hex="#ffffff" role="Tarjetas de datos, nivel 2." />
              <Swatch token="--c-error" hex="#b42318" role="Reservado: riesgo y destructive. No decorativo." />
            </div>
          </Section>

          {/* 3. Tipografía */}
          <Section id="tipografia" kicker="03 · Tipo" title="Escala y jerarquía">
            <div className="clinic-card p-6 md:p-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-2 border-b pb-6" style={{ borderColor: 'rgba(148,163,184,0.18)' }}>
                  <p className="clinic-label">Display / 48 · 700</p>
                  <p className="text-4xl font-extrabold tracking-tight md:text-5xl">Rehabilitación precisa</p>
                </div>
                <div className="flex flex-col gap-2 border-b pb-6" style={{ borderColor: 'rgba(148,163,184,0.18)' }}>
                  <p className="clinic-label">Headline / 32 · 700</p>
                  <p className="text-2xl font-bold tracking-tight md:text-3xl">Plan de rodilla · semana 3</p>
                </div>
                <div className="flex flex-col gap-2 border-b pb-6" style={{ borderColor: 'rgba(148,163,184,0.18)' }}>
                  <p className="clinic-label">Body / 16 · 400 · máx 70 caracteres por línea</p>
                  <p className="max-w-[62ch] text-base leading-relaxed">
                    El paciente completó 4 de 5 sesiones. El rango articular mejoró 12° sin aumento del
                    dolor reportado. Mantener carga y revisar técnica en la próxima sesión.
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-8">
                  <div>
                    <p className="clinic-label mb-2">Dato</p>
                    <p className="clinic-num text-3xl font-bold">
                      128<span className="ml-1 text-base font-medium">°</span>
                    </p>
                  </div>
                  <div>
                    <p className="clinic-label mb-2">Mono / IDs</p>
                    <p className="font-mono text-sm">FM-2026-00418</p>
                  </div>
                  <div>
                    <p className="clinic-label mb-2">Editorial</p>
                    <p className="text-2xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      Cada movimiento cuenta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 4. Superficies */}
          <Section id="superficies" kicker="04 · Profundidad" title="Tres niveles, no cinco">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl p-6" style={{ background: 'var(--c-background)', border: '1px dashed rgba(148,163,184,0.4)' }}>
                <p className="clinic-label mb-2">Nivel 1 · Base</p>
                <p className="text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                  Fondo de app. Sin sombra, sin borde.
                </p>
              </div>
              <div className="clinic-card p-6">
                <p className="clinic-label mb-2">Nivel 2 · Card</p>
                <p className="text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                  Superficie sólida, borde 12% y sombra suave. Acá viven los datos.
                </p>
              </div>
              <div className="clinic-overlay p-6">
                <p className="clinic-label mb-2">Nivel 3 · Overlay</p>
                <p className="text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                  Glass real, sólo flotante: modal, dock, command palette.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
              Regla dura: <strong>sin glass en tarjetas de datos</strong>. El blur baja el contraste del número.
            </p>
          </Section>

          {/* 5. Vitales */}
          <Section id="vitales" kicker="05 · Datos" title="Vitales clínicos">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <VitalTile label="Dolor EVA" value="3" unit="/ 10" delta="−2 vs. semana 2" tone="ok" bars={[80, 70, 55, 40, 30, 25, 30]} />
              <VitalTile label="ROM rodilla" value="128" unit="grados" delta="+12°" tone="ok" bars={[45, 50, 58, 66, 72, 80, 88]} />
              <VitalTile label="Adherencia" value="80" unit="%" delta="4 de 5" tone="warn" bars={[60, 80, 100, 80, 60, 80, 80]} />
              <VitalTile label="Sesiones" value="18" unit="acumuladas" delta="Racha 6 días" tone="ok" bars={[30, 45, 50, 65, 70, 85, 95]} />
            </div>
            <div className="mt-4 clinic-card flex flex-wrap items-center gap-8 p-6">
              <div className="flex items-center gap-4">
                <ProgressRing value={76} />
                <div>
                  <p className="clinic-label mb-1">Objetivo del plan</p>
                  <p className="text-lg font-bold">76% completado</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                    Restan 3 sesiones de 10
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="clinic-label">Estados</p>
                <div className="flex flex-wrap gap-2">
                  <span className="clinic-chip clinic-chip--ok">
                    <Check size={13} /> Sin dolor
                  </span>
                  <span className="clinic-chip clinic-chip--warn">
                    <Thermometer size={13} /> Molestia leve
                  </span>
                  <span className="clinic-chip clinic-chip--risk">
                    <Zap size={13} /> Dolor agudo
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* 6. Iconografía */}
          <Section id="iconos" kicker="06 · Iconografía" title="Metáforas clínicas">
            <div className="clinic-card p-6">
              <p className="mb-5 text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                Trazo 1.75, 24×24, esquinas redondeadas. Un solo set por grupo de acciones.
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-10">
                {[
                  { i: <Bone size={20} />, n: 'Columna' },
                  { i: <Move3d size={20} />, n: 'ROM' },
                  { i: <Footprints size={20} />, n: 'Marcha' },
                  { i: <Activity size={20} />, n: 'EMG' },
                  { i: <HeartPulse size={20} />, n: 'Vitales' },
                  { i: <Dumbbell size={20} />, n: 'Carga' },
                  { i: <Ruler size={20} />, n: 'Medición' },
                  { i: <Timer size={20} />, n: 'Sesión' },
                  { i: <ScanLine size={20} />, n: 'Escaneo' },
                  { i: <Waves size={20} />, n: 'Terapia' },
                  { i: <ClipboardList size={20} />, n: 'Rutina' },
                  { i: <UserRound size={20} />, n: 'Paciente' },
                ].map((it) => (
                  <div key={it.n} className="flex flex-col items-center gap-2 rounded-2xl px-2 py-4" style={{ background: 'rgba(21,105,102,0.06)' }}>
                    <span style={{ color: 'var(--c-primary)' }}>{it.i}</span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--c-on-surface-variant)' }}>
                      {it.n}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5" style={{ borderColor: 'rgba(148,163,184,0.18)' }}>
                <span className="clinic-label">Material Symbols</span>
                {['monitor_heart', 'healing', 'accessibility_new', 'medical_services', 'biotech'].map((n) => (
                  <span key={n} className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(58,95,148,0.08)', color: 'var(--c-secondary)' }}>
                    <Icon name={n} size={20} />
                  </span>
                ))}
              </div>
            </div>
          </Section>

          {/* 7. Movimiento */}
          <Section id="movimiento" kicker="07 · Movimiento" title="Con propósito, sin rebote">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="clinic-card flex flex-col items-center gap-4 p-6">
                <p className="clinic-label self-start">Pulso · estado en vivo</p>
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(21,105,102,0.12)' }}
                    animate={reduce ? undefined : { scale: [1, 1.35], opacity: [0.7, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <span className="h-4 w-4 rounded-full" style={{ background: 'var(--c-primary)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                  Sólo si comunica estado real.
                </p>
              </div>

              <div className="clinic-card flex flex-col gap-4 p-6">
                <p className="clinic-label">Entrada escalonada</p>
                <motion.ul
                  className="space-y-2"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}
                >
                  {['Evaluar dolor', 'Medir ROM', 'Ajustar carga', 'Registrar sesión'].map((t) => (
                    <motion.li
                      key={t}
                      variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2"
                      style={{ background: 'rgba(21,105,102,0.06)' }}
                    >
                      <Check size={15} style={{ color: 'var(--c-primary)' }} />
                      <span className="text-sm">{t}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              <div className="clinic-card flex flex-col items-center gap-4 p-6">
                <p className="clinic-label self-start">Progreso · 1.1s</p>
                <ProgressRing value={76} />
                <p className="text-sm" style={{ color: 'var(--c-on-surface-variant)' }}>
                  Curva estándar, sin overshoot.
                </p>
              </div>
            </div>
          </Section>

          {/* 8. Checklist */}
          <Section id="checklist" kicker="08 · Craft" title="Piso de calidad">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="clinic-card p-6">
                <p className="clinic-label mb-4" style={{ color: '#0f766e' }}>Hacer</p>
                <ul className="space-y-3 text-sm">
                  {[
                    'Un solo acento por pantalla, dos como máximo.',
                    'Números tabulares con unidad y contexto.',
                    'Foco visible y targets de 44px.',
                    'Los siete estados de cada control.',
                    'Reduced motion respetado en todo loop.',
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <Check size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--c-primary)' }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="clinic-card p-6">
                <p className="clinic-label mb-4" style={{ color: '#b42318' }}>Evitar</p>
                <ul className="space-y-3 text-sm">
                  {[
                    'Glass sobre glass y sombras de cinco capas.',
                    'Emojis y sparkles en pantallas clínicas.',
                    'Gris claro sobre blanco para texto.',
                    'Cards dentro de cards dentro de cards.',
                    'Animaciones en loop sin significado.',
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <X size={16} className="mt-0.5 shrink-0" style={{ color: '#b42318' }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        </div>

        <footer className="mt-16 border-t pt-6 text-sm" style={{ borderColor: 'rgba(148,163,184,0.18)', color: 'var(--c-on-surface-variant)' }}>
          FisioMirror · Laboratorio UI · los contratos viven en <span className="font-mono">DESIGN.md</span>
        </footer>
      </div>
    </div>
  );
}
