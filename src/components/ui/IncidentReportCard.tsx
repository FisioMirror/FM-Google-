import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  AreaSeries,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
  type ChartDataTypes,
} from 'reaviz';

interface ChartDataPoint {
  key: Date;
  data: number | null | undefined;
}

interface ChartSeries {
  key: string;
  data: ChartDataPoint[];
}

const DiamondAlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M9.92844 1.25411C9.32947 1.25895 8.73263 1.49041 8.28293 1.94747L1.92062 8.41475C1.02123 9.32885 1.03336 10.8178 1.94748 11.7172L8.41476 18.0795C9.32886 18.9789 10.8178 18.9667 11.7172 18.0526L18.0795 11.5861C18.0798 11.5859 18.08 11.5856 18.0803 11.5853C18.979 10.6708 18.9667 9.18232 18.0526 8.28291L11.5853 1.92061C11.1283 1.47091 10.5274 1.24926 9.92844 1.25411ZM9.93901 2.49597C10.2155 2.49373 10.4926 2.59892 10.7089 2.81172L17.1762 9.17403C17.6087 9.59962 17.6139 10.2767 17.1884 10.7097L10.8261 17.1761C10.4005 17.6087 9.72379 17.614 9.29123 17.1884L2.82394 10.826C2.39139 10.4005 2.38613 9.72378 2.81174 9.29121L9.17404 2.82393C9.38684 2.60765 9.66256 2.4982 9.93901 2.49597Z"
      fill="#14b8a6"
    />
  </svg>
);

const CircleAlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10.0001 1.66663C5.40511 1.66663 1.66675 5.40499 1.66675 9.99996C1.66675 14.5949 5.40511 18.3333 10.0001 18.3333C14.5951 18.3333 18.3334 14.5949 18.3334 9.99996C18.3334 5.40499 14.5951 1.66663 10.0001 1.66663ZM10.0001 2.91663C13.9195 2.91663 17.0834 6.08054 17.0834 9.99996C17.0834 13.9194 13.9195 17.0833 10.0001 17.0833C6.08066 17.0833 2.91675 13.9194 2.91675 9.99996C2.91675 6.08054 6.08066 2.91663 10.0001 2.91663Z"
      fill="#3a5f94"
    />
  </svg>
);

const TriangleAlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10.0001 2.10535C9.35241 2.10535 8.70472 2.42118 8.35459 3.05343L1.90440 14.7063C1.22414 15.9354 2.14514 17.5000 3.54990 17.5000H16.4511C17.8559 17.5000 18.7769 15.9354 18.0966 14.7063L11.6456 3.05343C11.2955 2.42118 10.6478 2.10535 10.0001 2.10535Z"
      fill="#84cc16"
    />
  </svg>
);

const UpTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.25" />
    <path d="M9.50134 12.6111L14.0013 8.16663M14.0013 8.16663L18.5013 12.6111M14.0013 8.16663L14.0013 19.8333" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const DownTrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.25" />
    <path d="M18.4987 15.3889L13.9987 19.8334M13.9987 19.8334L9.49866 15.3889M13.9987 19.8334V8.16671" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

// FisioMirror Medical Palette
const LEGEND_ITEMS = [
  { name: 'Rango Articular (ROM)', color: '#14b8a6' }, // Teal
  { name: 'Precisión Postural AR', color: '#3a5f94' }, // Slate Blue
  { name: 'Adherencia Terapéutica', color: '#a3e635' }, // Kinetic Lime
];

const now = new Date();
const generateDate = (offsetDays: number): Date => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date;
};

const initialChartData: ChartSeries[] = [
  {
    key: 'Rango Articular (ROM)',
    data: [
      { key: generateDate(6), data: 55 },
      { key: generateDate(5), data: 68 },
      { key: generateDate(4), data: 65 },
      { key: generateDate(3), data: 82 },
      { key: generateDate(2), data: 78 },
      { key: generateDate(1), data: 92 },
      { key: generateDate(0), data: 98 },
    ],
  },
  {
    key: 'Precisión Postural AR',
    data: [
      { key: generateDate(6), data: 40 },
      { key: generateDate(5), data: 52 },
      { key: generateDate(4), data: 60 },
      { key: generateDate(3), data: 58 },
      { key: generateDate(2), data: 74 },
      { key: generateDate(1), data: 85 },
      { key: generateDate(0), data: 89 },
    ],
  },
  {
    key: 'Adherencia Terapéutica',
    data: [
      { key: generateDate(6), data: 25 },
      { key: generateDate(5), data: 35 },
      { key: generateDate(4), data: 45 },
      { key: generateDate(3), data: 50 },
      { key: generateDate(2), data: 65 },
      { key: generateDate(1), data: 80 },
      { key: generateDate(0), data: 95 },
    ],
  },
];

const validateChartData = (data: ChartSeries[]): ChartDataTypes[] => {
  return data.map((series) => ({
    ...series,
    data: series.data.map((item) => ({
      ...item,
      data: typeof item.data !== 'number' || isNaN(item.data) ? 0 : item.data,
    })),
  }));
};

interface MetricInfo {
  id: string;
  Icon: React.FC<{ className?: string }>;
  label: string;
  tooltip: string;
  value: string;
  TrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }>;
  trendBaseColor: string;
  trendStrokeColor: string;
  delay: number;
}

const METRICS_DATA: MetricInfo[] = [
  {
    id: 'mttd',
    Icon: DiamondAlertIcon,
    label: 'Rango Máximo Logrado (ROM)',
    tooltip: 'Mayor grado articular alcanzado en sesión',
    value: '138°',
    TrendIcon: UpTrendIcon,
    trendBaseColor: '#14b8a6',
    trendStrokeColor: '#0d9488',
    delay: 0,
  },
  {
    id: 'irt',
    Icon: CircleAlertIcon,
    label: 'Precisión Biomecánica AR',
    tooltip: 'Porcentaje de ejecución sin compensaciones posturales',
    value: '94.2%',
    TrendIcon: UpTrendIcon,
    trendBaseColor: '#3a5f94',
    trendStrokeColor: '#60a5fa',
    delay: 0.05,
  },
  {
    id: 'ier',
    Icon: TriangleAlertIcon,
    label: 'Tasa de Compensación Lesiva',
    tooltip: 'Reducción de movimientos de sobrecarga detectados por MediaPipe',
    value: '3.8%',
    TrendIcon: DownTrendIcon,
    trendBaseColor: '#10b981',
    trendStrokeColor: '#10b981',
    delay: 0.1,
  },
];

export const IncidentReportCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const validatedChartData = useMemo(() => validateChartData(initialChartData), []);

  return (
    <div
      className={`flex flex-col pt-5 pb-5 bg-white dark:bg-[#0e141d] rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md min-h-[560px] overflow-hidden transition-colors duration-300 ${className}`}
    >
      <div className="px-6 sm:px-7 pt-2 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
            Reaviz Analytics 2.0
          </span>
          <span className="text-[10px] text-slate-400">Últimos 7 días</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Evolución Biomecánica
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tendencia clínica de movilidad y adherencia del paciente
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-between gap-2 px-6 sm:px-7 mb-4">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.name} className="flex gap-1.5 items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-semibold">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Reaviz Smooth Area Chart */}
      <div className="reaviz-chart-container h-[200px] w-full px-2">
        <AreaChart
          height={200}
          id="fisiomirror-reaviz-smooth-chart"
          data={validatedChartData}
          xAxis={
            <LinearXAxis
              type="time"
              tickSeries={
                <LinearXAxisTickSeries
                  label={
                    <LinearXAxisTickLabel
                      format={(v) =>
                        new Date(v).toLocaleDateString('es-ES', {
                          month: 'numeric',
                          day: 'numeric',
                        })
                      }
                      fill="var(--c-outline, #94a3b8)"
                    />
                  }
                  tickSize={10}
                />
              }
            />
          }
          yAxis={
            <LinearYAxis axisLine={null} tickSeries={<LinearYAxisTickSeries line={null} label={null} tickSize={10} />} />
          }
          series={
            <AreaSeries
              type="grouped"
              interpolation="smooth"
              area={
                <Area
                  gradient={
                    <Gradient
                      stops={[
                        <GradientStop key={1} stopOpacity={0.05} />,
                        <GradientStop key={2} offset="100%" stopOpacity={0.45} />,
                      ]}
                    />
                  }
                />
              }
              colorScheme={['#14b8a6', '#3a5f94', '#a3e635']}
            />
          }
          gridlines={<GridlineSeries line={<Gridline strokeColor="rgba(148, 163, 184, 0.15)" />} />}
        />
      </div>

      {/* Metrics List */}
      <div className="flex flex-col px-6 sm:px-7 pt-5 divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
        {METRICS_DATA.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: metric.delay }}
            className="flex w-full py-3.5 items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <metric.Icon />
              <span className="font-semibold" title={metric.tooltip}>
                {metric.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tabular-nums">
                {metric.value}
              </span>
              <metric.TrendIcon baseColor={metric.trendBaseColor} strokeColor={metric.trendStrokeColor} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default IncidentReportCard;
