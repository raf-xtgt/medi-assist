"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?:    number;
  onComplete: (otp: string) => void;
  disabled?:  boolean;
  hasError?:  boolean;
  className?: string;
}

export function OtpInput({
  length    = 6,
  onComplete,
  disabled  = false,
  hasError  = false,
  className,
}: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...values];
    next[idx]   = digit;
    setValues(next);

    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      onComplete(next.join(""));
    }
  };

  const handleKey = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next   = [...values];
    pasted.split("").forEach((d, i) => {
      if (i < length) next[i] = d;
    });
    setValues(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  return (
    <div
      role="group"
      aria-label="One-time password input"
      className={cn("flex items-center gap-2", className)}
    >
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={v}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={cn(
            "flex size-11 items-center justify-center rounded-lg border text-center text-lg font-semibold tabular-nums",
            "bg-background transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]",
            hasError
              ? "border-destructive bg-red-50 text-destructive"
              : "border-input hover:border-[var(--primary)]/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      ))}
    </div>
  );
}
