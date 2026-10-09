import React, { createContext, useContext, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxGroupContextType {
  values: string[];
  toggleValue: (val: string) => void;
  name?: string;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType>({
  values: [],
  toggleValue: () => {},
});

export function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'w-full rounded-3xl p-6 bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h4 className={cn('text-sm sm:text-base font-bold text-slate-900 dark:text-white', className)}>{children}</h4>;
}

export function Description({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4', className)}>{children}</p>;
}

export function CheckboxGroup({
  name,
  defaultValue = ['email', 'push'],
  children,
  onChange,
}: {
  name?: string;
  defaultValue?: string[];
  children: React.ReactNode;
  onChange?: (vals: string[]) => void;
}) {
  const [values, setValues] = useState<string[]>(defaultValue);

  const toggleValue = (val: string) => {
    const next = values.includes(val) ? values.filter((v) => v !== val) : [...values, val];
    setValues(next);
    onChange?.(next);
  };

  return (
    <CheckboxGroupContext.Provider value={{ values, toggleValue, name }}>
      <div className="space-y-3">{children}</div>
    </CheckboxGroupContext.Provider>
  );
}

interface CheckboxContextType {
  isChecked: boolean;
}

const CheckboxContext = createContext<CheckboxContextType>({ isChecked: false });

export function Checkbox({
  value,
  children,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { values, toggleValue } = useContext(CheckboxGroupContext);
  const isChecked = values.includes(value);

  return (
    <CheckboxContext.Provider value={{ isChecked }}>
      <div
        onClick={() => toggleValue(value)}
        className={cn(
          'flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none',
          isChecked
            ? 'bg-teal-500/10 border-teal-500/30 text-teal-950 dark:text-teal-200'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
          className
        )}
      >
        {children}
      </div>
    </CheckboxContext.Provider>
  );
}

export function CheckboxControl({ children }: { children?: React.ReactNode }) {
  const { isChecked } = useContext(CheckboxContext);

  return (
    <div
      className={cn(
        'size-5 rounded-lg border flex items-center justify-center transition-all shrink-0',
        isChecked
          ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
      )}
    >
      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      {children}
    </div>
  );
}

export function CheckboxIndicator() {
  return null;
}

export function CheckboxContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-xs font-semibold flex items-center gap-3', className)}>{children}</div>;
}

Checkbox.Control = CheckboxControl;
Checkbox.Indicator = CheckboxIndicator;
Checkbox.Content = CheckboxContent;

export function CheckboxPreferencesDemo() {
  return (
    <Surface className="w-full max-w-lg">
      <Label>Preferencias de Notificación Clínica</Label>
      <Description>Elige cómo deseas recibir avisos de rehabilitación, recordatorios y reportes médicos.</Description>
      <CheckboxGroup name="notifications">
        <Checkbox value="email">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Notificaciones por Correo</p>
              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Resúmenes semanales de evolución y notas de tu fisioterapeuta.
              </p>
            </div>
          </Checkbox.Content>
        </Checkbox>

        <Checkbox value="push">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Alertas Push en Navegador</p>
              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Avisos instantáneos al momento de iniciar tu rutina de ejercicios.
              </p>
            </div>
          </Checkbox.Content>
        </Checkbox>

        <Checkbox value="sms">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Recordatorios SMS / WhatsApp</p>
              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Mensaje directo de recordatorio si tienes más de 48 horas sin entrenar.
              </p>
            </div>
          </Checkbox.Content>
        </Checkbox>
      </CheckboxGroup>
    </Surface>
  );
}

export default CheckboxPreferencesDemo;
