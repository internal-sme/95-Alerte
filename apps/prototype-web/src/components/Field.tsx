import { Icon } from "@/components/Icon";
import type { ReactNode } from "react";

export interface FieldProps {
  id: string;
  label: string;
  help?: ReactNode;
  error?: ReactNode;
  counter?: any;
  max?: number;
  textarea?: boolean;
  [prop: string]: any;
}

export function Field({ id, label, help, error, counter, max, textarea, ...rest }: FieldProps) {
  const Tag = textarea ? "textarea" : "input";
  const describedBy = [help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} className="input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} maxLength={max} {...rest} />
      {error ? <span className="err" id={`${id}-err`}><Icon name="warning-fill" className="ph-sm" />{error}</span> : null}
      {help || max ? (
        <span className="help" id={`${id}-help`}>
          <span>{help}</span>
          {max ? <span>{(rest.value || "").length}/{max}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
