import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '../../lib/utils';

interface TokenInputProps {
  length?: number;
  onComplete?: (token: string) => void;
  onChange?: (token: string) => void;
  className?: string;
}

export function TokenInput({ length = 6, onComplete, onChange, className }: TokenInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value.toUpperCase();
    setValues(newValues);
    if (value && index < length - 1) inputsRef.current[index + 1]?.focus();
    const token = newValues.join('');
    onChange?.(token);
    if (token.length === length && !newValues.includes('')) onComplete?.(token);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, length).split('');
    const newValues = [...values];
    paste.forEach((char, i) => { if (i < length) newValues[i] = char.toUpperCase(); });
    setValues(newValues);
    const nextIndex = Math.min(paste.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
    const token = newValues.join('');
    onChange?.(token);
    if (token.length === length && !newValues.includes('')) onComplete?.(token);
  };

  return (
    <div className={cn('flex gap-2 sm:gap-3 justify-center', className)}>
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          value={val}
          maxLength={1}
          type="text"
          inputMode="text"
          placeholder="•"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={cn(
            'w-11 h-14 sm:w-13 sm:h-16 rounded-2xl text-center font-mono text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400',
            'focus:outline-none bg-surface/80 border border-outline/20',
            'focus:bg-surface focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 shadow-sm',
            'transition-all uppercase',
          )}
        />
      ))}
    </div>
  );
}
