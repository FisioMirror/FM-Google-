import { forwardRef, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
  className?: string
}

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  ({
    length = 6,
    value,
    onChange,
    onComplete,
    disabled,
    error,
    autoFocus = true,
    className,
  }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, [autoFocus])

    const handleChange = (index: number, digit: string) => {
      if (!/^\d*$/.test(digit) && digit !== "") return

      const newValue = value.split("")
      newValue[index] = digit
      const updatedValue = newValue.join("").slice(0, length)
      onChange(updatedValue)

      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      if (updatedValue.length === length && onComplete) {
        onComplete(updatedValue)
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && index > 0) {
        const newValue = value.split("")
        newValue[index] = ""
        onChange(newValue.join(""))
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasteData = e.clipboardData.getData("text/plain").slice(0, length)
      if (/^\d+$/.test(pasteData)) {
        onChange(pasteData)
        if (pasteData.length === length && onComplete) {
          onComplete(pasteData)
        }
      }
    }

    return (
      <div
        className={cn("flex gap-2", className)}
        onPaste={handlePaste}
      >
        {Array.from({ length }).map((_, index) => (
          <motion.input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg border-2 bg-background text-center text-lg font-mono transition-all",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-input",
              disabled && "cursor-not-allowed opacity-50"
            )}
            whileFocus={{ scale: 1.05, boxShadow: "0 0 0 3px rgba(0, 80, 77, 0.2)" }}
          />
        ))}
      </div>
    )
  }
)
OtpInput.displayName = "OtpInput"
