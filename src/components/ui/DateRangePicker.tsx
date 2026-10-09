import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerContextType {
  value: DateRange;
  setValue: (range: DateRange) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  hoverDate: Date | null;
  setHoverDate: (date: Date | null) => void;
  firstDayOfWeek?: "mon" | "sun";
  visibleWeeks?: number;
}

const DateRangePickerContext = createContext<DateRangePickerContextType | null>(null);

function useDateRangePicker() {
  const ctx = useContext(DateRangePickerContext);
  if (!ctx) {
    throw new Error("RangeCalendar components must be used within DateRangePicker or standalone RangeCalendar");
  }
  return ctx;
}

export interface DateRangePickerProps {
  children: React.ReactNode;
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  firstDayOfWeek?: "mon" | "sun";
  visibleWeeks?: number;
}

export function DateRangePicker({
  children,
  value: controlledValue,
  defaultValue = { start: null, end: null },
  onChange,
  className,
  firstDayOfWeek = "mon",
  visibleWeeks = 4,
}: DateRangePickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return defaultValue.start || new Date();
  });

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleSetValue = (nextRange: DateRange) => {
    if (!isControlled) {
      setUncontrolledValue(nextRange);
    }
    onChange?.(nextRange);
  };

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside and escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DateRangePickerContext.Provider
      value={{
        value,
        setValue: handleSetValue,
        isOpen,
        setIsOpen,
        toggle,
        close,
        currentMonth,
        setCurrentMonth,
        hoverDate,
        setHoverDate,
        firstDayOfWeek,
        visibleWeeks,
      }}
    >
      <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
        {children}
      </div>
    </DateRangePickerContext.Provider>
  );
}

export function DateRangePickerTrigger({
  className,
  placeholder = "Seleccionar rango clínico...",
}: {
  className?: string;
  placeholder?: string;
}) {
  const { value, toggle, isOpen } = useDateRangePicker();

  const formatDate = (d: Date | null) => {
    if (!d) return "";
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  const displayText = value.start
    ? value.end
      ? `${formatDate(value.start)} — ${formatDate(value.end)}`
      : `${formatDate(value.start)} — (Seleccionar fin)`
    : placeholder;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide",
        "bg-surface/90 dark:bg-slate-900/90 text-on-surface border border-border/80 shadow-xs",
        "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200",
        isOpen && "border-primary ring-2 ring-primary/20",
        className
      )}
    >
      <CalendarIcon className="size-4 text-primary shrink-0" />
      <span>{displayText}</span>
    </button>
  );
}

export function DateRangePickerPopover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOpen } = useDateRangePicker();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute z-50 mt-2 left-0 sm:left-auto right-0 sm:right-auto min-w-[320px] max-w-sm",
            "p-4 rounded-2xl md:rounded-3xl shadow-2xl shadow-slate-950/20",
            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl",
            "border border-slate-200/90 dark:border-slate-800/90 text-foreground",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface RangeCalendarProps {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  firstDayOfWeek?: "mon" | "sun";
  visibleDuration?: { weeks?: number; months?: number };
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
}

/**
 * RangeCalendar
 * Funciona tanto dentro de <DateRangePicker> como standalone con su propio estado interno.
 */
export function RangeCalendar({
  children,
  className,
  "aria-label": ariaLabel,
  firstDayOfWeek = "mon",
  visibleDuration,
  value: controlledValue,
  defaultValue = { start: null, end: null },
  onChange,
}: RangeCalendarProps) {
  const parentCtx = useContext(DateRangePickerContext);

  // Si ya hay un contexto padre (dentro de DateRangePicker), usarlo
  if (parentCtx) {
    return (
      <div aria-label={ariaLabel} className={cn("space-y-4", className)}>
        {children}
      </div>
    );
  }

  // Si es standalone, proveemos un contexto local
  return (
    <RangeCalendarStandalone
      ariaLabel={ariaLabel}
      firstDayOfWeek={firstDayOfWeek}
      visibleDuration={visibleDuration}
      controlledValue={controlledValue}
      defaultValue={defaultValue}
      onChange={onChange}
      className={className}
    >
      {children}
    </RangeCalendarStandalone>
  );
}

function RangeCalendarStandalone({
  children,
  className,
  ariaLabel,
  firstDayOfWeek = "mon",
  visibleDuration,
  controlledValue,
  defaultValue = { start: null, end: null },
  onChange,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  firstDayOfWeek?: "mon" | "sun";
  visibleDuration?: { weeks?: number; months?: number };
  controlledValue?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(defaultValue);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => defaultValue.start || new Date());

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleSetValue = (nextRange: DateRange) => {
    if (!isControlled) setUncontrolledValue(nextRange);
    onChange?.(nextRange);
  };

  return (
    <DateRangePickerContext.Provider
      value={{
        value,
        setValue: handleSetValue,
        isOpen: true,
        setIsOpen: () => {},
        toggle: () => {},
        close: () => {},
        currentMonth,
        setCurrentMonth,
        hoverDate,
        setHoverDate,
        firstDayOfWeek,
        visibleWeeks: visibleDuration?.weeks,
      }}
    >
      <div
        aria-label={ariaLabel}
        className={cn(
          "p-4 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4",
          className
        )}
      >
        {children}
      </div>
    </DateRangePickerContext.Provider>
  );
}

export function RangeCalendarHeader({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { currentMonth, setCurrentMonth } = useDateRangePicker();

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  // Si se proveen hijos con slots de navegación custom
  if (children) {
    return (
      <div className={cn("flex items-center justify-between px-1", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between px-1", className)}>
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border/50 transition-colors"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="text-sm font-bold text-on-surface capitalize">{monthLabel}</span>

      <button
        type="button"
        onClick={handleNextMonth}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border/50 transition-colors"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export function RangeCalendarNavButton({
  slot,
  className,
  children,
  onClick,
}: {
  slot?: "previous" | "next";
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const { setCurrentMonth } = useDateRangePicker();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (slot === "previous") {
      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={slot === "previous" ? "Anterior" : "Siguiente"}
      className={cn(
        "p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-border/40 hover:border-border/80 transition-colors",
        className
      )}
    >
      {children || (slot === "previous" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />)}
    </button>
  );
}

export function RangeCalendarHeading({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { currentMonth } = useDateRangePicker();
  const monthLabel = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <span className={cn("text-sm font-bold text-on-surface capitalize", className)}>
      {children || monthLabel}
    </span>
  );
}

export function RangeCalendarGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full select-none", className)}>{children}</div>;
}

export function RangeCalendarGridHeader({
  children,
  className,
}: {
  children?: React.ReactNode | ((day: string) => React.ReactNode);
  className?: string;
}) {
  const { firstDayOfWeek } = useDateRangePicker();
  const days = firstDayOfWeek === "sun"
    ? ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]
    : ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  if (typeof children === "function") {
    return (
      <div className={cn("grid grid-cols-7 mb-1.5 text-center", className)}>
        {days.map((day) => (children as (d: string) => React.ReactNode)(day))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-7 mb-1.5 text-center", className)}>
      {children ||
        days.map((d) => (
          <RangeCalendarHeaderCell key={d}>{d}</RangeCalendarHeaderCell>
        ))}
    </div>
  );
}

export function RangeCalendarHeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-bold text-muted py-1", className)}>
      {children}
    </div>
  );
}

export function RangeCalendarGridBody({
  children,
  className,
}: {
  children?: React.ReactNode | ((date: Date) => React.ReactNode);
  className?: string;
}) {
  const { currentMonth, visibleWeeks, firstDayOfWeek } = useDateRangePicker();

  const isRenderFunction = typeof children === "function";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  let startingDayOfWeek = firstDay.getDay(); // 0 = Dom, 1 = Lun ... 6 = Sab
  if (firstDayOfWeek === "mon") {
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Si visibleWeeks está definido, renderizamos un número de semanas específico
  const totalDaysToRender = visibleWeeks ? visibleWeeks * 7 : daysInMonth + startingDayOfWeek;

  const calendarCells = [];

  // Espacios vacíos antes del día inicial
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
    if (visibleWeeks) {
      if (isRenderFunction) {
        calendarCells.push(
          <div key={`prev-${i}`} className="opacity-40">
            {(children as (d: Date) => React.ReactNode)(prevDate)}
          </div>
        );
      } else {
        calendarCells.push(<RangeCalendarCell key={`prev-${i}`} date={prevDate} className="opacity-40" />);
      }
    } else {
      calendarCells.push(<div key={`empty-${i}`} className="size-8" />);
    }
  }

  // Días del mes activo
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (isRenderFunction) {
      calendarCells.push(
        <React.Fragment key={`curr-${day}`}>
          {(children as (d: Date) => React.ReactNode)(date)}
        </React.Fragment>
      );
    } else {
      calendarCells.push(<RangeCalendarCell key={`curr-${day}`} date={date} />);
    }
  }

  // Completar hasta llenar visibleWeeks o cuadrícula
  const currentCount = calendarCells.length;
  if (visibleWeeks && currentCount < totalDaysToRender) {
    const remaining = totalDaysToRender - currentCount;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      if (isRenderFunction) {
        calendarCells.push(
          <div key={`next-${day}`} className="opacity-40">
            {(children as (d: Date) => React.ReactNode)(nextDate)}
          </div>
        );
      } else {
        calendarCells.push(<RangeCalendarCell key={`next-${day}`} date={nextDate} className="opacity-40" />);
      }
    }
  }

  return <div className={cn("grid grid-cols-7 gap-y-1", className)}>{calendarCells}</div>;
}

export function RangeCalendarCell({
  date,
  className,
}: {
  date: Date;
  className?: string;
}) {
  const { value, setValue, hoverDate, setHoverDate } = useDateRangePicker();

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isStart = isSameDay(date, value.start);
  const isEnd = isSameDay(date, value.end);

  const isInRange = () => {
    if (!value.start) return false;
    const targetTime = date.getTime();
    const startTime = value.start.getTime();

    if (value.end) {
      return targetTime > startTime && targetTime < value.end.getTime();
    }
    if (hoverDate && hoverDate.getTime() > startTime) {
      return targetTime > startTime && targetTime < hoverDate.getTime();
    }
    return false;
  };

  const isToday = isSameDay(date, new Date());

  const handleClick = () => {
    if (!value.start || (value.start && value.end)) {
      // Comenzar nuevo rango
      setValue({ start: date, end: null });
    } else {
      // Cerrar rango
      if (date.getTime() < value.start.getTime()) {
        setValue({ start: date, end: value.start });
      } else {
        setValue({ start: value.start, end: date });
      }
    }
  };

  const inRange = isInRange();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center p-0.5",
        inRange && "bg-teal-500/15 dark:bg-teal-500/20",
        isStart && value.end && "rounded-l-xl bg-teal-500/15",
        isEnd && value.start && "rounded-r-xl bg-teal-500/15"
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHoverDate(date)}
        onMouseLeave={() => setHoverDate(null)}
        className={cn(
          "size-8 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center",
          "hover:bg-primary/20",
          (isStart || isEnd) && "bg-primary text-white font-bold shadow-xs hover:bg-primary",
          !isStart && !isEnd && inRange && "text-teal-700 dark:text-teal-300 font-bold",
          !isStart && !isEnd && !inRange && "text-on-surface",
          isToday && !isStart && !isEnd && "border border-primary/40 font-bold",
          className
        )}
      >
        {date.getDate()}
      </button>
    </div>
  );
}

// Subcomponentes del Selector HeroUI para WeekView
interface SelectContextType {
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
const SelectContext = createContext<SelectContextType | null>(null);

export function Select({
  children,
  value,
  onChange,
  className,
}: {
  children: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onChange, isOpen, setIsOpen }}>
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("block text-xs font-bold text-muted mb-1", className)}>{children}</label>;
}

export function SelectTrigger({ children, className }: { children?: React.ReactNode; className?: string }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.setIsOpen(!ctx.isOpen)}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-surface dark:bg-slate-800 border border-border/70 hover:border-primary/50 text-foreground transition-all",
        ctx.isOpen && "border-primary ring-2 ring-primary/20",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SelectValue({ className }: { className?: string }) {
  const ctx = useContext(SelectContext);
  return <span className={cn("capitalize", className)}>{ctx?.value || "Seleccionar"}</span>;
}

export function SelectIndicator({ className }: { className?: string }) {
  return <ChevronDown className={cn("size-3.5 text-muted ml-2 shrink-0", className)} />;
}

export function SelectPopover({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(SelectContext);
  if (!ctx?.isOpen) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-1.5 w-full min-w-[140px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ListBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-0.5", className)}>{children}</div>;
}

export function ListBoxItem({
  children,
  id,
  textValue,
  className,
}: {
  children: React.ReactNode;
  id: string;
  textValue?: string;
  className?: string;
}) {
  const ctx = useContext(SelectContext);
  const isSelected = ctx?.value === id;

  const handleClick = () => {
    ctx?.onChange(id);
    ctx?.setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left",
        isSelected
          ? "bg-primary/10 text-primary font-bold"
          : "hover:bg-surface text-on-surface",
        className
      )}
    >
      <span>{children}</span>
      {isSelected && <Check className="size-3.5 text-primary ml-auto" />}
    </button>
  );
}

export function ListBoxItemIndicator() {
  return null;
}

// Attach subcomponents
DateRangePicker.Trigger = DateRangePickerTrigger;
DateRangePicker.Popover = DateRangePickerPopover;
RangeCalendar.Header = RangeCalendarHeader;
RangeCalendar.NavButton = RangeCalendarNavButton;
RangeCalendar.Heading = RangeCalendarHeading;
RangeCalendar.Grid = RangeCalendarGrid;
RangeCalendar.GridHeader = RangeCalendarGridHeader;
RangeCalendar.HeaderCell = RangeCalendarHeaderCell;
RangeCalendar.GridBody = RangeCalendarGridBody;
RangeCalendar.Cell = RangeCalendarCell;

Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.Indicator = SelectIndicator;
Select.Popover = SelectPopover;
ListBox.Item = ListBoxItem;
ListBox.ItemIndicator = ListBoxItemIndicator;

// 1. Vista Básica de Rango (Exacta especificación del usuario)
export function BasicRangeCalendar() {
  return (
    <RangeCalendar aria-label="Trip dates" firstDayOfWeek="mon">
      <RangeCalendar.Header>
        <RangeCalendar.Heading />
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day: string) => <RangeCalendar.HeaderCell key={day}>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date: Date) => <RangeCalendar.Cell key={date.toISOString()} date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}

// 2. Vista Dinámica por Semanas (WeekView - Exacta especificación del usuario)
const weekOptions = [
  { id: "1", name: "1 semana" },
  { id: "2", name: "2 semanas" },
  { id: "3", name: "3 semanas" },
  { id: "4", name: "4 semanas" },
  { id: "5", name: "5 semanas" },
  { id: "6", name: "6 semanas" },
  { id: "8", name: "8 semanas" },
] as const;

export function WeekViewRangeCalendar() {
  const [weeks, setWeeks] = useState(2);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Semanas a visualizar:</span>
        <Select
          className="w-40"
          value={String(weeks)}
          onChange={(value) => value && setWeeks(Number(value))}
        >
          <Label className="sr-only">Visible weeks</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {weekOptions.map((option) => (
                <ListBox.Item key={option.id} id={option.id} textValue={option.name}>
                  {option.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <RangeCalendar
        key={weeks}
        aria-label="Trip dates"
        visibleDuration={{ weeks }}
        className="w-full"
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day: string) => <RangeCalendar.HeaderCell key={day}>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date: Date) => <RangeCalendar.Cell key={date.toISOString()} date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
    </div>
  );
}

// 3. Vista con Rango Predeterminado Inicial (DefaultValueRangeCalendar)
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function DefaultValueRangeCalendar() {
  const defaultValue = {
    start: parseDate("2026-02-03"),
    end: parseDate("2026-02-12"),
  };

  return (
    <RangeCalendar
      aria-label="Rango de rehabilitación predeterminado"
      defaultValue={defaultValue}
      className="w-full max-w-sm"
    >
      <RangeCalendar.Header>
        <RangeCalendar.Heading />
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day: string) => <RangeCalendar.HeaderCell key={day}>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date: Date) => <RangeCalendar.Cell key={date.toISOString()} date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}

/**
 * DateRangePickerDemo con presets clínicos (Últimos 7 días, 30 días, etc.)
 */
export function DateRangePickerDemo() {
  const today = new Date();
  const past7Days = new Date();
  past7Days.setDate(today.getDate() - 7);

  const [range, setRange] = useState<DateRange>({
    start: past7Days,
    end: today,
  });

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setRange({ start, end });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <DateRangePicker value={range} onChange={setRange}>
          <DateRangePicker.Trigger />
          <DateRangePicker.Popover>
            <div className="space-y-3">
              {/* Presets rápidos para fisioterapeutas */}
              <div className="flex items-center gap-1.5 pb-3 border-b border-border/40 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPreset(7)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface dark:bg-slate-800 hover:bg-primary/10 border border-border/50 text-muted hover:text-primary transition-colors"
                >
                  7 días
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(14)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface dark:bg-slate-800 hover:bg-primary/10 border border-border/50 text-muted hover:text-primary transition-colors"
                >
                  14 días
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(30)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface dark:bg-slate-800 hover:bg-primary/10 border border-border/50 text-muted hover:text-primary transition-colors"
                >
                  30 días
                </button>
                <button
                  type="button"
                  onClick={() => setRange({ start: null, end: null })}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 ml-auto transition-colors"
                >
                  Limpiar
                </button>
              </div>

              <RangeCalendar>
                <RangeCalendar.Header />
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader />
                  <RangeCalendar.GridBody />
                </RangeCalendar.Grid>
              </RangeCalendar>

              {range.start && range.end && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                  <span className="text-muted">Total sesiones seleccionadas:</span>
                  <span className="font-bold text-primary">
                    {Math.round((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24))} días de evolución
                  </span>
                </div>
              )}
            </div>
          </DateRangePicker.Popover>
        </DateRangePicker>
      </div>

      {/* Subsección interactiva demostrando WeekViewRangeCalendar y BasicRangeCalendar */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Vista Multisemana (visibleDuration dinámico):
        </p>
        <WeekViewRangeCalendar />
      </div>
    </div>
  );
}
