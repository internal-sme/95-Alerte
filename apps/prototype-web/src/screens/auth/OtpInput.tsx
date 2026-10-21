import { useState } from "react";
import { cx } from "@/utils/index";
import type { ReactNode } from "react";

export interface OtpInputProps {
  value: any;
  onChange: (...args: any[]) => any;
  error: ReactNode;
  id: string;
}

export function OtpInput({ value, onChange, error, id }: OtpInputProps) {
  const [focused, setFocused] = useState(false);
  const digits = value.padEnd(6, " ").split("");
  return (
    <div className={cx("otp", error && "is-error")}>
      <input id={id} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={value} aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined} aria-label="Code de vérification à 6 chiffres"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      {digits.map((d, i) => <span key={i} aria-hidden="true" className={cx("d", focused && i === Math.min(value.length, 5) && "is-active")}>{d.trim()}</span>)}
    </div>
  );
}
