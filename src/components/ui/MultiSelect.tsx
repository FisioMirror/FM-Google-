import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecciona...",
  label,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const remove = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-on-surface mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full min-h-[44px] px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900 text-on-surface text-left flex items-center justify-between gap-2 transition-all",
          open
            ? "border-teal-500 ring-2 ring-teal-500/20"
            : "border-outline-variant/60 dark:border-outline-variant/40 hover:border-teal-500/50",
        )}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedLabels.length === 0 ? (
            <span className="text-on-surface-variant text-sm">{placeholder}</span>
          ) : (
            selectedLabels.slice(0, maxDisplay).map((lbl) => (
              <span
                key={lbl}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-medium"
              >
                {lbl}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(options.find((o) => o.label === lbl)?.value ?? "");
                  }}
                  className="hover:bg-teal-500/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
          {selectedLabels.length > maxDisplay && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-on-surface-variant text-xs font-medium">
              +{selectedLabels.length - maxDisplay}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-on-surface-variant transition-transform flex-shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-2xl border border-outline-variant/60 dark:border-outline-variant/40 bg-white dark:bg-slate-900 shadow-elevated max-h-56 overflow-y-auto p-1"
          >
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left text-sm transition-colors cursor-pointer",
                    selected
                      ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold"
                      : "text-on-surface hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all",
                      selected
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "border-slate-300 dark:border-slate-600",
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
