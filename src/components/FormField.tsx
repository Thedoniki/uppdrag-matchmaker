import type { ReactNode } from "react";

export const inputCls =
  "mt-2 w-full rounded-lg border-2 border-input bg-card px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive";

export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
  extra,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | undefined;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-bold">
        {label}
        {required && <span className="ml-1 text-accent" aria-hidden="true">*</span>}
        {!required && <span className="ml-1 font-normal text-muted-foreground">(valfritt)</span>}
      </label>
      {hint && <p className="text-base text-muted-foreground">{hint}</p>}
      {children}
      {extra}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function Spinner() {
  return <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />;
}
